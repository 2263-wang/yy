import React from "react";
import { Composition, registerRoot } from "remotion";
import { MotionKitGallery } from "./Gallery.tsx";
const Root: React.FC = () => (
  <Composition
    id="MotionKitGallery"
    component={MotionKitGallery}
    width={1440}
    height={900}
    fps={30}
    durationInFrames={120}
  />
);
registerRoot(Root);
