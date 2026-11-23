# DrawAI 制作与复用

适用于本技能内的功能／界面／数据演示、可重复改版的系列视频、参考风格MG，以及适合代码实现的二维片段。借用真实工程能力与配方，不把上游导演流程全部照搬。当前任务和 motion-prompt-director 决定内容、表达与确认步骤。

## 使用已安装的执行器

依赖已安装的 `drawai-video-studio` Skill，通常位于 `~/.codex/skills/drawai-video-studio/SKILL.md`；设置了 `CODEX_HOME` 时按该目录定位。选用时读取它和当前需要的技术参考；不再递归重读已经加载的导演入口。缺少执行器时报告实际状态，按用户要求安装或使用已有合适工具，不假定其他机器沿用发布者的绝对路径。

PowerShell 入口示例（先定位安装目录，工程路径替换为实际项目路径）：

```powershell
$skillBase = if ($env:CODEX_HOME) { Join-Path $env:CODEX_HOME 'skills' } else { Join-Path $env:USERPROFILE '.codex/skills' }
$drawaiRoot = Join-Path $skillBase 'drawai-video-studio'
$wbEntry = Join-Path $drawaiRoot 'scripts/wb.mjs'
$localEntry = Join-Path $drawaiRoot 'scripts/codex-wb.mjs'
if (Test-Path -LiteralPath $localEntry) { $wbEntry = $localEntry }
node $wbEntry doctor --json
node $wbEntry create --dir '<工程绝对路径>' --spec 1920x1080@30 --duration 8 --segments 2 --theme paper-ink --prompt '<本项目内容与用途>' --json
```

规格、镜头数、主题按任务设置，不沿用示例默认值；`create` 只创建骨架，需要编写真实 `scene-N.tsx`。若本机有 `codex-wb.mjs`，它是本机配置适配入口；否则使用上游 `wb.mjs` 并按 `doctor` 结果准备依赖、FFmpeg 与浏览器。运行时尽量复用执行器的独立依赖，不为每个项目另装 Remotion。具体参数以所安装版本的 `help` 与源码为准。

## 把配方用于实际画面

```powershell
node $wbEntry card search --query '拼贴' --json
node $wbEntry card show --card '<返回的cardId>' --style '<返回的styleKey>' --json
node $wbEntry style list --json
node $wbEntry style read --slug '<返回的slug>' --full
node $wbEntry style source --slug '<返回的slug>' --json
```

搜索显式用 `--query`；当前 CLI 的 search 从该参数读取关键词，不能照部分旧文档只写位置参数。读取实际 recipe、保护参数、保留特征和返回的源码位置，再编写关键动作。风格包提供色板、节奏、材料和实现方法；按需看真实参考帧，不将源码文本当成已看片。

明确复刻时保留识别性动作和用户指定特征，只改获准内容。原创项目可改节奏、构图、素材和动作关系，简短记录保留了什么、为何改造；不再声称是原配方的精确复刻。风格与镜头卡均可选，不要求每镜选卡，不为卡片时长改变用户总时长。

`create --style` 会把风格引擎和画质条件写入工程，并在渲染前检查。先确认所选引擎与当前二维范围、环境一致：WebGL 本身可以做二维，立体场景不因使用它而获准。若只借部分方法，用普通工程实现；若已有风格工程需要改引擎，按真实技术原因记录偏离并验证，不能伪造 import 绕过检查。

## 项目怎样组织，后面怎样改

保留 DrawAI 的 `timeline.json`、`scene-N.tsx`、`assets/` 和 `.out/` 契约。`timeline.json` 管画幅、fps、镜头起止帧与音轨；场景读取本镜相对帧，不把同一时长散写在多个文件。`storyboard.md` 记录可见事件与声音并与时间轴同步，`DIRECTION.md` 只记设计决定，避免多份文档互相重复。

需要系列复用时，由制作代码显式增加以下分离；这些是项目组织约定，不是 wb 自动生成的产品功能：

| 文件／目录 | 放什么 | 修改后重点检查 |
| --- | --- | --- |
| `content.ts` 或 `data/*.json` | 获准文字、真实数值、素材引用、来源与单位 | 超长文字、空值、极值、数量变化和事实来源 |
| `theme.ts` | 色彩、字体及其职责 | 对比度、字体实际加载、素材与背景关系 |
| `components/` | 真正重复使用的图元、界面状态和动作机制 | 改组件是否意外影响其他镜头 |
| `scene-N.tsx` | 该镜具体事件与编排 | 本题特色、对象关系、转场与识别时间 |
| `timeline.json` | 规格、镜头时长与声音排期 | 切点、总帧数、声音与事件位置 |

场景必须真实读取这些内容和参数。数据驱动不等于新增一份未被使用的 JSON；导出视频不等于自动拥有可视化参数面板。DrawAI 的生成入口与普通 Remotion Studio 不完全相同，若用户需要面板，另查实际 props/schema 接线与版本并验证。

系列项目可复用母题和动作，但新内容需要时允许改变镜头数量、尺度与停留。每版保留独立输出或工程，记录变更内容；不要覆盖唯一的已确认成片。先检查受影响镜头和接缝，再渲整片；不把每次换字都变成重做全部创意。

## 功能、界面与数据如何进入画面

- 产品功能：以真实资料或用户素材支持的输入、操作和反馈组织事件，不补造能力。可用网站素材采集／截图命令准备资源，拍摄或录屏要求仍按实际素材处理。
- 界面演示：需要实际状态变化；整张截图漂移只能承担取景。重绘界面应说明示意范围，不能当成真实可操作软件。用户明确要求展示的必要界面文字可保留，不增加无关宣传标题。
- 动态图表：使用所给或核实的数据、单位和时间范围；必要数值／标签属于明确图表任务范围。计算与视觉映射保持对应，不为戏剧效果伪造差距，缺数据时只给明确标注的结构样例或补来源。
- 文案与声音：只按该项目已授权范围启用。非语言音效、音乐、真实录音各自登记在音轨；没有配音要求不调用 voice，不默认TTS估时或铺底噪。

## 预览、声音、质检与交付

按实际项目依次使用必要步骤，不强制所有项目做相同时长样片：

```powershell
node $wbEntry preview --dir '<工程绝对路径>' --frames 0,30,60 --json
node $wbEntry render --dir '<工程绝对路径>' --range 0,90 --wait --json
node $wbEntry audio add --dir '<工程绝对路径>' --file '<已取得音频路径>' --role sfx --at 1.2 --gain -6 --json
node $wbEntry render --dir '<工程绝对路径>' --wait --json
node $wbEntry qa --dir '<工程绝对路径>' --json
node $wbEntry export --dir '<工程绝对路径>' --name delivery --json
```

示例帧号须在实际时间轴范围内；样片 range 的结束帧语义先核对本机实现。声音命令只在项目需要音轨时执行。样片检验关键动作，整片检验段落发展；用户要求审样则等反馈，已要求直接完成则自行验证后继续。

工程质检检查帧数、黑场、闪烁、音频等；设计性停留／跳切可能触发提示，逐项定位并记录保留理由，不为刷 pass 而加无意义运动。编译通过或 qa=pass 不证明个性、趣味和节奏。按导演标准看实际输出；仅抽帧时说明检查范围。

默认已验证的是 H.264/AAC MP4 与逐镜素材包。透明 alpha、交互参数面板、不同规格需要单独验证；不把普通 MP4 改扩展名冒充透明素材，必要时选合适渲染路径。`export` 提供逐镜视频、分轨音频与可选字幕；可选剪映草稿尚需在剪映本体验证，不能描述为 ChatCut 原生可编辑图层。

交付成片、可修改源码／数据／主题、必要素材和简短改版说明。素材许可与可分发范围按实际来源核对。单条片不强制搭通用平台，也不把完整配方库复制进每个项目。
