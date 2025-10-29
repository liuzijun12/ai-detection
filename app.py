# 标准库
import os, re, json, time, datetime, threading, logging, webbrowser

# 图像与模型
from PIL import Image
import torch
import torchvision.transforms as transforms
from torch import nn
from efficientnet_pytorch import EfficientNet

# Flask 与扩展
from flask import Flask, request, jsonify, send_from_directory, session
from flask_cors import CORS
from flask_sqlalchemy import SQLAlchemy
from functools import wraps
from werkzeug.utils import secure_filename  # 可留作后续上传

# AI 与 NLP
import requests
from openai import OpenAI

# 自定义模块
from models import db, User, Case

# Word 文档生成
from docx import Document
from docx.enum.text import WD_ALIGN_PARAGRAPH

import base64
import uuid
from datetime import timedelta

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

# 添加图片保存配置
UPLOAD_FOLDER = os.path.join('ai_detection', 'staticImage')
ALLOWED_EXTENSIONS = {'png', 'jpg', 'jpeg'}

def allowed_file(filename):
    return '.' in filename and filename.rsplit('.', 1)[1].lower() in ALLOWED_EXTENSIONS

def save_base64_image(base64_string, folder):
    """保存Base64图片并返回文件路径"""
    try:
        # 从Base64字符串中提取实际的图片数据
        if ',' in base64_string:
            base64_string = base64_string.split(',')[1]
        
        # 解码Base64数据
        image_data = base64.b64decode(base64_string)
        
        # 生成唯一的文件名
        filename = f"{uuid.uuid4().hex}.png"
        
        # 确保目录存在
        os.makedirs(folder, exist_ok=True)
        
        # 保存文件
        filepath = os.path.join(folder, filename)
        with open(filepath, 'wb') as f:
            f.write(image_data)
        
        return filepath
    except Exception as e:
        print(f"Error saving base64 image: {e}")
        return None

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
CORS(app, 
     supports_credentials=True,  # 支持凭证
     resources={
         r"/*": {
             "origins": ["http://localhost:5001", "http://127.0.0.1:5001"],
             "methods": ["GET", "POST", "OPTIONS"],
             "allow_headers": ["Content-Type", "Authorization"],
             "expose_headers": ["Content-Range", "X-Content-Range"],
             "supports_credentials": True
         }
     }
)  # 支持跨域请求
app.secret_key = 'your-secret-key'  # 更换为随机的密钥


# 配置 MySQL 数据库连接（连接你容器里的 eye_db）
app.config['SQLALCHEMY_DATABASE_URI'] = 'mysql+pymysql://root:123456@localhost:3306/eye_db'
app.config['SQLALCHEMY_TRACK_MODIFICATIONS'] = False

# 初始化数据库对象
db.init_app(app)

@app.route("/register", methods=["POST"])
def register():
    data = request.get_json()
    username = data.get("username")
    password = data.get("password")

    if not username or not password:
        return jsonify({"success": False, "message": "用户名和密码不能为空"}), 400

    # 检查用户名是否存在
    if User.query.filter_by(username=username).first():
        return jsonify({"success": False, "message": "用户名已存在"}), 409

    # 创建用户
    new_user = User(username=username, password=password)
    db.session.add(new_user)
    db.session.commit()

    return jsonify({"success": True, "message": "注册成功"})

@app.route("/login", methods=["POST"])
def login():
    data = request.get_json()
    username = data.get("username")
    password = data.get("password")

    if not username or not password:
        return jsonify({"success": False, "message": "用户名和密码不能为空"}), 400

    user = User.query.filter_by(username=username).first()
    if not user:
        return jsonify({"success": False, "message": "用户不存在"}), 404

    if user.password != password:
        return jsonify({"success": False, "message": "密码错误"}), 401

    # 设置session
    session['logged_in'] = True
    session['username'] = username
    session['user_id'] = user.id
    session.permanent = True  # 设置session持久化

    return jsonify({
        "success": True,
        "message": "登录成功",
        "username": username
    })

# 添加session检查接口
@app.route("/check_session")
def check_session():
    return jsonify({
        "logged_in": session.get('logged_in', False),
        "username": session.get('username'),
        "user_id": session.get('user_id')
    })

# 修改app配置
def configure_app(app):
    # Session配置
    app.config.update(
        SESSION_COOKIE_SECURE=False,  # 开发环境设为False，生产环境设为True
        SESSION_COOKIE_HTTPONLY=True,
        SESSION_COOKIE_SAMESITE='Lax',
        PERMANENT_SESSION_LIFETIME=timedelta(days=7)  # session有效期7天
    )
    
    # 数据库配置
    app.config['SQLALCHEMY_DATABASE_URI'] = 'mysql+pymysql://root:123456@localhost:3306/eye_db'
    app.config['SQLALCHEMY_TRACK_MODIFICATIONS'] = False
    
    # 设置随机密钥
    app.secret_key = os.urandom(24)
    
    return app

# 路由：服务静态文件
@app.route('/')
def index():
    return send_from_directory('ai_detection', 'index.html')

@app.route('/<path:path>')
def serve_static(path):
    try:
        return send_from_directory('ai_detection', path)
    except Exception as e:
        print(f"Error serving static file: {str(e)}")
        return "File not found", 404

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

@app.route("/logout", methods=["POST"])
def logout():
    session.clear()
    return jsonify({"success": True, "message": "登出成功"})

@app.route("/cases")
@login_required
def get_cases():
    page = request.args.get('page', 1, type=int)
    per_page = 10  # 每页显示10条记录
    
    # 获取当前用户的病例
    user_id = session.get('user_id')
    pagination = Case.query.filter_by(user_id=user_id)\
        .order_by(Case.created_at.desc())\
        .paginate(page=page, per_page=per_page, error_out=False)
    
    cases = []
    for case in pagination.items:
        case_data = {
            'id': case.id,
            'created_at': case.created_at.isoformat(),
            'description': case.description,
            'left_eye_image': case.left_eye_image,
            'right_eye_image': case.right_eye_image,
            'left_eye_result': case.left_eye_result,
            'right_eye_result': case.right_eye_result
        }
        cases.append(case_data)
    
    return jsonify({
        'cases': cases,
        'total_pages': pagination.pages,
        'current_page': page
    })

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

        # 根据配置选择不同的处理方式
        if LLM_CONFIG["model_type"] == "local":
            try:
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
            
                if response.status_code == 200:
                    result_json = response.json()
                    logger.info(f"本地模型响应: {result_json}")
                    ai_response = result_json.get("response", "抱歉，我现在无法回答您的问题。")
                    return jsonify({"response": ai_response})
                else:
                    logger.error(f"Ollama API错误响应: {response.text}")
                    return jsonify({"error": "AI服务暂时不可用"}), 500

            except requests.exceptions.RequestException as e:
                logger.error(f"Ollama API请求错误: {str(e)}")
                return jsonify({"error": "无法连接到本地AI服务"}), 503

        else:  # LLM_CONFIG["model_type"] == "api"
            try:
                # 使用 Deepseek API
                try:
                    # 直接使用 requests 发送请求
                    response = requests.post(
                        "https://api.deepseek.com/v1/chat/completions",
                        headers={
                            "Authorization": f"Bearer {LLM_CONFIG['api_key']}",
                            "Content-Type": "application/json"
                        },
                        json={
                            "model": "deepseek-chat",
                            "messages": [
                                {"role": "system", "content": "你是一位专业的眼科医生，请使用中文详细回答用户提出的眼科相关问题。回答中应包括：问题的医学解释、可能的病因、建议的检查方法、是否需要就诊、日常注意事项等。如果问题模糊，可提示用户补充症状信息。禁止自我介绍和重复用户提问。"},
                                {"role": "user", "content": prompt}
                            ],
                            "temperature": 0.7,
                            "max_tokens": 1000
                        },
                        timeout=30
                    )

                    if response.status_code == 200:
                        ai_response = response.json()["choices"][0]["message"]["content"]
                    else:
                        raise Exception(f"API request failed with status {response.status_code}: {response.text}")

                except requests.exceptions.RequestException as e:
                    # 如果直接请求失败，尝试使用 OpenAI 客户端
                    logger.warning(f"Direct request failed, trying OpenAI client: {str(e)}")
                    client = OpenAI(
                        api_key=LLM_CONFIG["api_key"],
                        base_url="https://api.deepseek.com/v1"
                    )

                    completion = client.chat.completions.create(
                        model="deepseek-chat",
                        messages=[
                            {"role": "system", "content": "你是一位专业的眼科医生，请使用中文详细回答用户提出的眼科相关问题。回答中应包括：问题的医学解释、可能的病因、建议的检查方法、是否需要就诊、日常注意事项等。如果问题模糊，可提示用户补充症状信息。禁止自我介绍和重复用户提问。"},
                            {"role": "user", "content": prompt}
                        ],
                        temperature=0.7,
                        max_tokens=1000
                    )
                    ai_response = completion.choices[0].message.content

                # 过滤掉思考过程和固定开头结尾
                ai_response = re.sub(r'<think>[\s\S]*?</think>', '', ai_response)
                ai_response = re.sub(r'您好，我是AI眼科助手。您的问题是：.*?。', '', ai_response)
                ai_response = re.sub(r'我正在为您提供专业的眼科咨询服务。', '', ai_response)

                if not ai_response.strip():
                    ai_response = "抱歉，我无法理解您的问题，请尝试重新描述您的症状。"

                logger.info(f"过滤后的AI响应内容: {ai_response}")
                return jsonify({"response": ai_response})

            except Exception as e:
                logger.error(f"Deepseek API调用错误: {str(e)}")
                return jsonify({
                    "error": f"AI服务暂时不可用: {str(e)}",
                    "details": {
                        "api_url": LLM_CONFIG["api_url"],
                        "model": "deepseek-chat"
                    }
                }), 500

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
    webbrowser.open('http://127.0.0.1:5001')

@app.route("/save_detection", methods=["POST"])
@login_required
def save_detection():
    try:
        data = request.get_json()
        print("Received data for saving:", {
            'description': data.get('description'),
            'has_left_eye': 'left_eye' in data,
            'has_right_eye': 'right_eye' in data
        })
        
        # 获取当前用户ID
        user_id = session.get('user_id')
        print(f"Current session data: {dict(session)}")  # 调试信息
        
        if not user_id:
            print("No user_id found in session")  # 调试信息
            return jsonify({"error": "User not found"}), 401

        # 保存左眼图片
        left_eye_image = data.get('left_eye', {}).get('image')
        left_eye_path = None
        if left_eye_image:
            print("Saving left eye image...")  # 调试信息
            saved_path = save_base64_image(left_eye_image, UPLOAD_FOLDER)
            if saved_path:
                # 转换为相对路径
                left_eye_path = os.path.relpath(saved_path, 'ai_detection')
                print(f"Left eye image saved to: {left_eye_path}")  # 调试信息
            else:
                print("Failed to save left eye image")  # 调试信息

        # 保存右眼图片
        right_eye_image = data.get('right_eye', {}).get('image')
        right_eye_path = None
        if right_eye_image:
            print("Saving right eye image...")  # 调试信息
            saved_path = save_base64_image(right_eye_image, UPLOAD_FOLDER)
            if saved_path:
                # 转换为相对路径
                right_eye_path = os.path.relpath(saved_path, 'ai_detection')
                print(f"Right eye image saved to: {right_eye_path}")  # 调试信息
            else:
                print("Failed to save right eye image")  # 调试信息

        print(f"Creating new case for user {user_id}")  # 调试信息

        # 创建新的病例记录
        new_case = Case(
            user_id=user_id,
            description=data.get('description', ''),
            left_eye_image=left_eye_path,
            right_eye_image=right_eye_path,
            left_eye_result=json.dumps(data.get('left_eye', {}).get('results', {})),
            right_eye_result=json.dumps(data.get('right_eye', {}).get('results', {})),
            created_at=datetime.datetime.utcnow()
        )

        # 保存到数据库
        try:
            db.session.add(new_case)
            db.session.commit()
            print(f"Successfully saved case with ID: {new_case.id}")  # 调试信息
        except Exception as db_error:
            print(f"Database error: {str(db_error)}")  # 调试信息
            db.session.rollback()
            raise

        return jsonify({
            "success": True,
            "message": "检测结果已保存",
            "case_id": new_case.id
        })

    except Exception as e:
        db.session.rollback()
        print(f"Error saving detection: {str(e)}")  # 调试信息
        return jsonify({"error": str(e)}), 500


        })
    except Exception as e:
        print(f"Error getting case: {str(e)}")
        return jsonify({"error": str(e)}), 500

if __name__ == "__main__":
    # 配置应用
    app = configure_app(app)
    
    # 设置大语言模型配置
    setup_llm_config()

    # 加载眼部疾病预测模型
    model = load_model(MODEL_PATH)
    if model is None:
        print("Warning: Running without model. Predictions will not work!")

    with app.app_context():
        print("🧱 正在建表到 eye_db...")
        db.create_all()
        print("✅ 数据库表结构已初始化完毕")

    # 在新线程中打开浏览器
    threading.Thread(target=open_browser).start()

    logger.info("Server started")
    # 启动服务器
    app.run(host="0.0.0.0", port=5001, debug=True, use_reloader=False) 
