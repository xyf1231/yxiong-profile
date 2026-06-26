#!/usr/bin/env python3
"""
图片优化脚本 - 压缩 assets 目录中的图片

用法:
    python3 optimize-images.py

功能:
1. 压缩 PNG 图片（保持质量但减少文件大小）
2. 重新生成 WebP 版本（通常比 PNG 小 30-80%）
3. 限制最大尺寸（防止上传了超大原图）

需要安装依赖:
    pip install Pillow
"""

import os
import sys
from pathlib import Path

try:
    from PIL import Image
except ImportError:
    print("错误: 需要安装 Pillow 库")
    print("运行: pip install Pillow")
    sys.exit(1)

# 配置
ASSETS_DIR = Path(__file__).parent / "assets"
MAX_WIDTH = 1200  # 最大宽度，超过则缩放
MAX_HEIGHT = 800  # 最大高度
PNG_QUALITY = 85  # PNG 压缩质量 (0-100)
WEBP_QUALITY = 80  # WebP 压缩质量 (0-100)


def optimize_image(input_path: Path) -> tuple[bool, str]:
    """优化单张图片，返回 (是否成功, 消息)"""
    try:
        img = Image.open(input_path)
        original_size = input_path.stat().st_size
        
        # 转换为 RGB（去除透明通道，如果不是透明图片）
        if img.mode in ('RGBA', 'P'):
            # 检查是否有实际透明内容
            has_alpha = False
            if img.mode == 'RGBA':
                alpha = img.getchannel('A')
                has_alpha = any(p < 255 for p in alpha.getdata())
            
            if not has_alpha:
                img = img.convert('RGB')
        
        # 检查尺寸，过大则缩放
        width, height = img.size
        if width > MAX_WIDTH or height > MAX_HEIGHT:
            ratio = min(MAX_WIDTH / width, MAX_HEIGHT / height)
            new_width = int(width * ratio)
            new_height = int(height * ratio)
            img = img.resize((new_width, new_height), Image.LANCZOS)
            print(f"  缩放: {width}x{height} -> {new_width}x{new_height}")
        
        # 保存优化后的 PNG
        png_path = input_path
        if img.mode == 'RGBA':
            img.save(png_path, 'PNG', optimize=True)
        else:
            img.save(png_path, 'PNG', optimize=True)
        
        png_size = png_path.stat().st_size
        png_saved = original_size - png_size
        
        # 生成 WebP 版本
        webp_path = input_path.with_suffix('.webp')
        if img.mode == 'RGBA':
            img.save(webp_path, 'WEBP', quality=WEBP_QUALITY, method=6)
        else:
            img.save(webp_path, 'WEBP', quality=WEBP_QUALITY, method=6)
        
        webp_size = webp_path.stat().st_size
        webp_saved = original_size - webp_size
        
        msg = (f"  原图: {original_size/1024:.1f}KB | "
               f"PNG: {png_size/1024:.1f}KB (省 {png_saved/1024:.1f}KB) | "
               f"WebP: {webp_size/1024:.1f}KB (省 {webp_saved/1024:.1f}KB)")
        return True, msg
        
    except Exception as e:
        return False, f"  错误: {e}"


def main():
    if not ASSETS_DIR.exists():
        print(f"错误: 找不到目录 {ASSETS_DIR}")
        sys.exit(1)
    
    # 收集所有图片
    image_files = sorted(
        f for f in ASSETS_DIR.iterdir()
        if f.suffix.lower() in ('.png', '.jpg', '.jpeg')
    )
    
    if not image_files:
        print(f"在 {ASSETS_DIR} 中未找到图片")
        sys.exit(1)
    
    print(f"找到 {len(image_files)} 张图片，开始优化...")
    print(f"配置: 最大尺寸 {MAX_WIDTH}x{MAX_HEIGHT}, WebP 质量 {WEBP_QUALITY}")
    print("-" * 60)
    
    total_original = 0
    total_png = 0
    total_webp = 0
    success_count = 0
    
    for img_path in image_files:
        print(f"\n处理: {img_path.name}")
        success, msg = optimize_image(img_path)
        print(msg)
        
        if success:
            success_count += 1
            total_original += img_path.stat().st_size
            total_png += img_path.stat().st_size
            webp_path = img_path.with_suffix('.webp')
            if webp_path.exists():
                total_webp += webp_path.stat().st_size
    
    print("\n" + "=" * 60)
    print(f"优化完成: {success_count}/{len(image_files)} 张图片")
    if success_count > 0:
        print(f"PNG 总节省: {(total_original - total_png)/1024:.1f}KB")
        print(f"WebP 相比原图总节省: {(total_original - total_webp)/1024:.1f}KB")
        print(f"WebP 节省比例: {(total_original - total_webp)/total_original*100:.1f}%")
    print("\n提示: 优化后请重新部署到 Vercel")


if __name__ == "__main__":
    main()
