// Reference scene is authored at 30 fps. Changing its fps also requires converting the remaining literal-frame decorations/captions.
import React from "react";
import { AbsoluteFill, Img, staticFile, useCurrentFrame } from "remotion";

// ============================================================================
// PaperWorld —— 重做的版本
//
// 上一版 PaperReveal 的根本错误：把 1440×1080 当成了「画布」。
// 于是每一次段落转移都只能靠转场去遮，试了三种都失败：
//   半透明叠加 → 糊成失焦；淡出淡入 → 中间露出空白纸；胶片带 → 扫过前一页的空白区。
//
// 参考片的真实逻辑不是「一页页翻」，而是：
//   · 一张很大的纸 = 世界
//   · 帧 = 取景框，不是画布
//   · 摄像机在世界里按路线移动，停在某处做动画，再移动到下一处
//   · 「没有切点」是因为它从来没有切，只是摄像机一直在走
//
// 所以这一版把画布扩到 5600×3200，内容按世界坐标摆位，
// 摄像机用关键帧驱动，运动模糊由摄像机实际速度自动生成（停下即消失）。
// ============================================================================

export { FPS, DURATION } from "./motion-budget.js";
import { T, CAM, DURATION } from "./motion-budget.js";
import {
  smooth,
  fastOutSlowIn,
  seg,
  overshoot,
  camAt as evaluateCamera,
} from "./motion-curves.js";

// 取景框（录制比例，仅此而已）
const FRAME_W = 1440;
const FRAME_H = 1080;

// 世界（那张大纸）
const WORLD = { w: 5600, h: 3200 };

// ---- 站点坐标（世界坐标）----
// 站点 1：开场标题
const S1 = { x: 1980, y: 1180 };
// 站点 2：方格作业台
const GRID = { x: 2600, y: 1200, cols: 8, rows: 8, cw: 116, ch: 98 };
const GRID_W = GRID.cols * GRID.cw; // 928
const GRID_H = GRID.rows * GRID.ch; // 784
const S2 = { x: GRID.x + GRID_W / 2, y: GRID.y + GRID_H / 2 }; // 3064, 1592
// 站点 3：收尾标题
const S3 = { x: 4280, y: 1120 };

const CARD_W = 232; // 2 格
const CARD_H = 294; // 3 格
const CARD_X = [GRID.x, GRID.x + 3 * GRID.cw, GRID.x + 6 * GRID.cw];
const CARD_Y = [GRID.y, GRID.y + 5 * GRID.ch];

const STACK_SCALE = 1.12;
const HERO = 5;

// ---- 色板（从参考片实测）----
const C = {
  paper: "#E3E2E1",
  gridLine: "#9FC9D4",
  yellow: "#DFD64C",
  ink: "#1A1A1A",
  cream: "#E9E2D2",
  pink: "#D6A99C",
  shadow: "rgba(40,36,32,0.42)",
};

// ---- 时间轴（帧）----
// Shared T imported above.

// ---- 摄像机关键帧 ----
// 严格按「停 → 动 → 停 → 动 → 停」排：
//   0–78   停在站点 1，缓推 1.00→1.055
//   78–92 移动到站点 2
//   92–424 停在站点 2，缓慢从 1.00 推到 1.06
//   424–438 移动到站点 3
//   438–550 停在站点 3，缓推
// Shared CAM imported above.

// ============================================================================
// 工具
// ============================================================================
const clamp01 = (v) => Math.max(0, Math.min(1, v));
const lerp = (a, b, t) => a + (b - a) * t;
const easeOut = (t) => 1 - Math.pow(1 - clamp01(t), 3);
const camAt = (f) => evaluateCamera(CAM, f);

const NOISE_URL =
  "url(\"data:image/svg+xml;utf8,<svg xmlns='http://www.w3.org/2000/svg' width='260' height='260'>" +
  "<filter id='n'><feTurbulence type='fractalNoise' baseFrequency='0.82' numOctaves='3' stitchTiles='stitch'/>" +
  "<feColorMatrix type='saturate' values='0'/></filter>" +
  "<rect width='100%' height='100%' filter='url(%23n)' opacity='0.42'/></svg>\")";

// 世界范围的粉色手绘长弧线（参考片的底纹）
const PAPER_ARCS = [
  "M -200 900 C 900 500, 2100 300, 3300 700 S 5200 1600, 5900 1200",
  "M -300 2200 C 800 1900, 1700 2450, 2600 2300 S 4600 1700, 5900 2050",
  "M 600 3400 C 1500 2700, 2400 2900, 3200 3250",
  "M 3200 -200 C 3700 700, 4600 1000, 5600 1400",
  "M 1200 -250 C 1600 500, 2300 800, 3000 1150",
  "M 4200 3400 C 4400 2800, 5000 2500, 5800 2600",
];

const PaperSheet = () => (
  <>
    <div
      style={{
        position: "absolute",
        left: 0,
        top: 0,
        width: WORLD.w,
        height: WORLD.h,
        background: C.paper,
      }}
    />
    <div
      style={{
        position: "absolute",
        left: 0,
        top: 0,
        width: WORLD.w,
        height: WORLD.h,
        backgroundImage: NOISE_URL,
        backgroundRepeat: "repeat",
        opacity: 0.55,
        mixBlendMode: "multiply",
      }}
    />
    <svg
      width={WORLD.w}
      height={WORLD.h}
      style={{ position: "absolute", left: 0, top: 0 }}
      viewBox={`0 0 ${WORLD.w} ${WORLD.h}`}
    >
      <g
        fill="none"
        stroke={C.pink}
        strokeWidth="2.2"
        opacity="0.5"
        strokeLinecap="round"
      >
        {PAPER_ARCS.map((d, i) => (
          <path key={i} d={d} opacity={i % 2 ? 0.6 : 1} />
        ))}
      </g>
      {/* 散落的铅笔短痕，让两块内容之间的纸面不空 */}
      <g stroke="#2A2622" strokeWidth="2" opacity="0.16" strokeLinecap="round">
        {[
          [1750, 780, 1810, 742],
          [1830, 860, 1900, 812],
          [2000, 2450, 2065, 2418],
          [3740, 2320, 3800, 2278],
          [3860, 900, 3920, 862],
          [860, 1900, 930, 1862],
          [4980, 2400, 5050, 2362],
          [1200, 2600, 1265, 2568],
        ].map((s, i) => (
          <line key={i} x1={s[0]} y1={s[1]} x2={s[2]} y2={s[3]} />
        ))}
      </g>
    </svg>
  </>
);

// ============================================================================
// 青色方格（世界坐标）
// ============================================================================
const GraphGrid = ({ progress = 1, clipW = GRID_W }) => {
  const lines = [];
  for (let i = 0; i <= GRID.cols; i++) {
    lines.push(
      <line
        key={`v${i}`}
        x1={GRID.x + i * GRID.cw}
        y1={GRID.y}
        x2={GRID.x + i * GRID.cw}
        y2={GRID.y + GRID_H}
      />,
    );
  }
  for (let j = 0; j <= GRID.rows; j++) {
    lines.push(
      <line
        key={`h${j}`}
        x1={GRID.x}
        y1={GRID.y + j * GRID.ch}
        x2={GRID.x + GRID_W}
        y2={GRID.y + j * GRID.ch}
      />,
    );
  }
  return (
    <svg
      width={WORLD.w}
      height={WORLD.h}
      style={{ position: "absolute", left: 0, top: 0 }}
      viewBox={`0 0 ${WORLD.w} ${WORLD.h}`}
    >
      <clipPath id="gridClipW">
        <rect x={GRID.x} y={GRID.y - 14} width={clipW} height={GRID_H + 28} />
      </clipPath>
      <g
        clipPath="url(#gridClipW)"
        stroke={C.gridLine}
        strokeWidth="3.5"
        opacity={progress}
        strokeLinecap="square"
      >
        {lines}
      </g>
    </svg>
  );
};

// ============================================================================
// 黄线：过方格中心、-31.5°，两端延伸出画面（世界坐标）
// ============================================================================
const YEL_RAD = (-31.5 * Math.PI) / 180;
const U = { x: Math.cos(YEL_RAD), y: Math.sin(YEL_RAD) };
const YEL_A = { x: S2.x - U.x * 1250, y: S2.y - U.y * 1250 };
const YEL_B = { x: S2.x + U.x * 1250, y: S2.y + U.y * 1250 };

const YellowLine = ({ progress = 1, opacity = 1 }) => {
  const bx = lerp(YEL_A.x, YEL_B.x, progress);
  const by = lerp(YEL_A.y, YEL_B.y, progress);
  return (
    <svg
      width={WORLD.w}
      height={WORLD.h}
      style={{ position: "absolute", left: 0, top: 0 }}
      viewBox={`0 0 ${WORLD.w} ${WORLD.h}`}
    >
      <line
        x1={YEL_A.x}
        y1={YEL_A.y}
        x2={bx}
        y2={by}
        stroke={C.yellow}
        strokeWidth="7"
        strokeLinecap="butt"
        opacity={opacity}
      />
    </svg>
  );
};

// ============================================================================
// 数字卡 / 光标 / 标题 / 字幕 / 角度标注 / 手绘方框
// ============================================================================
const NumberCard = ({
  n,
  x,
  y,
  rot = -7,
  scale = 1,
  opacity = 1,
  dark = true,
}) => (
  <div
    style={{
      position: "absolute",
      left: x,
      top: y,
      width: 148,
      height: 186,
      transform: `rotate(${rot}deg) scale(${scale})`,
      transformOrigin: "50% 50%",
      opacity,
      background: dark ? "#161514" : C.cream,
      boxShadow: `10px 14px 26px ${C.shadow}`,
      display: "flex",
      alignItems: "center",
      justifyContent: "center",
    }}
  >
    <div
      style={{
        fontFamily: '"Noto Serif SC", "SimSun", serif',
        fontWeight: 900,
        fontSize: 132,
        lineHeight: 1,
        color: dark ? C.cream : "#161514",
        marginTop: -6,
      }}
    >
      {n}
    </div>
  </div>
);

const Cursor = ({ x, y, rot = 0, scale = 1, opacity = 1 }) => (
  <svg
    width="86"
    height="116"
    viewBox="0 0 26 35"
    style={{
      position: "absolute",
      left: x - 13,
      top: y - 17,
      transform: `rotate(${rot}deg) scale(${scale})`,
      transformOrigin: "13px 17px",
      opacity,
      filter: "drop-shadow(5px 7px 5px rgba(30,26,22,0.45))",
    }}
  >
    <path
      d="M3 2 L3 28.5 L9.6 22.2 L13.6 31.6 L18 29.7 L14.2 20.6 L23 20.6 Z"
      fill="#FFFFFF"
      stroke="#141414"
      strokeWidth="1.5"
      strokeLinejoin="round"
    />
  </svg>
);

const TitleBlock = ({ cn, en, x, y, opacity = 1, dy = 0 }) => (
  <div
    style={{
      position: "absolute",
      left: x,
      top: y,
      transform: `translateY(${dy}px)`,
      opacity,
    }}
  >
    <div
      style={{
        fontFamily: '"Noto Serif SC", "SimSun", serif',
        fontWeight: 900,
        fontSize: 168,
        lineHeight: 1.05,
        letterSpacing: 14,
        color: C.ink,
        textShadow: "2px 3px 0 rgba(60,52,44,0.10)",
      }}
    >
      {cn}
    </div>
    <div
      style={{
        fontFamily: '"Noto Serif", "Times New Roman", serif',
        fontStyle: "italic",
        fontSize: 62,
        letterSpacing: 3,
        color: "#22201E",
        marginTop: 6,
        marginLeft: 6,
        opacity: 0.92,
      }}
    >
      {en}
    </div>
  </div>
);

// 字幕固定在取景框上，不跟着纸走（参考片就是这样）
const Caption = ({ text, opacity = 1 }) => {
  if (opacity <= 0.01) return null;
  return (
    <div
      style={{
        position: "absolute",
        left: 0,
        right: 0,
        top: 1002,
        textAlign: "center",
        opacity,
        fontFamily: '"Microsoft YaHei", "Noto Sans SC", sans-serif',
        fontSize: 42,
        fontWeight: 600,
        color: "#FFFFFF",
        letterSpacing: 2,
        textShadow:
          "0 0 2px rgba(0,0,0,0.9), 2px 2px 0 rgba(0,0,0,0.55), -2px 2px 0 rgba(0,0,0,0.55), 2px -2px 0 rgba(0,0,0,0.55)",
      }}
    >
      {text}
    </div>
  );
};

const roughRectPath = (cx, cy, hw, hh, r) => {
  const j = 3.5;
  return [
    `M ${cx - hw + r} ${cy - hh}`,
    `C ${cx - hw * 0.5} ${cy - hh - j}, ${cx + hw * 0.4} ${cy - hh + j}, ${cx + hw - r} ${cy - hh}`,
    `Q ${cx + hw + j} ${cy - hh}, ${cx + hw} ${cy - hh + r}`,
    `C ${cx + hw + j} ${cy - hh * 0.3}, ${cx + hw - j} ${cy + hh * 0.3}, ${cx + hw} ${cy + hh - r}`,
    `Q ${cx + hw} ${cy + hh + j}, ${cx + hw - r} ${cy + hh}`,
    `C ${cx + hw * 0.5} ${cy + hh + j}, ${cx - hw * 0.4} ${cy + hh - j}, ${cx - hw + r} ${cy + hh}`,
    `Q ${cx - hw - j} ${cy + hh}, ${cx - hw} ${cy + hh - r}`,
    `C ${cx - hw - j} ${cy + hh * 0.3}, ${cx - hw + j} ${cy - hh * 0.3}, ${cx - hw} ${cy - hh + r}`,
    `Q ${cx - hw} ${cy - hh - j}, ${cx - hw + r} ${cy - hh}`,
  ].join(" ");
};

const InkRect = ({ cx, cy, hw, hh, progress = 1, opacity = 1, rot = -0.8 }) => {
  const r = 46;
  const perim = 2 * (2 * hw + 2 * hh) - 8 * r + 2 * Math.PI * r;
  const d = roughRectPath(cx, cy, hw, hh, r);
  const off = perim * (1 - progress);
  return (
    <svg
      width={WORLD.w}
      height={WORLD.h}
      style={{ position: "absolute", left: 0, top: 0 }}
      viewBox={`0 0 ${WORLD.w} ${WORLD.h}`}
    >
      <g transform={`rotate(${rot} ${cx} ${cy})`} opacity={opacity}>
        <path
          d={d}
          fill="none"
          stroke="#181818"
          strokeWidth="3.4"
          strokeLinecap="round"
          strokeLinejoin="round"
          strokeDasharray={`${perim} ${perim}`}
          strokeDashoffset={off}
        />
        <path
          d={d}
          fill="none"
          stroke="#181818"
          strokeWidth="1.6"
          strokeLinecap="round"
          strokeDasharray={`${perim} ${perim}`}
          strokeDashoffset={off + perim * 0.08}
          opacity="0.32"
          transform="translate(5, -4)"
        />
      </g>
    </svg>
  );
};

const AngleNote = ({
  x,
  y,
  deg,
  len = 186,
  lineDeg = 10.5,
  opacity = 1,
  rot = 0,
}) => (
  <div
    style={{
      position: "absolute",
      left: x,
      top: y,
      opacity,
      transform: `rotate(${rot}deg)`,
      transformOrigin: "0 0",
    }}
  >
    <svg width={len + 90} height="160" viewBox={`0 0 ${len + 90} 160`}>
      <g transform="translate(0, 52)">
        <line
          x1="0"
          y1="0"
          x2={len}
          y2={len * Math.tan((lineDeg * Math.PI) / 180)}
          stroke="#1A1A1A"
          strokeWidth="2.2"
          strokeLinecap="round"
        />
        <line
          x1="0"
          y1="0"
          x2={len}
          y2="0"
          stroke="#1A1A1A"
          strokeWidth="1.6"
          strokeDasharray="6 6"
          opacity="0.7"
        />
        <text
          x={len * 0.26}
          y="-18"
          fontFamily='"Noto Serif", "Times New Roman", serif'
          fontStyle="italic"
          fontSize="46"
          fill="#1A1A1A"
        >
          {deg}°
        </text>
      </g>
    </svg>
  </div>
);

// 路上散落的小纸片——摄像机移动时要有东西掠过，纸面才不空
const Scrap = ({
  x,
  y,
  w = 150,
  h = 96,
  rot = 0,
  opacity = 1,
  dark = false,
}) => (
  <div
    style={{
      position: "absolute",
      left: x - w / 2,
      top: y - h / 2,
      width: w,
      height: h,
      background: dark ? "#1C1A18" : C.cream,
      transform: `rotate(${rot}deg)`,
      boxShadow: `7px 10px 20px ${C.shadow}`,
      opacity,
    }}
  />
);

// ============================================================================
// 卡片数据（世界坐标）
// ============================================================================
const CARDS = [
  { img: "card1.png", tilt: -0.7, from: [1900, 700] },
  { img: "card2.png", tilt: 0.5, from: [1850, 2000] },
  { img: "card3.png", tilt: -0.4, from: [3820, 720] },
  { img: "card4.png", tilt: 0.8, from: [3900, 2120] },
  { img: "card5.png", tilt: -0.6, from: [2200, 2040] },
  { img: "card6.png", tilt: 0.4, from: [3760, 1980] }, // 主角
].map((c, i) => ({
  ...c,
  idx: i,
  slotX: CARD_X[i % 3],
  slotY: CARD_Y[Math.floor(i / 3)],
  isHero: i === HERO,
}));

const stackOffset = (i) => {
  const layer = i === HERO ? 0 : 6 - i;
  return { dx: layer * 15, dy: layer * -11, rot: layer * 2.1 };
};

// ============================================================================
// 主合成
// ============================================================================
export const PaperWorld = () => {
  const f = useCurrentFrame();

  // ---------- 摄像机 ----------
  const cam = camAt(f);
  const camPrev = camAt(Math.max(0, f - 1));
  const vx = (cam.x - camPrev.x) * cam.z;
  const vy = (cam.y - camPrev.y) * cam.z;
  const speed = Math.hypot(vx, vy);
  // 运动模糊由摄像机速度直接生成：停下自动归零，不需要手动开关键帧
  const blur = Math.min(14, speed * 0.13);

  // ---------- 网格生长 ----------
  const gridClipW = GRID_W * easeOut(seg(f, 20, 92));
  const gridOpacity = clamp01(seg(f, 20, 40));

  // ---------- 黄线 ----------
  const yellowP = easeOut(seg(f, T.stack[0] - 6, T.stack[0] + 22));
  const yellowOpacity = clamp01(seg(f, T.stack[0] - 6, T.stack[0] + 2));

  // ---------- 卡片 ----------
  const cardStates = CARDS.map((c) => {
    const ds = T.dropStart + c.idx * T.dropGap;
    const pDrop = seg(f, ds, ds + T.dropDur);

    let x = c.from[0];
    let y = c.from[1];
    let rot = c.tilt * 3.2;
    let scale = 1;
    let opacity = 0;
    let z = c.idx;

    if (pDrop > 0) {
      const e = overshoot(pDrop);
      x = lerp(c.from[0], c.slotX, e);
      y = lerp(c.from[1], c.slotY, e);
      rot = lerp(c.tilt * 3.2, c.tilt, e);
      opacity = clamp01(pDrop * 4);
    }
    if (pDrop >= 1) {
      x = c.slotX;
      y = c.slotY;
      rot = c.tilt;
      opacity = 1;
    }

    // 叠摞：两端速度归零（不能用 overshoot，它会把行程堆在开头造成突刺）
    const pStack = seg(f, T.stack[0], T.stack[1]);
    if (pStack > 0) {
      const off = stackOffset(c.idx);
      const e = smooth(pStack);
      x = lerp(c.slotX, S2.x - CARD_W / 2 + off.dx, e);
      y = lerp(c.slotY, S2.y - CARD_H / 2 + off.dy, e);
      rot = lerp(c.tilt, off.rot, e);
      scale = lerp(1, STACK_SCALE, e);
    }

    // 抽走（非主角）
    if (!c.isHero) {
      const order = 5 - c.idx;
      const ps = T.pullStart + (order - 1) * T.pullGap;
      const pPull = seg(f, ps, ps + T.pullDur);
      if (pPull > 0) {
        const off = stackOffset(c.idx);
        const fan = (order - 2.5) * 78;
        const baseX = S2.x - CARD_W / 2 + off.dx;
        const baseY = S2.y - CARD_H / 2 + off.dy;
        const e = 1 - Math.pow(1 - pPull, 2);
        const dist = 1180 * e;
        x = baseX + U.x * dist + -U.y * fan * e;
        y = baseY + U.y * dist + U.x * fan * e;
        rot = off.rot + (order % 2 === 0 ? -34 : 26) * e;
        scale = lerp(STACK_SCALE, 0.78, e);
        opacity = lerp(1, 0, clamp01((pPull - 0.45) / 0.55));
        z = 10 + order;
      }
    }

    // 主角：抽完后放大（两段式：0.4s 冲高 → 0.67s 慢收）
    if (c.isHero) {
      const t1 = T.heroUp[0];
      const tMid = t1 + 12;
      const t2 = T.heroUp[1];
      if (f >= t1) {
        const off = stackOffset(c.idx);
        let s = lerp(STACK_SCALE, 2.24, fastOutSlowIn(seg(f, t1, tMid)));
        if (f > tMid) s = lerp(2.24, 2.08, smooth(seg(f, tMid, t2)));
        scale = s;
        x = S2.x - CARD_W / 2 + off.dx;
        y = S2.y - CARD_H / 2 + off.dy;
        rot = lerp(
          off.rot,
          -2.2,
          clamp01((s - STACK_SCALE) / (2.08 - STACK_SCALE)),
        );
        z = 60;
      }
      if (f >= T.stack[0] && f < t1) z = 0;
    }

    return { ...c, x, y, rot, scale, opacity, z };
  });

  // ---------- 光标 ----------
  const handOf = (st) => ({
    x: st.x + CARD_W / 2 + CARD_W * st.scale * 0.42,
    y: st.y + CARD_H / 2 + CARD_H * st.scale * 0.42,
  });
  const handOfFrom = (c) => ({
    x: c.from[0] + CARD_W / 2 + CARD_W * 0.42,
    y: c.from[1] + CARD_H / 2 + CARD_H * 0.42,
  });
  const waitSpot = { x: GRID.x + GRID_W + 96, y: GRID.y + GRID_H - 30 };

  let cx = S2.x;
  let cy = S2.y;
  let cursorOn = false;
  let grab = 0;

  for (let i = 0; i < CARDS.length; i++) {
    const s = T.dropStart + i * T.dropGap;
    if (f >= s - 8 && f <= s + T.dropDur + 2) {
      const h = f < s ? handOfFrom(CARDS[i]) : handOf(cardStates[i]);
      cx = h.x;
      cy = h.y;
      cursorOn = true;
      grab = Math.max(
        grab,
        Math.sin(Math.PI * clamp01((f - s) / T.dropDur)) * 0.7,
      );
    }
  }
  if (!cursorOn) {
    for (let i = 0; i < CARDS.length - 1; i++) {
      const ePrev = T.dropStart + i * T.dropGap + T.dropDur + 2;
      const sNext = T.dropStart + (i + 1) * T.dropGap - 8;
      if (f > ePrev && f < sNext) {
        const t = smooth(seg(f, ePrev, sNext));
        const A = handOf({ x: CARDS[i].slotX, y: CARDS[i].slotY, scale: 1 });
        const B = handOfFrom(CARDS[i + 1]);
        cx = lerp(A.x, B.x, t);
        cy = lerp(A.y, B.y, t);
        cursorOn = true;
      }
    }
  }
  const lastDropEnd = T.dropStart + 5 * T.dropGap + T.dropDur + 2;
  if (!cursorOn && f >= lastDropEnd && f < T.pullStart) {
    const t = smooth(seg(f, lastDropEnd, lastDropEnd + 28));
    const A = handOf({ x: CARDS[5].slotX, y: CARDS[5].slotY, scale: 1 });
    cx = lerp(A.x, waitSpot.x, t);
    cy = lerp(A.y, waitSpot.y, t);
    cursorOn = true;
  }
  for (let k = 1; k <= 5; k++) {
    const ps = T.pullStart + (k - 1) * T.pullGap;
    const holdEnd = ps + T.pullDur * 0.55;
    if (f >= ps && f <= holdEnd + 10) {
      const st = cardStates[5 - k];
      const h = handOf(st);
      const r = smooth(seg(f, holdEnd, holdEnd + 10));
      cx = lerp(h.x, waitSpot.x - 220, r * 0.25);
      cy = lerp(h.y, waitSpot.y - 60, r * 0.25);
      cursorOn = true;
      grab = Math.max(
        grab,
        Math.sin(Math.PI * clamp01(seg(f, ps, ps + T.pullDur))) * 0.8,
      );
    }
  }
  const pullAllEnd = T.pullStart + 4 * T.pullGap + T.pullDur;
  const cursorFade =
    f > pullAllEnd ? 1 - clamp01(seg(f, pullAllEnd, pullAllEnd + 8)) : 1;
  const cursorScale = 1 - 0.1 * grab;

  // ---------- 字幕 ----------
  const captions = [
    { a: 108, b: 236, t: "六张海报，一张一张摆进格子" },
    { a: 240, b: 250, t: "格线替你决定了留白" },
    { a: 254, b: 304, t: "叠成一摞，主角压在最下面" },
    { a: 308, b: 396, t: "抽开上面五张" },
    { a: 400, b: 422, t: "它自己就露出来了" },
  ];
  const cap = captions.find((c) => f >= c.a && f < c.b);

  // 主角圈注
  const inkP = easeOut(seg(f, T.heroUp[0] + 4, T.heroUp[0] + 22));
  const inkOn = f >= T.heroUp[0] + 4 && f < T.move2[0];

  return (
    <AbsoluteFill style={{ background: C.paper, overflow: "hidden" }}>
      {/* ===== 世界层：整体受摄像机变换 + 速度模糊 ===== */}
      <AbsoluteFill
        style={{
          overflow: "hidden",
          filter: blur > 0.35 ? `blur(${blur}px)` : undefined,
        }}
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
          <PaperSheet />

          {/* ---- 站点 1：开场标题 ---- */}
          <TitleBlock
            cn="摆位"
            en="Layout"
            x={1400}
            y={880}
            opacity={clamp01(seg(f, 12, 32))}
            dy={lerp(30, 0, easeOut(seg(f, 12, 36)))}
          />
          <NumberCard
            n="1"
            x={2180}
            // 之前只落 54px，几乎看不出来。改成从上方 380px 真正落下来，
            // 这一页才有节拍（实测原来整页能量只有 0.81，参考片同期 1.7）。
            y={lerp(380, 760, overshoot(seg(f, 20, 44)))}
            rot={lerp(19, 8, overshoot(seg(f, 20, 44)))}
            opacity={clamp01(seg(f, 20, 26))}
            dark={false}
          />
          <Cursor
            x={1560}
            y={1250}
            rot={-14}
            scale={1.05}
            opacity={clamp01(seg(f, 6, 26))}
          />

          {/* ---- 路上的散落物：摄像机移动时要有东西掠过 ---- */}
          <Scrap x={2300} y={1560} w={168} h={104} rot={-12} opacity={0.95} />
          <Scrap x={2580} y={1090} w={104} h={70} rot={7} opacity={0.9} />
          <Scrap x={3560} y={1900} w={146} h={94} rot={14} opacity={0.92} />
          <Scrap x={4150} y={1570} w={170} h={110} rot={8} opacity={0.94} />
          <Scrap x={4450} y={1600} w={122} h={78} rot={-6} opacity={0.9} />
          <Scrap x={3720} y={700} w={96} h={64} rot={-6} opacity={0.86} dark />
          <Scrap x={1660} y={1900} w={128} h={82} rot={9} opacity={0.9} />
          <Scrap x={2060} y={1010} w={186} h={124} rot={-5} opacity={0.94} />
          <Scrap x={4600} y={1500} w={120} h={80} rot={-9} opacity={0.9} />
          <Scrap x={4620} y={1700} w={200} h={132} rot={6} opacity={0.92} />

          {/* ---- 站点 2：方格作业台 ---- */}
          {f >= 20 && <GraphGrid progress={gridOpacity} clipW={gridClipW} />}
          {yellowOpacity > 0.01 && (
            <YellowLine progress={yellowP} opacity={yellowOpacity * 0.95} />
          )}

          {[...cardStates]
            .sort((a, b) => a.z - b.z)
            .map((c) => (
              <div
                key={c.img}
                style={{
                  position: "absolute",
                  left: c.x,
                  top: c.y,
                  width: CARD_W,
                  height: CARD_H,
                  opacity: c.opacity,
                  transform: `rotate(${c.rot}deg) scale(${c.scale})`,
                  transformOrigin: "50% 50%",
                  boxShadow: `8px 12px 22px ${C.shadow}`,
                  background: "#fff",
                }}
              >
                <Img
                  src={staticFile(c.img)}
                  style={{
                    width: "100%",
                    height: "100%",
                    objectFit: "cover",
                    display: "block",
                  }}
                />
              </div>
            ))}

          <NumberCard
            n="2"
            x={GRID.x - 190}
            y={GRID.y - 110}
            rot={-9}
            scale={clamp01(seg(f, 104, 120))}
            opacity={clamp01(seg(f, 104, 120))}
          />

          {f >= T.stack[1] - 8 && f < T.pullStart + T.pullGap && (
            <AngleNote
              x={S2.x + 252}
              y={S2.y - 214}
              deg={11}
              opacity={
                clamp01(seg(f, T.stack[1] - 8, T.stack[1] + 4)) *
                (1 - clamp01(seg(f, T.pullStart, T.pullStart + T.pullGap)))
              }
            />
          )}

          {inkOn && (
            <InkRect
              cx={S2.x}
              cy={S2.y}
              hw={(CARD_W * 2.08) / 2 + 30}
              hh={(CARD_H * 2.08) / 2 + 26}
              progress={inkP}
              opacity={
                clamp01(seg(f, T.heroUp[0] + 4, T.heroUp[0] + 10)) *
                (1 - clamp01(seg(f, T.move2[0], T.move2[0] + 8)))
              }
            />
          )}

          {cursorOn && (
            <Cursor
              x={cx}
              y={cy}
              rot={-8 + 6 * Math.sin(f / 26)}
              scale={cursorScale}
              opacity={clamp01(seg(f, 110, 122)) * cursorFade}
            />
          )}

          {/* ---- 站点 3：收尾标题 ---- */}
          <div
            style={{
              position: "absolute",
              left: 3620,
              // 摄像机到位后才从下方贴上来。否则第二次移动途中，
              // 站点 2 那张放大版还没移出画面，站点 3 这张已经进画面，会出现两张一样的卡。
              top: lerp(
                1560,
                1180,
                overshoot(seg(f, T.move2[1] + 8, T.move2[1] + 30)),
              ),
              width: CARD_W * 1.45,
              height: CARD_H * 1.45,
              transform: "rotate(-3.4deg)",
              opacity: clamp01(seg(f, T.move2[1] + 8, T.move2[1] + 16)),
              boxShadow: "18px 24px 44px rgba(40,36,32,0.46)",
            }}
          >
            <Img
              src={staticFile("card6.png")}
              style={{
                width: "100%",
                height: "100%",
                objectFit: "cover",
                display: "block",
              }}
            />
          </div>
          <TitleBlock
            cn="揭示"
            en="Reveal"
            x={4040}
            y={1220}
            opacity={clamp01(seg(f, T.move2[1] + 12, T.move2[1] + 32))}
            dy={lerp(28, 0, easeOut(seg(f, T.move2[1] + 12, T.move2[1] + 38)))}
          />
          <NumberCard
            n="3"
            x={4740}
            y={780}
            rot={-8}
            opacity={clamp01(seg(f, T.move2[1] + 10, T.move2[1] + 30))}
          />
        </div>
      </AbsoluteFill>

      {/* ===== 取景框层：暗角 + 字幕（固定，不随纸移动）===== */}
      <AbsoluteFill
        style={{
          pointerEvents: "none",
          background:
            "radial-gradient(ellipse 78% 72% at 50% 46%, rgba(255,255,255,0.30) 0%, rgba(255,255,255,0) 55%, rgba(90,84,78,0.17) 100%)",
        }}
      />
      {cap && <Caption text={cap.t} />}
    </AbsoluteFill>
  );
};
