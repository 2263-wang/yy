# 动画skill

动效提示词导演 · 画面设计与运动曲线

用于 Codex、WorkBuddy、DSH（DeepSeek Harness）等支持 Skill 的 AI 工具的中文动画技能。从内容、素材和对象行为出发，设计二维动画，并按现有环境选择制作工具。

创作目标是减少过度正式、整齐划一的模板感，增加有内容依据的表达可能性。重点学习画面构图、色彩、裁切、运动曲线与节奏，让动画保留自己的语气、停顿和材料变化。

## 能做什么

| 项目 | 主要能力 |
| --- | --- |
| 产品功能、界面、数据演示 | 根据真实功能与数据设计操作反馈，组织场景、时间轴与输出 |
| 经常改文案、数据、配色的系列视频 | 分离内容、配色和场景，复用合适的组件，修改后复核布局与节奏 |
| 有明确参考风格的短篇动画 | 观察构图、动作和材料，先做关键动作小样，再按项目内容改造 |
| 学习参考片的画面与运动 | 拆解主次、留白与裁切；观察起停、快慢和动作分段，区分量测与拟合 |
| 无说明文字的二维图形叙事 | 设计可见事件、对象行为、焦点交接与段落发展 |
| 产品图片快切、拼贴、品牌过场 | 编排真实素材、裁切、匹配线索与快慢变化 |

## 安装与使用

使用仓库中的完整 `skills/motion-prompt-director` 文件夹，保留脚本、参考文档和素材；入口为 `SKILL.md`。

| 使用工具 | 安装入口 |
| --- | --- |
| Codex | 将完整技能文件夹放入技能目录，通常是 `~/.codex/skills/`；设置了 `CODEX_HOME` 时检查其下的 `skills/`。也可请 Codex 从本仓库安装指定文件夹。 |
| WorkBuddy | 在“专家·技能·连接器 → 技能 → 添加技能 → 上传技能”导入完整技能包。见[官方技能说明](https://www.codebuddy.cn/docs/workbuddy/From-Beginner-to-Expert-Guide/Function-Description/Skills-Market)。 |
| DSH / DeepSeek Harness | 将技能文件夹放入项目的 `.dsh/skills/`，形成 `.dsh/skills/motion-prompt-director/SKILL.md`，避免多套一层仓库目录。见[官方技能机制](https://github.com/deepseek-ai/deepseek-harness/blob/master/docs/subsystems/skills.md)。 |

完整说明与验证范围见[跨平台安装与使用](skills/motion-prompt-director/references/portable-use.md)。已有旧版本时，先备份，再比较更新并保留自己的修改。

安装后，可以在所用 AI 工具中说：

```text
使用 motion-prompt-director，做一个 10 秒的二维品牌动画。
重点设计画面构图、对象行为和运动曲线，减少整齐划一的模板感。
```

Codex 中也可使用 `$motion-prompt-director` 指定技能。其他工具按各自的调用方式使用；`agents/openai.yaml` 只提供 Codex 的显示与调用提示，主要创作流程都在 `SKILL.md` 中。

本技能提供创作方法、参考资料、辅助脚本与示例。实际制作时使用当前环境中合适的动画工具；代码示例的运行依赖按所选工具配置，`.mjs` 辅助脚本需要 Node.js。

## 默认工作偏好

- 默认制作二维动画，不自动启用三维动画或 CSS 立体展示。
- 普通动画默认只显示真实 Logo 原生字标，不自动增加标题、字幕或口号。
- 明确图表任务可使用必要的真实数值、单位和标签；界面演示可保留有关的原生文字；指定文案按请求修改。
- 默认不合成配音，也不使用临时 TTS 估时。音乐、音效和真人录音按项目要求处理。
- 用户当次明确要求优先，例外只应用于相应任务范围。
- 参考方法、小样和审看步骤按需使用；不要求所有项目采用同一套模板或每一步停下来确认。

这些是本版本的个人工作偏好，可根据实际需要修改 Skill。

## 文件入口

- [SKILL.md](skills/motion-prompt-director/SKILL.md)：主要设计与制作流程。
- [跨平台安装与使用](skills/motion-prompt-director/references/portable-use.md)：安装入口、调用方式及环境要求。
- [表达个性与小实验](skills/motion-prompt-director/references/expressive-direction.md)：语气、对象行为、节奏与有意的不规则。
- [画面设计与运动曲线](skills/motion-prompt-director/references/design-and-motion-curves.md)：4 组画面观察、2 个原生帧量测案例，以及带误差说明的曲线近似。
- [产品片与抽象广告方法](skills/motion-prompt-director/references/product-film-studies.md)：8 张带观察区间、迁移方式和失效信号的方法卡。
- [曲线对照页](skills/motion-prompt-director/references/curve-studies/curve-lab.html)：下载后在浏览器打开，可拖动比较量测进度、拟合与线性动作；GitHub 文件页显示源码。
- [制作方法](skills/motion-prompt-director/references/production-method.md)：组织素材、场景、修改、预览与交付。
- [设计记录模板](skills/motion-prompt-director/assets/templates/direction-record.md)：项目中的简短设计与制作记录。

技能目录中的 `scripts/` 提供方法检索与检查工具；`assets/` 提供组件、模板、正反例与示例工程，各自适用范围见相应说明。

## 验证与来源

当前修订：`platform-neutral-animation-20261124`。本次统一二维动画用语，补充跨平台使用说明，移除参考项目的专用执行流程与安装要求，保留画面设计、运动曲线及通用工程复用方法。

技能包已在 Codex 环境中使用，结构、引用与辅助脚本有检查记录。WorkBuddy 和 DSH 的安装入口按 2026-11-24 的官方文档核对，尚未在这两个应用中完成端到端动画制作验证；实际可用的搜索、渲染与导出工具取决于各自环境。

参考研究第一轮观察 8 支影片，第二轮对两个片段按 24/30fps 量测，共 42/43 帧，并对所选动作区间拟合曲线。拟合是屏幕空间近似，未取得作者原始工程；正常速度完整回看、音轨和新动画审美尚未验证。原片与参考抽帧未随仓库分发，仓库保留自行制作的量测图和数值。

这是个人整理与演进的技能。历史参考和观察边界见[来源说明](skills/motion-prompt-director/references/provenance.md)。第三方项目及参考素材的权利归各自权利人，具体使用遵循其原有许可与来源说明。
