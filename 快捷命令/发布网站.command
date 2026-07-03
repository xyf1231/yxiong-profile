#!/bin/bash

set -uo pipefail

SCRIPT_DIR="$(cd "$(dirname "$0")" && pwd)"
PROJECT_DIR="$(cd "$SCRIPT_DIR/.." && pwd)"

cd "$PROJECT_DIR"

# ============================================
# 读取当前版本号
# ============================================
get_current_version() {
  if [ -f "VERSION" ]; then
    cat VERSION | tr -d '[:space:]'
  else
    echo "v0.0.0"
  fi
}

# ============================================
# 非交互模式：自动 patch+1 并推送
# ============================================
if [ ! -t 0 ]; then
  echo "检测到非交互环境，自动执行 patch+1 并推送"
  echo ""
  
  current_version=$(get_current_version)
  
  # 用 cut 分割 vX.Y.Z，避免 sed 捕获组问题
  ver_no_v=$(echo "$current_version" | sed 's/^v//')
  major=$(echo "$ver_no_v" | cut -d. -f1)
  minor=$(echo "$ver_no_v" | cut -d. -f2)
  patch=$(echo "$ver_no_v" | cut -d. -f3)
  
  # 安全检查：确保解析结果是纯数字
  if ! echo "$major" | grep -qE '^[0-9]+$' || ! echo "$minor" | grep -qE '^[0-9]+$' || ! echo "$patch" | grep -qE '^[0-9]+$'; then
    echo "错误: 无法解析版本号 '$current_version'，请检查 VERSION 文件格式"
    exit 1
  fi
  ver_no_v=$(echo "$current_version" | sed 's/^v//')
  major=$(echo "$ver_no_v" | cut -d. -f1)
  minor=$(echo "$ver_no_v" | cut -d. -f2)
  patch=$(echo "$ver_no_v" | cut -d. -f3)
  
  major=${major:-1}
  minor=${minor:-0}
  patch=${patch:-0}
  patch=$((patch + 1))
  new_version="v${major}.${minor}.${patch}"
  
  echo "自动递增补丁号: $current_version -> $new_version"
  echo "$new_version" > VERSION
  
  if [ -f "./bump-version.sh" ]; then
    echo "更新所有 HTML 文件..."
    bash ./bump-version.sh
  fi
  
  echo ""
  echo "---------- 推送到 GitHub ----------"
  
  if ! git status --short > /dev/null 2>&1; then
    echo "无法访问 Git 仓库"
    exit 1
  fi
  
  git add -A
  
  if ! git diff --cached --quiet; then
    git commit -m "Deploy $new_version - update content"
  fi
  
  echo "推送到 GitHub origin/main..."
  if git push origin main; then
    echo ""
    echo "完成！版本: $new_version"
    echo "线上地址: https://xyfoptics.xyz"
  else
    echo "推送失败"
    exit 1
  fi
  
  exit 0
fi

# ============================================
# 交互式菜单
# ============================================

while true; do
  CURRENT_VER=$(get_current_version)

  echo ""
  echo "========================================"
  echo "  xyfoptics 网站发布"
  echo "  当前版本: $CURRENT_VER"
  echo "========================================"
  echo ""
  echo "  1) 更新版本号 (自动 patch +1)"
  echo "  2) 本地预览（启动 http://localhost:3000）"
  echo "  3) 推送到 GitHub（触发 Cloudflare Pages 部署）"
  echo "  4) 打开 Cloudflare Pages 预览地址"
  echo "  5) 打开正式域名"
  echo "  0) 退出"
  echo ""
  read -rp "请选择操作 (输入编号): " choice
  echo ""

  case "$choice" in
    1)
      echo ""
      echo "---------- 更新版本号 ----------"
      echo ""

      current_version=$(get_current_version)

      # 用 cut 分割 vX.Y.Z，避免 sed 捕获组问题
      ver_no_v=$(echo "$current_version" | sed 's/^v//')
      major=$(echo "$ver_no_v" | cut -d. -f1)
      minor=$(echo "$ver_no_v" | cut -d. -f2)
      patch=$(echo "$ver_no_v" | cut -d. -f3)

      # 安全检查：确保解析结果是纯数字
      if ! echo "$major" | grep -qE '^[0-9]+$' || ! echo "$minor" | grep -qE '^[0-9]+$' || ! echo "$patch" | grep -qE '^[0-9]+$'; then
        echo "错误: 无法解析版本号 '$current_version'，请检查 VERSION 文件格式"
        exit 1
      fi

      major=${major:-1}
      minor=${minor:-0}
      patch=${patch:-0}

      patch=$((patch + 1))
      new_version="v${major}.${minor}.${patch}"

      echo "自动递增补丁号: $current_version -> $new_version"
      echo "$new_version" > VERSION
      echo "  VERSION 文件已更新"

      if [ -f "./bump-version.sh" ]; then
        echo "  正在运行 bump-version.sh..."
        bash ./bump-version.sh
        echo ""
      fi

      echo "版本号已更新为: $new_version"
      echo ""
      echo "提示: 如需 minor+1 或手动设置，请直接编辑 VERSION 文件"
      echo ""
      ;;

    2)
      echo ""
      echo "---------- 本地预览 ----------"
      echo "正在启动本地服务器..."
      echo ""

      if ! command -v npx > /dev/null 2>&1; then
        echo "未找到 npx，请先安装 Node.js"
        echo ""
        continue
      fi

      npx serve . -l 3000 &
      SERVE_PID=$!

      sleep 2
      open "http://localhost:3000"
      echo "已打开 http://localhost:3000"
      echo "  按回车键关闭服务器..."
      echo ""
      read -r ""

      kill $SERVE_PID 2>/dev/null || true
      echo "服务器已关闭。"
      echo ""
      ;;

    3)
      CURRENT_VER=$(get_current_version)
      echo ""
      echo "---------- 推送到 GitHub ----------"
      echo "当前版本: $CURRENT_VER"
      echo ""

      if ! git status --short > /dev/null 2>&1; then
        echo "无法访问 Git 仓库"
        echo ""
        continue
      fi

      git add -A

      if git diff --cached --quiet; then
        echo "没有新的更改需要提交"
      else
        echo "提交更改（版本: $CURRENT_VER）..."
        git commit -m "Deploy $CURRENT_VER - update content"
      fi

      echo ""
      echo "推送到 GitHub origin/main..."
      echo "（Cloudflare Pages 会自动构建部署）"
      echo ""

      if git push origin main; then
        echo ""
        echo "推送成功！"
        echo "  仓库地址: https://github.com/xyf1231/yxiong-profile"
        echo "  线上地址: https://xyfoptics.xyz"
        echo "  当前版本: $CURRENT_VER"
      else
        echo ""
        echo "推送失败"
      fi
      echo ""
      ;;

    4)
      echo ""
      echo "正在打开 Cloudflare 预览地址..."
      open "https://yxiong-profile.pages.dev"
      echo "已打开 https://yxiong-profile.pages.dev"
      echo ""
      ;;

    5)
      echo ""
      echo "正在打开正式域名..."
      open "https://xyfoptics.xyz"
      echo "已打开 https://xyfoptics.xyz"
      echo ""
      ;;

    0)
      echo ""
      echo "已退出。"
      exit 0
      ;;

    *)
      echo ""
      echo "无效选择，请重新输入。"
      echo ""
      ;;
  esac
done
