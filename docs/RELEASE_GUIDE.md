# 发版指南 (Release Guide)

本文件规定 GithubRemarkReborn 的版本发布流程、文档模板与注意事项。

> ⚠️ **硬性规则**
> 1. **未经维护者明确指示，不得修改 `manifest.json` 中的 `version`。**
> 2. **未经维护者明确指示，不得创建 Git Tag、GitHub Release 或上传发布包。**
> 3. 日常修复统一记录在 `CHANGELOG.md` 的 `[Unreleased]` 区块。

---

## 一、发版前检查清单

- [ ] 本次要发布的变更已全部合入 `master` 分支。
- [ ] `CHANGELOG.md` 中 `[Unreleased]` 的内容已整理为本次版本条目（新增版本号与日期）。
- [ ] 维护者已确认新版本号（遵循 SemVer：`MAJOR.MINOR.PATCH`）。
- [ ] 已同步修改 `manifest.json` 的 `version` 字段。
- [ ] 已运行 `node -c` 校验全部 JS 文件，`manifest.json` 可被 JSON 解析。
- [ ] 在 Microsoft Edge 与 Google Chrome 中均完成加载自测（无 Manifest 警告）。
- [ ] 在 GitHub 浅色与深色模式下检查徽章、悬浮操作条、编辑框的对比度。
- [ ] 确认未引入任何外部 CDN 资源，扩展可离线运行。
- [ ] `docs/WORKLOG.md` 已追加本次发版记录。

---

## 二、版本号约定

| 变更类型 | 版本位 | 示例 |
| :--- | :--- | :--- |
| 不兼容的架构调整、存储格式变更 | `MAJOR` | `1.0.0 → 2.0.0` |
| 向下兼容的新功能 | `MINOR` | `1.0.0 → 1.1.0` |
| 向下兼容的缺陷修复、样式微调 | `PATCH` | `1.0.0 → 1.0.1` |

---

## 三、发布步骤

```bash
# 1) 确认工作区干净、与远端一致
git status
git pull origin master

# 2) 校验语法与配置
node -c storage.js && node -c bg.js && node -c ghremark.js && node -c popup.js && node -c option.js
node -e "JSON.parse(require('fs').readFileSync('manifest.json'))"

# 3) 打包扩展（仅包含运行所需文件，供商店与 Release；server/docs/未引用图标一律排除）
python -c "
import zipfile, os
name = 'GithubRemarkReborn-vX.Y.Z.zip'
files = ['manifest.json','storage.js','ghremark.js','bg.js','popup.html','popup.js','options.html','option.js',
         'images/icon-16.png','images/icon-32.png','images/icon-48.png','images/icon-128.png']
with zipfile.ZipFile(name,'w',zipfile.ZIP_DEFLATED) as z:
    for f in files:
        z.write(f)
"

# 4) 提交版本变更
git add manifest.json CHANGELOG.md docs/WORKLOG.md
git commit -m "release: vX.Y.Z <一句话说明>"
git push origin master

# 5) 打标签并推送
git tag -a vX.Y.Z -m "release: vX.Y.Z"
git push origin vX.Y.Z

# 6) 创建 GitHub Release（需指定仓库，避免误发到上游原作者仓库）
gh release create vX.Y.Z GithubRemarkReborn-vX.Y.Z.zip \
  --repo qyyyy09315/Github-Remark-Reborn \
  --title "GithubRemarkReborn vX.Y.Z - <标题>" \
  -F release_notes.txt
```

> 注意：`release_notes.txt` 使用 UTF-8 编码保存，避免中文乱码。
> `gh release create` 必须带 `--repo qyyyy09315/Github-Remark-Reborn`，因为本地同时配置了 `upstream`（原项目）远程。

---

## 四、更新说明模板

```markdown
## 🎉 GithubRemarkReborn vX.Y.Z

<一句话概述本次发布>，全面兼容 **Microsoft Edge** 与 **Google Chrome**。

### ✨ 新增
- ...

### 🔧 优化
- ...

### 🐛 修复
- ...

### ⚠️ 不兼容变更
- （如无，写「无」）

### 📦 安装方式
1. 下载 Assets 中的 `GithubRemarkReborn-vX.Y.Z.zip` 并解压；
2. 打开 `edge://extensions/` 或 `chrome://extensions/`；
3. 开启「开发人员模式」；
4. 点击「加载解压缩的扩展」，选择解压后的目录。

**Full Changelog**: https://github.com/qyyyy09315/Github-Remark-Reborn/compare/vPREV...vX.Y.Z
```

---

## 五、发布后核对

- [ ] Release 页面显示正确标题、标签与附件。
- [ ] 附件可下载且体积合理（当前约 55 KB）。
- [ ] `CHANGELOG.md` 的比较链接已指向新标签。
- [ ] 从 Release 附件全新安装一次，验证：个人主页添加入口、列表页悬停操作条、深色模式配色。
