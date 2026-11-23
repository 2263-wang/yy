import React from "react";
import {
  AbsoluteFill,
  Easing,
  Img,
  useCurrentFrame,
  useVideoConfig,
} from "remotion";
export type ThreeImageAsset = { src: string; label?: string };
export type ThreeImageFallbackProps = {
  assets: [ThreeImageAsset, ThreeImageAsset, ThreeImageAsset];
  durationSeconds?: number;
  emphasis?: number;
};
const clamp = (v: number) => Math.max(0, Math.min(1, v));
const mix = (a: number, b: number, p: number) => a + (b - a) * p;
const ease = Easing.bezier(0.16, 1, 0.3, 1);
// R03 complete fallback: input real asset URLs or staticFile() results; no invented content.
export const ThreeImageFallback: React.FC<ThreeImageFallbackProps> = ({
  assets,
  durationSeconds,
  emphasis = 1.045,
}) => {
  const frame = useCurrentFrame(),
    { fps, width, height, durationInFrames } = useVideoConfig();
  const duration = durationInFrames / fps;
  if (!assets || assets.length !== 3 || assets.some((a) => !a.src))
    throw new Error("ThreeImageFallback requires exactly 3 real asset sources");
  if (duration < 3)
    throw new Error(
      "This fallback requires at least 3 seconds; use a simpler single-beat composition for shorter clips",
    );
  if (
    durationSeconds !== undefined &&
    Math.abs(durationSeconds - duration) > 1 / fps
  )
    throw new Error("durationSeconds must match the registered composition");
  if (!Number.isFinite(emphasis) || emphasis < 1 || emphasis > 1.15)
    throw new Error("emphasis must be in 1..1.15");
  const s = frame / fps,
    t = s / duration;
  const master = frame === 0 || frame >= durationInFrames - 1 ? 0 : 1;
  return (
    <AbsoluteFill style={{ opacity: master }}>
      {assets.map((asset, i) => {
        const enter = clamp((t - (0.018 + i * 0.016)) / 0.08),
          leave = clamp((t - (0.84 + i * 0.012)) / 0.09),
          align = ease(clamp((t - 0.135) / 0.065));
        const e = ease(enter),
          o = ease(leave),
          focusStart = 0.22 + i * 0.19,
          focusEnd = focusStart + 0.19;
        const focus =
          ease(clamp((t - focusStart) / 0.045)) *
          (1 - ease(clamp((t - (focusEnd - 0.045)) / 0.045)));
        const x =
          width * ([0.24, 0.5, 0.76][i] + (i - 1) * 0.015 * (1 - align)) +
          (i - 1) * width * 0.025 * o;
        const y =
          height *
          (0.52 +
            (1 - e) * 0.075 +
            (1 - align) * [0.025, -0.025, 0.025][i] +
            o * 0.035);
        const rotate = (i - 1) * 3 * (1 - align);
        const scale =
          mix(0.9, 1, e) * mix(1, emphasis, focus) * mix(1, 0.97, o);
        return (
          <div
            key={i}
            style={{
              position: "absolute",
              left: x,
              top: y,
              width: width * 0.23,
              height: height * 0.62,
              opacity: Math.min(enter / 0.35, 1) * (1 - o),
              zIndex: focus > 0.01 ? 10 : i,
              transform: `translate(-50%,-50%) rotate(${rotate}deg) scale(${scale})`,
            }}
          >
            <Img
              src={asset.src}
              alt={asset.label ?? ""}
              style={{ width: "100%", height: "100%", objectFit: "contain" }}
            />
          </div>
        );
      })}
    </AbsoluteFill>
  );
};
