import type React from 'react';
import {AbsoluteFill, useCurrentFrame, useVideoConfig} from 'remotion';

// Deterministic state evaluator: the prototype, studies and final share these seconds.
export const TIMING={focus:[1.4,2.2],foreground:[3.1,3.6,4.7,5.15],return:[4.9,5.8],hardware:[5.8,6.5],exit:[7.1,7.8],duration:8.6} as const;
const clamp=(x:number)=>Math.max(0,Math.min(1,x));
const smooth=(x:number)=>{const p=clamp(x);return p*p*p*(p*(p*6-15)+10);};
const at=(t:number,a:number,b:number)=>smooth((t-a)/(b-a));
const mix=(a:number,b:number,p:number)=>a+(b-a)*p;
export const NODES=[
 {id:'model',label:'模型',detail:'观察起点',x:460,y:250},
 {id:'compute',label:'计算资源',detail:'先聚焦一处支撑',x:1260,y:250},
 {id:'chip',label:'芯片',detail:'硬件环节',x:1260,y:680},
 {id:'manufacturing',label:'制造',detail:'继续追溯',x:710,y:880},
 {id:'tools',label:'工具与材料',detail:'简化示意',x:260,y:680},
] as const;
export function stateAt(t:number){
 const focus=at(t,...TIMING.focus)*(1-at(t,...TIMING.return));
 const foreground=at(t,TIMING.foreground[0],TIMING.foreground[1])*(1-at(t,TIMING.foreground[2],TIMING.foreground[3]));
 const dim=at(t,3.0,3.45)*(1-at(t,5.05,5.5));
 const hardware=at(t,...TIMING.hardware);
 return {camera:{x:mix(870,1230,focus),y:mix(540,250,focus),z:mix(.82,1.45,focus)},foreground,hardware,
   worldOpacity:1-.96*dim,focus,exit:at(t,...TIMING.exit),stage:t<1.4?0:t<3.1?1:t<5.15?2:3};
}
const C={bg:'#101714',ink:'#f0f2df',muted:'#819187',line:'#3f5348',accent:'#e9d58e'};
const FONT='"Microsoft YaHei","Noto Sans SC",sans-serif';
const edgePath='M 650 250 H 1070 M 1260 340 V 590 M 1120 730 L 880 820 M 540 820 L 390 730';
export type DiagramNarrativeProps={variant:'atlas'|'relay';showGuide:boolean};

export const DiagramNarrative:React.FC<DiagramNarrativeProps>=({variant,showGuide})=>{
 const f=useCurrentFrame();const {fps}=useVideoConfig();const t=f/fps;const s=stateAt(t);
 const relay=variant==='relay';
 const nodes=NODES.map((n,i)=>relay?{...n,x:290+i*315,y:i%2?620:430}:n);
 const camera=relay?{x:920,y:550,z:1}:s.camera;
 const foreground=relay?0:s.foreground;
 const relayPosition=mix(0,4,at(t,.8,6.8));
 return <AbsoluteFill style={{background:C.bg,color:C.ink,fontFamily:FONT,overflow:'hidden'}}>
  <div style={{position:'absolute',inset:0,backgroundImage:'radial-gradient(#3f534855 1px,transparent 1px)',backgroundSize:'42px 42px'}}/>
  <div style={{position:'absolute',left:960-camera.x*camera.z,top:540-camera.y*camera.z,scale:camera.z,transformOrigin:'0 0',opacity:relay?1:s.worldOpacity}}>
   <svg width={1900} height={1100} style={{position:'absolute',left:0,top:0,overflow:'visible'}}>
    {relay?<path d={nodes.map((n,i)=>`${i?'L':'M'}${n.x} ${n.y}`).join(' ')} fill="none" stroke={C.line} strokeWidth={3}/>:<path d={edgePath} fill="none" stroke={C.line} strokeWidth={4}/>}
    {!relay&&<path d="M 1260 340 V 590" fill="none" stroke={C.accent} strokeWidth={5} strokeDasharray={250} strokeDashoffset={250*(1-s.hardware)}/>}
    {!relay&&<path d={`M 1450 680 H ${1450+400*s.exit}`} fill="none" stroke={C.accent} strokeWidth={4} opacity={s.exit}/>}
   </svg>
   {nodes.map((n,i)=>{
    const current=relay?Math.max(0,1-Math.abs(relayPosition-i)):n.id==='compute'?s.focus:(n.id==='chip'||n.id==='manufacturing'||n.id==='tools')?s.hardware:0;
    return <div key={n.id} style={{position:'absolute',left:n.x-190,top:n.y-88,width:380,height:176,border:`${current>.15?3:2}px solid ${current>.15?C.accent:C.line}`,borderRadius:18,background:current>.15?'#28342a':'#152019',display:'flex',flexDirection:'column',justifyContent:'center',alignItems:'center',opacity:relay?mix(.36,1,current):mix(.66,1,Math.max(s.hardware,current)),scale:relay?mix(.91,1.05,current):1}}>
     <div style={{fontSize:43,fontWeight:700,letterSpacing:2}}>{n.label}</div>
     <div style={{fontSize:23,color:C.muted,marginTop:12}}>{n.detail}</div>
    </div>;
   })}
  </div>
  {!relay&&<div style={{position:'absolute',left:250,top:310,width:1420,textAlign:'center',opacity:foreground,translate:`0 ${(1-foreground)*25}px`}}>
   <div style={{fontSize:100,fontWeight:750,lineHeight:1.35}}>模型背后<br/><span style={{color:C.accent}}>还有哪些支撑？</span></div>
  </div>}
  <div style={{position:'absolute',left:105,top:80,fontSize:25,letterSpacing:3,color:C.muted}}>内容关系示意 · 设计粗动稿</div>
  {showGuide&&<div style={{position:'absolute',left:105,top:130,fontSize:37,fontWeight:700,color:C.accent}}>{relay?'B · 同尺度节点接力':(['A · 先建立全局关系','A · 聚焦一处支撑','A · 前景问题接管','A · 回到关系，交给后文'][s.stage])}</div>}
  <div style={{position:'absolute',left:105,right:105,bottom:72,fontSize:24,color:C.muted,lineHeight:1.5}}>
   {relay?'同一批对象固定在画内，以焦点沿节点推进。':'同一批对象保留位置，取景与前景按观看任务变化。'}
   <br/>抽象演示，不代表完整产业链、企业采购关系或国家能力比较。
  </div>
 </AbsoluteFill>;
};
