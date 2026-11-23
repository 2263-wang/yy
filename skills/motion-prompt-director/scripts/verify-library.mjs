#!/usr/bin/env node
import assert from "node:assert/strict";
import { readFileSync } from "node:fs";
import { spawnSync } from "node:child_process";
import { fileURLToPath } from "node:url";
const catalog = JSON.parse(
  readFileSync(
    new URL("../assets/motion-library/catalog.json", import.meta.url),
    "utf8",
  ),
);
const selector = fileURLToPath(new URL("./select-motion.mjs", import.meta.url));
assert.equal(catalog.actions.length, 60);
assert.equal(catalog.recipes.length, 12);
const ids = new Set(catalog.actions.map((a) => a.id));
assert.equal(ids.size, 60);
assert.equal(new Set(catalog.recipes.map((r) => r.id)).size, 12);
const source = readFileSync(
  new URL("../assets/motion-kit/MotionKit.tsx", import.meta.url),
  "utf8",
);
const primitives = new Set(
  [...source.matchAll(/export function (\w+)\(/g)].map((m) => m[1]),
);
assert.equal(primitives.size, 8);
for (const action of catalog.actions) {
  for (const key of [
    "id",
    "name",
    "category",
    "startState",
    "action",
    "endState",
    "pitfall",
    "prompt",
    "implementationNote",
  ])
    assert(action[key]?.length, action.id + " " + key);
  assert(
    ["spec-only", "compose-with-primitives"].includes(action.implementation),
  );
  assert(
    action.durationSeconds[0] > 0 &&
      action.durationSeconds[1] >= action.durationSeconds[0],
  );
  for (const primitive of action.primitives)
    assert(primitives.has(primitive), primitive);
  const doc = readFileSync(
    new URL(`../references/library/${action.category}.md`, import.meta.url),
    "utf8",
  );
  assert(doc.includes(`## ${action.id} · ${action.name}`));
  const section = doc.split(`## ${action.id} · `)[1].split("\n## ")[0];
  assert(
    section.includes(`代码状态：${action.implementation}`),
    "docs must match machine status: " + action.id,
  );
}
for (const recipe of catalog.recipes)
  for (const action of recipe.actions)
    assert(ids.has(action), recipe.id + " unknown action " + action);
const run = (args) =>
  spawnSync(process.execPath, [selector, ...args], {
    encoding: "utf8",
    maxBuffer: 8 * 1024 * 1024,
  });
const fixtures = [
  [1, "showcase", "overlay", "R01"],
  [3, "showcase", "overlay", "R03"],
  [6, "showcase", "overlay", "R02"],
  [12, "showcase", "overlay", "R04"],
  [3, "hero", "overlay", "R05"],
  [0, "ranking", "insert", "R06"],
  [0, "evidence", "insert", "R07"],
  [0, "text", "insert", "R08"],
  [0, "world", "insert", "R09"],
  [0, "transition", "transition", "R10"],
  [4, "icons", "overlay", "R11"],
  [16, "icons", "insert", "R11"],
  [1, "icons", "insert", "R11"],
  [1, "loop", "loop", "R12"],
];
const passed = [];
for (const [assets, goal, mode, id] of fixtures) {
  const r = run([
    `--assets=${assets}`,
    `--goal=${goal}`,
    `--mode=${mode}`,
    "--duration=8",
    ...(['ranking','evidence','text'].includes(goal)?['--text=explicit']:[]),
  ]);
  assert.equal(r.status, 0, r.stderr);
  const result = JSON.parse(r.stdout);
  assert.equal(result.recipe.id, id);
  assert.equal(result.phases[0].startSeconds, 0);
  assert.equal(result.phases.at(-1).endSeconds, 8);
  for (let i = 0; i < result.phases.length; i++)
    assert(
      result.phases[i].endSeconds > result.phases[i].startSeconds &&
        (!i ||
          result.phases[i].startSeconds === result.phases[i - 1].endSeconds),
    );
  assert.equal(result.focusSlots.length, assets);
  assert(result.actions.every((a) => ids.has(a.id)));
  if (goal === "ranking")
    assert(
      result.requiredInputs.some(
        (x) => x.includes("禁止") || x.includes("不可编造"),
      ),
    );
  if (mode === "transition")
    assert(result.seamChecks.some((x) => x.includes("覆盖整个取景框")));
  if (mode === "loop")
    assert(result.seamChecks.some((x) => x.includes("屏幕速度兼容")));
  passed.push(id);
}
for (const args of [
  ["--assets=1.2"],
  ["--assets=-1"],
  ["--assets=0"],
  ["--duration=0"],
  ["--duration=NaN"],
  ["--mode=bogus"],
  ["--style=bogus"],
  ["--goal=unknown"],
  ["--oops=3"],
  ["--mode=loop", "--goal=transition"],
  ["--assets=0", "--goal=icons"],
])
  assert.equal(run(args).status, 1, args.join(" "));
const short = JSON.parse(run(["--assets=12", "--duration=1"]).stdout);
assert(short.warnings.length >= 2);
assert.equal(short.request.durationSeconds, 1);
const prompt = run(["--assets=3", "--format=prompt"]);
assert.equal(prompt.status, 0);
assert(prompt.stdout.includes("0–1.6s"));
assert(prompt.stdout.includes("1.6–6.4s"));
console.log(
  JSON.stringify(
    {
      status: "pass",
      cards: 60,
      recipes: 12,
      primitives: 8,
      recipeRoutes: passed,
      invalidInputs: 11,
      shortDurationWarning: true,
      promptFormat: true,
    },
    null,
    2,
  ),
);
