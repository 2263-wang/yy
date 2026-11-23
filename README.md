# 动效提示词导演 · DrawAI 融合版

面向 Codex 的中文动画制作 Skill：从内容、素材和对象行为出发设计二维动画，按项目融合 DrawAI 的镜头配方、可复用工程、时间轴、预览与导出。

创作目标是减少过度正式、整齐划一的模板感，增加有内容依据的表达可能性。工程需要可靠，画面可以有自己的语气、停顿、变化和材料关系。

## 能做什么

| 项目 | 主要能力 |
| --- | --- |
| 产品功能、界面、数据演示 | 真实功能与数据、操作反馈、场景组件、时间轴和音轨 |
| 经常改文案、数据、配色的系列视频 | 分离内容、主题、场景与排期，复用组件并分版本交付 |
| 有明确参考风格的短 MG | 检索镜头卡、阅读配方和源码，先打样再按内容改造 |
| 无说明文字的二维图形叙事 | 可见事件、对象行为、焦点交接与段落发展 |
| 产品图片快切、拼贴、品牌过场 | 真实素材、裁切、匹配线索、快慢变化与逐镜输出 |

## 在 Codex 中安装

把下面这句话发给 Codex：

> 请将 https://github.com/2263-wang/yy 仓库里的 skills/motion-prompt-director 安装到我的 Codex 技能目录。保留该技能的默认约束，检查文件结构和引用是否完整。

也可以手动把 `skills/motion-prompt-director` 整个文件夹复制到 Codex 技能目录，通常是 `~/.codex/skills/`；设置了 `CODEX_HOME` 时使用其下的 `skills/`。保持目录中的脚本、参考文档和素材完整，不只复制 `SKILL.md`。

安装后在下一条消息中使用：

```text
用 $motion-prompt-director 做一个 10 秒的二维品牌过场。
```

如果已经安装旧版本，先备份现有目录，再由 Codex 比较和更新，保留自己的本机配置。

## DrawAI 执行依赖

本仓库提供导演 Skill 及制作说明，不内置 DrawAI 引擎、FFmpeg、浏览器或大型运行时。设计、分镜和使用其他已有工具不依赖 DrawAI；选择 DrawAI 制作时，需要另行安装其独立 Skill。

可告诉 Codex：

> 请从 fourzkw/dsh-drawai 的 skills/workbuddy 安装独立视频 Skill，目录命名为 drawai-video-studio；检查本机 Node、渲染依赖、字体素材、FFmpeg 和浏览器，并用小样验证后接入 motion-prompt-director。

上游项目：[fourzkw/dsh-drawai](https://github.com/fourzkw/dsh-drawai)。独立工具的命令简称 `wb`，不需要安装 WorkBuddy 应用或 DeepSeek Harness 画布。依赖安装方式和要求以所安装版本为准。

完整流程见 [DrawAI 制作与复用](skills/motion-prompt-director/references/drawai-production.md)。

## 默认工作偏好

- 默认二维制作，不自动启用三维或 CSS 立体展示。
- 普通动画默认只显示真实 Logo 原生字标，不自动增加标题、字幕或口号。
- 明确图表任务可使用必要的真实数值、单位和标签；界面演示可保留有关的原生文字；指定文案按请求修改。
- 默认不合成配音，也不使用临时 TTS 估时。音乐、音效和真人录音按项目要求处理。
- 用户当次明确要求优先，例外只应用于相应任务范围。
- 配方、风格和审样步骤按需使用；不要求所有项目采用同一套模板或每一步停下来确认。

这些是本版本的个人工作偏好，可根据实际需要修改 Skill。

## 文件入口

- [SKILL.md](skills/motion-prompt-director/SKILL.md)：主要设计与制作流程。
- [表达个性与小实验](skills/motion-prompt-director/references/expressive-direction.md)：语气、对象行为、节奏与有意的不规则。
- [DrawAI 制作与复用](skills/motion-prompt-director/references/drawai-production.md)：配方、工程组织、改版、预览和交付。
- [设计记录模板](skills/motion-prompt-director/assets/templates/direction-record.md)：项目中的简短设计与制作记录。
- `scripts/`：已有的方法检索与工程检查工具。
- `assets/`：组件、模板、正反例与示例工程；旧示例的适用边界由当前入口说明。

## 验证与来源

当前修订：`expressive-drawai-fusion-20261123`。已检查 Skill 格式、本次修改的引用与 DrawAI 的环境和配方查询；本机此前完成过 4 秒二维音视频的渲染、技术质检和逐镜素材导出。其他机器需要自行验证环境，这些检查不证明所有风格、审美效果、透明格式或剪映草稿导入都已通过。

这是个人整理与演进的技能，不是参考视频作者的原版 Skill，也不是 DrawAI 官方发行包。历史参考和观察边界保留在 [来源说明](skills/motion-prompt-director/references/provenance.md) 中。第三方项目及参考素材的权利归各自权利人，具体使用遵循其原有许可与来源说明；本仓库不对第三方材料另行授予许可。
