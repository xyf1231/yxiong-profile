// 新闻详情页入口：若存在 SiteCore 统一渲染核心，则启动新闻页渲染
// 当前项目实际由 script.js 直接渲染，此文件保留用于兼容旧架构
if (window.SiteCore) window.SiteCore.start("news");
