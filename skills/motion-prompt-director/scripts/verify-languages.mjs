#!/usr/bin/env node
import assert from "node:assert/strict";
import { readFileSync } from "node:fs";
import { spawnSync } from "node:child_process";
import { fileURLToPath } from "node:url";
import { languages, selectLanguage, toPrompt } from "./select-language.mjs";
const cards = JSON.parse(
  readFileSync(
    new URL("../assets/motion-library/catalog.json", import.meta.url),
    "utf8",
  ),
);
const actions = new Set(cards.actions.map((a) => a.id)),
  recipes = new Set(cards.recipes.map((r) => r.id));
assert.equal(languages.families.length, 13);
assert.equal(new Set(languages.families.map((f) => f.id)).size, 13);
assert.equal(new Set(languages.families.map((f) => f.intent)).size, 13);
const aliases = new Set(),
  conceptIds = new Set();
for (const family of languages.families) {
  assert(
    family.contentRelation &&
      family.defaultLanguage &&
      family.rhythmGuidance &&
      family.implementationLimits,
  );
  for (const alias of family.contentAliases) {
    assert(!aliases.has(alias));
    aliases.add(alias);
    assert.equal(selectLanguage({ content: alias }).primary.id, family.id);
  }
  for (const id of family.actionIds) assert(actions.has(id), id);
  for (const id of family.recipeIds) assert(recipes.has(id), id);
  assert.equal(family.concepts.length, 2);
  for (const c of family.concepts) {
    assert(!conceptIds.has(c.id));
    conceptIds.add(c.id);
    for (const key of [
      "name",
      "visualPremise",
      "opening",
      "middle",
      "ending",
      "seam",
    ])
      assert(c[key]?.length);
  }
  assert.doesNotThrow(() =>
    readFileSync(
      new URL(`../references/languages/${family.key}.md`, import.meta.url),
      "utf8",
    ),
  );
}
assert.equal(conceptIds.size, 26);
const cases = [
  ["icons", "state", "ML01"],
  ["timeline", "sequence", "ML02"],
  ["map", "navigation", "ML03"],
  ["mechanism", "mechanism", "ML04"],
  ["data", "comparison", "ML05"],
  ["text", "statement", "ML06"],
  ["physical", "force", "ML07"],
  ["character", "acting", "ML08"],
  ["product", "detail", "ML09"],
  ["photos", "collection", "ML10"],
  ["music", "mood", "ML11"],
  ["transition", "bridge", "ML12"],
  ["brand", "identity", "ML13"],
];
for (const [content, intent, id] of cases) {
  const r = selectLanguage({
    content,
    intent,
    objects: 16,
    files: 1,
    duration: 8,
  });
  assert.equal(r.primary.id, id);
  assert.equal(r.input.objects, 16);
  assert.equal(r.input.files, 1);
  assert.equal(r.conceptCandidates.length, id==='ML06'?0:2);
  assert(r.actionHints.every((a) => actions.has(a.id)));
}
const mixed = selectLanguage({ content: "icons,timeline", intent: "sequence" });
assert.equal(mixed.primary.id, "ML02");
assert.deepEqual(
  mixed.secondary.map((f) => f.id),
  ["ML01"],
);
const override = selectLanguage({
  content: "icons,data",
  intent: "comparison",
  language: "ML06",
});
assert.equal(override.primary.id, "ML06");
assert(
  override.secondary.some((f) => f.id === "ML01") &&
    override.secondary.some((f) => f.id === "ML05"),
);
assert.equal(
  selectLanguage({ content: "icons", objects: 16 }).primary.id,
  "ML01",
);
assert.equal(
  selectLanguage({ content: "photos", objects: 16 }).primary.id,
  "ML10",
);
assert(
  selectLanguage({ content: "icons", objects: 16 }).recipeHints.some(
    (r) => r.id === "R11",
  ),
);
assert.equal(selectLanguage({ mode: "transition" }).primary.id, "ML12");
assert.equal(
  selectLanguage({ content: "icons", mode: "overlay" }).primary.id,
  "ML01",
);
assert(
  selectLanguage({ content: "icons", mode: "loop" }).secondary.some(
    (f) => f.id === "ML11",
  ),
);
assert(
  selectLanguage({ content: "data" }).requiredInputs.some((x) =>
    x.includes("不得编造"),
  ),
);
assert(
  selectLanguage({ content: "character" }).requiredInputs.some((x) =>
    x.includes("表演"),
  ),
);
assert(toPrompt(selectLanguage({ content: "icons" })).includes("ML01-1"));
for (const input of [
  {},
  { objects: 16 },
  { content: "bogus" },
  { intent: "bogus" },
  { language: "ML99" },
  { content: "icons", duration: 0 },
  { content: "icons", duration: NaN },
  { content: "icons", objects: -1 },
  { content: "icons", files: 1.2 },
  { content: "icons", mode: "bogus" },
])
  assert.throws(() => selectLanguage(input));
const cli = fileURLToPath(new URL("./select-language.mjs", import.meta.url));
const run = (args) =>
  spawnSync(process.execPath, [cli, ...args], {
    encoding: "utf8",
    maxBuffer: 4 * 1024 * 1024,
  });
const json = run([
  "--content=icons",
  "--intent=state",
  "--objects=16",
  "--files=1",
]);
assert.equal(json.status, 0, json.stderr);
assert.equal(JSON.parse(json.stdout).primary.id, "ML01");
const prompt = run([
  "--content=icons,timeline",
  "--intent=sequence",
  "--format=prompt",
]);
assert.equal(prompt.status, 0, prompt.stderr);
assert(prompt.stdout.includes("ML02") && prompt.stdout.includes("ML01"));
assert.equal(JSON.parse(run(["--list"]).stdout).length, 13);
for (const args of [
  ["--objects=16"],
  ["--content=bogus"],
  ["--content=icons", "--files=-1"],
  ["--content=icons", "--duration=NaN"],
  ["--content=icons", "--format=bogus"],
  ["--content=icons", "--oops=1"],
])
  assert.equal(run(args).status, 1, args.join(" "));
console.log(
  JSON.stringify(
    {
      status: "pass",
      families: 13,
      conceptCandidates: 26,
      contentAliases: aliases.size,
      routes: cases.map((x) => x[2]),
      sameCountDifferentLanguages: true,
      intentOverridesContent: true,
      explicitLanguagePreserved: true,
      countsDoNotSelectLanguage: true,
      legacyIconRecipe16Compatible: true,
      cliJsonAndPrompt: true,
    },
    null,
    2,
  ),
);
