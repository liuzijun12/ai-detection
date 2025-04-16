import matplotlib.pyplot as plt
import numpy as np

# 2020年至2024年的年度数据
years = np.array([2020, 2021, 2022, 2023, 2024])

# 市场需求数据（单位：亿元）
market_demand = np.array([50, 80, 120, 160, 200])

# 投资增长数据（单位：亿元）
investment_growth = np.array([5, 10, 20, 30, 40])

fig, ax1 = plt.subplots(figsize=(10, 6))

# 绘制市场需求的折线图
ax1.plot(years, market_demand, color='tab:blue', label='市场需求（亿元）', marker='o')
ax1.set_xlabel('年份')
ax1.set_ylabel('市场需求（亿元）', color='tab:blue')
ax1.tick_params(axis='y', labelcolor='tab:blue')

# 创建第二个y轴，用于绘制投资增长的条形图
ax2 = ax1.twinx()
ax2.bar(years, investment_growth, alpha=0.6, color='tab:orange', label='投资增长（亿元）')
ax2.set_ylabel('投资增长（亿元）', color='tab:orange')
ax2.tick_params(axis='y', labelcolor='tab:orange')

# 添加标题和图例
plt.title('人工智能眼部疾病检测市场需求与投资增长分析')
fig.tight_layout()

# 显示图表
plt.show()
