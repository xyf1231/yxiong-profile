import re

with open('css/styles.css', 'r') as fh:
    lines = fh.readlines()

# Remove comments from lines for checking
balance = 0
in_comment = False
issues = []

for i, raw_line in enumerate(lines, 1):
    line = raw_line.strip()
    if not line:
        continue
    # Simple comment removal
    while '/*' in line and '*/' in line:
        start = line.find('/*')
        end = line.find('*/', start) + 2
        line = line[:start] + line[end:]
    for ch in line:
        if ch == '{':
            balance += 1
        elif ch == '}':
            balance -= 1
            if balance < 0:
                # Print context
                print(f"\n=== Issue at line {i} (balance={balance+1}) ===")
                start = max(0, i-5)
                end = min(len(lines), i+3)
                for j in range(start, end):
                    marker = ">>> " if j == i-1 else "    "
                    print(f"{marker}{j+1:4d}: {lines[j].rstrip()}")
                balance = 0

print(f"\nFinal balance: {balance}")
