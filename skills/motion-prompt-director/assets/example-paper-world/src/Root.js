import { Composition } from "remotion";
import { PaperWorld, DURATION, FPS } from "./PaperWorld.js";

// 只注册这一个合成。完整工程里还有七个穷举用的合成（OpeningTest / MiddleTest /
// EndingTest / TransitionTest / AlbumGridPush / FullPiece / PaperReveal），
// 那些是过程稿，没必要带进来——这里是「法则的来源」那一支片子。
export const RemotionRoot = () => {
  return (
    <Composition
      id="PaperWorld"
      component={PaperWorld}
      durationInFrames={DURATION}
      fps={FPS}
      width={1440}
      height={1080}
    />
  );
};
