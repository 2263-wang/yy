// Optional motion vocabulary. Inputs use normalized time; actual velocity scales by distance/duration.
const clamp01 = (t) => Math.max(0, Math.min(1, t));
export const smooth = (t) => {
  const x = clamp01(t);
  return x * x * (3 - 2 * x);
};
// A single monotonic curve: reaches headShare at split without a zero-speed seam.
export const fastOutSlowIn = (t, split = 0.35, headShare = 0.8) => {
  if (!(split > 0 && split < 1 && headShare > 0 && headShare < 1))
    throw new RangeError("split and headShare must be between 0 and 1");
  const x = clamp01(t),
    k = (split * split * (1 - headShare)) / (headShare * (1 - split) ** 2);
  return (x * x) / (x * x + k * (1 - x) ** 2);
};
// Damped step with initial zero velocity; smoothly returns exactly to one.
// freq/decay are shape parameters, NOT a requested overshoot percentage. Remeasure the peak.
export const overshoot = (t, freq = 7.4, decay = 5.2) => {
  if (!(freq > 0 && decay >= 0))
    throw new RangeError("Invalid damping parameters");
  const x = clamp01(t);
  const raw =
    1 -
    Math.exp(-decay * x) *
      (Math.cos(freq * x) + (decay / freq) * Math.sin(freq * x));
  const w = smooth((x - 0.86) / 0.14);
  return raw * (1 - w) + w;
};
export const anticipate = (t) => {
  const x = clamp01(t);
  return -16 * x * x * (1 - x) * (1 - x);
};
export const squashX = (t) => {
  const x = clamp01(t);
  return 1 + 0.06 * Math.sin(2 * Math.PI * x) * Math.sin(Math.PI * x) ** 2;
};
export const squashY = (t) => 1 / squashX(t);
export const measurePeak = (fn, steps = 2000) => {
  if (!Number.isInteger(steps) || steps < 2)
    throw new RangeError("steps must be an integer >= 2");
  let peak = -Infinity,
    at = 0;
  for (let i = 0; i <= steps; i++) {
    const t = i / steps,
      v = fn(t);
    if (!Number.isFinite(v)) throw new Error("Non-finite curve");
    if (v > peak) {
      peak = v;
      at = t;
    }
  }
  return { peak, at, end: fn(1) };
};
export const seg = (f, a, b) => clamp01((f - a) / Math.max(1, b - a));
// Stop-to-stop camera. All keys are intentional stops; use a tangent-preserving spline for through-points.
export const camAt = (keys, f) => {
  if (!keys.length) throw new Error("Camera keys are empty");
  if (f <= keys[0].f) return keys[0];
  for (let i = 0; i < keys.length - 1; i++) {
    const a = keys[i],
      b = keys[i + 1];
    if (f <= b.f) {
      const t = smooth(seg(f, a.f, b.f));
      return {
        x: a.x + (b.x - a.x) * t,
        y: a.y + (b.y - a.y) * t,
        z: a.z + (b.z - a.z) * t,
      };
    }
  }
  return keys[keys.length - 1];
};
