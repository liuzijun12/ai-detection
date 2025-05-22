# 使用官方 Python 3.11 镜像
FROM python:3.11

# 设置工作目录
WORKDIR /app

# 拷贝当前目录下所有文件到容器中
COPY . /app

# 安装 pip 源，并安装依赖
RUN pip install --no-cache-dir -r requirements.txt

# 设置环境变量（防止 Python 缓存 .pyc）
ENV PYTHONDONTWRITEBYTECODE 1
ENV PYTHONUNBUFFERED 1

# 显式暴露端口（容器内部）
EXPOSE 5001

# 默认启动命令
CMD ["python", "app.py"]
