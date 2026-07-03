#!/bin/zsh

set -euo pipefail

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
# 版本号自动递增工具函数
# ============================================
auto_bump_version() {
  local current_version=""
  local new_version=""
  
  current_version=$(get_current_version)
  
  if [ -z "$current_version" ] || [ "$current_version" = "v0.0.0" ]; then
    current_version="v1.0.0"
    echo "⚠️  VERSION 文件为空或不存在，使用默认版本 $current_version"
  fi
  
  echo "📌 当前版本号: $current_version"
  echo
  echo "请选择版本号更新策略:"
  echo "  1) 自动递增补丁号 (patch +1) — 推荐日常发布"
  echo "  2) 自动递增次版本号 (minor +1) — 较大功能更新"
  echo "  3) 手动输入版本号"
  echo "  4) 取消"
  echo
  
  read -r "?请选择 [1/2/3/4] (默认 1): " bump_choice
  bump_choice=${bump_choice:-1}
  echo
  
  # 解析当前版本号 vX.Y.Z
  local major minor patch
  major=$(echo "$current_version" | sed -E 's/^v?([0-9]+)\..*/\1/')
  minor=$(echo "$current_version" | sed -E 's/^v?[0-9]+\.([0-9]+)\..*/\1/')
  patch=$(echo "$current_version" | sed -E 's/^v?[0-9]+\.[0-9]+\.([0-9]+).*/\1/')
  
  # 确保解析成功
  major=${major:-1}
  minor=${minor:-0}
  patch=${patch:-0}
  
  case "$bump_choice" in
    1)
      patch=$((patch + 1))
      new_version="v${major}.${minor}.${patch}"
      echo "✅ 自动递增补丁号: $current_version → $new_version"
      ;;
    2)
      minor=$((minor + 1))
      patch=0
      new_version="v${major}.${minor}.${patch}"
      echo "✅ 自动递增次版本号: $current_version → $new_version"
      ;;
    3)
      read -r "?请输入新版本号 (格式 vX.Y.Z): " input_version
      if echo "$input_version" | grep -qE '^v?[0-9]+\.[0-9]+\.[0-9]+$'; then
        new_version="$input_version"
        # 确保带 v 前缀
        if [[ ! "$new_version" =~ ^v ]]; then
          new_version="v$new_version"
        fi
        echo "✅ 手动设置版本号: $current_version → $new_version"
      else
        echo "❌ 版本号格式不正确，已取消"
        return 1
      fi
      ;;
    4)
      echo "⏭️ 已取消"
      return 1
      ;;
    *)
      patch=$((patch + 1))
      new_version="v${major}.${minor}.${patch}"
      echo "✅ 自动递增补丁号: $current_version → $new_version"
      ;;
  esac
  
  # 写入 VERSION 文件
  echo "$new_version" > VERSION
  echo "   📝 已更新 VERSION 文件"
  
  # 运行 bump-version.sh 更新所有 HTML
  if [ -f "./bump-version.sh" ]; then
    echo "   🔄 正在运行 bump-version.sh 更新所有 HTML 文件..."
    bash ./bump-version.sh
    echo
  else
    echo "   ⚠️ bump-version.sh 不存在，跳过 HTML 版本号更新"
  fi
  
  # 返回新版本号
  echo "$new_version"
  return 0
}

# ============================================
# 主菜单
# ============================================

while true; do
  CURRENT_VER=$(get_current_version)
  
  echo
  echo "========================================"
  echo "  xyfoptics 网站发布"
  echo "  当前版本: $CURRENT_VER"
  echo "========================================"
  echo "  1. 更新版本号"
  echo "  2. 推送到 GitHub（更新 jsDelivr CDN，触发 Cloudflare Pages 自动部署）"
  echo "  3. 打开 Cloudflare Pages 预览地址"
  echo "  4. 打开正式域名"
  echo "  5. 本地预览（启动 http://localhost:3000）"
  echo "  6. 退出"
  echo "========================================"
  echo

  read -r "?请选择操作 [1/2/3/4/5/6]: " choice
  echo

  case "${choice:l}" in
    1)
      echo "---------- 更新版本号 ----------"
      echo
      
      new_ver=$(auto_bump_version) && VERSION_BUMPED=true || VERSION_BUMPED=false
      
      if [ "$VERSION_BUMPED" = true ]; then
        echo "📌 版本号已更新为: $new_ver"
        echo
        echo "💡 提示: 版本号更新已写入文件，但尚未提交。"
        echo "   请选择「2. 推送到 GitHub」将更改一起发布。"
      else
        echo "📌 版本号未变更，当前仍为: $(get_current_version)"
      fi
      echo
      ;;

    2)
      CURRENT_VER=$(get_current_version)
      echo "---------- 推送到 GitHub ----------"
      echo "📌 当前版本: $CURRENT_VER"
      echo

      # 检查 Git 仓库状态
      if ! git status --short > /dev/null 2>&1; then
        echo "❌ 无法访问 Git 仓库，请检查网络或 Git 配置"
        echo
        continue
      fi

      # 添加所有更改
      git add -A

      # 检查是否有更改要提交
      if git diff --cached --quiet; then
        echo "✅ 没有新的更改需要提交"
      else
        echo "提交更改（版本: $CURRENT_VER）..."
        git commit -m "Deploy $CURRENT_VER - update content"
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
        echo "  当前版本： $CURRENT_VER"
      else
        echo
        echo "❌ 推送失败"
        echo "  可能原因：网络问题、GitHub 凭据过期"
      fi
      echo
      ;;

    3)
      echo "打开 Cloudflare Pages 预览地址..."
      open "https://yxiong-profile.pages.dev"
      echo "✅ 已打开 https://yxiong-profile.pages.dev"
      echo
      ;;

    4)
      echo "打开正式域名..."
      open "https://xyfoptics.xyz"
      echo "✅ 已打开 https://xyfoptics.xyz"
      echo
      ;;

    5)
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

    6)
      echo "已退出。"
      exit 0
      ;;

    *)
      echo "请输入 1、2、3、4、5 或 6。"
      echo
      ;;
  esac
done
