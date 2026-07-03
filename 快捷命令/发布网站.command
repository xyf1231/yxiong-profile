#!/bin/zsh

set -euo pipefail

SCRIPT_DIR="$(cd "$(dirname "$0")" && pwd)"
PROJECT_DIR="$(cd "$SCRIPT_DIR/.." && pwd)"

cd "$PROJECT_DIR"

while true; do
  echo
  echo "========================================"
  echo "  xyfoptics 网站发布"
  echo "========================================"
  echo "  1. 推送到 GitHub（更新 jsDelivr CDN，触发 Cloudflare Pages 自动部署）"
  echo "  2. 打开 Cloudflare Pages 预览地址"
  echo "  3. 打开正式域名"
  echo "  4. 本地预览（启动 http://localhost:3000）"
  echo "  5. 退出"
  echo "========================================"
  echo

  read -r "?请选择操作 [1/2/3/4/5]: " choice
  echo

  case "${choice:l}" in
    1)
      echo "---------- 推送到 GitHub ----------"
      echo

      # 检查 Git 仓库状态
      if ! git status --short > /dev/null 2>&1; then
        echo "❌ 无法访问 Git 仓库，请检查网络或 Git 配置"
        echo
        continue
      fi

      # 添加所有更改
      git add -A

      # 获取版本号用于提交信息
      VERSION=$(cat VERSION 2>/dev/null || echo "")
      if [ -z "$VERSION" ]; then
        VERSION="$(date +%Y%m%d-%H%M)"
      fi

      # 检查是否有更改要提交
      if git diff --cached --quiet; then
        echo "✅ 没有新的更改需要提交"
      else
        echo "提交更改（版本: $VERSION）..."
        git commit -m "Deploy $VERSION - update content"
      fi

      # 推送到 GitHub
      echo
      echo "推送到 GitHub origin/main..."
      echo "（Cloudflare Pages 会自动从 GitHub 构建并部署）"
      echo

      if git push origin main; then
        echo
        echo "✅ 推送成功！"
        echo "  仓库地址： https://github.com/xyf1231/yxiong-profile"
        echo "  Cloudflare Pages 会自动构建部署"
        echo "  线上地址： https://xyfoptics.xyz"
        echo "  jsDelivr 缓存：5-10 分钟后生效"
      else
        echo
        echo "❌ 推送失败"
        echo "  可能原因：网络问题、GitHub 凭据过期"
      fi
      echo
      ;;

    2)
      echo "打开 Cloudflare Pages 预览地址..."
      open "https://yxiong-profile.pages.dev"
      echo "✅ 已打开 https://yxiong-profile.pages.dev"
      echo
      ;;

    3)
      echo "打开正式域名..."
      open "https://xyfoptics.xyz"
      echo "✅ 已打开 https://xyfoptics.xyz"
      echo
      ;;

    4)
      echo "---------- 本地预览 ----------"
      echo "正在启动本地服务器..."
      echo

      # 检查 npx 是否可用
      if ! command -v npx > /dev/null 2>&1; then
        echo "❌ 未找到 npx，请先安装 Node.js"
        echo
        continue
      fi

      # 后台启动 serve
      npx serve . -l 3000 &
      SERVE_PID=$!

      sleep 2
      open "http://localhost:3000"
      echo "✅ 已打开 http://localhost:3000"
      echo "   按回车键关闭本地服务器..."
      echo
      read -r ""

      # 关闭 serve 进程
      kill $SERVE_PID 2>/dev/null || true
      echo "本地服务器已关闭。"
      echo
      ;;

    5)
      echo "已退出。"
      exit 0
      ;;

    *)
      echo "请输入 1、2、3、4 或 5。"
      echo
      ;;
  esac
done
