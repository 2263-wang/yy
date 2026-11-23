import {Composition,registerRoot} from 'remotion';
import {VisualEvents} from './VisualEvents';
const Root=()=> <>
 <Composition id="MGAssemble" component={VisualEvents} width={1920} height={1080} fps={30} durationInFrames={240} defaultProps={{variant:'assemble' as const}}/>
 <Composition id="MGPropagate" component={VisualEvents} width={1920} height={1080} fps={30} durationInFrames={240} defaultProps={{variant:'propagate' as const}}/>
</>;
registerRoot(Root);
