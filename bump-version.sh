#!/bin/bash
# ============================================
# 网站版本号统一升级脚本
# 用法: ./bump-version.sh
# 原理: 读取 VERSION 文件，批量替换所有 HTML 中的缓存版本戳
# ============================================

set -e

PROJECT_DIR="$(cd "$(dirname "$0")" && pwd)"
VERSION_FILE="$PROJECT_DIR/VERSION"

# 读取版本号（去掉首尾空白）
if [ ! -f "$VERSION_FILE" ]; then
    echo "❌ 错误: VERSION 文件不存在于 $VERSION_FILE"
    echo "   请创建 VERSION 文件并写入新版本号，例如: echo 'v1.6.2' > VERSION"
    exit 1
fi

NEW_VERSION=$(cat "$VERSION_FILE" | tr -d '[:space:]')

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
        
        # 使用正则匹配 ?v=vX.Y.Z 或 ?v=vX.Y.Z" 格式并替换
        # 先检查文件是否包含版本戳
        if grep -qE '\?v=v[0-9]+\.[0-9]+\.[0-9]+' "$file"; then
            # 获取旧版本号（取第一个匹配）
            OLD_VERSION=$(grep -oE 'v=[vV][0-9]+\.[0-9]+\.[0-9]+' "$file" | head -1 | sed 's/v=//')
            
            # 执行替换: 匹配任意 vX.Y.Z 格式
            sed -i '' -E "s/\?v=v[0-9]+\.[0-9]+\.[0-9]+/?v=$NEW_VERSION/g" "$file"
            
            # 验证替换结果
            if grep -qF "?v=$NEW_VERSION" "$file"; then
                echo "   ✅ $FILENAME  ($OLD_VERSION → $NEW_VERSION)"
                UPDATED_COUNT=$((UPDATED_COUNT + 1))
            else
                echo "   ⚠️  $FILENAME  替换可能未生效，请检查"
            fi
        else
            echo "   ⏭️  $FILENAME  (无版本戳，跳过)"
        fi
        FILE_COUNT=$((FILE_COUNT + 1))
    fi
done

echo ""
echo "========================================"
echo "✅ 完成! 共处理 $FILE_COUNT 个文件，更新 $UPDATED_COUNT 个"
echo "📌 当前版本号: $NEW_VERSION"
echo "========================================"
