# Remotion 交接要点

当前默认：画面仅允许Logo原生字标，不添加标题、字幕、注释或数字；不朗读口播、不合成配音，也不调用TTS计时。参数面板中的文案控件仅在当前用户明确要求画面文字时启用。技术导出参数不会改变这些内容约束。

明确图表、真实界面和指定文案任务的必要文字范围按 SKILL.md 处理。以下仅在项目选用 Remotion 时参考：检查实际注册入口、参数面板与版本；内容文件可复用并不自动带来可视化面板。

以下按 2026-10-28 查询到的官方文档整理。生成实际工程前，以该项目的安装版本及当前文档为准；不把界面下拉菜单中的位置写成稳定 API。

## 参数面板

目的：用户在 Studio 修改素材、文案、颜色和关键动作参数后，画面确实随之改变。

- 提供组件 props 类型和 Composition 的 defaultProps，确保组件实际读取这些属性。
- 当前文档说明，v4.0.516 起可从 defaultProps 推断基础控件。不要声称所有版本都必须有 Zod schema。
- 需要上下界、枚举、参数描述或颜色等专门控件时再定义 schema，并核对版本与依赖。
- 时长与帧数应一致；改变 fps 或 duration 需要同步合成元数据，不能仅添加同名内容控件。

来源：https://www.remotion.dev/docs/schemas

## 用于剪辑叠加的透明 MOV

透明不是导出时去掉黑色。合成中本来就需要有透明像素：容器无不透明背景；原图片自带的底色也不会因修改编码自动消失。

当前官方给出的 ProRes alpha 组合：

- codec：`prores`
- prores profile：`4444` 或 `4444-xq`
- image format：`png`
- pixel format：`yuva444p10le`
- 输出容器：`.mov`

素材包报告视频选择 `4444 XQ (Best)`。它不是唯一可以保留 alpha 的 ProRes profile；`hq` 与 `4444-xq` 是不同值，不能把“质量高”理解为任意 HQ 都支持透明。

CLI 参数示例，只在用户要求导出且已核实工程入口和合成 ID 后使用：

```text
npx remotion render <entry-point> <composition-id> out/overlay.mov --codec=prores --prores-profile=4444-xq --image-format=png --pixel-format=yuva444p10le
```

用明暗不同的底图检查边缘和透明区域；预览棋盘格不能出现在成片中。转场需检查开始和结束状态是否符合叠轨使用方式。

来源：https://www.remotion.dev/docs/transparent-videos

Profile 值：https://www.remotion.dev/docs/options/prores-profile

## 普通成片

用户只需要普通视频时沿用其输出要求；不要因为教程展示了透明叠加就默认所有动效都输出体积较大的 ProRes MOV。

只交付制作提示词时，将以上内容压缩成与该任务有关的交付约定，不复制安装教程或整套编码文档。
