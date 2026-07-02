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
  echo "  1. 推送到 GitHub（更新 jsDelivr CDN）"
  echo "  2. 部署到 Vercel（更新线上网站）"
  echo "  3. 全部执行（GitHub → Vercel）"
  echo "  4. 退出"
  echo "========================================"
  echo

  read -r "?请选择操作 [1/2/3/4]: " choice
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
      VERSION=$(grep '"version":' package.json | head -1 | sed 's/.*"\(.*\)".*/\1/')
      if [ -z "$VERSION" ]; then
        VERSION="$(date +%Y%m%d-%H%M)"
      fi

      # 检查是否有更改要提交
      if git diff --cached --quiet; then
        echo "✅ 没有新的更改需要提交"
      else
        echo "提交更改（版本: $VERSION）..."
        git commit -m "Deploy v$VERSION - update content"
      fi

      # 推送到 GitHub
      echo
      echo "推送到 GitHub origin/main..."
      echo "（如果网络较慢，可能需要等待 1-2 分钟）"
      echo

      if git push origin main; then
        echo
        echo "✅ 推送成功！"
        echo "  仓库地址： https://github.com/xyf1231/yxiong-profile"
        echo "  jsDelivr 缓存：5-10 分钟后生效"
      else
        echo
        echo "❌ 推送失败"
        echo "  可能原因：网络问题、GitHub 凭据过期"
      fi
      echo
      ;;

    2)
      echo "---------- 部署到 Vercel ----------"
      echo
      if npx vercel --prod; then
        echo
        echo "✅ 部署完成"
        echo "  线上地址： https://xyfoptics.xyz"
      else
        echo
        echo "❌ 部署失败，请检查上方报错"
      fi
      echo
      ;;

    3)
      echo "---------- 全部执行：GitHub → Vercel ----------"
      echo

      # GitHub 推送
      if ! git status --short > /dev/null 2>&1; then
        echo "❌ 无法访问 Git 仓库，请检查网络或 Git 配置"
        echo
        continue
      fi

      git add -A

      VERSION=$(grep '"version":' package.json | head -1 | sed 's/.*"\(.*\)".*/\1/')
      if [ -z "$VERSION" ]; then
        VERSION="$(date +%Y%m%d-%H%M)"
      fi

      if git diff --cached --quiet; then
        echo "✅ 没有新的更改需要提交"
      else
        echo "提交更改（版本: $VERSION）..."
        git commit -m "Deploy v$VERSION - update content"
      fi

      echo
      echo "推送到 GitHub..."
      if git push origin main; then
        echo "✅ GitHub 推送成功"
      else
        echo "❌ GitHub 推送失败，跳过 Vercel 部署"
        echo
        continue
      fi

      echo
      echo "部署到 Vercel..."
      if npx vercel --prod; then
        echo
        echo "✅ 部署完成！"
        echo "  jsDelivr 缓存：5-10 分钟后生效"
        echo "  线上地址： https://xyfoptics.xyz"
      else
        echo
        echo "❌ Vercel 部署失败，请检查上方报错"
      fi
      echo
      ;;

    4)
      echo "已退出。"
      exit 0
      ;;

    *)
      echo "请输入 1、2、3 或 4。"
      echo
      ;;
  esac
done
