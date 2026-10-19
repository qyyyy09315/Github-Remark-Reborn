# GithubRemarkReborn

> 给你的 GitHub 好友与开发者添加个性化备注，类似微信备注功能。全面适配新版 GitHub 页面结构与 Turbo 单页导航，原生适配浅色与深色（Dark）模式，完美兼容 **Google Chrome** 与 **Microsoft Edge**！

---

## ✨ 核心特性

- 🔖 **全场景覆盖与常驻入口**：
  - **个人主页专属入口**：访问任意用户的 GitHub 主页（Profile），昵称旁常驻大号备注徽章；未备注时显示精致小巧的「+ 添加备注」胶囊按钮，再也不用担心找不到添加入口。
  - **全站用户链接识别**：Issues 讨论区、Commits 提交记录、Star 列表、Followers 列表、PR 审查人等位置均自动挂载。
- 🎨 **视觉质感深度优化**：
  - **深浅色主题自适应**：读取 GitHub 原生主题变量与系统偏好，浅色呈清水晶蓝，深色呈深邃晶体玻璃质感，融入 GitHub Primer 设计语言。
  - **内嵌高清矢量 SVG 图标**：标签、修改、删除、确定等图标清晰锐利，无外链图片延迟。
  - **悬停快捷内联编辑**：鼠标悬停备注徽章即可呼出 ✎（编辑）与 ✕（删除），支持键盘 `Enter` 快捷保存、`Esc` 取消。
- ☁️ **零门槛跨设备云同步（推荐）**：
  - 原生接入 `chrome.storage.sync`，登录 Chrome 或 Edge 浏览器账号即可在多台电脑间自动秒级同步备注，**无需自行搭建或依赖任何第三方服务器**，零隐私泄露风险。
  - 多标签页实时联动：在一个页面或控制台修改备注，其他所有已打开的 GitHub 标签页即时同步渲染。
- 💾 **完整数据备份中心**：
  - 随时将所有备注一键导出为 `.json` 备份文件。
  - 支持从 JSON 备份文件一键恢复或合并数据。
- 🌐 **双浏览器完美兼容**：
  - 严格遵循 Manifest V3 规范，彻底移除外部 CDN 依赖，完全自包含离线可用，原生兼容 **Microsoft Edge** 与 **Google Chrome**。

---

## 🚀 安装方法

### 方式一：Microsoft Edge 浏览器安装
1. 下载或克隆本项目代码到本地任意目录：
   ```bash
   git clone https://github.com/qyyyy09315/Github-Remark-Reborn.git
   ```
2. 打开 Edge 浏览器，地址栏输入进入 `edge://extensions/`
3. 开启左侧的「开发人员模式」开关
4. 点击「加载解压缩的扩展」，选择解压后的项目根目录
5. 安装完成，打开任意 [GitHub](https://github.com) 页面即可享受个性化备注！

### 方式二：Google Chrome 浏览器安装
1. 打开 Chrome 浏览器，进入扩展管理页面 `chrome://extensions/`
2. 开启右上角「开发者模式」
3. 点击「加载已解压的扩展程序」，选择项目根目录
4. 安装完成，刷新 GitHub 页面即可使用

---

## 📖 使用指南

1. **为用户添加备注**：
   - **方式 1（个人主页）**：访问目标用户的 Profile 主页（如 `https://github.com/torvalds`），点击昵称下方的「+ 添加备注」按钮，输入备注后按 `Enter` 即可保存。
   - **方式 2（扩展弹窗）**：点击浏览器右上角插件图标，在快速添加卡片中输入 GitHub 用户名与备注名点击「保存」。
   - **方式 3（右键菜单）**：在任何指向 GitHub 用户的链接上点击鼠标右键，选择「对此 GitHub 用户添加/编辑备注」。
2. **修改或删除备注**：
   - 鼠标悬停在任意备注徽章上，点击 ✎ 可原地编辑，点击 ✕ 可直接删除。
3. **数据管理与导出备份**：
   - 点击插件弹窗中的「管理全部备注」或右键选择「选项」，可进入全功能控制面板。
   - 控制面板支持：用户名/备注名模糊搜索、头像实时预览、就地修改、一键导出 JSON 备份及从备份文件恢复。

---

## 🏗️ 技术架构

- **Manifest V3 规范**：使用声明式 `content_scripts` 拦截与注入，彻底根除旧版本动态注入脚本导致的事件重叠与性能浪费。
- **本地优先（Local-First）**：页面渲染时由内存 Map 实现 0 毫秒极速匹配，告别 N+1 网络请求风暴。
- **存储引擎**：基于 `chrome.storage.sync`（优先）+ `chrome.storage.local`（兜底），安全轻便。
- **可选自建后端 (`server/`)**：
  - 若团队或组织内部有私有化集中同步需求，可部署 `server/` 下基于 Node.js + Mongoose 的轻量级服务。
  - 启动方式：进入 `server` 目录，执行 `npm install && npm start`。

---

## 👨‍💻 贡献与参考

- 作者：[qyyyy](https://github.com/qyyyy)
- 原项目：[GithubRemark](https://github.com/dpy1123/GithubRemark) by [DD](https://github.com/dpy1123)
- 设计参考：[refined-github](https://github.com/refined-github/refined-github)
