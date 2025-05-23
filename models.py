# models.py
from flask_sqlalchemy import SQLAlchemy
from datetime import datetime

db = SQLAlchemy()

class User(db.Model):
    id = db.Column(db.Integer, primary_key=True)
    username = db.Column(db.String(80), unique=True, nullable=False)
    password = db.Column(db.String(128), nullable=False)

class Case(db.Model):
    id = db.Column(db.Integer, primary_key=True)
    user_id = db.Column(db.Integer, db.ForeignKey('user.id'), nullable=False)
    description = db.Column(db.Text)
    left_eye_image = db.Column(db.String(255))
    right_eye_image = db.Column(db.String(255))
    created_at = db.Column(db.DateTime, default=datetime.utcnow)
    left_eye_result = db.Column(db.Text)  # 存储JSON格式的检测结果
    right_eye_result = db.Column(db.Text)  # 存储JSON格式的检测结果

    user = db.relationship('User', backref=db.backref('cases', lazy=True))
