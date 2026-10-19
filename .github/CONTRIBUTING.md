# 贡献指南 (Contributing Guide)

感谢关注并愿意为 **GithubRemarkReborn** 贡献力量！

为了保证代码库的整洁、安全与高效审查，请在提交代码前仔细阅读以下指引。

---

## 🚀 开发流程

1. **Fork 本仓库** 到你个人的 GitHub 账号。
2. 从 `master` 分支检出新的开发分支：
   ```bash
   git checkout -b feat/your-feature-name
   ```
3. 在 Edge 或 Chrome 的扩展页面（`edge://extensions/` 或 `chrome://extensions/`）中开启「开发人员模式」，点击「加载解压缩的扩展」，选择本地开发目录进行实时调试。
4. 完成代码修改并确保控制台无报错。
5. 提交改动并推送到你的远程分支。
6. 发起 Pull Request 请求合并至本仓库的 `master` 分支。

---

## 📋 代码与规范要求

- **Manifest V3 离线合规**：所有样式与脚本必须自包含在扩展内部，严禁引用任何外部 CDN 资源。
- **色彩与无障碍**：GitHub 支持 Light、Dark 及 Dark Dimmed 主题。所有注入样式必须进行多主题适配，且文字与背景需保持高对比度（建议达到 WCAG AAA 级）。
- **Edge 与 Chrome 双兼容**：请确保改动在 Edge 与 Chrome 浏览器上均能正常加载与运行。

---

## ⚠️ PR 提交与审查注意（重要）

- 提交 Pull Request 时，请在 PR 描述或评论区 **@qyyyy09315**（本项目当前维护者），以加快审核速度。
- **请切勿 @bobdong 或 @dpy1123**，他们是原版项目的作者，目前未维护此项目，请避免向他们发送不必要的通知。
