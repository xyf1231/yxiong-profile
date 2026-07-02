#!/usr/bin/env python3
"""
Compress images in a folder to WebP and keep only WebP outputs.

Usage:
    python3 scripts/optimize-images.py [folder]

What it does:
1. Reads PNG, JPG, JPEG, and WebP files in the target folder.
2. Keeps the original image dimensions unchanged.
3. Writes optimized .webp files.
4. Removes original PNG/JPG/JPEG files after successful conversion.

SVG files are left untouched.
"""

import sys
from pathlib import Path

try:
    from PIL import Image
except ImportError:
    print("错误: 需要安装 Pillow 库")
    print("运行: python3 -m pip install Pillow")
    sys.exit(1)


ROOT_DIR = Path(__file__).resolve().parent.parent
DEFAULT_TARGET_DIR = ROOT_DIR / "assets"
WEBP_QUALITY = 80
SOURCE_SUFFIXES = {".png", ".jpg", ".jpeg", ".webp"}


def prepare_image(img: Image.Image) -> Image.Image:
    if img.mode in ("RGBA", "LA"):
        return img
    if img.mode == "P":
        return img.convert("RGBA") if "transparency" in img.info else img.convert("RGB")
    if img.mode not in ("RGB", "RGBA"):
        return img.convert("RGB")
    return img




def optimize_image(input_path: Path) -> tuple[bool, str]:
    try:
        original_size = input_path.stat().st_size
        webp_path = input_path.with_suffix(".webp")
        temp_path = webp_path.with_name(f"{webp_path.stem}.tmp.webp")

        with Image.open(input_path) as opened:
            img = prepare_image(opened)
            img.save(temp_path, "WEBP", quality=WEBP_QUALITY, method=6)

        temp_path.replace(webp_path)

        if input_path.suffix.lower() != ".webp" and input_path.exists():
            input_path.unlink()

        webp_size = webp_path.stat().st_size
        saved = original_size - webp_size
        parts = [f"原图: {original_size / 1024:.1f}KB"]
        parts.append(f"WebP: {webp_size / 1024:.1f}KB")
        parts.append(f"节省: {saved / 1024:.1f}KB")
        return True, " | ".join(parts)
    except Exception as error:
        return False, f"错误: {error}"


def resolve_target_dir(argv: list[str]) -> Path:
    if len(argv) > 2:
        print("用法: python3 scripts/optimize-images.py [folder]")
        raise SystemExit(1)

    if len(argv) == 2:
        candidate = Path(argv[1]).expanduser()
        if not candidate.is_absolute():
            candidate = (ROOT_DIR / candidate).resolve()
        return candidate

    return DEFAULT_TARGET_DIR


def main() -> int:
    target_dir = resolve_target_dir(sys.argv)

    if not target_dir.exists():
        print(f"错误: 找不到目录 {target_dir}")
        return 1

    image_files = sorted(
        path for path in target_dir.iterdir()
        if path.is_file() and path.suffix.lower() in SOURCE_SUFFIXES
    )

    if not image_files:
        print(f"在 {target_dir} 中未找到可压缩图片")
        return 0

    before_total = sum(path.stat().st_size for path in image_files)
    success_count = 0

    print(f"找到 {len(image_files)} 张图片，开始压缩为 WebP...")
    print(f"目标目录: {target_dir}")
    print(f"配置: 保持原始分辨率, WebP 质量 {WEBP_QUALITY}")
    print("-" * 60)

    for img_path in image_files:
        print(f"\n处理: {img_path.name}")
        success, message = optimize_image(img_path)
        print(f"  {message}")
        if success:
            success_count += 1

    webp_files = sorted(path for path in target_dir.iterdir() if path.is_file() and path.suffix.lower() == ".webp")
    after_total = sum(path.stat().st_size for path in webp_files)
    leftover_sources = sorted(
        path.name for path in target_dir.iterdir()
        if path.is_file() and path.suffix.lower() in {".png", ".jpg", ".jpeg"}
    )

    print("\n" + "=" * 60)
    print(f"优化完成: {success_count}/{len(image_files)} 张图片")
    print(f"压缩前参与处理图片: {before_total / 1024:.1f}KB")
    print(f"当前 WebP 总大小: {after_total / 1024:.1f}KB")
    if leftover_sources:
        print("警告: 仍有非 WebP 图片未删除:")
        for name in leftover_sources:
            print(f"  - {name}")
        return 1

    print("已只保留 WebP 图片，SVG 图标保持不变。")
    print("提示: 优化后如需上线，请运行一键部署到 Vercel。")
    return 0


if __name__ == "__main__":
    sys.exit(main())
