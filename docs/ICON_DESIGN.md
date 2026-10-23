# 扩展图标设计规格（AI 绘画用）

目标：为 GithubRemarkReborn 设计一枚**原创、无商标风险、16px 仍可辨认**的扩展图标，用于 Microsoft Edge Add-ons 商店与浏览器工具栏。

> 2026-10-21 状态：已采用该方案。最终切图位于 `images/icon-16/32/48/128.png` 与 `images/store-logo-300.png`，`manifest.json` 已切换，旧 GitHub 官方 Logo 不再被引用。

---

## 1. 设计原则

| 约束 | 原因 |
| :--- | :--- |
| 单一强剪影（吊牌/标签） | 浏览器工具栏最小只有 16×16，细节会糊成一团 |
| 禁止 Octocat、GitHub 官方 Logo、猫、字母 “G” | 商标风险，商店可能按“冒充官方/品牌侵权”拒绝 |
| 图形占画布约 55%–62%，四周留白 ≥ 18% | 商店会做圆角/圆形裁切，避免边缘被切 |
| 最细笔画 ≥ 画布宽度的 5% | 1024 画布下不低于 50px，缩小到 16px 不消失 |
| 2 色主视觉（深蓝底 + 纯白图形） | 高对比，浅色/深色工具栏都能看清 |
| 无文字、无数字、无 3D、无投影、无纹理 | 小尺寸下会变成噪点 |

## 2. 最终推荐：深蓝圆角方块 + 纯白吊牌

- **底板**：圆角方形，圆角半径约为边长的 22%，对角渐变 `#0284C7 → #1E40AF`。
- **主图形**：粗壮的纯白吊牌剪影，水平向右，尖端处有一个小圆孔。
- **比例**：吊牌宽约占画布 58%，高约 38%；左侧留白 24%，右侧 18%。
- **对比度**：白色与最浅处 `#0284C7` 的对比度约 4.0:1，与最深处 `#1E40AF` 约 8.7:1，满足非文本图形 3:1 的无障碍要求。
- **为什么不做铅笔**：已按 16 / 32 / 48 / 64 四档实际缩放测试，铅笔在 16px 会退化成一道白色短线，看起来像噪点或划痕，反而降低辨识度。因此**工具栏图标只用吊牌**，语义也已经足够（备注 = 给用户贴标签）。

### 主图标参考图

打开 [icon-concept.svg](icon-concept.svg) 查看构图（512×512 矢量，可直接缩放核对）。

### 商店可选的装饰版

如果希望商店 300×300 大图更有细节，可用 [icon-concept-store.svg](icon-concept-store.svg)：在吊牌右下角加一支白色短铅笔，并用背景蓝留出细缝。**该版本不用于 16/32 工具栏图标。**

## 3. AI 绘画提示词

> AI 很容易自动联想章鱼猫、字母或聊天气泡，务必保留“不要……”与 negative 部分。

### 3.1 中文通用版（即梦 / 豆包 / 通义万相 / GPT 图像）

```text
设计一个极简扁平矢量风格的应用图标，画布 1024×1024 正方形。
背景是一个圆角方形，圆角半径约为边长的 22%，填充从左上到右下的天蓝到深蓝渐变（#0284C7 到 #1E40AF）。
画面正中央是一个粗壮的纯白色吊牌（标签）剪影：吊牌水平向右指，尖端有一个小圆孔，左侧为圆角矩形。
整体为几何矢量风格，边缘锐利干净，图形占画面约 58%，四周留白充足。
不要文字、不要字母、不要数字、不要吉祥物、不要猫、不要章鱼猫、不要 GitHub 标志、不要任何品牌 Logo；
不要 3D、不要投影、不要高光、不要纹理、不要噪点、不要细线描边、不要多个图标并排。
```

### 3.2 Midjourney（v6 / v7）

```text
minimal flat vector app icon, rounded square, sky-blue to deep-blue diagonal gradient background (#0284C7 to #1E40AF), a bold pure-white price tag silhouette pointing right with a small circular hole, rounded rectangle body, geometric thick shapes, centered composition, generous margins, crisp edges, high contrast, no text, no letters, no numbers, no mascot, no cat, no octocat, no github logo, no brand logo, no 3D, no shadow, no highlight, no texture --ar 1:1 --style raw --v 6.1
```

### 3.3 Stable Diffusion / SDXL

正向：

```text
flat vector app icon, deep blue gradient rounded square, white price tag silhouette with circular hole, bold simple geometric shapes, centered, high contrast, clean edges, minimalist, 1:1
```

负向：

```text
text, letters, words, numbers, watermark, signature, cat, octocat, mascot, github logo, brand logo, 3d, bevel, emboss, drop shadow, reflection, glossy, gradient mesh, noise, texture, thin lines, detailed illustration, photorealistic, multiple icons, mockup, frame, border
```

### 3.4 可选的铅笔版（仅商店大图）

在上面任意提示词基础上追加：

```text
吊牌右下角增加一支纯白色短铅笔，铅笔与吊牌之间留出约 8px 的背景蓝色细缝，两者轮廓清晰分离。
```

## 4. 出图验收清单

生成 4 张后逐项打勾，只保留全部通过的：

- [ ] 缩到 16×16 仍能一眼看出是“标签/吊牌”
- [ ] 16px 下没有多余白色短线、斑点或碎屑
- [ ] 没有出现猫、章鱼猫、GitHub 图标、字母或文字
- [ ] 图形居中，距离四边至少 18% 留白
- [ ] 白色图形与蓝色背景对比清晰，没有灰白渐变或半透明
- [ ] 没有 3D 厚度、投影、玻璃高光、噪点纹理
- [ ] 圆角方块四个角干净完整，没有被裁切

## 5. 交付方式

把最终选定的 **1 张 1024×1024（或更大）PNG** 发给我即可，我会完成：

1. 生成 `16 / 32 / 48 / 128` 四档 PNG（工具栏与扩展页使用）；
2. 生成 Microsoft Edge Add-ons 要求的 **300×300** 商店 Logo；
3. 需要时生成 `440×280` 小宣传图；
4. 更新 `manifest.json` 图标映射，删除旧的 GitHub 官方 Logo 资源；
5. 重新打包商店专用 zip（排除 `server/`、`docs/`、未使用图片）。

> 版本号仍保持 `1.0.0`，不会创建新的 Release，直到你明确要求发版。
