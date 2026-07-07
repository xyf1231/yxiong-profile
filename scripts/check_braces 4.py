"""
check_braces.py — CSS 大括号平衡检查（方案一：先移除注释再统计）
用于快速发现 styles.css 中可能存在的大括号不匹配问题。
"""

import re

# 读取 styles.css 全文
with open('css/styles.css', 'r') as fh:
    text = fh.read()

# 移除 CSS 注释，避免注释中的 { } 干扰统计
text_no_comments = re.sub(r'/\*.*?\*/', '', text, flags=re.DOTALL)

# 按行拆分以便定位
lines = text_no_comments.split('\n')

# 逐行统计大括号平衡
balance = 0
issues = []
for i, line in enumerate(lines, 1):
    stripped = line.strip()
    if not stripped:
        continue
    for ch in line:
        if ch == '{':
            balance += 1
        elif ch == '}':
            balance -= 1
            # 发现多余的右括号，记录位置
            if balance < 0:
                issues.append((i, stripped[:60]))
                balance = 0

# 输出检查结果
print(f"Final balance: {balance}")
print(f"Issues found: {len(issues)}")
for issue in issues:
    print(f"  Line {issue[0]}: {issue[1]}")
