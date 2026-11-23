// Fixed 1440x1080 sample. Timing and metadata come from motion-budget.js.
// Spacing warning and CSS Gaussian blur are case-specific approximations, not pass/fail rules.

import React from "react";
import { AbsoluteFill, useCurrentFrame } from "remotion";
import {
  smooth,
  fastOutSlowIn,
  seg,
  camAt as camAtLib,
} from "./motion-curves.js";
import { T, CAM, STATIONS } from "./motion-budget.js";
export { FPS, DURATION } from "./motion-budget.js";
const FRAME_W = 1440;
const FRAME_H = 1080;
const WORLD = { w: 5600, h: 3200 };
const [S1, S2, S3] = STATIONS;
if (typeof console !== "undefined") {
  const d12 = Math.hypot(S2.x - S1.x, S2.y - S1.y);
  const d23 = Math.hypot(S3.x - S2.x, S3.y - S2.y);
  const R = FRAME_W / 2 + 600;
  if (d12 > R)
    console.warn(
      `[站距] S1→S2 = ${d12.toFixed(0)}px > ${R}px，移动中可能露空白纸`,
    );
  if (d23 > R)
    console.warn(
      `[站距] S2→S3 = ${d23.toFixed(0)}px > ${R}px，移动中可能露空白纸`,
    );
}
const clamp01 = (v) => Math.max(0, Math.min(1, v));
const lerp = (a, b, t) => a + (b - a) * t;
const camAt = (f) => camAtLib(CAM, f);
export const WorldCamera = () => {
  const f = useCurrentFrame();
  const cam = camAt(f);
  const prev = camAt(Math.max(0, f - 1));
  const speed = Math.hypot(cam.x - prev.x, cam.y - prev.y) * cam.z;
  const THINNEST_LINE = 3.5; // px
  const blur = Math.min(THINNEST_LINE * 4, speed * 0.13);

  return (
    <AbsoluteFill style={{ background: "#DCDBDB", overflow: "hidden" }}>
      <AbsoluteFill
        style={{ filter: blur > 0.35 ? `blur(${blur}px)` : undefined }}
      >
        <div
          style={{
            position: "absolute",
            left: 0,
            top: 0,
            width: WORLD.w,
            height: WORLD.h,
            transformOrigin: "0 0",
            transform: `translate(${FRAME_W / 2 - cam.x * cam.z}px, ${
              FRAME_H / 2 - cam.y * cam.z
            }px) scale(${cam.z})`,
          }}
        >
          <StationTitle
            x={1400}
            y={880}
            cn="开场"
            en="Opening"
            p={seg(f, T.title[0], T.title[1])}
          />

          <Grid
            x={2600}
            y={1200}
            w={696}
            h={588}
            p={seg(f, T.grid[0], T.grid[1])}
          />
          {[
            { i: 0, x: 2600, y: 1200 },
            { i: 1, x: 2832, y: 1200 },
            { i: 2, x: 3064, y: 1200 },
            { i: 3, x: 2600, y: 1494 },
            { i: 4, x: 2832, y: 1494 },
            { i: 5, x: 3064, y: 1494 },
          ].map((c) => (
            <Card
              key={c.i}
              {...c}
              p={seg(
                f,
                T.dropStart + c.i * T.dropGap,
                T.dropStart + c.i * T.dropGap + T.dropDur,
              )}
            />
          ))}

          {[
            { x: 2060, y: 1010, w: 186, h: 124, rot: -5 },
            { x: 2330, y: 1330, w: 168, h: 104, rot: -12 },
            { x: 2620, y: 1060, w: 150, h: 96, rot: 7 },
            { x: 2900, y: 1400, w: 176, h: 112, rot: 11 },
            { x: 3320, y: 1420, w: 170, h: 110, rot: 8 },
            { x: 3620, y: 1240, w: 152, h: 98, rot: -6 },
            { x: 3900, y: 1400, w: 188, h: 120, rot: 13 },
            { x: 4150, y: 1180, w: 158, h: 100, rot: -9 },
          ].map((s, k) => (
            <Scrap key={`scrap-${k}`} {...s} />
          ))}

          <StationTitle
            x={4040}
            y={1220}
            cn="收尾"
            en="Ending"
            p={seg(f, T.move2[1] + 12, T.move2[1] + 36)}
          />
        </div>
      </AbsoluteFill>
    </AbsoluteFill>
  );
};

const StationTitle = ({ x, y, cn, en, p }) => (
  <div
    style={{
      position: "absolute",
      left: x,
      top: y,
      opacity: clamp01(p),
      transform: `translateY(${lerp(30, 0, smooth(p))}px)`,
      fontFamily: '"Source Han Serif SC", "Songti SC", serif',
    }}
  >
    <div
      style={{
        fontSize: 132,
        fontWeight: 700,
        color: "#1A1A1A",
        letterSpacing: 8,
      }}
    >
      {cn}
    </div>
    <div
      style={{
        fontSize: 40,
        color: "#6B6B6B",
        letterSpacing: 6,
        marginTop: 10,
      }}
    >
      {en}
    </div>
  </div>
);

const Grid = ({ x, y, w, h, p }) => {
  const cellW = 116;
  const cellH = 98;
  const cols = Math.floor(w / cellW);
  const rows = Math.floor(h / cellH);
  const clip = clamp01(p);
  return (
    <svg
      width={w}
      height={h}
      style={{ position: "absolute", left: x, top: y, opacity: clip }}
      viewBox={`0 0 ${w} ${h}`}
    >
      <defs>
        <clipPath id="grow">
          <rect x="0" y="0" width={w * clip} height={h} />
        </clipPath>
      </defs>
      <g clipPath="url(#grow)" stroke="#B0D3DA" strokeWidth="3">
        {Array.from({ length: cols + 1 }, (_, i) => (
          <line
            key={`v${i}`}
            x1={i * cellW}
            y1="0"
            x2={i * cellW}
            y2={rows * cellH}
          />
        ))}
        {Array.from({ length: rows + 1 }, (_, i) => (
          <line
            key={`h${i}`}
            x1="0"
            y1={i * cellH}
            x2={cols * cellW}
            y2={i * cellH}
          />
        ))}
      </g>
    </svg>
  );
};
const Card = ({ i, x, y, p }) => {
  const e = fastOutSlowIn(p, 0.6, 0.8);
  const W = 232;
  const H = 294;
  const hues = [
    "#C9D8E8",
    "#E8D6C9",
    "#D8E8C9",
    "#E8C9D8",
    "#D6C9E8",
    "#E8C9C9",
  ];
  return (
    <div
      style={{
        position: "absolute",
        left: lerp(x + 600, x, e),
        top: lerp(y + 300, y, e),
        width: W,
        height: H,
        background: hues[i % hues.length],
        borderRadius: 6,
        opacity: clamp01(p * 2),
        transform: `rotate(${lerp(6, 0, e)}deg)`,
        boxShadow: "14px 18px 34px rgba(48,42,36,0.28)",
      }}
    />
  );
};

const Scrap = ({ x, y, w, h, rot }) => (
  <div
    style={{
      position: "absolute",
      left: x,
      top: y,
      width: w,
      height: h,
      background: "#F2EFE9",
      transform: `rotate(${rot}deg)`,
      boxShadow: "8px 10px 20px rgba(48,42,36,0.22)",
    }}
  />
);
