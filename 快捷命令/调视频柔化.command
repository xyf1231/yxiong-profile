#!/bin/zsh
set -e
cd "$(dirname "$0")/.."

PYTHON_BIN="/Users/xiongyifeng/.cache/codex-runtimes/codex-primary-runtime/dependencies/python/bin/python3"
if [ ! -x "$PYTHON_BIN" ]; then
  PYTHON_BIN="$(command -v python3 || true)"
fi

if [ -z "$PYTHON_BIN" ]; then
  echo "没有找到 Python 3。请先安装 Python 3，或告诉我帮你配置。"
  read "?按回车关闭..."
  exit 1
fi

cat <<'EOF'
请选择柔化区域：
1) 只柔边缘
2) 边缘 + 轻微向内
3) 边缘 + 明显向内
4) 整体都柔一点
EOF

read "?输入 1/2/3/4: " AREA

case "$AREA" in
  1)
    OUTER_INSET="-22px"
    INNER_INSET="-12px"
    ;;
  2)
    OUTER_INSET="-28px"
    INNER_INSET="-16px"
    ;;
  3)
    OUTER_INSET="-34px"
    INNER_INSET="-20px"
    ;;
  4)
    OUTER_INSET="-18px"
    INNER_INSET="-10px"
    ;;
  *)
    echo "输入无效，已取消。"
    read "?按回车关闭..."
    exit 1
    ;;
esac

cat <<'EOF'
请选择柔化程度：
1) 轻
2) 标准
3) 强
4) 很强
EOF

read "?输入 1/2/3/4: " LEVEL

case "$LEVEL" in
  1)
    OUTER_BLUR="40px"
    INNER_BLUR="24px"
    OUTER_OPACITY="0.82"
    INNER_OPACITY="0.78"
    ;;
  2)
    OUTER_BLUR="54px"
    INNER_BLUR="32px"
    OUTER_OPACITY="0.98"
    INNER_OPACITY="0.92"
    ;;
  3)
    OUTER_BLUR="68px"
    INNER_BLUR="40px"
    OUTER_OPACITY="1"
    INNER_OPACITY="0.96"
    ;;
  4)
    OUTER_BLUR="82px"
    INNER_BLUR="52px"
    OUTER_OPACITY="1"
    INNER_OPACITY="1"
    ;;
  *)
    echo "输入无效，已取消。"
    read "?按回车关闭..."
    exit 1
    ;;
esac

"$PYTHON_BIN" - "$OUTER_INSET" "$INNER_INSET" "$OUTER_BLUR" "$INNER_BLUR" "$OUTER_OPACITY" "$INNER_OPACITY" <<'PY'
from pathlib import Path
import sys

outer_inset, inner_inset, outer_blur, inner_blur, outer_opacity, inner_opacity = sys.argv[1:7]
path = Path("styles.css")
text = path.read_text()

replacements = {
    "inset: -30px;": f"inset: {outer_inset};",
    "inset: -18px;": f"inset: {inner_inset};",
    "filter: blur(68px);": f"filter: blur({outer_blur});",
    "filter: blur(40px);": f"filter: blur({inner_blur});",
    "opacity: 0.98;": f"opacity: {outer_opacity};",
    "opacity: 1;": f"opacity: {inner_opacity};",
}

for old, new in replacements.items():
    text = text.replace(old, new)

path.write_text(text)
PY

echo ""
echo "已更新视频柔化设置。"
read "?按回车关闭..."
