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

if [ ! -d "frame" ]; then
  echo "没有找到 frame 文件夹，请先确认它在项目根目录下。"
  read "?按回车关闭..."
  exit 1
fi

echo "正在把 frame/ 里的图片压缩为 WebP，保持原始分辨率不变..."
echo "PNG/JPG/JPEG 会在成功转换后删除；SVG 会保持不变。"
echo ""
"$PYTHON_BIN" scripts/optimize-images.py frame

echo ""
echo "压缩完成。"
read "?按回车关闭..."
