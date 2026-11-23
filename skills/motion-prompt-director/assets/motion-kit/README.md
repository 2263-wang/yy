# 八个基础代码组件

当前边界：只用二维路径；旧例中的透视／三维、材质打光等建议不执行。真实产品图可作平面素材，图片蒙太奇与明确获准产品名按[主规则](../../SKILL.md)处理，不把技术示例当默认成片。

这是通用积木，不是 60 套完成品。提示卡里的 compose 表示可用这些组件组合起步；spec-only 表示还需专项实现。逐帧路径变形、复杂3D翻折、数字滚动、拖尾与真实交互不在本组件库的直接实现范围。

将本目录复制到 Remotion 工程 src/motion-kit，导入 MotionKit.tsx。仅依赖 React 与 Remotion；时间单位是秒，内部从 useVideoConfig 取 fps，动画随 useCurrentFrame 确定性求值。没有 CSS animation、随机时钟或外部网络依赖。

- Motion：位移、缩放、旋转、alpha 的起终态插值；from/to 用像素、角度和比例。多动作共用 transform 时用嵌套层，避免覆盖。
- ClipReveal：固定内容的矩形遮罩揭示／关闭。用于绝对定位子节点时，style 必须给出非零 width/height。
- Stagger：按 children 顺序错峰；总窗口须包括最后一项的延迟。实例作为整体模板编辑；需独立编辑时展开 JSX。
- OrbitGroup：绕共同中心分布，默认保持图标正立；需固定宽高。
- TextSplit：逐字符或按空格分词。中文分词需先按语义组织，复杂组合字素需额外处理。
- ShapeMorph：只在圆角矩形家族内插值宽、高、圆角；不是任意 SVG 路径变形。默认锚点是中心。
- PathMove：三次贝塞尔路径；不传控制点时为直线，control1/control2 可指定弧线。
- Camera2D：大世界按秒定义路线；此版本是停到停插值，每个关键点会归零速度。连续穿越节点需换切线连续的路径求值。

Gallery.tsx 导出 MotionKitGallery，注册为 1440×900、30fps、120帧可查看基础能力。画廊色底只是演示背景；基础组件不自动给透明作品加底板。

这些离线组件不提供实时手势打断或 Apple 系统动画实现。参考其状态连续性时，仍需按目标应用的交互系统实现。

## 一套完整组合预设

ThreeImageFallback.tsx 是 R03 的三图保底实现；准确时间线见 [实例说明](../../references/fallback-three-images.md)。需要3个真实 src，合成时长至少3秒，默认8秒比较适合。含错峰、对齐、轮流强调和透明退出；它与上述8个基础组件分开计数。

基础组件的实际渲染演示：[4秒预览](preview.mp4) · [截图](preview.png)。三图预设的首帧、中段和末帧另经透明通道检查。
