#!/usr/bin/env node
import { readFileSync } from "node:fs";
import { pathToFileURL } from "node:url";
import {screenPolicy,TEXT_ACTIONS,TEXT_RECIPES} from './screen-policy.mjs';
import {DISABLED_DEPTH_ACTIONS} from './flat-policy.mjs';
export const languages = JSON.parse(
  readFileSync(
    new URL("../assets/motion-library/languages.json", import.meta.url),
    "utf8",
  ),
);
const actionCatalog = JSON.parse(
  readFileSync(
    new URL("../assets/motion-library/catalog.json", import.meta.url),
    "utf8",
  ),
);
const modes = ["insert", "overlay", "loop", "transition"];
export function selectLanguage(input = {}) {
  const {
    content = "",
    intent,
    language,
    objects,
    files,
    duration = 8,
    mode = "insert",
    text = "brand-only",
  } = input;
  const presentation = screenPolicy(text);
  if (!Number.isFinite(duration) || duration <= 0)
    throw new Error("duration must be positive and finite");
  if (!modes.includes(mode)) throw new Error("Unknown delivery mode: " + mode);
  for (const [key, n] of Object.entries({ objects, files }))
    if (n !== undefined && (!Number.isSafeInteger(n) || n < 0 || n > 999))
      throw new Error(key + " must be an integer in 0..999");
  const contentKeys = content
    .split(",")
    .map((x) => x.trim().toLowerCase())
    .filter(Boolean);
  const contentFamilies = contentKeys.map((key) => {
    const f = languages.families.find(
      (x) => x.contentAliases.includes(key) || x.key === key,
    );
    if (!f) throw new Error("Unknown content: " + key + "; use --list");
    return f;
  });
  const byIntent = intent
    ? languages.families.find((f) => f.intent === intent)
    : undefined;
  if (intent && !byIntent)
    throw new Error("Unknown intent: " + intent + "; use --list");
  const explicit = language
    ? languages.families.find(
        (f) => f.id === language.toUpperCase() || f.key === language,
      )
    : undefined;
  if (language && !explicit)
    throw new Error("Unknown language: " + language + "; use --list");
  const primary =
    explicit ??
    byIntent ??
    (mode === "transition"
      ? languages.families.find((f) => f.id === "ML12")
      : contentFamilies[0]);
  if (!primary)
    throw new Error(
      "Provide --content, --intent or --language; object count alone does not select animation language.",
    );
  const secondaryIds = [
    ...new Set(
      contentFamilies.filter((f) => f.id !== primary.id).map((f) => f.id),
    ),
  ];
  if (mode === "transition" && primary.id !== "ML12") secondaryIds.push("ML12");
  if (mode === "loop" && primary.id !== "ML11") secondaryIds.push("ML11");
  const secondary = [...new Set(secondaryIds)].map((id) => {
    const f = languages.families.find((f) => f.id === id);
    return {
      id: f.id,
      name: f.name,
      role: "按需要采用辅助语言，不自动叠加全部手法",
    };
  });
  const warnings = [];
  if (
    !explicit &&
    !intent &&
    new Set(contentFamilies.map((f) => f.id)).size > 1
  )
    warnings.push(
      "未指定表达目的，先按第一个内容选择主导；需对照用户目标确认其合理性，不把多类手法全部相加。",
    );
  if (objects !== undefined && objects > 8)
    warnings.push(
      "对象较多：按关系组织分组、路径和焦点；是否逐项阅读由信息密度决定，不默认逐个重复同一种强调。",
    );
  if (duration < 3)
    warnings.push(
      "时长较短：简化画面命题与行程，保留用户时长；不把完整多段方案强压进短片。",
    );
  const recipeHints = primary.recipeIds
    .map((id) => actionCatalog.recipes.find((r) => r.id === id))
    .filter(
      (r) =>
        r && (text==='explicit' || !TEXT_RECIPES.has(r.id)) &&
        (objects === undefined ||
          (objects >= r.minAssets && objects <= r.maxAssets)),
    )
    .map((r) => ({
      id: r.id,
      name: r.name,
      scope: "可适配的局部配方；主导语言与用户设计优先",
    }));
  const requiredInputs = [
    "读取真实素材，核对对象身份、原始信息像素、分层与透明情况。",
    "写明观众要理解／感受的内容关系，以及本次交付是方案、成片还是工程。",
  ];
  if (primary.id === "ML02")
    requiredInputs.push(
      "提供真实事件顺序、阶段和必要日期，避免将播放器时间当成内容时间。",
    );
  if (primary.id === "ML03")
    requiredInputs.push("真实地图／位置需核对来源；抽象图谱说明空间是编排示意，不伪造地理或物理包含关系。");
  if (primary.id === "ML04")
    requiredInputs.push(
      "提供可支持解释的结构、步骤和工作原理；示意与事实分开。",
    );
  if (primary.id === "ML05")
    requiredInputs.push("提供标签、数值、单位与来源；缺失数据不得编造。");
  if (primary.id === "ML08")
    requiredInputs.push(
      "核实角色分层／骨骼／表情素材能力，不能把整图漂浮称作表演。",
    );
  if (primary.id === "ML11" && contentKeys.includes("music"))
    requiredInputs.push(
      "读取实际音轨后再声称卡点；无音轨时明确只设计视觉节律。",
    );
  const deliveryChecks =
    mode === "transition"
      ? ["核实实际切点覆盖范围与前后画面连接；透明用途保留alpha。"]
      : mode === "overlay"
        ? ["从构图到导出保持alpha，按用途检查首尾与叠加安全区。"]
        : mode === "loop"
          ? ["循环首尾状态与速度兼容，入场段按用途另行处理。"]
          : ["按成片用途确定背景、收束和阅读余量，不自动套透明退出。"];
  return {
    schemaVersion: 1,
    status: primary.id==='ML06' && text!=='explicit' ? "text-language-requires-explicit-user-request" : "direction-and-concept-candidates-only",
    screenPolicy: presentation,
    sourceConceptsNeedAdaptation: true,
    workflow: {
      stage: "retrieval-only",
      selectedConceptId: null,
      selectedTool: null,
      explorationEntry: "scripts/explore-directions.mjs",
      next: ["明确内容约束与片段职责", "研究本题动画表达及相近结构", "跨方法展开与剪枝，不锁死本类", "展开片内可见事件、素材与表示形式，说明统一项和段落发展", "比较有效命题与观看节拍", "检查覆盖主要段落的关键状态与必要粗动稿", "按方案选择工具并完成制作"],
      references: ["references/production-method.md", "references/exploration-method.md", "references/reference-learning.md", "references/visual-richness.md", "references/richness-cases.md", "references/tool-selection.md", "references/design-review.md", "assets/templates/direction-record.md"],
      uncertainty: "默认自主选择；查看证据后仍不能可靠取舍时，携有效候选、构图／小样及优缺点让用户选择。",
    },
    selectionReason: explicit
      ? "显式指定的检索类目；是否为用户已定方向仍以当前请求为准"
      : byIntent
        ? "表达目的优先于素材类型"
        : mode === "transition"
          ? "剪辑衔接任务"
          : "本次仅按内容检索相关类目，尚未确定主导语言",
    retrievalNotice: "primary只是本次局部检索的首类，不是最终方向或整片统一版式；同题应跨组织方法展开，选定方向后继续设计片内素材、事件与段落变化，必要时用外部研究扩充库。",
    input: {
      content: contentKeys,
      intent: intent ?? null,
      objects: objects ?? null,
      files: files ?? null,
      durationSeconds: duration,
      mode,
    },
    primary: {
      id: primary.id,
      name: primary.name,
      contentRelation: primary.contentRelation,
      language: primary.defaultLanguage,
      rhythm: primary.rhythmGuidance,
      reference: "references/languages/" + primary.key + ".md",
    },
    secondary,
    styleAxis:
      "视觉风格另选并保持统一；按段落职责组合表示形式、尺度与密度，不强凑种类。苹果式是用户偏好的对象语言参考，不是所有任务的通用风格。",
    creativeReview: [
      "素材／内容依据是什么",
      "画面命题与核心趣味是什么",
      "动作之间怎样承接并推进表达",
    ],
    conceptCandidates: primary.id==='ML06' && text!=='explicit' ? [] : primary.concepts,
    actionHints: primary.actionIds.filter(id=>!DISABLED_DEPTH_ACTIONS.has(id)&&(text==='explicit'||!TEXT_ACTIONS.has(id))).map((id) => {
      const a = actionCatalog.actions.find((a) => a.id === id);
      return { id: a.id, name: a.name, implementation: a.implementation };
    }),
    recipeHints,
    implementationLimits: primary.implementationLimits,
    requiredInputs,
    deliveryChecks,
    warnings,
  };
}
export function toPrompt(r) {
  return [
    r.screenPolicy.note,
    r.screenPolicy.rendering.note,
    r.screenPolicy.text==='explicit'?'仅在用户本次明确范围内使用文字；二维与声音约束仍有效。':r.screenPolicy.text==='product-name'?'仅启用用户要求的产品名，文字配方仍关闭；图库可快切，不加说明标题。':r.status==='text-language-requires-explicit-user-request'?'当前没有可直接执行的文字概念；改为无文字图形表达，不能自行启用文字。':'源库概念按当前二维或蒙太奇组织重构，不直接照搬标题／标签。',
    r.retrievalNotice,
    "当前只是语言检索，尚未选择画面命题；优先用explore-directions与外部参考扩充表达方法，不默认第一候选。",
    "后续流程：" + r.workflow.next.join(" → "),
    "流程入口：" + r.workflow.references.join("；"),
    r.workflow.uncertainty,
    `本次检索类目（待比较）：${r.primary.id} ${r.primary.name}`,
    `选择依据：${r.selectionReason}。内容关系：${r.primary.contentRelation}`,
    `画面组织：${r.primary.language}`,
    `节奏：${r.primary.rhythm}`,
    `规格：${r.input.durationSeconds}秒，${r.input.mode}；数量与真实素材仍需绑定。`,
    r.styleAxis,
    ...(r.secondary.length
      ? ["辅助方向：" + r.secondary.map((f) => f.id + " " + f.name).join("；")]
      : []),
    "先比较创意：" + r.creativeReview.join("；"),
    ...r.conceptCandidates.flatMap((c) => [
      `${c.id} ${c.name}：${c.visualPremise}`,
      `开场：${c.opening}`,
      `中段：${c.middle}`,
      `结尾：${c.ending}`,
      `衔接：${c.seam}`,
    ]),
    "动作起点：" + r.actionHints.map((a) => a.id + " " + a.name).join("、"),
    "实现边界：" + r.implementationLimits,
    "执行前补全：",
    ...r.requiredInputs,
    "交付检查：",
    ...r.deliveryChecks,
    ...r.warnings,
    "这是方向与提示方案，未读取素材、未生成视频；选定后继续设计实际时间线与工程。",
  ].join("\n");
}
if (
  process.argv[1] &&
  pathToFileURL(process.argv[1]).href === import.meta.url
) {
  try {
    const raw = {};
    let list = false,
      help = false;
    const allowed = new Set([
      "content",
      "intent",
      "language",
      "objects",
      "files",
      "duration",
      "mode",
      "format",
      "text",
    ]);
    for (const token of process.argv.slice(2)) {
      if (token === "--help") {
        help = true;
        continue;
      }
      if (token === "--list") {
        list = true;
        continue;
      }
      const m = /^--([a-z]+)=(.+)$/.exec(token);
      if (!m || !allowed.has(m[1]))
        throw new Error("Unknown argument: " + token + "; use --help");
      raw[m[1]] = m[2];
    }
    if (help)
      console.log(
        "node scripts/select-language.mjs --content=icons --intent=state --objects=16 --files=1 --duration=8 --mode=insert --format=prompt\n--text=brand-only is default; --text=product-name allows only a currently requested real product name; --text=explicit requires a current user request for broader text. Current rendering stays flat-2d. Narration and TTS timing stay off. --content accepts comma-separated aliases. --language=ML01 overrides the language only. --list shows content aliases and intents. Counts constrain implementation, not language selection.",
      );
    else if (list)
      console.log(
        JSON.stringify(
          languages.families.map((f) => ({
            id: f.id,
            name: f.name,
            content: f.contentAliases,
            intent: f.intent,
          })),
          null,
          2,
        ),
      );
    else {
      if (raw.format && !["json", "prompt"].includes(raw.format))
        throw new Error("format must be json or prompt");
      const input = { ...raw };
      for (const key of ["objects", "files", "duration"])
        if (key in input) input[key] = Number(input[key]);
      const result = selectLanguage(input);
      console.log(
        raw.format === "prompt"
          ? toPrompt(result)
          : JSON.stringify(result, null, 2),
      );
    }
  } catch (error) {
    console.error(error.message);
    process.exitCode = 1;
  }
}
