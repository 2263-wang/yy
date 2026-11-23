#!/usr/bin/env node
import assert from 'node:assert/strict';
import {spawnSync} from 'node:child_process';
import {fileURLToPath} from 'node:url';
import {screenPolicy,TEXT_ACTIONS,TEXT_RECIPES} from './screen-policy.mjs';
import {selectLanguage,toPrompt} from './select-language.mjs';
import {explore,methodLibrary} from './explore-directions.mjs';
const brief={topic:'iPhone Duo',relations:['product','identity','sequence'],duration:10};
const r=explore(brief);
for(const id of ['image-montage','brand-product-handoff','flat-footage-bridge'])assert(r.searchCoverage.compatibleMethods.includes(id));
assert.equal(r.selectedCandidateId,null);assert.equal(r.selectedTool,null);
for(const policy of [screenPolicy(),screenPolicy('product-name'),screenPolicy('explicit'),r.screenPolicy]){
 assert.equal(policy.rendering.mode,'flat-2d');assert.equal(policy.rendering.synthetic3D,false);assert.equal(policy.rendering.css3D,false);
 assert.equal(policy.narration,'off');assert.equal(policy.ttsForTiming,false);
}
assert.deepEqual(screenPolicy('product-name').allowedText,['native-logo-wordmarks','explicitly-requested-real-product-name']);
assert.equal(screenPolicy('product-name').textOverrideRequiresCurrentUserRequest,true);
for(const content of ['product','icons','photos','transition']){
 const s=selectLanguage({content,text:'product-name'});
 assert(s.actionHints.every(a=>!TEXT_ACTIONS.has(a.id)&&a.id!=='T08'));
 assert(s.recipeHints.every(a=>!TEXT_RECIPES.has(a.id)));
 assert.equal(s.screenPolicy.rendering.css3D,false);
 assert(toPrompt(s).includes(s.screenPolicy.rendering.note));
}
const base=structuredClone(methodLibrary.methods[0]);base.id='blocked-method';base.relations=['only-custom'];
for(const mode of ['synthetic-3d','css-3d','unclassified',undefined]){
 const m=structuredClone(base);if(mode===undefined)delete m.rendering;else m.rendering=mode;
 const s=explore({...brief,relations:['only-custom'],methods:[m]});assert.equal(s.candidates.length,0);assert.deepEqual(s.searchCoverage.uncoveredRelations,['only-custom']);
 assert(s.searchCoverage.excluded.some(x=>x.method===m.id));
}
base.rendering='flat-2d';assert(explore({...brief,relations:['only-custom'],methods:[base]}).candidates.length>0);
for(const q of [...r.researchPlan.topicQueries,...r.researchPlan.structureQueries]){
 assert(q.includes('2D'));assert(q.includes('-3D'));assert(q.includes('-CGI'));
}
assert.equal(r.researchPlan.scope,'expression-research-not-product-image-sourcing');assert.equal(r.researchPlan.status,'not-executed');
const name=explore({...brief,text:'product-name'});assert.equal(name.screenPolicy.text,'product-name');assert.equal(name.screenPolicy.narration,'off');
const cli=fileURLToPath(new URL('./explore-directions.mjs',import.meta.url));
const result=spawnSync(process.execPath,[cli,'--topic=iPhone Duo','--relations=product,identity,sequence','--text=product-name'],{encoding:'utf8',maxBuffer:8*1024*1024});
assert.equal(result.status,0,result.stderr);assert.equal(JSON.parse(result.stdout).screenPolicy.text,'product-name');
console.log(JSON.stringify({status:'pass',flatOnlyAcrossTextModes:true,unclassifiedAnd3DMethodsExcluded:true,purposefulMontageAndBrandHandoffAvailable:true,productNameDoesNotEnableTypeRecipes:true,referenceQueriesRestrictedWithoutBanningProductImages:true,noAutomaticWinnerOrTool:true,narrationAndTTSStillOff:true,scope:'Declared selector policies, not proof of rendered pixels, source identity or third-party compliance.'},null,2));
