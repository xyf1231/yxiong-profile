# 移动端全屏黑边修复计划

## 问题
手机端地址栏收起后，hero 区段用 `100vh` 固定不变，viewport 变高后露出 body 黑底。

## 改动

### css/styles.css — 全部 vh → dvh（14处）

| 行 | 选择器 | 改动 |
|----|--------|------|
| ~946 | `.hero` | `92vh` → `92dvh` |
| ~957 | `.portal-hero` | `94vh` → `94dvh` |
| ~962 | `.fiber-hero` | `100vh` → `100dvh` |
| ~972 | `.fiber-hero::after` | `34vh` → `34dvh` |
| ~980 | `.fiber-story` | `360vh` → `360dvh` |
| ~987 | `.fiber-sticky` | `100vh` → `100dvh` |
| ~994 | `.clean-hero` | `100vh` → `100dvh` |
| ~1004 | `.clean-hero::after` | `40vh` → `40dvh` |
| ~1251 | `.story-panel` | `100vh` → `100dvh` |
| ~1337 | `.page-hero` | `72vh` → `72dvh` |
| ~1361 | `.profile-landing` | `86vh` → `86dvh` |
| ~3556 | `.page-hero`（mobile） | `68vh` → `68dvh` |
| ~9792 | `.home-frame-stage` | `100vh` → `100dvh` |

### css/home-config.css

| 行 | 变量 | 改动 |
|----|------|------|
| ~9 | `--hero-min-height` | `100vh` → `100dvh` |

已存在的 `100svh` / `100dvh` 规则不动。
