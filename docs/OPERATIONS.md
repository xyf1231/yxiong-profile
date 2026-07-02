# 运维说明

此文件已归档。当前唯一维护流程请见：`docs/WORKFLOW.md`。

当前稳定基线：

- 主数据源：`data.js`
- 部署：GitHub push -> Vercel 自动部署
- 版本更新：`node scripts/bump-version.mjs x.x.x`
- 本地检查：`node scripts/check-site.mjs`
