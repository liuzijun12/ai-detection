import os
import re
from PIL import Image
import torch
import torchvision.transforms as transforms
from efficientnet_pytorch import EfficientNet
from flask import Flask, request, jsonify, send_from_directory, session, redirect, url_for, Response
from flask_cors import CORS
from functools import wraps
import logging
import webbrowser
import threading
import time
import requests
from openai import OpenAI
from torch import nn
from werkzeug.utils import secure_filename
from ultralytics import YOLO
import json
import datetime
from docx import Document
from docx.enum.text import WD_ALIGN_PARAGRAPH

logging.basicConfig(level=logging.INFO)
logger = logging.getLogger(__name__)

# 全局配置
MODEL_PATH = "best_model.pth"  # 训练好的最佳模型
IMAGE_SIZE = 320               # 训练时的图像尺寸
DEVICE = torch.device("cuda" if torch.cuda.is_available() else "cpu")

# 大语言模型配置
LLM_CONFIG = {
    "model_type": "local",  # local 或 api
    "model_name": "deepseek-r1:1.5b",  # 默认模型名称
    "api_url": "",  # API URL，如果使用API
    "api_key": "",  # API密钥，如果使用API
}

def input_with_timeout(prompt, timeout=10, default="2"):
    """
    跨平台实现用户输入超时，默认选择 default。
    Windows + Linux 通用。
    """
    result = {"value": default}

    def get_input():
        try:
            user_input = input(prompt)
            if user_input.strip() in ["1", "2"]:
                result["value"] = user_input.strip()
        except Exception:
            pass

    thread = threading.Thread(target=get_input)
    thread.daemon = True
    thread.start()
    thread.join(timeout)

    if result["value"] == default:
        print(f"\n未在 {timeout} 秒内输入，默认选择 {default}（网络API）")
    return result["value"]




def setup_llm_config():
    """设置大语言模型配置"""
    print("\n" + "="*50)
    print("欢迎使用眼部疾病预测中心")
    print("="*50)

    print("\n请选择AI问诊使用的大语言模型类型:")
    print("1. 本地模型 (Ollama)")
    print("2. 网络API (如OpenAI, Azure等)")

    choice = input_with_timeout("\n请输入选项 (1/2): ", timeout=10, default="2")

    if choice == "1":
        LLM_CONFIG["model_type"] = "local"

        # 获取可用的本地模型列表
        try:
            response = requests.get("http://localhost:11434/api/tags", timeout=5)
            if response.status_code == 200:
                models = response.json().get("models", [])
                if models:
                    print("\n可用的本地模型:")
                    for i, model in enumerate(models, 1):
                        print(f"{i}. {model.get('name')}")

                    model_choice = ""
                    while not model_choice.isdigit() or int(model_choice) < 1 or int(model_choice) > len(models):
                        model_choice = input(f"\n请选择模型 (1-{len(models)}): ").strip()

                    selected_model = models[int(model_choice)-1].get('name')
                    LLM_CONFIG["model_name"] = selected_model
                    print(f"\n已选择模型: {selected_model}")
                else:
                    print("\n未找到可用的本地模型，将使用默认模型: deepseek-r1:1.5b")
                    print("如需安装模型，请运行: ollama pull deepseek-r1:1.5b")
            else:
                print("\nOllama服务未响应，请确保Ollama正在运行")
                print("将使用默认模型: deepseek-r1:1.5b")
        except Exception as e:
            print(f"\n获取本地模型列表失败: {str(e)}")
            print("将使用默认模型: deepseek-r1:1.5b")
            print("请确保Ollama服务正在运行，或者运行: ollama pull deepseek-r1:1.5b")

    else:  # choice == "2"
        LLM_CONFIG["model_type"] = "api"

        # api_url = input("\n请输入API URL (例如: https://api.openai.com/v1/chat/completions): ").strip()
        api_url = "https://api.deepseek.com"
        # https: // api.deepseek.com / v1
        # api_key = input("请输入API密钥: ").strip()
        api_key = "sk-aa19071022fe47f1aaef8a0215749ddc"
        # model_name = input("请输入模型名称 (例如: gpt-3.5-turbo): ").strip()
        model_name = "deepseek-chat"

        LLM_CONFIG["api_url"] = api_url
        LLM_CONFIG["api_key"] = api_key

        if model_name:
            LLM_CONFIG["model_name"] = model_name

    print("\n配置完成！正在启动服务器...\n")
    return LLM_CONFIG

# 加载模型
def load_model(model_path):
    try:
        print("Loading model...")
        model = EfficientNet.from_name("efficientnet-b3")
        num_classes = 8
        model._fc = nn.Linear(model._fc.in_features, num_classes)

        if os.path.exists(model_path):
            checkpoint = torch.load(model_path, map_location=DEVICE)
            model.load_state_dict(checkpoint["model_state_dict"])
            model.eval().to(DEVICE)
            print("Model loaded successfully!")
            logger.info("Model loaded successfully")
        else:
            print(f"Warning: Model file {model_path} not found!")
            return None
        return model
    except Exception as e:
        print(f"Error loading model: {str(e)}")
        logger.error("Error loading model: %s", str(e))
        return None

# 预处理函数
def preprocess_image(image):
    transform = transforms.Compose([
        transforms.Resize((IMAGE_SIZE, IMAGE_SIZE)),
        transforms.ToTensor(),
        transforms.Normalize(mean=[0.485, 0.456, 0.406], std=[0.229, 0.224, 0.225])
    ])
    return transform(image).unsqueeze(0).to(DEVICE)

app = Flask(__name__, static_folder='ai_detection')
CORS(app, supports_credentials=True)  # 支持跨域请求
app.secret_key = 'your-secret-key'  # 更换为随机的密钥

# 添加 session 配置
app.config.update(
    SESSION_COOKIE_SECURE=False,  # 开发环境设为 False
    SESSION_COOKIE_HTTPONLY=True,
    SESSION_COOKIE_SAMESITE='Lax'
)

# 路由：服务静态文件
@app.route('/')
def index():
    return send_from_directory(app.static_folder, 'index.html')

@app.route('/<path:path>')
def serve_static(path):
    return send_from_directory(app.static_folder, path)

def login_required(f):
    @wraps(f)
    def decorated_function(*args, **kwargs):
        if not session.get('logged_in'):
            return jsonify({"error": "Please login first"}), 401
        return f(*args, **kwargs)
    return decorated_function

# 预测接口
@app.route("/predict", methods=["POST"])
def predict():
    if "file" not in request.files:
        return jsonify({"error": "No file provided"}), 400

    file = request.files["file"]

    if not file.filename:
        return jsonify({"error": "No file selected"}), 400

    try:
        image = Image.open(file).convert("RGB")
        image_tensor = preprocess_image(image)

        with torch.no_grad():
            output = model(image_tensor)
            probs = torch.sigmoid(output).cpu().numpy().tolist()[0]

        classes = ["N", "D", "G", "C", "A", "H", "M", "O"]
        predictions = {cls: float(prob) for cls, prob in zip(classes, probs)}

        return jsonify({"predictions": predictions})
    except Exception as e:
        logger.error("Error during prediction: %s", str(e))
        return jsonify({"error": str(e)}), 500

# 登录接口
@app.route("/login", methods=["POST"])
def login():
    data = request.get_json()
    username = data.get("username")
    password = data.get("password")

    if username == "admin" and password == "123456":
        session['logged_in'] = True
        session['username'] = username
        return jsonify({
            "success": True,
            "message": "登录成功",
            "username": username
        })
    else:
        return jsonify({
            "success": False,
            "message": "用户名或密码错误"
        }), 401

@app.route("/logout", methods=["POST"])
def logout():
    session.clear()
    return jsonify({"success": True, "message": "登出成功"})

@app.route("/chat_ollama", methods=["POST"])
def chat_ollama():
    try:
        data = request.get_json()
        prompt = data.get("prompt")
        model_name = data.get("model", LLM_CONFIG["model_name"])

        if not prompt:
            return jsonify({"error": "No prompt provided"}), 400

        logger.info(f"收到聊天请求: prompt={prompt}, model={model_name}")

        # 构建上下文
        context = f"""你是一位专业的眼科医生，请直接回答问题，不要有思考过程，不要说"您好，我是AI眼科助手"，不要重复用户的问题，直接给出专业的回答。
        
        用户问题：{prompt}"""

        try:
            # 根据配置选择不同的处理方式
            if LLM_CONFIG["model_type"] == "local":
                # 首先测试Ollama服务是否可用
                health_check = requests.get("http://localhost:11434/api/tags", timeout=5)
                if health_check.status_code != 200:
                    logger.error("Ollama服务未运行或无响应")
                    return jsonify({"error": "AI服务未启动，请确保Ollama正在运行"}), 503
                # 调用Ollama API
                logger.info(f"正在调用Ollama API，使用模型: {model_name}")
                response = requests.post(
                    "http://localhost:11434/api/generate",
                    json={
                        "model": model_name,
                        "prompt": context,
                        "stream": False,
                        "temperature": 0.7,
                        "top_p": 0.9
                    },
                    timeout=30
                )
                logger.info(f"Ollama API响应状态码: {response.status_code}")
                # if response.status_code == 200:
                #     result = response.json()
                #     logger.info("成功获取AI响应")
                #     ai_response = result.get("response", "抱歉，我现在无法回答您的问题。")
                # else:
                #     logger.error(f"Ollama API错误响应: {response.text}")
                #     return jsonify({"error": "AI服务暂时不可用"}), 500
                try:
                    if response.status_code == 200:
                        result_json = response.json()
                        logger.info(f"本地模型响应: {result_json}")
                        ai_response = result_json.get("response")
                        # 检查返回结构，找出实际的字段
                        # if "response" in result_json:
                        #     ai_response = result_json["response"]
                        # else:
                        #     ai_response = "抱歉，我现在无法回答您的问题。"
                    else:
                        logger.error(f"Ollama API错误响应: {response.text}")
                        return jsonify({"error": "AI服务暂时不可用"}), 500
                    return jsonify({"response": ai_response})
                except Exception as e:
                    logger.error(f"解析本地模型响应时发生错误: {str(e)}")
                    return jsonify({"error": "解析响应时出错"}), 500

            else:  # LLM_CONFIG["model_type"] == "api"
                # 调用外部API
                logger.info(f"正在调用外部API: {LLM_CONFIG['api_url']}")
                headers = {
                    "Content-Type": "application/json",
                    "Authorization": f"Bearer {LLM_CONFIG['api_key']}"
                }
                # response = requests.post(...)
                payload = {
                    "model": LLM_CONFIG["model_name"],
                    "messages": [
                        {"role": "system", "content": "你是一位专业的眼科医生..."},
                        {"role": "user", "content": prompt}
                    ],
                    "temperature": 0.7,
                    "max_tokens": 1000
                }
                response = requests.post(
                    f"{LLM_CONFIG['api_url'].rstrip('/')}/v1/chat/completions",
                    headers={
                        "Authorization": f"Bearer {LLM_CONFIG['api_key']}",
                        "Content-Type": "application/json"
                    },
                    json=payload
                )
                ai_response = response.json()["choices"][0]["message"]["content"]

                # 根据不同的API调整请求格式
                if "deepseek" in LLM_CONFIG["api_url"].lower():
                    # OpenAI格式
                    print(LLM_CONFIG["api_url"])
                    print(LLM_CONFIG["api_key"])
                    client = OpenAI(api_key="sk-aa19071022fe47f1aaef8a0215749ddc", base_url="https://api.deepseek.com/v1")

                    payload = client.chat.completions.create(
                        model="deepseek-chat",
                        messages=[
                            {"role": "system", "content": "你是一位专业的眼科医生，请使用中文详细回答用户提出的眼科相关问题。回答中应包括：问题的医学解释、可能的病因、建议的检查方法、是否需要就诊、日常注意事项等。如果问题模糊，可提示用户补充症状信息。禁止自我介绍和重复用户提问。"},
                            {"role": "user", "content": prompt},
                        ],
                        stream=False
                    )
                    ai_response = payload.choices[0].message.content
                    return jsonify({"response": ai_response})
                else:
                    # 通用格式
                    payload = {
                        "model": LLM_CONFIG["model_name"],
                        "prompt": context,
                        "temperature": 0.7,
                        "max_tokens": 1000
                    }
                response = requests.post(
                    "https://api.deepseek.com/v1/chat/completions",
                    headers={
                        "Authorization": f"Bearer {LLM_CONFIG['api_key']}",
                        "Content-Type": "application/json"
                    },
                    json=payload
                )
            # 过滤掉思考过程和固定开头结尾
            ai_response = re.sub(r'<think>[\s\S]*?</think>', '', ai_response)
            ai_response = re.sub(r'您好，我是AI眼科助手。您的问题是：.*?。', '', ai_response)
            ai_response = re.sub(r'我正在为您提供专业的眼科咨询服务。', '', ai_response)
            # ai_response = response.choices[0].message.content
            # 远程api调用的输出格式
            ai_response = response.json()["choices"][0]["message"]["content"]
            # 如果过滤后内容为空，提供默认回复

            if not ai_response.strip():
                ai_response = "抱歉，我无法理解您的问题，请尝试重新描述您的症状。"
            logger.info(f"过滤后的AI响应内容: {ai_response}")
            return jsonify({"response": ai_response})

        except requests.exceptions.ConnectionError:
            logger.error("无法连接到AI服务")
            return jsonify({"error": "无法连接到AI服务，请确保服务正在运行"}), 503
        except requests.exceptions.Timeout:
            logger.error("请求AI服务超时")
            return jsonify({"error": "AI服务响应超时，请稍后重试"}), 504
        except requests.exceptions.RequestException as e:
            logger.error(f"请求AI服务时发生错误: {str(e)}")
            return jsonify({"error": "与AI服务通信时发生错误"}), 500

    except Exception as e:
        logger.error(f"处理聊天请求时出错: {str(e)}")
        return jsonify({"error": str(e)}), 500

@app.errorhandler(404)
def not_found(error):
    return jsonify({"error": "Not found"}), 404

@app.errorhandler(500)
def server_error(error):
    return jsonify({"error": "Internal server error"}), 500

# 添加自动打开浏览器的函数
def open_browser():
    time.sleep(1)  # 等待服务器启动
    webbrowser.open('http://127.0.0.1:5000')

if __name__ == "__main__":
    # 设置大语言模型配置
    setup_llm_config()

    # 加载眼部疾病预测模型
    model = load_model(MODEL_PATH)
    if model is None:
        print("Warning: Running without model. Predictions will not work!")

    # 在新线程中打开浏览器
    threading.Thread(target=open_browser).start()

    logger.info("Server started")
    # 启动服务器
    app.run(host="0.0.0.0", port=5000, debug=True, use_reloader=False) 
