# 更新日志

## v1.8.3 - 2025-07-05
- 类型：回滚
- 变更：回滚 v1.8.2 中尝试的 CSS 模块化拆分（base/nav/components/home/profile/publications/admin/animations）。拆分后 `@import` 方式会增加 HTTP 请求数，且调试复杂度上升，暂不适合当前项目阶段。恢复原单文件 `styles.css` 结构。
- 检查：npm run check 通过
- 部署：未部署

## v1.8.2 - 2025-07-05

## v1.8.2 - 2025-07-05
- 类型：修复
- 变更：修复手机端个人简介卡片中照片和名字未水平居中的问题。将 `.profile-card-left` 的 `display: grid` 改为 `display: flex; flex-direction: column; align-items: center`，确保照片和姓名在 flex 容器中明确居中。
- 检查：npm run check 通过
- 部署：未部署

## v1.8.1 - 2025-07-05
- 类型：修复
- 变更：修复上一版本引入的样式问题
- 检查：npm run check 通过
- 部署：已发布

## v1.8.0 - 2025-07-04
- 类型：功能
- 变更：新增个人简介页面和研究内容板块
- 检查：npm run check 通过
- 部署：已发布

