"""
check_braces2.py — CSS 大括号平衡检查（方案二：逐行移除注释并打印上下文）
与 check_braces.py 相比，会在发现问题时输出附近行便于定位。
"""

import re

# 读取 styles.css 全部行
with open('css/styles.css', 'r') as fh:
    lines = fh.readlines()

# 逐行移除注释后检查大括号平衡
balance = 0
in_comment = False
issues = []

for i, raw_line in enumerate(lines, 1):
    line = raw_line.strip()
    if not line:
        continue
    # 简单移除行内完整注释块
    while '/*' in line and '*/' in line:
        start = line.find('/*')
        end = line.find('*/', start) + 2
        line = line[:start] + line[end:]
    # 统计大括号
    for ch in line:
        if ch == '{':
            balance += 1
        elif ch == '}':
            balance -= 1
            # 发现多余的右括号，打印上下文
            if balance < 0:
                print(f"\n=== Issue at line {i} (balance={balance+1}) ===")
                start = max(0, i-5)
                end = min(len(lines), i+3)
                for j in range(start, end):
                    marker = ">>> " if j == i-1 else "    "
                    print(f"{marker}{j+1:4d}: {lines[j].rstrip()}")
                balance = 0

# 输出最终平衡值
print(f"\nFinal balance: {balance}")
