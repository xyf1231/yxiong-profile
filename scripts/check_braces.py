import re

with open('css/styles.css', 'r') as fh:
    text = fh.read()

# Remove CSS comments
text_no_comments = re.sub(r'/\*.*?\*/', '', text, flags=re.DOTALL)

# Split into lines for reporting
lines = text_no_comments.split('\n')

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
            if balance < 0:
                issues.append((i, stripped[:60]))
                balance = 0

print(f"Final balance: {balance}")
print(f"Issues found: {len(issues)}")
for issue in issues:
    print(f"  Line {issue[0]}: {issue[1]}")
