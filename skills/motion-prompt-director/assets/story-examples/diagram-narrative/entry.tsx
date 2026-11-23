import {Composition,registerRoot} from 'remotion';
import {DiagramNarrative} from './DiagramNarrative';
const Root=()=> <>
 <Composition id="DiagramAtlas" component={DiagramNarrative} width={1920} height={1080} fps={30} durationInFrames={258} defaultProps={{variant:'atlas' as const,showGuide:true}}/>
 <Composition id="DiagramRelay" component={DiagramNarrative} width={1920} height={1080} fps={30} durationInFrames={258} defaultProps={{variant:'relay' as const,showGuide:true}}/>
</>;
registerRoot(Root);
