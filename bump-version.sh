#!/bin/bash
# ============================================
# 网站版本号统一升级脚本
# 用法: ./bump-version.sh
# 原理: 读取 VERSION 文件，批量替换所有 HTML 中的版本号
# 覆盖: 1) 缓存版本戳 ?v=vX.Y.Z  2) footer 中的 Version X.Y.Z
# ============================================

set -e

PROJECT_DIR="$(cd "$(dirname "$0")" && pwd)"
VERSION_FILE="$PROJECT_DIR/VERSION"

# 读取版本号（去掉首尾空白，去掉 v 前缀用于 footer）
if [ ! -f "$VERSION_FILE" ]; then
    echo "❌ 错误: VERSION 文件不存在于 $VERSION_FILE"
    echo "   请创建 VERSION 文件并写入新版本号，例如: echo 'v1.6.2' > VERSION"
    exit 1
fi

NEW_VERSION=$(cat "$VERSION_FILE" | tr -d '[:space:]')
NEW_VERSION_NO_V=$(echo "$NEW_VERSION" | sed 's/^v//')

if [ -z "$NEW_VERSION" ]; then
    echo "❌ 错误: VERSION 文件为空"
    exit 1
fi

# 验证版本号格式 (vX.Y.Z)
if ! echo "$NEW_VERSION" | grep -qE '^v[0-9]+\.[0-9]+\.[0-9]+$'; then
    echo "⚠️  警告: 版本号 '$NEW_VERSION' 不符合 vX.Y.Z 格式，是否继续? (y/n)"
    read -r CONFIRM
    if [ "$CONFIRM" != "y" ] && [ "$CONFIRM" != "Y" ]; then
        exit 0
    fi
fi

echo "🔄 正在升级全站版本号 → $NEW_VERSION"
echo "   项目目录: $PROJECT_DIR"
echo ""

# 统计替换情况
UPDATED_COUNT=0
FILE_COUNT=0

for file in "$PROJECT_DIR"/*.html; do
    if [ -f "$file" ]; then
        FILENAME=$(basename "$file")
        HAS_CHANGE=false
        
        # ===== 1. 替换缓存版本戳 ?v=vX.Y.Z =====
        if grep -qE '\?v=v[0-9]+\.[0-9]+\.[0-9]+' "$file"; then
            OLD_CACHE=$(grep -oE 'v=[vV][0-9]+\.[0-9]+\.[0-9]+' "$file" | head -1 | sed 's/v=//')
            sed -i '' -E "s/\?v=v[0-9]+\.[0-9]+\.[0-9]+/?v=$NEW_VERSION/g" "$file"
            if grep -qF "?v=$NEW_VERSION" "$file"; then
                echo "   📝 $FILENAME  缓存戳 $OLD_CACHE → $NEW_VERSION"
                HAS_CHANGE=true
            fi
        fi
        
        # ===== 2. 替换 footer 中的 Version X.Y.Z =====
        if grep -qE 'Version [0-9]+\.[0-9]+\.[0-9]+' "$file"; then
            OLD_FOOTER=$(grep -oE 'Version [0-9]+\.[0-9]+\.[0-9]+' "$file" | head -1 | sed 's/Version //')
            sed -i '' -E "s/Version [0-9]+\.[0-9]+\.[0-9]+/Version $NEW_VERSION_NO_V/g" "$file"
            if grep -qF "Version $NEW_VERSION_NO_V" "$file"; then
                echo "   🦶 $FILENAME  footer $OLD_FOOTER → $NEW_VERSION_NO_V"
                HAS_CHANGE=true
            fi
        fi
        
        if [ "$HAS_CHANGE" = true ]; then
            UPDATED_COUNT=$((UPDATED_COUNT + 1))
        else
            echo "   ⏭️  $FILENAME  (无版本号，跳过)"
        fi
        
        FILE_COUNT=$((FILE_COUNT + 1))
    fi
done

echo ""
echo "========================================"
echo "✅ 完成! 共处理 $FILE_COUNT 个文件，更新 $UPDATED_COUNT 个"
echo "📌 当前版本号: $NEW_VERSION (缓存戳) / $NEW_VERSION_NO_V (footer)"
echo "========================================"
