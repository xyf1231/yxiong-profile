#!/bin/zsh
set -e
cd "$(dirname "$0")/.."

NODE_BIN="/Users/xiongyifeng/.cache/codex-runtimes/codex-primary-runtime/dependencies/node/bin/node"
if [ ! -x "$NODE_BIN" ]; then
  NODE_BIN="$(command -v node || true)"
fi

if [ -z "$NODE_BIN" ]; then
  echo "没有找到 Node.js。请先安装 Node.js，或告诉我帮你配置。"
  read "?按回车关闭..."
  exit 1
fi

echo "正在启动本地网站预览..."
echo "浏览器会自动打开：http://localhost:8787/index.html"
echo "保持这个窗口打开；预览结束后按 Ctrl+C 关闭。"
ADMIN_OPEN_PATH="/index.html" "$NODE_BIN" scripts/admin-server.mjs
