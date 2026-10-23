<p align="center">
  <img src="images/icon-128.png" width="96" height="96" alt="GithubRemark Logo">
</p>

<h1 align="center">GithubRemarkReborn</h1>

<p align="center">
  <strong>给你的 GitHub 好友与开发者添加个性化备注，类似微信备注功能</strong><br>
  全场景识别 · 现代高质感视觉 · 纯本地隐私存储 · 完美兼容 Microsoft Edge & Google Chrome
</p>

<p align="center">
  <a href="https://github.com/qyyyy09315/Github-Remark-Reborn/releases/latest"><img src="https://img.shields.io/badge/Release-v1.0.0-blue.svg?style=flat-square" alt="Release"></a>
  <img src="https://img.shields.io/badge/Manifest-V3-success.svg?style=flat-square" alt="Manifest V3">
  <img src="https://img.shields.io/badge/Browser-Edge%20%7C%20Chrome-0078d7.svg?style=flat-square" alt="Edge and Chrome">
  <img src="https://img.shields.io/badge/Storage-chrome.storage.local-success.svg?style=flat-square" alt="Local Storage">
  <a href="https://github.com/qyyyy09315"><img src="https://img.shields.io/badge/Maintainer-@qyyyy09315-blueviolet.svg?style=flat-square" alt="Maintainer"></a>
  <img src="https://img.shields.io/badge/License-MIT-orange.svg?style=flat-square" alt="License">
</p>

---

## 💡 为什么需要 GithubRemarkReborn？

在 GitHub 上探索和协作时，许多开发者的 Handle（ID）与昵称常常抽象或容易遗忘。**GithubRemarkReborn** 让你可以像在微信中给好友备注一样，为任意 GitHub 用户打上鲜明、易记的专属标签。

基于原版插件重制，全面适配新版 GitHub 页面架构与 Turbo 单页导航，重构了底层数据流并升级了现代高对比度 UI。

---

## ✨ 核心特性

| 特性 | 功能说明 |
| :--- | :--- |
| 🏷️ **个人主页常驻入口** | 访问任意用户的个人主页（Profile），昵称旁常驻大号备注徽章；未设置备注时，显示轻巧的「**+ 添加备注**」胶囊，随时为任何人添加第一条备注。 |
| 📱 **全场景智能识别** | 自动识别并挂载全站用户链接：Following/Followers 关注列表、Issues 讨论区、PR 审查人、Commits 提交记录、Star 列表、组织成员等。 |
| 🎨 **超清晰高对比度视觉** | 采用沉稳深邃的绀青色加粗文字（`#0c4a6e`，Bold 700）搭配透亮淡天蓝背景，对比度超越 WCAG AAA 标准，彻底杜绝模糊黑晕与字迹发白；自动适配 GitHub 浅色与深色模式。 |
| 🔒 **纯本地隐私存储** | 数据仅保存在当前浏览器的 `chrome.storage.local` 中，不上传任何服务器、不依赖账号登录；更换设备时通过 JSON 导出/导入一键迁移。 |
| ⚡ **本地优先（Local-First）** | 内存 Map 0 毫秒极速查找，彻底消灭每个用户一次 HTTP 请求的 N+1 网络风暴，页面加载丝滑不卡顿。 |
| 🔄 **多标签页即时联动** | 跨页面广播机制：在一个标签页或设置面板修改备注，其他所有已打开的 GitHub 页面无需刷新，秒级同步更新。 |
| 💾 **完整数据备份中心** | 控制面板提供一键导出 `.json` 备份文件，并支持选择 JSON 备份一键恢复与合并。 |
| 🌐 **Edge & Chrome 双兼容** | 纯自包含原生实现，无任何外部 CDN 依赖，完全离线可用，严格符合 Edge Add-ons 与 Chrome Web Store 规范。 |

---

## 🚀 极速安装

### 方式一：下载 Release 压缩包（推荐，即装即用）
1. 前往 [Releases 页面](https://github.com/qyyyy09315/Github-Remark-Reborn/releases) 下载最新版本的 `GithubRemarkReborn-v1.0.0.zip` 并解压。
2. 打开浏览器扩展管理页面：
   - **Microsoft Edge**：地址栏输入 `edge://extensions/`
   - **Google Chrome**：地址栏输入 `chrome://extensions/`
3. 开启页面上的「**开发者模式 / 开发人员模式**」。
4. 点击「**加载已解压的扩展程序 / 加载解压缩的扩展**」，选择解压后的文件夹即可完成安装！

### 方式二：通过 Git 克隆源码
```bash
git clone https://github.com/qyyyy09315/Github-Remark-Reborn.git
```
在浏览器扩展页面中加载该目录即可。

---

## 📖 使用指南

1. **添加备注**：
   - **在个人主页**：打开任意用户主页（如 `https://github.com/torvalds`），点击主昵称下方的「**+ 添加备注**」胶囊按钮，输入内容按 `Enter` 即可保存。
   - **在关注/粉丝/项目列表**：鼠标悬停在任意未备注开发者的名字附近，会自动显现「**+ 备注**」微型按钮，点击就地输入。
   - **在扩展弹窗中**：点击浏览器右上角插件图标，在快捷添加栏中输入 GitHub 用户名与备注，点击「保存」。
   - **在右键菜单中**：在任意指向 GitHub 用户的链接上点击鼠标右键，选择「对此 GitHub 用户添加/编辑备注」。
2. **修改与删除**：
   - 鼠标悬停在任意已有备注徽章上，会自动呼出 ✎（编辑）与 ✕（删除）小工具。
   - 内联编辑支持快捷键：`Enter` 确认保存，`Esc` 取消还原。
3. **管理与导出备份**：
   - 点击插件弹窗底部的「管理全部备注」，进入全功能控制仪表盘。
   - 支持按用户名或备注名实时模糊搜索、一键导出 JSON 备份、上传 JSON 恢复合并。

---

## 🏗️ 项目架构

```text
GithubRemarkReborn/
├── manifest.json        # 扩展配置清单 (Manifest V3, 声明式 content_scripts)
├── storage.js           # 统一存储引擎 (chrome.storage.local 纯本地, 支持导入/导出/广播)
├── ghremark.js          # 核心内容脚本 (高对比度样式、主页入口、悬浮操作条、Turbo单页适配)
├── bg.js                # Background Service Worker (右键菜单、Badge 状态指示)
├── popup.html / .js     # 现代弹出卡片 (状态开关、数据统计、快捷添加)
├── options.html / .js   # 全功能控制仪表盘 (实时检索、就地修改、备份中心)
├── images/              # 扩展高清图标资源
├── docs/                # 开发工作日志与发版指南
└── server/              # (可选) 私有 Node.js + MongoDB 后端同步服务
```

### 📚 项目文档

| 文档 | 说明 |
| :--- | :--- |
| [CHANGELOG.md](CHANGELOG.md) | 版本更新说明，按 Keep a Changelog 规范维护 |
| [docs/WORKLOG.md](docs/WORKLOG.md) | 开发工作日志：需求背景、关键决策、踩坑与验证结论 |
| [docs/RELEASE_GUIDE.md](docs/RELEASE_GUIDE.md) | 发版流程、检查清单与更新说明模板 |

---

## 🤝 贡献与 Pull Request (PR) 提交规范

我们非常欢迎社区提交 Bug 修复、交互改进或新功能建议！为保证项目的代码质量与审核效率，请遵循以下规范：

### 1. 分支与提交规范
- 提交前请基于 `master` 分支检出新的特性分支（例如 `feat/your-feature-name` 或 `fix/issue-description`）。
- 提交信息（Commit Message）推荐使用语义化规范：
  - `feat: ...`（新增功能）
  - `fix: ...`（Bug 修复）
  - `style: ...`（样式调整与视觉优化）
  - `refactor: ...`（代码重构）
  - `docs: ...`（文档补充与修正）

### 2. 代码要求
- **Manifest V3 合规**：严禁在任何 HTML 或脚本中引入未打包的外部 CDN 资源，确保扩展离线可用并通过商店安全审核。
- **视觉无障碍**：修改或新增 UI 元素时，必须同时考虑 GitHub 浅色模式与深色模式，文字与背景必须保持足够高的色彩对比度。
- **双浏览器兼容**：改动需在 Microsoft Edge 与 Google Chrome 上均完成实测。

### 3. ⚠️ PR 审核与通知规范（重要！）
> **请在提交 Pull Request 时务必注意：**
> 
> 📢 **请在 PR 描述或评论区 @qyyyy09315（本项目当前维护者）**，我们会在第一时间收到通知并进行 Code Review 与合并测试！
> 
> 🚫 **请切勿 @bobdong 或 @dpy1123**。他们是数年前原版项目的原作者，当前并不维护此重制版仓库，请避免向他们发送不必要的通知打扰。

---

## 📄 开源许可

本项目基于 [MIT License](LICENSE) 开源。

- 本项目重制与维护：[@qyyyy09315](https://github.com/qyyyy09315)
- 原项目贡献致谢：[dpy1123/GithubRemark](https://github.com/dpy1123/GithubRemark) by [DD](https://github.com/dpy1123)
- 设计与架构参考：[refined-github](https://github.com/refined-github/refined-github)
