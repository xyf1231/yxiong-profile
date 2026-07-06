#!/bin/bash
# Letters Playground 一键启动器
# 双击此文件即可启动本地服务器并打开浏览器

cd "$HOME/Documents/02-个人/01-个人网站/个人简历网站" || exit 1

PORT=8082

echo "========================================"
echo "  🎨 Letters Playground 启动器"
echo "========================================"
echo ""

# 检查服务器是否已在运行
if curl -s --max-time 1 "http://localhost:$PORT/playground.html" > /dev/null 2>&1; then
    echo "✅ 本地服务器已在端口 $PORT 运行"
else
    echo "🚀 正在启动本地服务器 (端口 $PORT)..."
    # 使用 nohup 确保 Terminal 关闭后服务器继续运行
    nohup python3 -m http.server $PORT > /dev/null 2>&1 &
    
    # 等待服务器启动并确认可用
    for i in {1..10}; do
        sleep 0.5
        if curl -s --max-time 1 "http://localhost:$PORT/playground.html" > /dev/null 2>&1; then
            echo "✅ 服务器启动成功 (PID: $!)"
            break
        fi
        if [ $i -eq 10 ]; then
            echo "❌ 服务器启动失败，请检查 python3 是否安装"
            read -p "按回车键退出..."
            exit 1
        fi
    done
fi

echo ""
echo "🌐 正在打开浏览器..."
open "http://localhost:$PORT/playground.html"

echo ""
echo "✨ 完成！"
echo "   URL: http://localhost:$PORT/playground.html"
echo ""
echo "💡 提示："
echo "   • 修改 playground.html 后刷新浏览器即可看到更新"
echo "   • 服务器在后台运行，Terminal 关闭后仍然可用"
echo ""

# 3秒后自动关闭 Terminal 窗口
sleep 3
osascript -e 'tell application "Terminal" to close (every window whose name contains "Letters Playground")' &
