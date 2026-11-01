# 更新日志

本项目遵循语义化版本（SemVer）。

## [1.1.0] - 2026-11-01

### 新增
- **学习数据看板**（`#/stats`）：掌握度总览分段条、近 20 周 GitHub 风格学习热力图、
  各部分进度、全部章末测验成绩墙、个性化复习建议；学习日历数据并入备份/导入。
- **PWA 可安装**：`manifest.webmanifest` + Service Worker，桌面/主屏幕安装、
  资源预缓存、断网完整可用、新版本提示刷新；`file://` 双击使用时自动跳过。
- **命令面板**：`Ctrl/⌘+K` 唤起，知识点与页面操作统一模糊检索、全键盘操作。
- **快捷键帮助**：按 `?` 查看全部快捷键；知识点页新增 `←/→` 上一页/下一页。
- 新增品牌化 PWA 图标（192/512/maskable/apple-touch/SVG，脚本化零依赖生成）。
- 首页新增"学习数据看板"入口与顶栏看板按钮。
- 零依赖本地静态服务器 `scripts/serve.js`（含目录穿越防护）。

### 安全
- 引入 **DOMPurify**：AI 回复、用户笔记等不可信 Markdown 统一经消毒渲染，防止 XSS；
  库缺失时退化为保守的危险标签/事件属性过滤。
- 全局 `error` / `unhandledrejection` 兜底，异常不再导致整站白屏。
- API Key 等敏感数据继续仅存本机、备份脱敏。

### 无障碍
- skip-link（跳到正文）、可见焦点轮廓、纯图标按钮 `aria-label`、
  当前导航项 `aria-current`、阅读进度条 `role=progressbar`、Toast `aria-live`、
  面包屑语义化、`prefers-reduced-motion` 减少动效支持。

### 工程化
- 新增 `package.json`（脚本与版本单一事实来源）、`LICENSE`(MIT)、`.gitignore`。
- 质量脚本：`check-syntax.js`、`check-data.js`（新增死链/孤儿文件校验）、
  `smoke.js`（无头 Edge/Chrome 20+ 断言与桌面/移动截图）、`build-sw.js`、`make-icons.js`。
- Service Worker 预缓存清单由 `index.html` 自动生成，杜绝人工漏缓存。

## [1.0.0]

- 114 个知识点、九大板块；598 段带中文注释代码、323 道例题（含真题精讲）、
  362 道练习、539 条易错点、119 个核心模板、57 套章末测验。
- 知识图谱、收藏/错题本、背模板默写、在线运行沙箱、AI 私教、三套主题、
  全文搜索、打卡、笔记、备份导入导出、打印导出 PDF。
