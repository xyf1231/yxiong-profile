#!/bin/zsh

set -euo pipefail

SCRIPT_DIR="$(cd "$(dirname "$0")" && pwd)"
PROJECT_DIR="$(cd "$SCRIPT_DIR/.." && pwd)"

cd "$PROJECT_DIR"

echo "Vercel 部署菜单"
echo "输入 y 开始部署，输入 n 退出。"
echo

while true; do
  read -r "?是否现在部署到 Vercel? [y/n] " answer
  case "${answer:l}" in
    y)
      echo
      echo "开始部署..."
      echo
      if npx vercel --prod; then
        echo
        echo "部署完成。"
      else
        echo
        echo "部署失败，请检查上方报错。"
      fi
      echo
      ;;
    n)
      echo
      echo "已退出。"
      exit 0
      ;;
    *)
      echo "请输入 y 或 n。"
      echo
      ;;
  esac
done