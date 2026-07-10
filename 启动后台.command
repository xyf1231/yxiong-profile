#!/bin/zsh
set -e
cd "$(dirname "$0")"

NODE_BIN="/Users/xiongyifeng/.cache/codex-runtimes/codex-primary-runtime/dependencies/node/bin/node"
if [ ! -x "$NODE_BIN" ]; then
  NODE_BIN="$(command -v node || true)"
fi

if [ -z "$NODE_BIN" ]; then
  echo "没有找到 Node.js。请先安装 Node.js，或告诉我帮你配置。"
  read "?按回车关闭..."
  exit 1
fi

stop_existing_server() {
  local port=8787
  local pids=""

  if command -v lsof >/dev/null 2>&1; then
    pids="$(lsof -tiTCP:"$port" -sTCP:LISTEN 2>/dev/null || true)"
  fi

  if [ -z "$pids" ]; then
    return 0
  fi

  echo "检测到已有后台占用 8787 端口，正在先关闭旧服务器..."
  for pid in $pids; do
    kill "$pid" 2>/dev/null || true
  done

  for _ in 1 2 3 4 5; do
    sleep 1
    if command -v lsof >/dev/null 2>&1 && ! lsof -tiTCP:"$port" -sTCP:LISTEN >/dev/null 2>&1; then
      echo "旧服务器已关闭。"
      return 0
    fi
  done

  for pid in $pids; do
    kill -9 "$pid" 2>/dev/null || true
  done

  echo "旧服务器未能在短时间内退出，已强制关闭。"
}

stop_existing_server

echo "正在启动本地后台..."
echo "浏览器会自动打开：http://localhost:8787/admin.html"
echo "内容会写入 js/data.js，文件会写入 resources/images/、resources/papers/、resources/videos/ 和 resources/frames/。"
echo "发布流程使用 GitHub + Cloudflare Pages 自动部署。"
echo "保持这个窗口打开；维护结束后按 Ctrl+C 关闭。"
"$NODE_BIN" scripts/admin-server.mjs
