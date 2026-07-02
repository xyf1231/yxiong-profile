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

echo "正在一键压缩 assets/ 里的图片到 WebP..."
echo "PNG/JPG/JPEG 会在成功转换后删除；SVG 会保持不变。"
echo ""
"$PYTHON_BIN" scripts/optimize-images.py

echo ""
echo "压缩完成。需要上线时，请再运行“部署到Vercel.command”。"
read "?按回车关闭..."
