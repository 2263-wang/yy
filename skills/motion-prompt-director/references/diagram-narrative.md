# 完整粗动稿：同一图谱怎样组织不同观看任务

**历史技术示例：不符合当前默认无说明文字的成片规则。** 保留用于研究共享坐标／取景，或用户明确要求文字图谱时使用；不要按“产业链”关键词直接作为新作品模板。默认改读[无说明文字动画](nontext-mg.md)，不能只把本例标题删去便称作已转为MG。

适用于需要关系总览与局部聚焦的图谱、层级或支撑网络。不作为所有题目的固定模板；简单图标、角色、循环可以走其他路线。

本例目标：让观众认识一组简化节点，聚焦一处支撑，再用前景问题引导后文。不是解释中美能力差异，也不代表完整产业链、真实采购关系或内部物理结构。所有素材为代码图形和文字，替换时必须核对实际关系。

## 两个有效方向

- A「空间图谱」：保持节点坐标，先看全局、推近计算资源、让前景问题接管、回到硬件关系并把路线交给后文。适合需要规模感、局部与整体联系的开场；风险是移镜与前景若同时很重会争焦点。
- B「节点接力」：相同节点固定在画内，不运镜，按观看顺序交接亮度与尺度。适合短行程、小画幅和持续辨认全部节点；风险是每站同样强调会平，复杂分支也不适合强排单线。

两者都可制作，不能以“B没用摄像机所以差”作为选择依据。实际任务按入口／出口、口播和素材判断；看过构图／小样仍无法可靠取舍，就把两者及具体不确定点给用户选择。

## A的观看节拍

- 0–1.4秒：总览。当前任务是认识关系规模，节点位置稳定，不要求逐个读完。
- 1.4–2.2秒：镜头推到计算资源；2.2–3.1秒保持。主角清楚，其他节点可出画；不强行让所有小字都可读。
- 3.1–3.6秒：图谱退暗，前景问题出现；停留至4.7秒，再退出至5.15秒。提问接管而非继续逐项浏览。
- 4.9–5.8秒：镜头回到同一坐标的图谱；前景交还注意力。
- 5.8–6.5秒：硬件节点与连接获得强调；留阅读到7.1秒。
- 7.1–7.8秒：路线向后文延续，至8.6秒留接片余量。不额外给无依据答案或独立海报。

时间只是这个教学例的配置。依口播、画幅和用途重排，不能把8.6秒或四段结构当成通用要求。节点接力B共用同一组内容，但组织方式和阅读代价不同。

## 文件与接入

代码在 [DiagramNarrative.tsx](../assets/story-examples/diagram-narrative/DiagramNarrative.tsx)，注册在 [entry.tsx](../assets/story-examples/diagram-narrative/entry.tsx)。同一个 `stateAt(t)` 与 `TIMING` 同时供粗动稿和检查使用，避免小样和主片起态分离。

将整个目录复制到已有Remotion工程的 `src/diagram-narrative/`。使用项目的依赖；本例以React19.2.3／Remotion4.0.539实际验证。可运行：

```text
npx remotion studio src/diagram-narrative/entry.tsx
npx remotion render src/diagram-narrative/entry.tsx DiagramAtlas out/diagram-atlas.mp4 --scale=0.5
npx remotion render src/diagram-narrative/entry.tsx DiagramRelay out/diagram-relay.mp4 --scale=0.5
```

`DiagramAtlas` 与 `DiagramRelay` 都为1920×1080、30fps、258帧；半尺寸预览是960×540。修改时长同步注册帧数和时间配置。背景不透明，无音轨，不声称支持透明循环或真实3D。

`variant` 切换两个方向，`showGuide` 控制上方阶段提示。这里刻意保留教学说明与简陋形状，作为判断关系与节奏的粗动稿，不作为成片美术质量标杆。`NODES` 映射真实素材时需要重新检查尺寸、标题区、路径和身份，不能只换文字就认为已适配。

## 判断示例时看什么

两条已渲染预览：[A空间图谱](../assets/story-examples/diagram-narrative/atlas-preview.mp4)、[B节点接力](../assets/story-examples/diagram-narrative/relay-preview.mp4)；关键帧：[A接触表](../assets/story-examples/diagram-narrative/atlas-contact.jpg)、[B接触表](../assets/story-examples/diagram-narrative/relay-contact.jpg)。[本次设计记录](../assets/story-examples/diagram-narrative/DIRECTION.md)说明参考迁移、取舍与一次真实修改。

预览和关键帧用于检查：焦点节点是否完整入画；前景出现时背景是否让位；返回后节点身份与坐标是否一致；尾态是否给后文留空间。状态／布局检查和TypeScript通过不代表美感通过。

图谱风格可以改，卡片容器可以保留。需要保住的是“当前任务—主角—变化—参照—交接”的关系；不机械复制金色、网格或运镜次数。
