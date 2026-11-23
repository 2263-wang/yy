#!/usr/bin/env node
import { readFileSync } from "node:fs";
import {screenPolicy,TEXT_ACTIONS} from './screen-policy.mjs';
import {DISABLED_DEPTH_ACTIONS} from './flat-policy.mjs';
const catalog = JSON.parse(
  readFileSync(
    new URL("../assets/motion-library/catalog.json", import.meta.url),
    "utf8",
  ),
);
const allowed = new Set([
  "assets",
  "duration",
  "mode",
  "style",
  "goal",
  "format",
  "help",
  "text",
]);
const args = {
  assets: "1",
  duration: "8",
  mode: "overlay",
  style: "calm",
  goal: "showcase",
  format: "json",
  text: "brand-only",
};
try {
  for (const input of process.argv.slice(2)) {
    if (input === "--help") {
      args.help = true;
      continue;
    }
    const m = /^--([a-z]+)=(.+)$/.exec(input);
    if (!m || !allowed.has(m[1]) || m[1] === "help")
      throw new Error(`Unknown argument: ${input}; use --help`);
    args[m[1]] = m[2];
  }
  if (args.help) {
    console.log(
      "node scripts/select-motion.mjs --assets=3 --duration=8 --mode=overlay --style=calm --goal=showcase --format=json\nmode: overlay|insert|loop|transition; style: calm|balanced|dynamic; goal: showcase|hero|ranking|evidence|text|world|icons|loop|transition; format: json|prompt; text: brand-only(default)|product-name(current user request for name only)|explicit(current user request required). Current rendering is flat-2d. Narration and TTS timing stay off.",
    );
    process.exit(0);
  }
  const presentation=screenPolicy(args.text);
  if(['ranking','evidence','text'].includes(args.goal) && args.text!=='explicit')
    throw new Error('This preset requires displayed text/numbers. Redesign as nontext MG; use --text=explicit only when the current user explicitly requests text.');
  const count = Number(args.assets),
    duration = Number(args.duration);
  if (!Number.isSafeInteger(count) || count < 0 || count > 999)
    throw new Error("assets must be an integer in 0..999");
  if (!Number.isFinite(duration) || duration <= 0)
    throw new Error("duration must be positive and finite");
  for (const [key, options] of Object.entries({
    mode: ["overlay", "insert", "loop", "transition"],
    style: ["calm", "balanced", "dynamic"],
    goal: [
      "showcase",
      "hero",
      "ranking",
      "evidence",
      "text",
      "world",
      "icons",
      "loop",
      "transition",
    ],
    format: ["json", "prompt"],
  }))
    if (!options.includes(args[key]))
      throw new Error(`Invalid ${key}: ${args[key]}`);
  if (
    (args.mode === "loop" && args.goal === "transition") ||
    (args.mode === "transition" && args.goal === "loop")
  )
    throw new Error("loop and transition conflict; choose one delivery intent");
  if (
    args.mode === "transition" &&
    !["transition", "showcase"].includes(args.goal)
  )
    throw new Error("transition mode requires goal=transition or showcase");
  if (args.mode === "loop" && !["loop", "showcase"].includes(args.goal))
    throw new Error("loop mode requires goal=loop or showcase");
  const byGoal = {
    hero: "R05",
    ranking: "R06",
    evidence: "R07",
    text: "R08",
    world: "R09",
    icons: "R11",
    loop: "R12",
    transition: "R10",
  };
  let id =
    args.mode === "transition"
      ? "R10"
      : args.mode === "loop"
        ? "R12"
        : byGoal[args.goal];
  if (!id) {
    if (count === 0)
      throw new Error(
        "showcase needs at least one asset; for text/data/world use the matching goal",
      );
    id = count === 1 ? "R01" : count <= 3 ? "R03" : count <= 8 ? "R02" : "R04";
  }
  const recipe = catalog.recipes.find((r) => r.id === id);
  if (count < recipe.minAssets || count > recipe.maxAssets)
    throw new Error(
      `${id} accepts ${recipe.minAssets}..${recipe.maxAssets} assets; current count ${count}. Choose another goal or supply assets; do not discard inputs.`,
    );
  const n = (v) => Math.round(v * 10000) / 10000;
  const profile = {
    calm: {
      travelFraction: 0.08,
      rotationDegrees: 3,
      scaleEmphasis: 1.04,
      staggerSeconds: 0.12,
      preferredActionSeconds: 0.65,
    },
    balanced: {
      travelFraction: 0.16,
      rotationDegrees: 7,
      scaleEmphasis: 1.08,
      staggerSeconds: 0.09,
      preferredActionSeconds: 0.55,
    },
    dynamic: {
      travelFraction: 0.24,
      rotationDegrees: 12,
      scaleEmphasis: 1.12,
      staggerSeconds: 0.07,
      preferredActionSeconds: 0.4,
    },
  }[args.style];
  const endMode =
    id === "R12" ? "loop" : id === "R10" ? "transition" : args.mode;
  const warnings = [],
    requiredInputs = [
      "逐个绑定 A1…An 到真实文件，读取尺寸、锚点与透明通道；本命令不读取图片。",
    ];
  if (["R06", "R07"].includes(id))
    requiredInputs.push(
      "需要真实标签、起值／终值、单位与来源；数据未提供前不可编造或宣称可渲染。",
    );
  if (["R08", "R09"].includes(id))
    requiredInputs.push("需要实际文案、内容关系与阅读顺序；缺少时先列待填项。");
  if (id === "R05")
    requiredInputs.push("需要指定哪个对象是主角，不能由文件顺序推断胜负。");
  if (args.mode === "overlay" || id === "R10")
    requiredInputs.push(
      "核实素材边缘是否已抠好；需要时先抠图。导出必须保留 alpha，棋盘格仅用于预览。",
    );
  if (duration < 3)
    warnings.push(
      "时长不足3秒：只保留最少表达；用户时长保持不变。缩短行程，减少动作，不机械压缩全部动作。",
    );
  if (count > 8)
    warnings.push(
      "素材多：按真实阅读顺序分组，下面逐项焦点槽只是分配记录；过短时改成每组一个焦点。不得静默省略素材。",
    );
  const phaseNames = {
    R01: ["揭示主体", "局部细节与阅读", "沿原关系收回"],
    R02: ["建立叠摞并展开", "按顺序交接焦点", "收拢并退出"],
    R03: ["错峰并列集结", "逐个介绍后回并列", "同等分量干净退出"],
    R04: ["建立第一组", "同布局规则逐组展示", "汇总或关闭"],
    R05: ["建立群体", "明确主角并让位", "收紧识别"],
    R06: ["建立标签与数据绑定", "同步更新数值和位次", "终值阅读并收回"],
    R07: ["提出真实结论", "证据与标注", "阅读并收回"],
    R08: ["建立关键词", "轮廓接到图形", "回到可读标题"],
    R09: ["建立第一站", "在同一世界沿内容移镜", "汇总或回起点"],
    R10: ["从透明扫入", "完全遮挡指定切点", "同向退出至透明"],
    R11: ["建立图标初态", "对象展开、切换或焦点交接", "稳定呈现或回收"],
    R12: ["进入循环初态", "低幅周期变化", "接回起始状态"],
  };
  const boundaries = id === "R10" ? [0, 0.4, 0.6, 1] : [0, 0.2, 0.8, 1];
  const phases = phaseNames[id].map((label, i) => ({
    name: ["opening", "middle", "ending"][i],
    label,
    startSeconds: n(duration * boundaries[i]),
    endSeconds: n(duration * boundaries[i + 1]),
    purpose:
      i === 1
        ? "推进关系并留阅读"
        : i === 0
          ? "建立第一眼焦点"
          : "完成交付用途",
  }));
  const focusCount = count || 1,
    middle = phases[1],
    slot = (middle.endSeconds - middle.startSeconds) / focusCount;
  if (slot < 0.6 && count > 1)
    warnings.push(
      "逐项焦点槽不足0.6秒，默认改为分组／整体说明；如果要求逐项阅读，需要减少信息或增加时长，不能宣称已读清。",
    );
  const focusSlots = Array.from({ length: count }, (_, i) => ({
    asset: `A${i + 1}`,
    startSeconds: n(middle.startSeconds + i * slot),
    endSeconds: n(middle.startSeconds + (i + 1) * slot),
    note:
      slot < 0.6 ? "组内成员，勿逐个抢焦点" : "介绍后交还原布局，不暗示排名",
  }));
  const seams = [
    "同一对象跨段保留同一身份、坐标系、锚点和可见包围盒。",
    "衔接核对位置、尺度、alpha、层序与屏幕速度；停顿须有阅读目的。",
  ];
  if (endMode === "loop")
    seams.push(
      "循环成片从周期起点开始；入场演示另放循环外。首尾位置、尺度、alpha和屏幕速度兼容，不能最后一帧突然跳回。",
    );
  else if (endMode === "transition")
    seams.push(
      "首帧和末帧全透明；中段用实际不透明遮挡覆盖整个取景框，切点位于完整遮挡窗口内。",
    );
  else if (endMode === "overlay")
    seams.push(
      "首帧与末帧透明，主体有完整出现与退出过程；退出在最后一帧之前完成，禁止只在最后一帧硬清空。",
    );
  else seams.push("结尾留可用停留或退出，按实际剪辑用途选择。");
  if (endMode === "overlay") {
    phases[2].label += "，随后退至全透明";
    seams.push(
      args.text==='explicit'?"交付用途覆盖配方尾态：收紧为图标或标题后仍须在结尾窗口内退出，不能停留不透明角标。":"交付用途覆盖配方尾态：对象收紧后仍须在结尾窗口内退出，不能留下不透明角标或额外文字。",
    );
  }
  const result = {
    schemaVersion: 1,
    screenPolicy: presentation,
    directionNotice:
      "旧局部配方工具，仅在已有选定方向时使用；未定方向先用explore-directions及真实参考展开方法。这里的配方、均分焦点槽和20/80时窗只是示意，不是已验证导演方案，不锁定制作工具。",
    requiresSelectedDirection: true,
    timingScope: "legacy-placeholder-not-a-validated-timeline",
    selectedTool: null,
    status: "plan-needs-asset-binding-and-visual-verification",
    assumptions: [
      "未指定比例／分辨率／帧率时建议16:9、1920×1080、30fps；用户规格优先。",
      "选型器不读取素材和已有文案，requiredInputs 是执行前检查项。",
    ],
    request: {
      assetCount: count,
      durationSeconds: duration,
      mode: endMode,
      style: args.style,
      goal: args.goal,
    },
    recipe,
    profile,
    rotationAxis: "z-only-in-current-flat-policy",
    phases,
    focusSlots,
    actions: recipe.actions.filter(a=>!DISABLED_DEPTH_ACTIONS.has(a)&&(args.text==='explicit'||!TEXT_ACTIONS.has(a))).map((a) => catalog.actions.find((x) => x.id === a)),
    excludedDepthActions: recipe.actions.filter(a=>DISABLED_DEPTH_ACTIONS.has(a)),
    excludedTextActions: recipe.actions.filter(a=>args.text!=='explicit'&&TEXT_ACTIONS.has(a)),
    requiredInputs,
    seamChecks: seams,
    verification: [
      "工程与真实文件可加载；时间线覆盖0到用户时长。",
      "开场／中段／结尾分别取样，并检查运动中段和衔接。",
      "正常速度回看焦点、可读性和节奏；透明素材叠到明暗两种背景检查。",
      "困难效果降级为可验证的遮罩／2D近似，明确实际实现范围。",
    ],
    warnings,
  };
  if (args.format === "json") console.log(JSON.stringify(result, null, 2));
  else
    console.log(
      [
        presentation.note,
        presentation.rendering.note,
        result.directionNotice,
        `采用 ${recipe.id} ${recipe.name}；${duration}秒，${count}份素材，${endMode}，${args.style}。`,
        recipe.plan,
        ...phases.map((p) => `${p.startSeconds}–${p.endSeconds}s：${p.label}`),
        ...result.actions.map((a) => a.prompt),
        `参数：${JSON.stringify(profile)}`,
        "必须补全：",
        ...requiredInputs,
        "衔接：",
        ...seams,
        "验收：",
        ...result.verification,
        ...warnings,
      ].join("\n"),
    );
} catch (error) {
  console.error(error.message);
  process.exitCode = 1;
}
