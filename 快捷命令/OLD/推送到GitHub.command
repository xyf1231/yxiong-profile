#!/bin/bash
# ============================================================
# 推送到 GitHub 命令
# 功能：将本地修改提交并推送到 GitHub 仓库
# 用法：双击此文件或在终端执行
# ============================================================

PROJECT_DIR="/Users/xiongyifeng/Documents/02-个人/01-个人网站/个人简历网站"
cd "$PROJECT_DIR" || exit 1

echo "========================================"
echo "  推送到 GitHub - xyf1231/yxiong-profile"
echo "========================================"
echo ""

# 1. 检查 Git 仓库状态
echo "[1/4] 检查 Git 仓库状态..."
if ! git status --short > /dev/null 2>&1; then
  echo "❌ 无法访问 Git 仓库，请检查网络或 Git 配置"
  exit 1
fi

# 2. 添加所有更改
echo "[2/4] 添加所有更改..."
git add -A

# 3. 获取版本号用于提交信息
VERSION=$(grep '"version":' package.json | head -1 | sed 's/.*"\(.*\)".*/\1/')
if [ -z "$VERSION" ]; then
  VERSION="$(date +%Y%m%d-%H%M)"
fi

# 检查是否有更改要提交
if git diff --cached --quiet; then
  echo "✅ 没有新的更改需要提交"
else
  echo "[3/4] 提交更改（版本: $VERSION）..."
  git commit -m "Deploy v$VERSION - update content" 2>&1
fi

# 4. 推送到 GitHub
echo "[4/4] 推送到 GitHub origin/main..."
echo "（如果网络较慢，可能需要等待 1-2 分钟）"
echo ""

git push origin main 2>&1
PUSH_STATUS=$?

if [ $PUSH_STATUS -eq 0 ]; then
  echo ""
  echo "========================================"
  echo "  ✅ 推送成功！"
  echo "========================================"
  echo "  仓库地址： https://github.com/xyf1231/yxiong-profile"
  echo "  jsDelivr 缓存：5-10 分钟后生效"
  echo "  网站地址： https://xyfoptics.xyz"
  echo "========================================"
else
  echo ""
  echo "========================================"
  echo "  ❌ 推送失败"
  echo "========================================"
  echo "  可能原因："
  echo "  1. 网络连接问题（GitHub 被墙或网络不稳定）"
  echo "  2. GitHub 凭据过期"
  echo ""
  echo "  建议："
  echo "  - 检查网络连接"
  echo "  - 稍后再试"
  echo "  - 使用 VPN 或代理"
  echo "========================================"
  exit 1
fi

echo ""
read -n 1 -s -r -p "按任意键关闭..."
