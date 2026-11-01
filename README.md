# 📘 信息学 C++ 学习手册（CSP-J / CSP-S）

一个**零运行时依赖、双击即用、完全离线、可安装**的专业级静态学习网站：面向信息学奥赛学员的
系统化 C++ 讲义，包含知识点详解、带中文注释的代码、例题精讲、课后练习、章末测验、背模板默写、
学习数据看板、个人笔记与 AI 私教答疑。

> 版本 **v1.1.0** · 纯原生 HTML/CSS/JavaScript，无构建步骤、无框架、无后端。

## 🚀 快速开始

### 方式一：直接打开
双击 `index.html` 即可（推荐 Chrome / Edge）。所有学习数据保存在浏览器 localStorage，
无需安装任何环境、无需联网：Markdown 渲染（marked）、代码高亮（highlight.js）与
XSS 消毒（DOMPurify）均已内置在 `vendor/` 目录；即使这些库意外缺失，手册内置的极简
Markdown 渲染器也能保证正文（含表格、引用、列表、任务清单）正常阅读。
仅"C++ 在线运行"和"AI 私教"两项功能本身需要联网。

### 方式二：本地服务器（AI 直连 / PWA 离线安装推荐）
```bash
# 需要 Node.js（仅开发/服务用途，非运行时依赖）
npm run serve          # 等价于 node scripts/serve.js 8000
# 或使用 Python： python -m http.server 8000
# 然后浏览器访问 http://localhost:8000
```
通过 http(s) 访问时，站点会注册 Service Worker，可**安装到桌面/主屏幕**并在断网后完整离线使用。

### 安装为桌面 / 手机应用
在 http(s) 方式打开后：
- **Chrome / Edge（桌面）**：地址栏右侧"安装"图标，或菜单 →"安装此应用"；
- **iOS Safari**：分享 →"添加到主屏幕"；
- **Android Chrome**：菜单 →"添加到主屏幕 / 安装应用"。

## ✨ 功能

- **114 个知识点全部成稿**：九大板块，从零基础到 NOI
- 每个知识点：概念详解 + **598 段带详细中文注释的 C++ 代码** + 323 道例题（题解默认折叠，含标注来源的真题/初赛高频考题）+ 362 道课后练习 + 539 条易错点 + 小结
- **🏆 真题与经典名题精讲**：算法知识点配有标注真实来源（NOIP/CSP、洛谷经典题号）的精讲例题，金色来源徽章
- **119 个可背诵核心模板**：知识点页速记 + 独立"模板速查"页（搜索/分篇筛选）
- **🎯 考级与初赛专题（第四部分）**：GESP 与 CSP-J/S 初赛全解析；硬件、**补码**、系统、网络、HTTP、安全、多媒体、AI，每点配有初赛高频考题
- **⚔️ 竞赛算法进阶（第五部分）**：双指针/滑窗、树上差分/树链剖分、矩阵快速幂、高斯消元、SG 博弈
- **🏆 高阶算法专题（第六部分）**：**计算几何（叉积/凸包）、数论进阶（Lucas/CRT）、高级分治（CDQ/整体二分/离线连通性）**
- **🎓 字符串、网络流与多项式（第七部分）**：AC 自动机、后缀数组/自动机、最小费用最大流、FFT / NTT
- **💎 可持久化、线性基与莫队（第八部分）**：主席树、可持久化 Trie、线性基、普通/带修莫队
- **🌌 NOI 前沿专题（第九部分）**：**Link-Cut Tree、K-D Tree、多项式牛顿迭代（ln/exp）、生成函数、最小割树、LGV 引理**
- **知识图谱**：每页底部展示先修知识与后续延伸，自动连成学习路径
- **章末测验**：57 套测验卷共 171 道单选题，即时判分 + 逐题解析 + 最佳成绩记录
- **背模板默写模式**：关键标识符自动挖空，检查/显示答案；支持随机抽题挑战
- **收藏与错题本**：练习题、模板均可收藏，做错的题加入错题本集中复习（数据随备份导出）
- **C++ 在线运行沙箱**：完整程序代码块可直接"▶ 运行"（语法演示/待分析片段等无 main 的代码块自动只保留复制，避免误运行报错），由 Wandbox 公共服务 GCC 编译（支持标准输入），无需本地环境
- 代码块 mac 风格工具栏（语言标识 + 一键复制）、长代码限高滚动、highlight.js 高亮
- 页内目录导航（宽屏右侧悬浮，滚动高亮当前章节）、顶部阅读进度条、回到顶部
- 📊 **学习数据看板**：掌握度总览、近 20 周 GitHub 风格学习热力图、各部分进度条、全部测验成绩、个性化复习建议（`#/stats`）
- 🔥 连续学习打卡、全文搜索（正文内容也能搜到）、Ctrl+P 打印自动展开所有题解（可导出 PDF）
- 🔍 大纲即时搜索（按 `/` 聚焦）与 **⌘/Ctrl+K 命令面板**（知识点 + 操作统一检索、键盘可达）
- ⌨️ 完整快捷键体系（`?` 查看）、`←/→` 知识点快速翻页、skip-link、ARIA 标签、焦点轮廓、`prefers-reduced-motion`
- 📲 **PWA 可安装**：桌面/主屏幕图标、Service Worker 预缓存、断网完整可用、新版本提示刷新
- 🛡️ **安全加固**：AI 回复与用户笔记统一经 DOMPurify 消毒（防 XSS）、全局错误兜底不白屏
- ♿ 响应式 + 无障碍：手机自适应、减少动效偏好、语义化结构与键盘导航
- ✅ 学习进度三态标记（未学 / 学习中 / 已掌握），首页与侧栏进度条
- 📝 每个知识点独立的 Markdown 笔记，自动保存，支持编辑/预览，可导出全部笔记
- 🤖 **AI 私教**：流式对话，支持 DeepSeek / 通义千问 / 智谱 GLM / Kimi / OpenAI
  （OpenAI 兼容接口，浏览器直连，API Key 仅保存在本机）
  - 快捷指令：通俗讲解 / 出练习题 / 总结易错点 / 检查代码
  - 自动携带当前章节上下文，未编写的讲义可让 AI 先讲
- 🎨 明亮 / 护眼 / 深色三套主题，字号可调，手机端自适应
- 💾 学习数据一键 JSON 备份 / 导入 / 清空

## 📁 目录结构

```
cpp-note/
├─ index.html               # 入口（数据通过 <script> 加载，file:// 也能用）
├─ manifest.webmanifest     # PWA 清单
├─ sw.js                    # Service Worker（由 scripts/build-sw.js 自动生成，勿手改）
├─ icons/                   # PWA 图标（192/512/maskable/apple-touch/svg）
├─ vendor/                  # 内置的本地第三方库（无需联网/CDN）
│  ├─ marked.min.js         # Markdown 渲染（v12，MIT）
│  ├─ highlight.min.js      # 代码高亮（v11.9，含 C++，BSD-3）
│  ├─ purify.min.js         # XSS 消毒（DOMPurify v3，Apache-2.0/MPL-2.0）
│  └─ atom-one-dark.min.css # 代码高亮主题
├─ css/style.css
├─ js/
│  ├─ store.js              # 进度/笔记/设置/打卡/学习日历的本地存储
│  ├─ ai.js                 # AI 私教（OpenAI 兼容，SSE 流式）
│  ├─ stats.js              # 学习数据看板（热力图/掌握度/测验成绩）
│  ├─ pwa.js                # PWA 安装引导与 SW 更新提示
│  ├─ app.js                # 路由、渲染、搜索、命令面板、TOC、笔记、设置
│  └─ data/
│     ├─ outline.js         # 大纲地图（部分 → 章 → 知识点）
│     ├─ p1-01.js … p1-12.js  # 第一部分 入门篇
│     ├─ p2-01.js … p2-14.js  # 第二部分 CSP-J 普及篇
│     ├─ p3-01.js … p3-16.js  # 第三部分 CSP-S 提高篇
│     ├─ p4-01.js … p4-04.js  # 第四部分 考级与初赛专题
│     ├─ p5-01.js … p5-03.js  # 第五部分 竞赛算法进阶
│     ├─ p6-01.js … p6-03.js  # 第六部分 高阶算法专题
│     ├─ p7-01.js … p7-03.js  # 第七部分 字符串、网络流与多项式
│     ├─ p8-01.js … p8-03.js  # 第八部分 可持久化、线性基与莫队
│     ├─ p9-01.js … p9-03.js  # 第九部分 NOI 前沿专题
│     ├─ relations.js       # 知识图谱：知识点先修/后续关系
│     ├─ templates-p1.js … templates-p8.js  # 各部分核心模板速记
│     └─ quiz-p1.js … quiz-p9.js            # 各部分章末测验
└─ README.md
```

## ➕ 如何新增 / 扩充知识点

1. 在 `js/data/outline.js` 的对应章节下添加元数据（id 必须唯一）：
```js
{ id: 'greedy', title: '贪心策略', diff: 3, tags: ['贪心'],
  preview: '未写正文时占位页显示的简介' }
```
2. 新建内容文件（如 `js/data/p2-06.js`），按下面格式编写；
3. 在 `index.html` 中加一行 `<script src="js/data/p2-06.js"></script>` 即可。

```js
(function () {
  const T = {};
  T['greedy'] = {
    chapter: '第6章 贪心算法',
    time: '约 40 分钟',
    body: `
## 标题

正文用 Markdown 书写，代码块用 \x60\x60\x60cpp ... \x60\x60\x60，
提示用 > **💡 提示：**，警告用 > **⚠️ 注意：**，易错用 > **❗ 坑：**（自动着色）。
`,
    examples: [
      {
        title: '例题名',
        level: '基础',                 // 入门 / 基础 / 提高 / 挑战
        statement: '**题目描述** ...',  // Markdown
        input: '输入格式说明',
        output: '输出格式说明',
        samples: [['样例输入', '样例输出']],
        analysis: '### 解题思路 ...',   // Markdown，默认折叠
        code: '```cpp\n// 带注释的参考代码\n```',
      },
    ],
    pitfalls: ['**易错点标题**：说明...'],
    exercises: [
      { title: '练习题', level: '提高', statement: '...', hint: '折叠提示，不给答案' },
    ],
    summary: '一段话小结（Markdown）',
  };
  Object.assign(window.TOPICS, T);
})();
```

> 编写约定：正文数学符号直接用 Unicode（≤ ≥ × ² √ π），不要用 LaTeX 的 `\(...\)`；
> C++ 代码换行在模板字符串中写作 `\\n`。

## 🔑 AI 私教配置

设置（⚙️）→ AI 私教 → 选择服务商 → 填 API Key → 测试连接。

| 服务商 | Base URL | 模型 |
| --- | --- | --- |
| DeepSeek | `https://api.deepseek.com/v1` | `deepseek-chat` |
| 通义千问 | `https://dashscope.aliyuncs.com/compatible-mode/v1` | `qwen-plus` |
| 智谱 GLM | `https://open.bigmodel.cn/api/paas/v4` | `glm-4-flash` |
| Kimi | `https://api.moonshot.cn/v1` | `moonshot-v1-8k` |

Key 只保存在本机浏览器 localStorage，备份导出时自动脱敏。若直连报网络错误，
改用 `python -m http.server` 以 localhost 方式访问。

## 🛠️ 技术说明

- 原生 HTML/CSS/JavaScript，无构建步骤、无框架、无后端；marked（Markdown）、highlight.js（代码高亮）、DOMPurify（消毒）均本地化到 `vendor/`，整站离线可用；另内置无依赖的极简 Markdown 降级渲染器（标题/列表/引用/表格/任务清单/代码围栏），库加载失败时自动兜底
- hash 路由（`#/t/topic-id`），可前进后退、可分享链接
- PWA：`manifest.webmanifest` + `sw.js`（预缓存由脚本从 `index.html` 自动生成，导航网络优先、资源缓存优先），http(s) 下可安装与离线；`file://` 双击使用时自动跳过 SW，不影响任何内容功能
- 安全：AI 回复与用户笔记等**不可信内容**经 DOMPurify 消毒后再渲染，防 XSS；全局 `error` / `unhandledrejection` 兜底，单点异常不白屏；本地静态服务器含目录穿越防护
- 快捷键：`Ctrl/⌘+K` 命令面板 · `Ctrl/⌘+J` 笔记面板 · `Ctrl/⌘+B` 目录 · `/` 搜索 · `?` 快捷键帮助 · `←/→` 翻页 · `Esc` 关闭弹层

## 🧪 质量保障（零运行时依赖，仅开发脚本）

```bash
npm run check        # JS 语法检查 + 全站数据完整性校验
npm run check:data   # 交叉校验大纲/正文/模板/图谱/测验引用、围栏配平、死链
npm run serve        # 零依赖本地静态服务器（含目录穿越防护）
npm run smoke        # 无头 Edge/Chrome 冒烟测试（20+ 断言 + 桌面/移动截图）
node scripts/make-icons.js   # 重新生成 PWA 图标
node scripts/build-sw.js     # 由 index.html 重新生成 sw.js 预缓存清单
```

`scripts/check-data.js` 会保证：大纲每个知识点都有正文且 id 唯一、例题样例与可运行代码匹配、
模板围栏配平、知识图谱无悬空/自环、每章都有测验且答案下标合法、`index.html` 无死链/无孤儿数据文件。

## 🔒 隐私

- 所有学习数据（进度、笔记、收藏、错题、测验、打卡、设置、对话记录）只保存在**本机浏览器** localStorage；
  备份导出为本地 JSON，**API Key 不导出**。
- 仅两类联网请求：① 在线运行代码发送到 Wandbox 公共编译服务；② AI 私教发送到你自己配置的服务商。除此之外不发任何数据。

## 📄 许可证

MIT，见 [LICENSE](LICENSE)。内置第三方库：marked (MIT)、highlight.js (BSD-3-Clause)、DOMPurify (Apache-2.0/MPL-2.0)。
