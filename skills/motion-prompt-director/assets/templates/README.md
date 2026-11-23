# 共用时间配置的世界／摄像机模板

当前边界：只用二维路径；旧例中的透视／三维、材质打光等建议不执行。真实产品图可作平面素材，图片蒙太奇与明确获准产品名按[主规则](../../SKILL.md)处理，不把技术示例当默认成片。

此目录是特定布局的起始骨架。保留用户的分段探索与双节奏方法，曲线和纸面风格按任务选用。

新项目先用[设计记录模板](direction-record.md)，按[制作方法](../../references/production-method.md)完成命题、观看节拍与粗动稿判断，再展开此工程骨架。时间审计不能给设计判通过。

## 接入

把整个 templates 文件夹复制为工程的 `src/motion/`，保留目录内 package.json、所有 js 与审计脚本在一起。不要把 audit 单独放根目录，否则其相对导入会失效。

在 Root 中导入 WorldCamera，并从同目录 motion-budget.js 导入 FPS、DURATION，注册合成元数据。渲染组件也直接导入 T、CAM、STATIONS；修改真实时间配置后，再运行：

```text
node src/motion/audit-rhythm.mjs
```

可指定另一份导出 BUDGET 的 ESM 模块：

```text
node src/motion/audit-rhythm.mjs path/to/timing.mjs
```

结构错误返回非零退出码。0.3–1 秒等偏好只产生提示；解释目的后可以保留，不为通过检查伪拆动作。审计只检查已登记窗口，不自动发现所有动画、不检查像素、不证明观感或 C1。

## 调整顺序

先定表达与关键构图，再修改世界尺寸、站点与摄像机路线；小样比较单次动作和节奏；把选定方案拼起来检验接缝。站距与高斯模糊公式仅是旧例近似，不是保证。

在 motion-budget.js 改 `createBudget(30)` 的 fps，所有以秒定义的窗口自动换算。替换样例动作后，更新同一文件中的 motions，确保组件真实读取这些窗口。先查开始／中途／结束及移动中点，再完整播放。

## 曲线

smooth 用于停到停；fastOutSlowIn 是内部不停顿的连续速度分配；overshoot 的 freq/decay 为形状参数，比例须重新 measurePeak；anticipate 首尾位置与速度归零；squash 两端恢复为 1。渲染和数值检查应导入同一文件。
