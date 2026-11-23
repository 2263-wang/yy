#!/usr/bin/env node
import assert from 'node:assert/strict';
import {spawnSync} from 'node:child_process';
import {fileURLToPath} from 'node:url';
import {explore,methodLibrary} from './explore-directions.mjs';
const task={topic:'AI产业链',relations:['dependency','part-whole'],duration:8};
const r=explore(task);
assert(r.searchCoverage.compatibleMethods.includes('world-camera'));
assert(r.searchCoverage.compatibleMethods.includes('evolving-map'));
assert(r.searchCoverage.compatibleMethods.length>2);
assert.equal(r.selectedCandidateId,null);assert.equal(r.selectedTool,null);
assert.equal(r.researchPlan.status,'not-executed');
assert(r.researchPlan.topicQueries.every(q=>q.includes(task.topic)));
for(const c of r.candidates){const[a,b,d]=c.stages;assert.equal(a.to,b.from);assert.equal(b.to,d.from);assert(d.modes.includes('insert'));}
for(const mode of ['overlay','transition','loop']){
 const v=explore({...task,mode});assert(v.candidates.length);
 for(const c of v.candidates){const[a,,d]=c.stages;assert.equal(d.to,mode==='loop'?a.from:'clear');}
 assert.equal(v.screenPolicy.text,'brand-only');assert.equal(v.screenPolicy.narration,'off');assert.equal(v.screenPolicy.ttsForTiming,false);
}
const states=explore({topic:'同样图标',relations:['state']});
assert(states.searchCoverage.compatibleMethods.includes('state-morph'));
assert(!states.searchCoverage.compatibleMethods.includes('world-camera'));
assert.deepEqual(explore({...task,relations:['unseen-relation']}).searchCoverage.uncoveredRelations,['unseen-relation']);
assert.equal(explore({...task,relations:['unseen-relation']}).candidates.length,0);
const custom={id:'new-method',name:'New observed-or-self-authored method',rendering:'flat-2d',relations:['unseen-relation'],conditions:['Test condition'],risk:'Test limitation',source:'self-authored validation fixture, not an actual observation',query:'new method animation',
 entries:[{id:'a',description:'open',from:'start',to:'ready'}],middles:[{id:'b',description:'change',from:'ready',to:'changed'}],exits:[{id:'c',description:'hold',from:'changed',to:'held',modes:['insert']}]};
const extended=explore({...task,relations:['unseen-relation'],methods:[custom]});
assert.equal(extended.candidates.length,1);assert.equal(extended.candidates[0].method,'new-method');assert.equal(extended.searchCoverage.uncoveredRelations.length,0);
const broken=structuredClone(custom);broken.middles[0].from='missing-object-state';
assert.equal(explore({...task,relations:['unseen-relation'],methods:[broken]}).candidates.length,0);
const badLoop=structuredClone(custom);badLoop.exits[0].modes=['loop'];
assert.equal(explore({...task,relations:['unseen-relation'],methods:[badLoop],mode:'loop'}).candidates.length,0);
for(const input of [{},{...task,topic:''},{...task,relations:[]},{...task,relations:[3]},{...task,duration:0},{...task,duration:NaN},{...task,mode:'bad'},{...task,methods:[methodLibrary.methods[0]]},{...task,methods:[{}]}])assert.throws(()=>explore(input));
assert.throws(()=>explore({...task,text:'explicit'}));
const attempted=explore({...task,narration:'on'});assert.equal(attempted.screenPolicy.text,'brand-only');assert.equal(attempted.screenPolicy.narration,'off');
const cli=fileURLToPath(new URL('./explore-directions.mjs',import.meta.url));
const run=args=>spawnSync(process.execPath,[cli,...args],{encoding:'utf8',maxBuffer:8*1024*1024});
const valid=run(['--topic=AI产业链','--relations=dependency,part-whole']);assert.equal(valid.status,0,valid.stderr);assert.equal(JSON.parse(valid.stdout).selectedTool,null);
for(const args of [['--topic=x'],['--topic=x','--relations=state','--duration=NaN'],['--input=missing.json'],['--topic=x','--relations=state','--oops=1'],['--input=x','--topic=y']])assert.equal(run(args).status,1);
console.log(JSON.stringify({status:'pass',openMethods:methodLibrary.methods.length,dependencySeeds:r.candidates.length,distinctOrganizingMethods:r.searchCoverage.compatibleMethods.length,stateCompatibility:true,unknownRelationDoesNotDefault:true,newMethodExtension:true,loopAndAlphaEndState:true,noAutomaticWinnerOrTool:true,researchNotPretended:true,screenAndAudioDefaults:true,scope:'Explicit retrieval/state/policy invariants, not fact or visual-quality proof.'},null,2));
