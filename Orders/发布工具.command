#!/bin/bash
# xyfoptics 站点维护
# 一键打开后台管理界面

PROJECT_DIR="$HOME/Documents/02-个人/01-个人网站/个人简历网站"
PORT=8787
URL="http://localhost:${PORT}/admin.html"

echo "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"
echo "  xyfoptics 站点维护"
echo "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"

# 检查端口是否已被占用（admin-server 已在运行）
if lsof -Pi :$PORT -sTCP:LISTEN -t >/dev/null 2>&1; then
    echo "✅ 本地服务器已在运行 (端口 $PORT)"
else
    echo "🚀 正在启动本地服务器…"
    cd "$PROJECT_DIR" || exit 1
    nohup node scripts/admin-server.mjs >/dev/null 2>&1 &

    # 等待服务器就绪
    echo "⏳ 等待服务器启动…"
    for i in {1..30}; do
        if curl -s -o /dev/null "$URL" 2>/dev/null; then
            echo "✅ 服务器已就绪"
            break
        fi
        sleep 0.3
    done
fi

# 打开浏览器
echo "🌐 正在打开后台管理界面…"
open "$URL"

echo "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"
echo "  后台地址: $URL"
echo "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"

# 保持终端窗口短暂显示
sleep 1
