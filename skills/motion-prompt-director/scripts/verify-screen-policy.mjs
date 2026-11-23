import assert from 'node:assert/strict';
import {spawnSync} from 'node:child_process';
import {fileURLToPath} from 'node:url';
import {selectLanguage,toPrompt} from './select-language.mjs';
import {TEXT_ACTIONS,TEXT_RECIPES} from './screen-policy.mjs';
const icon=selectLanguage({content:'icons',objects:16});
assert.equal(icon.screenPolicy.text,'brand-only');
assert.equal(icon.screenPolicy.narration,'off');assert.equal(icon.screenPolicy.ttsForTiming,false);
assert(icon.actionHints.every(a=>!TEXT_ACTIONS.has(a.id)));
for(const content of ['mechanism','data','map','brand']){
 const r=selectLanguage({content});assert(r.actionHints.every(a=>!TEXT_ACTIONS.has(a.id)));
 assert(r.recipeHints.every(a=>!TEXT_RECIPES.has(a.id)));
}
const blocked=selectLanguage({content:'text'});assert.equal(blocked.conceptCandidates.length,0);assert.equal(blocked.status,'text-language-requires-explicit-user-request');
const explicit=selectLanguage({content:'text',text:'explicit'});assert.equal(explicit.conceptCandidates.length,2);assert(explicit.actionHints.some(a=>TEXT_ACTIONS.has(a.id)));assert.equal(explicit.screenPolicy.narration,'off');
assert.throws(()=>selectLanguage({content:'icons',text:'all'}));
const cli=fileURLToPath(new URL('./select-motion.mjs',import.meta.url));
const run=args=>spawnSync(process.execPath,[cli,...args],{encoding:'utf8'});
for(const goal of ['text','ranking','evidence']){
 assert.equal(run(['--assets=0','--goal='+goal]).status,1);
 const r=run(['--assets=0','--goal='+goal,'--text=explicit']);assert.equal(r.status,0,r.stderr);assert.equal(JSON.parse(r.stdout).screenPolicy.narration,'off');
}
const regular=JSON.parse(run(['--assets=3']).stdout);assert(regular.actions.every(a=>!TEXT_ACTIONS.has(a.id)));assert.equal(regular.screenPolicy.text,'brand-only');
assert(toPrompt(icon).startsWith(icon.screenPolicy.note));
console.log(JSON.stringify({status:'pass',defaultBrandWordmarksOnly:true,textActionsExcluded:true,textRecipesRequireExplicitFlag:true,semanticTypeNotAutoEnabled:true,narrationOffIncludingExplicitText:true,ttsForTimingOff:true,scope:'selector-policy-not-pixel-or-aesthetic-proof'},null,2));
