# 跨平台安装与使用

本 Skill 的入口是 `SKILL.md`，创作流程和参考文档可由 Codex、WorkBuddy、DSH（DeepSeek Harness）等支持技能文件的 AI 工具读取。交付整个 `motion-prompt-director` 文件夹，保留脚本、参考文档与素材的相对位置。技能名称始终是 `motion-prompt-director`，版本标记以入口的 `metadata.revision` 为准。

## 安装入口

| 工具 | 如何放置或导入 |
| --- | --- |
| Codex | 将完整文件夹放到本机技能目录；本环境使用 `~/.codex/skills/motion-prompt-director/`。设置了 `CODEX_HOME` 时检查其 `skills/` 目录。 |
| WorkBuddy | 在“专家·技能·连接器 → 技能 → 添加技能 → 上传技能”导入本地完整技能包。自定义包使用上传入口，不假定技能市场的对话安装能安装任意 GitHub 仓库。 |
| DSH / DeepSeek Harness | 可将完整文件夹放在项目的 `.dsh/skills/motion-prompt-director/` 下；`SKILL.md` 应直接位于该技能文件夹内，避免多套一层仓库目录。也可使用该环境配置的其他技能目录。 |
| 其他 AI 工具 | 使用其支持的技能导入方式；支持文件读取但没有技能加载入口时，可明确要求读取 `SKILL.md` 及相关引用，但不等同于完成原生技能安装。 |

WorkBuddy 与 DSH 的入口按 2026-11-24 的官方文档核对：[WorkBuddy 技能](https://www.codebuddy.cn/docs/workbuddy/From-Beginner-to-Expert-Guide/Function-Description/Skills-Market)、[DeepSeek Harness 技能机制](https://github.com/deepseek-ai/deepseek-harness/blob/master/docs/subsystems/skills.md)。界面与目录配置以用户安装版本为准。本 Skill 尚未在这两个应用中完成端到端制作验证；可导入文件不代表各工具拥有相同的搜索、渲染或导出能力。

`agents/openai.yaml` 仅提供 Codex 的列表显示和调用提示，不是创作流程入口。其他工具读取 `SKILL.md` 和引用资源即可，不必理解这份平台专用配置。

## 开始使用

可在目标 AI 工具里说：

> 使用 motion-prompt-director，根据我的内容制作二维动画。先理解画面要表达什么，再设计构图、对象行为、运动曲线和段落衔接，选择当前环境中可用的工具实现。保留本次规格和已定方案；默认内容边界按 SKILL.md，明确要求的界面文字、图表、产品名称或其他内容按对应范围处理。

Codex 中也可用 `$motion-prompt-director` 指定技能。其他工具的快捷调用语法以其自身说明为准。

仅要方案时输出设计；要求制作时推进到约定的源工程、预览与输出。缺少特定工具时检查已有替代，说明实际限制，不把某个参考项目自动变成安装前提。

## 设计资源与制作环境

- [画面设计与运动曲线](design-and-motion-curves.md)：构图、色彩、留白、裁切、动作分段与曲线量测。
- [表达个性](expressive-direction.md)与[片内丰富度](visual-richness.md)：对象行为、材料变化与段落发展。
- [制作方法](production-method.md)与[工具选择](tool-selection.md)：根据现有工程和交付需求落地。
- `scripts/` 中的 `.mjs` 检索与检查脚本使用 Node.js；没有 Node.js 时，仍可阅读设计方法，按需选择是否运行脚本。
- 包内的代码示例按各自说明使用相应依赖；Skill 不自带通用视频渲染器，也不保证目标环境已安装示例所用工具。现有 Remotion 示例不等于可直接在其他引擎运行。

需要组合检索时，可在技能目录运行：

```text
node scripts/explore-directions.mjs --topic=AI产业链 --relations=dependency,part-whole --purpose=opening --duration=8 --mode=insert
```

它输出待筛选的方案起点与待执行的研究计划，不自动上网、挑选最终方案或生成视频。使用范围与文字选项见[组合探索](exploration-method.md)，当前任务的内容范围仍以 `SKILL.md` 为准。

## 验证范围

本包已经在 Codex 环境中使用，并检查过技能结构、引用、检索器与相关示例；具体影片和研究案例保留各自的验证记录。它们不证明所有风格、全部输出格式或其他 AI 工具的实际效果。

需要检查包内资源与脚本时，按相关改动运行：

```text
node scripts/verify-library.mjs
node scripts/verify-languages.mjs
node scripts/verify-screen-policy.mjs
node scripts/verify-exploration.mjs
node scripts/verify-flat-policy.mjs
```

脚本只验证各自覆盖的结构与行为，不能代替画面观察、内容事实和正常速度回看。另见[行为测试](behavior-tests.md)。不要凭“已加载 Skill”声称动画或平台兼容性已经通过验证。
