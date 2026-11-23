import type React from 'react';
import {AbsoluteFill,useCurrentFrame,useVideoConfig} from 'remotion';

const clamp=(n:number)=>Math.max(0,Math.min(1,n));
const ease=(n:number)=>{const x=clamp(n);return x*x*x*(x*(x*6-15)+10);};
const p=(t:number,a:number,b:number)=>ease((t-a)/(b-a));
const mix=(a:number,b:number,x:number)=>a+(b-a)*x;
export type Variant='assemble'|'propagate';
export const TIMING={seconds:8,assembly:[1.1,3.05],systemShift:[4,5],connection:[4.55,5.5],signal:[5.7,6.9],response:[6.9,7.5]} as const;
const slots=[[-170,-170],[0,-170],[170,-170],[170,0],[170,170],[0,170],[-170,170],[-170,0]];
export function sceneAt(t:number,variant:Variant){
 const assembled=variant==='assemble'?p(t,...TIMING.assembly):1;
 const shift=variant==='assemble'?p(t,...TIMING.systemShift):1;
 return {assembled,cx:mix(960,620,shift),connection:p(t,...TIMING.connection),signal:p(t,...TIMING.signal),
  signalAlpha:p(t,5.7,5.9)*(1-p(t,6.75,6.95)),response:p(t,...TIMING.response),body:variant==='assemble'?p(t,1.2,2.4):1};
}
export function moduleAt(t:number,i:number,variant:Variant){
 const s=sceneAt(t,variant);const angle=-Math.PI/2+i*Math.PI/4;
 const a=variant==='assemble'?p(t,1.1+i*.025,2.8+i*.025):1;
 const activation=variant==='assemble'?p(t,3.1+i*.055,3.55+i*.055):p(t,.65+i*.39,1.1+i*.39);
 return {x:s.cx+mix(Math.cos(angle)*620,slots[i][0],a),y:540+mix(Math.sin(angle)*300,slots[i][1],a),
  angle:mix((i%2?1:-1)*14,0,a),activation};
}
const C={bg:'#eceee6',ink:'#24342e',line:'#a7b4a8',plate:'#dbe1d5',light:'#f8f8f1',accent:'#ee8857',active:'#b7cc90'};

export const VisualEvents:React.FC<{variant:Variant}>=({variant})=>{
 const frame=useCurrentFrame();const {fps}=useVideoConfig();const t=frame/fps;const s=sceneAt(t,variant);
 const core=p(t,3.25,3.85);const target=6+s.response*7;
 const lineStart=s.cx+270;const lineEnd=1390;
 return <AbsoluteFill style={{background:C.bg,overflow:'hidden'}}>
  <svg width={1920} height={1080} viewBox="0 0 1920 1080" style={{position:'absolute',inset:0}}>
   <ellipse cx={s.cx} cy={809} rx={250*s.body} ry={22*s.body} fill={C.ink} opacity={s.body*.055}/>
   <g opacity={s.body} transform={`translate(${s.cx} 540) scale(${mix(.88,1,s.body)})`}>
    {Array.from({length:13},(_,i)=><g key={i} stroke={C.line} strokeWidth={6} strokeLinecap="round">
     <path d={`M ${-216+i*36} -270 V -292 M ${-216+i*36} 270 V 292 M -270 ${-216+i*36} H -292 M 270 ${-216+i*36} H 292`}/>
    </g>)}
    <rect x={-270} y={-270} width={540} height={540} rx={42} fill={C.plate} stroke={C.line} strokeWidth={2}/>
    {slots.map(([x,y],i)=><path key={i} d={`M ${x} ${y} L ${x*.45} ${y*.45} L 0 0`} fill="none" stroke={C.line} strokeWidth={3} opacity={.8}/>)}
   </g>
   {slots.map((_,i)=>{
    const m=moduleAt(t,i,variant);return <g key={i} transform={`translate(${m.x} ${m.y}) rotate(${m.angle})`}>
     <rect x={-43} y={-43} width={86} height={86} rx={15} fill={mix(0,1,m.activation)>.5?C.active:C.light} stroke={C.ink} strokeWidth={2}/>
     <rect x={-26} y={-26} width={52} height={52} rx={7} fill="none" stroke={C.line} strokeWidth={2}/>
     <path d="M-17 -10 H17 M-17 0 H17 M-17 10 H3" fill="none" stroke={C.ink} strokeWidth={3} opacity={.6}/>
     <circle cx={26} cy={-26} r={4} fill={m.activation>.5?C.accent:C.line}/>
    </g>;
   })}
   <g opacity={s.body}>
    <rect x={s.cx-62} y={478} width={124} height={124} rx={21} fill={variant==='propagate'||core>.5?C.ink:C.light}/>
    <rect x={s.cx-41} y={499} width={82} height={82} rx={12} fill={C.accent} opacity={variant==='propagate'?p(t,2.8,3.65):core}/>
    <path d={`M ${s.cx-19} 540 H ${s.cx+19} M ${s.cx} 521 V559`} stroke={C.light} strokeWidth={4} opacity={variant==='propagate'?p(t,2.8,3.65):core}/>
   </g>
   <path d={`M${lineStart} 540 H${lineEnd}`} fill="none" stroke={C.line} strokeWidth={4} strokeDasharray={600} strokeDashoffset={600*(1-s.connection)} opacity={s.connection}/>
   <circle cx={mix(lineStart,lineEnd,s.signal)} cy={540} r={13} fill={C.accent} opacity={s.signalAlpha}/>
   <g opacity={s.connection} transform={`translate(1490 540) scale(${1+.07*s.response})`}>
    <circle r={94} fill={C.light} stroke={C.line} strokeWidth={2}/>
    {Array.from({length:6},(_,i)=>{const a=i*Math.PI/3;return <circle key={i} cx={Math.cos(a)*34} cy={Math.sin(a)*34} r={target} fill={s.response>.5?C.accent:C.line}/>;})}
    <circle r={15+4*s.response} fill={s.response>.5?C.accent:C.ink}/>
   </g>
  </svg>
 </AbsoluteFill>;
};
