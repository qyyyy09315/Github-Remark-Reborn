# 更新日志 (Changelog)

本项目的所有重要变更都会记录在此文件。

格式参考 [Keep a Changelog](https://keepachangelog.com/zh-CN/1.1.0/)，
版本号遵循 [语义化版本 SemVer](https://semver.org/lang/zh-CN/)。

> ⚠️ **版本发布规则**
> 版本号的变更与 GitHub Release 的创建，必须由维护者明确指示后执行。
> 日常开发与缺陷修复统一记录在 `[Unreleased]` 区块下，不自动升级版本号、不自动创建 Release。

---

## [Unreleased]

### Fixed

- **修复悬停备注徽章时徽章"消失"的问题**：原实现通过 `display: none → inline-flex` 在徽章内部展开 ✎/✕ 按钮，徽章宽度瞬间增大触发父容器重排，指针被挤出元素边界产生 `mouseleave`，随即收起又重新命中，形成肉眼可见的高频"展开—收起"抖动（表现为标签消失）。现改为挂载于 `document.body` 的固定定位悬浮操作条，徽章自身尺寸全程不变，并支持指针在徽章与操作条之间平滑移动（180ms 延迟收起）。
- 移除徽章 `:hover` 状态下的 `translateY(-0.5px)` 微位移，避免亚像素位移导致的边缘命中抖动。
- 增加节点自愈校验：当 GitHub 局部重绘（Turbo Frame、Hovercard 加载）移除徽章节点时，扫描会重新补挂，不再因 `ghrk-processed-link` 标记而永久跳过该用户。
- 页面禁用插件、删除备注、滚动或缩放窗口时，悬浮操作条会自动收起，避免位置错位与悬空引用。

### Added

- 新增 `CHANGELOG.md`，按 Keep a Changelog 规范维护版本更新说明。
- 新增 `docs/WORKLOG.md` 开发工作日志，记录需求、决策与验证过程。
- 新增 `docs/RELEASE_GUIDE.md` 发版流程与更新说明模板，供后续版本发布使用。
- 新增原创扩展图标 `images/icon-16/32/48/128.png` 与商店用 `images/store-logo-300.png`（深蓝渐变底 + 纯白吊牌，透明圆角外缘）。

### Changed

- 扩展图标、弹窗与设置页 Logo、README 头图全部切换为原创图标，不再使用 GitHub 官方标识，降低商店商标审核风险。
- **本人识别**：浏览自己的 GitHub 主页时不再渲染「+ 添加备注」入口或备注徽章；全站指向当前登录用户的链接同样不再挂载任何备注组件，并自动清理历史遗留节点（如此前给自己添加过的备注徽章）。

---

## [1.0.0] - 2026-10-19

首个正式重构版本：重写存储层与渲染层，强化视觉可读性，完善全站交互入口，并完成 Microsoft Edge 与 Google Chrome 双浏览器适配。

### Added

- **个人主页常驻备注入口**：在用户 Profile 的昵称区注入专属组件；未备注时显示「+ 添加备注」胶囊按钮，点击可直接内联编辑。
- **全站用户链接识别**：覆盖关注列表、粉丝列表、Star 列表、Issues、PR 审查人、Commits 等位置的 `a[data-hovercard-type="user"]`。
- **列表页悬停添加入口**：未备注用户在鼠标悬停时显示「+ 备注」微型按钮，点击就地展开输入框。
- **统一存储层 `storage.js`**：优先 `chrome.storage.sync` 跨设备同步，超额或异常时降级 `chrome.storage.local`；支持 JSON 导出与导入合并。
- **多标签页实时联动**：基于 `chrome.storage.onChanged` 广播，任一页面修改备注，其余已打开页面即时刷新。
- **右键菜单**：支持对任意 GitHub 用户链接直接添加/编辑备注。
- **全功能控制面板 `options.html`**：备注实时模糊搜索、头像预览、就地修改、JSON 备份导出与恢复、一键清空。
- **弹窗快捷面板 `popup.html`**：启停开关、已备注数量统计、快捷添加、控制台入口。
- **可选私有后端 `server/`**：标准化 `package.json`、异步 `async/await` 重构、批量与全量查询接口、请求体大小限制与统一异常处理。

### Changed

- `manifest.json` 升级至 Manifest V3 声明式 `content_scripts`，移除 `tabs` / `scripting` 等冗余权限与错误的 `devtools_page` 配置。
- 渲染策略改为**本地优先（Local-First）**：页面初始化一次性加载备注字典到内存 Map，渲染阶段零网络请求，消除 N+1 请求风暴。
- 徽章视觉升级：字号提升至 13px（主页 14px）、字重 700，浅色模式使用深墨青蓝文字（`#0c4a6e`）配淡天蓝底，对比度超过 WCAG AAA 标准。
- 弹窗与控制台移除外部 Bootstrap CDN，改为自包含原生 CSS，保证离线可用并满足商店审核要求。
- 过滤纯头像链接（含 `img` / `.avatar`），避免头像下方重复挂载徽章。

### Fixed

- 修复系统深色偏好与 GitHub 浅色页面冲突导致的徽章文字发白、模糊难辨问题（严格以 GitHub 的 `data-color-mode` 为唯一判据）。
- 修复旧版 `server/db.js` 硬编码 `/usr/local/lib/node_modules/mongoose` 导致跨环境无法启动的问题。
- 修复后端错误分支未回调导致客户端请求永久挂起的问题。

### Removed

- 移除宿主页面 `localStorage` 读写（避免污染 `github.com` 存储）。
- 移除硬编码的个人测试备注数据与失效的 `option.js` 旧逻辑。
- 移除外部 CDN 依赖与动态脚本重复注入逻辑。

---

[Unreleased]: https://github.com/qyyyy09315/Github-Remark-Reborn/compare/v1.0.0...HEAD
[1.0.0]: https://github.com/qyyyy09315/Github-Remark-Reborn/releases/tag/v1.0.0
