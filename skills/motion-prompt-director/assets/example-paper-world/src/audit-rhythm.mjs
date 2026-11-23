// Checks registered timing only. It does not inspect pixels, infer every action or certify aesthetics.
import { pathToFileURL } from "node:url";
import { resolve } from "node:path";
import { BUDGET, GUIDELINES_SECONDS } from "./motion-budget.js";
export const auditBudget = (budget) => {
  const errors = [],
    warnings = [];
  const { fps, durationFrames, segments = [], motions = [], CAM = [] } = budget;
  if (!Number.isFinite(fps) || fps <= 0) errors.push("fps must be positive");
  if (!Number.isInteger(durationFrames) || durationFrames <= 0)
    errors.push("durationFrames must be a positive integer");
  const validWindow = (w) =>
    Number.isInteger(w.start) &&
    Number.isInteger(w.end) &&
    w.start >= 0 &&
    w.end > w.start &&
    w.end <= durationFrames;
  const segmentMap = new Map();
  for (const s of segments) {
    if (segmentMap.has(s.id)) errors.push(`duplicate segment: ${s.id}`);
    segmentMap.set(s.id, s);
    if (!validWindow(s)) errors.push(`invalid segment window: ${s.id}`);
  }
  const ids = new Set();
  for (const m of motions) {
    if (ids.has(m.id)) errors.push(`duplicate motion: ${m.id}`);
    ids.add(m.id);
    if (!validWindow(m)) {
      errors.push(`invalid motion window: ${m.id}`);
      continue;
    }
    const s = m.segment ? segmentMap.get(m.segment) : null;
    if (m.segment && !s) errors.push(`missing segment: ${m.id}`);
    if (s && (m.start < s.start || m.end > s.end))
      errors.push(`motion leaves segment: ${m.id}`);
    const limits = GUIDELINES_SECONDS[m.kind];
    if (!limits) {
      errors.push(`unknown kind: ${m.id}`);
      continue;
    }
    const sec = (m.end - m.start) / fps;
    if (sec < limits.min - 1e-9 || sec > limits.max + 1e-9)
      warnings.push(
        `${m.id}: ${sec.toFixed(3)}s outside preference ${limits.min}..${limits.max}s${m.reason ? "; reason: " + m.reason : "; review purpose"}`,
      );
  }
  for (let i = 0; i < CAM.length; i++) {
    const k = CAM[i];
    if (
      !Number.isInteger(k.f) ||
      k.f < 0 ||
      k.f > durationFrames ||
      ![k.x, k.y, k.z].every(Number.isFinite) ||
      k.z <= 0 ||
      (i > 0 && k.f <= CAM[i - 1].f)
    )
      errors.push(`invalid camera key: ${i}`);
  }
  return {
    checkedMotions: motions.length,
    errors,
    warnings,
    scope:
      "Registered timing windows only; not visual/continuity/complete-coverage certification",
  };
};
if (
  process.argv[1] &&
  import.meta.url === pathToFileURL(resolve(process.argv[1])).href
) {
  const supplied = process.argv[2]
    ? await import(pathToFileURL(resolve(process.argv[2])).href)
    : null;
  const result = auditBudget(supplied ? supplied.BUDGET : BUDGET);
  console.log(JSON.stringify(result, null, 2));
  process.exitCode = result.errors.length ? 1 : 0;
}
