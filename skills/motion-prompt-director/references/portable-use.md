# 交给其他AI使用

交付整个motion-prompt-director文件夹，入口为SKILL.md。放到目标软件支持的技能目录；不能自动加载时直接让AI读取入口与相关引用。不能只发入口而遗漏资源。调用名仍是motion-prompt-director，visual-richness-20261104只是revision，不当成新技能跨目录搜。

可附启动指令：

> 使用motion-prompt-director（revision: visual-richness-20261104）。按我的文案与规格，主动研究本题二维MG／图片蒙太奇表达，同题不足时扩展相近结构案例；不要只搜资料图片。在内容约束下展开、组合和比较表达方法；选定方向后继续设计片内的可见事件、素材、表示形式与尺度／密度变化，保持视觉风格和主体可追踪。用覆盖主要段落的真实构图／粗动稿筛选，再按方案选择合适工具。当前关闭三维／CSS立体模拟，允许有内容与节奏的产品图片快切；默认仅Logo原生字标，用户明确要求时仅例外产品名，不加其他画面文字、不朗读／配音／TTS计时、不做PPT式巡览。能判断就自主完成，确实无法取舍再带有效候选让我选。用户已定方案或局部修改时保留范围。

## 新的探索入口

```text
node scripts/explore-directions.mjs --topic=AI产业链 --relations=dependency,part-whole --purpose=opening --duration=8 --mode=insert
```

命令输出未验证种子、兼容性与待执行检索计划，不理解自由文案、不联网、不选首项、不自动选工具、不生成视频。需实际搜索／观察、映射对象、剪枝和验证。方法库开放，可通过JSON补充声明rendering=flat-2d的新方法；未分类／三维会被排除；细则见[组合探索](exploration-method.md)。没有Node时按同样原则执行，不把缺少脚本当不能设计。

旧select-language.mjs用于检索分类，select-motion.mjs仅作已选方向的局部配方／示意时窗，不作为完整导演入口。最终少量候选不限制内部探索广度。记录用[模板](../assets/templates/direction-record.md)，工具选择读[工具选择](tool-selection.md)，用户指定工具优先。包内不随附Remotion／HF运行时，不承诺目标环境已安装。

需要提高片内丰富度时，读取[方法](visual-richness.md)和[完整案例](richness-cases.md)。检索器的primary及单个组合种子不锁定整片表达；素材状态、主体内层变化与段落差异需映射到真实画面。案例含成片观察与未渲染的原创推演，区分验证范围。Kimi关键画面联系图可选，原视频不是运行依赖。

[无文字MG实例](nontext-mg.md)可研究局部对象关系；旧图谱／8组件演示含说明文字，不当当前默认模板。已有代码是Remotion示例，不声称它们在HF直接可运行。使用相应工具的现有依赖和版本，不要求另一个AI存在本机技能路径。

## 检查与真实试用

```text
node scripts/verify-library.mjs
node scripts/verify-languages.mjs
node scripts/verify-screen-policy.mjs
node scripts/verify-exploration.mjs
node scripts/verify-flat-policy.mjs
```

各脚本只覆盖资源引用、路由、默认文字／声音政策、组合状态与可扩充性；不证明事实、美感、网页真被观察或执行者实际照做。text=explicit只能来自当前用户明确要求文字，不能自行启用；不会自动启用配音。

[行为测试](behavior-tests.md)在隔离项目执行，不把预期方案或其他AI本题方案喂给执行者。审查真实查询、观察与迁移、不同组织方法、选择证据、工具理由和最终画面。未经用户授权不自动向外部AI发送任务或启动收费任务。

技能能提供方法和可检查产物，不能从外部强制第三方AI行为；不要凭“已调用skill”判通过。

产品名称单独例外：用户当前明确要求时，探索器可传--text=product-name，只允许相应真实名称；不解锁文字配方、说明字幕、三维、配音或TTS。工具和脚本不能自行赋予授权。
