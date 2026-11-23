import React, { type ReactNode } from "react";
import { AbsoluteFill } from "remotion";
import {
  Motion,
  ClipReveal,
  Stagger,
  OrbitGroup,
  TextSplit,
  ShapeMorph,
  PathMove,
  Camera2D,
} from "./MotionKit.tsx";
const box = (text: string, color = "#4554dd") => (
  <div
    style={{
      width: 84,
      height: 84,
      borderRadius: 15,
      background: color,
      color: "white",
      display: "grid",
      placeItems: "center",
      fontSize: 25,
      fontFamily: "Arial",
    }}
  >
    {text}
  </div>
);
function Panel({
  index,
  title,
  children,
}: {
  index: number;
  title: string;
  children: ReactNode;
}) {
  return (
    <div
      style={{
        position: "absolute",
        left: (index % 4) * 360,
        top: Math.floor(index / 4) * 450,
        width: 360,
        height: 450,
        border: "1px solid #d8dbe3",
        boxSizing: "border-box",
        fontFamily: "Arial",
      }}
    >
      <div
        style={{
          position: "absolute",
          top: 30,
          left: 24,
          fontSize: 22,
          color: "#1b2230",
        }}
      >
        {title}
      </div>
      <div
        style={{
          position: "absolute",
          left: 30,
          top: 100,
          width: 300,
          height: 260,
          overflow: "hidden",
        }}
      >
        {children}
      </div>
    </div>
  );
}
export const MotionKitGallery: React.FC = () => (
  <AbsoluteFill style={{ background: "#f5f6fa" }}>
    <Panel index={0} title="01 · Motion">
      <Motion
        fromSeconds={0.3}
        durationSeconds={0.7}
        from={{ x: -100, y: 40, opacity: 0 }}
        to={{ x: 108, y: 75, opacity: 1 }}
      >
        {box("A")}
      </Motion>
    </Panel>
    <Panel index={1} title="02 · ClipReveal">
      <ClipReveal
        style={{ width: 300, height: 260 }}
        fromSeconds={0.4}
        durationSeconds={0.7}
      >
        <div
          style={{
            position: "absolute",
            top: 70,
            left: 20,
            width: 260,
            height: 90,
            background: "#4554dd",
            color: "white",
            display: "grid",
            placeItems: "center",
            fontSize: 32,
          }}
        >
          REVEAL
        </div>
      </ClipReveal>
    </Panel>
    <Panel index={2} title="03 · Stagger">
      <Stagger
        fromSeconds={0.4}
        gapSeconds={0.15}
        style={{ position: "relative" }}
      >
        <div style={{ position: "absolute", left: 0, top: 80 }}>{box("1")}</div>
        <div style={{ position: "absolute", left: 108, top: 80 }}>
          {box("2")}
        </div>
        <div style={{ position: "absolute", left: 216, top: 80 }}>
          {box("3")}
        </div>
      </Stagger>
    </Panel>
    <Panel index={3} title="04 · OrbitGroup">
      <OrbitGroup
        radius={90}
        fromSeconds={0.4}
        durationSeconds={1.5}
        turnDegrees={100}
        style={{ width: 300, height: 260 }}
      >
        {["A", "B", "C", "D"].map((t) => (
          <div
            key={t}
            style={{
              width: 48,
              height: 48,
              borderRadius: 12,
              background: "#4554dd",
              color: "white",
              display: "grid",
              placeItems: "center",
              fontSize: 20,
            }}
          >
            {t}
          </div>
        ))}
      </OrbitGroup>
    </Panel>
    <Panel index={4} title="05 · TextSplit">
      <TextSplit
        text="MOTION"
        fromSeconds={0.4}
        gapSeconds={0.1}
        style={{
          position: "absolute",
          left: 26,
          top: 95,
          fontSize: 46,
          fontWeight: 700,
          color: "#26314a",
        }}
      />
    </Panel>
    <Panel index={5} title="06 · ShapeMorph">
      <ShapeMorph
        fromSeconds={0.4}
        durationSeconds={0.8}
        from={{ width: 70, height: 70, radius: 35 }}
        to={{ width: 260, height: 90, radius: 20 }}
      >
        <div style={{ color: "white", fontSize: 22 }}>OBJECT</div>
      </ShapeMorph>
    </Panel>
    <Panel index={6} title="07 · PathMove">
      <PathMove
        fromSeconds={0.4}
        durationSeconds={1.2}
        start={{ x: 0, y: 160 }}
        end={{ x: 210, y: 80 }}
        control1={{ x: 40, y: -80 }}
        control2={{ x: 180, y: 240 }}
      >
        {box("B")}
      </PathMove>
    </Panel>
    <Panel index={7} title="08 · Camera2D">
      <Camera2D
        worldWidth={700}
        worldHeight={400}
        viewportWidth={300}
        viewportHeight={260}
        keys={[
          { seconds: 0, x: 150, y: 130, zoom: 1 },
          { seconds: 0.5, x: 150, y: 130, zoom: 1 },
          { seconds: 1.6, x: 510, y: 130, zoom: 1 },
        ]}
      >
        <div style={{ position: "absolute", left: 95, top: 80 }}>
          {box("ONE")}
        </div>
        <div style={{ position: "absolute", left: 455, top: 80 }}>
          {box("TWO", "#476665")}
        </div>
      </Camera2D>
    </Panel>
  </AbsoluteFill>
);
