// Single source of timing for the sample renderer and audit. Seconds are converted at the chosen fps.
export const createBudget = (fps = 30) => {
  if (!Number.isFinite(fps) || fps <= 0)
    throw new RangeError("fps must be positive");
  const f = (seconds) => Math.round(seconds * fps);
  const T = {
    title: [f(12 / 30), f(36 / 30)],
    grid: [f(20 / 30), f(92 / 30)],
    move1: [f(78 / 30), f(92 / 30)],
    dropStart: f(118 / 30),
    dropGap: f(18 / 30),
    dropDur: f(20 / 30),
    lookEnd: f(252 / 30),
    stack: [f(252 / 30), f(280 / 30)],
    pullStart: f(306 / 30),
    pullGap: f(18 / 30),
    pullDur: f(20 / 30),
    heroUp: [f(400 / 30), f(432 / 30)],
    move2: [f(424 / 30), f(438 / 30)],
    end: f(550 / 30),
  };
  const STATIONS = [
    { x: 1980, y: 1180 },
    { x: 3064, y: 1592 },
    { x: 4280, y: 1120 },
  ];
  const CAM = [
    { f: 0, ...STATIONS[0], z: 1 },
    { f: T.move1[0], ...STATIONS[0], z: 1.05 },
    { f: T.move1[1], ...STATIONS[1], z: 1 },
    { f: T.lookEnd, ...STATIONS[1], z: 1.02 },
    { f: T.move2[0], ...STATIONS[1], z: 1.06 },
    { f: T.move2[1], ...STATIONS[2], z: 1 },
    { f: T.end, ...STATIONS[2], z: 1.05 },
  ];
  const segments = [
    { id: "opening", start: 0, end: T.move1[1] },
    { id: "arrange", start: T.move1[1], end: T.lookEnd },
    { id: "stack", start: T.lookEnd, end: T.pullStart },
    { id: "reveal", start: T.pullStart, end: T.move2[1] },
    { id: "ending", start: T.move2[1], end: T.end },
  ];
  const motions = [
    {
      id: "title",
      segment: "opening",
      start: T.title[0],
      end: T.title[1],
      kind: "element",
    },
    ...Array.from({ length: 6 }, (_, i) => ({
      id: `card-${i + 1}`,
      segment: "arrange",
      start: T.dropStart + i * T.dropGap,
      end: T.dropStart + i * T.dropGap + T.dropDur,
      kind: "element",
    })),
    {
      id: "stack",
      segment: "stack",
      start: T.stack[0],
      end: T.stack[1],
      kind: "element",
    },
    ...Array.from({ length: 5 }, (_, i) => ({
      id: `pull-${i + 1}`,
      segment: "reveal",
      start: T.pullStart + i * T.pullGap,
      end: T.pullStart + i * T.pullGap + T.pullDur,
      kind: "element",
    })),
    {
      id: "hero",
      segment: "reveal",
      start: T.heroUp[0],
      end: T.heroUp[1],
      kind: "element",
      reason: "Hero reveal intentionally lasts slightly over one second",
    },
    {
      id: "camera-1",
      segment: "opening",
      start: T.move1[0],
      end: T.move1[1],
      kind: "camera",
    },
    {
      id: "camera-2",
      segment: "reveal",
      start: T.move2[0],
      end: T.move2[1],
      kind: "camera",
    },
  ];
  return { fps, durationFrames: T.end, T, CAM, STATIONS, segments, motions };
};
export const GUIDELINES_SECONDS = {
  element: { min: 0.3, max: 1 },
  stroke: { min: 0.1, max: 0.3 },
  camera: { min: 0.3, max: 3 },
  choreography: { min: 0, max: Infinity },
};
export const BUDGET = createBudget(30);
export const {
  fps: FPS,
  durationFrames: DURATION,
  T,
  CAM,
  STATIONS,
  segments: SEGMENTS,
  motions: MOTIONS,
} = BUDGET;
