import React, { Children, type CSSProperties, type ReactNode } from "react";
import {
  AbsoluteFill,
  Easing,
  Sequence,
  useCurrentFrame,
  useVideoConfig,
} from "remotion";
const clamp = (x: number) => Math.max(0, Math.min(1, x));
const smooth = (x: number) => x * x * (3 - 2 * x);
const mix = (a: number, b: number, p: number) => a + (b - a) * p;
type Timed = {
  fromSeconds?: number;
  durationSeconds?: number;
  easing?: "smooth" | "linear" | "quick-settle";
};
function useProgress({
  fromSeconds = 0,
  durationSeconds = 0.6,
  easing = "quick-settle",
}: Timed) {
  const frame = useCurrentFrame(),
    { fps } = useVideoConfig();
  if (!Number.isFinite(durationSeconds) || durationSeconds <= 0)
    throw new Error("durationSeconds must be positive");
  const t = clamp((frame / fps - fromSeconds) / durationSeconds);
  return easing === "linear"
    ? t
    : easing === "smooth"
      ? smooth(t)
      : Easing.bezier(0.16, 1, 0.3, 1)(t);
}
export type MotionState = {
  x?: number;
  y?: number;
  scale?: number;
  rotate?: number;
  opacity?: number;
};
type Visual = { children?: ReactNode; style?: CSSProperties };
export function Motion({
  children,
  style,
  from = {},
  to = {},
  ...timing
}: Visual & Timed & { from?: MotionState; to?: MotionState }) {
  const p = useProgress(timing);
  const v = (key: keyof MotionState, defaultValue: number) =>
    mix(from[key] ?? defaultValue, to[key] ?? defaultValue, p);
  return (
    <div
      style={{
        ...style,
        opacity: v("opacity", 1),
        transform: `translate(${v("x", 0)}px,${v("y", 0)}px) rotate(${v("rotate", 0)}deg) scale(${v("scale", 1)})`,
      }}
    >
      {children}
    </div>
  );
}
export function ClipReveal({
  children,
  style,
  direction = "left",
  closing = false,
  ...timing
}: Visual &
  Timed & {
    direction?: "left" | "right" | "top" | "bottom";
    closing?: boolean;
  }) {
  const progress = useProgress(timing),
    p = closing ? 1 - progress : progress,
    r = (1 - p) * 100;
  const inset =
    direction === "left"
      ? `0 ${r}% 0 0`
      : direction === "right"
        ? `0 0 0 ${r}%`
        : direction === "top"
          ? `0 0 ${r}% 0`
          : `${r}% 0 0 0`;
  return (
    <div style={{ ...style, clipPath: `inset(${inset})` }}>{children}</div>
  );
}
export function Stagger({
  children,
  style,
  gapSeconds = 0.08,
  durationSeconds = 0.5,
  fromSeconds = 0,
}: Visual & {
  gapSeconds?: number;
  durationSeconds?: number;
  fromSeconds?: number;
}) {
  const { fps } = useVideoConfig();
  return (
    <div style={style}>
      {Children.toArray(children).map((child, i) => (
        <Sequence
          key={i}
          from={Math.round((fromSeconds + i * gapSeconds) * fps)}
          layout="none"
        >
          <Motion
            durationSeconds={durationSeconds}
            from={{ y: 24, opacity: 0 }}
            to={{ y: 0, opacity: 1 }}
          >
            {child}
          </Motion>
        </Sequence>
      ))}
    </div>
  );
}
export function OrbitGroup({
  children,
  style,
  radius = 110,
  turnDegrees = 90,
  startDegrees = -90,
  keepUpright = true,
  ...timing
}: Visual &
  Timed & {
    radius?: number;
    turnDegrees?: number;
    startDegrees?: number;
    keepUpright?: boolean;
  }) {
  const p = useProgress(timing),
    items = Children.toArray(children);
  return (
    <div style={{ position: "relative", ...style }}>
      {items.map((child, i) => {
        const deg =
            startDegrees +
            (i * 360) / Math.max(1, items.length) +
            turnDegrees * p,
          a = (deg * Math.PI) / 180;
        return (
          <div
            key={i}
            style={{
              position: "absolute",
              left: "50%",
              top: "50%",
              transform: `translate(-50%,-50%) translate(${Math.cos(a) * radius}px,${Math.sin(a) * radius}px) rotate(${keepUpright ? 0 : deg + 90}deg)`,
            }}
          >
            {child}
          </div>
        );
      })}
    </div>
  );
}
export function TextSplit({
  text,
  mode = "characters",
  gapSeconds = 0.045,
  fromSeconds = 0,
  style,
}: {
  text: string;
  mode?: "characters" | "words";
  gapSeconds?: number;
  fromSeconds?: number;
  style?: CSSProperties;
}) {
  const frame = useCurrentFrame(),
    { fps } = useVideoConfig(),
    parts = mode === "words" ? text.split(/(\s+)/) : Array.from(text);
  return (
    <div style={style}>
      {parts.map((part, i) => {
        const p = Easing.bezier(
          0.16,
          1,
          0.3,
          1,
        )(clamp((frame / fps - fromSeconds - i * gapSeconds) / 0.4));
        return (
          <span
            key={i}
            style={{
              display: "inline-block",
              whiteSpace: "pre",
              opacity: p,
              transform: `translateY(${(1 - p) * 18}px)`,
            }}
          >
            {part}
          </span>
        );
      })}
    </div>
  );
}
type Box = { width: number; height: number; radius: number };
export function ShapeMorph({
  children,
  style,
  from,
  to,
  color = "#4554dd",
  ...timing
}: Visual & Timed & { from: Box; to: Box; color?: string }) {
  const p = useProgress(timing);
  return (
    <div
      style={{
        position: "absolute",
        left: "50%",
        top: "50%",
        ...style,
        width: mix(from.width, to.width, p),
        height: mix(from.height, to.height, p),
        borderRadius: mix(from.radius, to.radius, p),
        transform: "translate(-50%,-50%)",
        background: color,
        overflow: "hidden",
        display: "flex",
        alignItems: "center",
        justifyContent: "center",
      }}
    >
      {children}
    </div>
  );
}
type Point = { x: number; y: number };
export function PathMove({
  children,
  style,
  start,
  end,
  control1,
  control2,
  ...timing
}: Visual &
  Timed & { start: Point; end: Point; control1?: Point; control2?: Point }) {
  const p = useProgress(timing),
    q = 1 - p,
    c1 = control1 ?? {
      x: mix(start.x, end.x, 1 / 3),
      y: mix(start.y, end.y, 1 / 3),
    },
    c2 = control2 ?? {
      x: mix(start.x, end.x, 2 / 3),
      y: mix(start.y, end.y, 2 / 3),
    };
  const x =
      q * q * q * start.x +
      3 * q * q * p * c1.x +
      3 * q * p * p * c2.x +
      p * p * p * end.x,
    y =
      q * q * q * start.y +
      3 * q * q * p * c1.y +
      3 * q * p * p * c2.y +
      p * p * p * end.y;
  return (
    <div
      style={{
        position: "absolute",
        ...style,
        transform: `translate(${x}px,${y}px)`,
      }}
    >
      {children}
    </div>
  );
}
export type CameraKey = { seconds: number; x: number; y: number; zoom: number };
export function Camera2D({
  children,
  keys,
  worldWidth,
  worldHeight,
  viewportWidth,
  viewportHeight,
}: {
  children?: ReactNode;
  keys: CameraKey[];
  worldWidth: number;
  worldHeight: number;
  viewportWidth?: number;
  viewportHeight?: number;
}) {
  const frame = useCurrentFrame(),
    { fps, width, height } = useVideoConfig(),
    t = frame / fps;
  if (
    keys.length === 0 ||
    keys.some(
      (k, i) =>
        ![k.seconds, k.x, k.y, k.zoom].every(Number.isFinite) ||
        k.zoom <= 0 ||
        (i > 0 && k.seconds <= keys[i - 1].seconds),
    )
  )
    throw new Error(
      "Camera keys need finite positions, positive zoom and increasing seconds",
    );
  let camera = keys[0];
  if (t >= keys[keys.length - 1].seconds) camera = keys[keys.length - 1];
  else
    for (let i = 0; i < keys.length - 1; i++) {
      const a = keys[i],
        b = keys[i + 1];
      if (t >= a.seconds && t <= b.seconds) {
        const p = smooth(clamp((t - a.seconds) / (b.seconds - a.seconds)));
        camera = {
          seconds: t,
          x: mix(a.x, b.x, p),
          y: mix(a.y, b.y, p),
          zoom: mix(a.zoom, b.zoom, p),
        };
        break;
      }
    }
  return (
    <AbsoluteFill style={{ overflow: "hidden" }}>
      <div
        style={{
          position: "absolute",
          width: worldWidth,
          height: worldHeight,
          transformOrigin: "0 0",
          transform: `translate(${(viewportWidth ?? width) / 2 - camera.x * camera.zoom}px,${(viewportHeight ?? height) / 2 - camera.y * camera.zoom}px) scale(${camera.zoom})`,
        }}
      >
        {children}
      </div>
    </AbsoluteFill>
  );
}
