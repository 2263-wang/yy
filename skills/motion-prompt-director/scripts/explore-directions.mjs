#!/usr/bin/env node
import {readFileSync} from 'node:fs';
import {pathToFileURL} from 'node:url';
import {screenPolicy} from './screen-policy.mjs';
import {methodIsFlat,flatQuery} from './flat-policy.mjs';
export const methodLibrary=JSON.parse(readFileSync(new URL('../assets/motion-library/expression-methods.json',import.meta.url),'utf8'));
const modes=['insert','overlay','loop','transition'];
const nonempty=x=>typeof x==='string'&&x.trim().length>0;
function validateMethod(m){
 if(!m||!['id','name','risk','source','query'].every(k=>nonempty(m[k])))throw Error('Method needs id, name, risk, source and query.');
 if(!Array.isArray(m.relations)||!m.relations.length||!m.relations.every(nonempty))throw Error('Method relations must be nonempty strings.');
 if(!Array.isArray(m.conditions)||!m.conditions.length||!m.conditions.every(nonempty))throw Error('Method conditions are required.');
 for(const key of ['entries','middles','exits']){
  if(!Array.isArray(m[key])||!m[key].length||m[key].length>24)throw Error('Each method stage needs 1..24 options.');
  const ids=new Set();
  for(const a of m[key]){
   if(!a||!['id','description','from','to'].every(k=>nonempty(a[k]))||ids.has(a.id))throw Error('Stage needs unique id, description, from and to.');
   ids.add(a.id);
   if(key==='exits'&&(!Array.isArray(a.modes)||!a.modes.length||a.modes.some(v=>!modes.includes(v))))throw Error('Exit modes must be supported delivery modes.');
  }
 }
}
export function explore(input={}){
 const {topic,relations,purpose='opening',duration=8,mode='insert',methods:extra=[],text='brand-only'}=input;
 if(!['brand-only','product-name'].includes(text))throw Error('This flat explorer accepts brand-only or product-name (current user request required); it does not enable general type recipes.');
 if(!nonempty(topic)||topic.length>500)throw Error('topic must contain 1..500 characters.');
 if(!Array.isArray(relations)||!relations.length||relations.length>32||!relations.every(nonempty))throw Error('relations must contain 1..32 nonempty strings.');
 if(!nonempty(purpose)||!Number.isFinite(duration)||duration<=0||!modes.includes(mode))throw Error('Invalid purpose, duration or mode.');
 if(!Array.isArray(extra)||extra.length>64)throw Error('methods must be an array of at most 64 new methods.');
 const requested=[...new Set(relations.map(x=>x.trim()))];
 const all=[...methodLibrary.methods,...extra];const ids=new Set();
 for(const m of all){validateMethod(m);if(ids.has(m.id))throw Error('Duplicate method id: '+m.id);ids.add(m.id);}
 let evaluated=0;const candidates=[],excluded=[],covered=new Set(),compatibleMethods=[];
 for(const m of all){
  if(!methodIsFlat(m)){excluded.push({method:m.id,reason:'Current flat-only policy excludes synthetic/CSS 3D or unclassified rendering. Classify and adapt the actual method; a label cannot prove a flat implementation.'});continue;}
  const matches=requested.filter(r=>m.relations.includes(r));
  if(!matches.length){excluded.push({method:m.id,reason:'No declared relation match; this is retrieval filtering, not an aesthetic rejection.'});continue;}
  let count=0;
  for(const entry of m.entries)for(const middle of m.middles)for(const exit of m.exits){
   if(++evaluated>10000)throw Error('More than 10000 combinations; narrow the method options explicitly. No silent truncation.');
   if(entry.to!==middle.from||middle.to!==exit.from||!exit.modes.includes(mode))continue;
   if(mode==='loop'&&exit.to!==entry.from)continue;
   if(['overlay','transition'].includes(mode)&&exit.to!=='clear')continue;
   candidates.push({id:`${m.id}/${entry.id}/${middle.id}/${exit.id}`,method:m.id,name:m.name,matchedRelations:matches,
    conditions:m.conditions,risk:m.risk,source:m.source,
    stages:[{...entry,role:'opening'},{...middle,role:'middle'},{...exit,role:'exit'}],
    taskAdaptation:'Map actual objects, facts, viewing order and timings; verify the method conditions before accepting this seed.'});count++;
  }
  if(count){compatibleMethods.push(m.id);matches.forEach(r=>covered.add(r));}
  else excluded.push({method:m.id,reason:'No compatible entry-middle-exit state path for this delivery mode.'});
 }
 return {schemaVersion:1,status:candidates.length?'unvalidated-combination-seeds':'extend-methods-or-revise-relations',
  screenPolicy:screenPolicy(text),input:{topic,relations:requested,purpose,duration,mode},selectedCandidateId:null,selectedTool:null,
  searchCoverage:{methodsScanned:all.length,compatibleMethods,combinationsEvaluated:evaluated,seeds:candidates.length,uncoveredRelations:requested.filter(r=>!covered.has(r)),excluded},
  researchPlan:{status:'not-executed',scope:'expression-research-not-product-image-sourcing',topicQueries:[flatQuery(`${topic} 二维 平面MG 图片快切 画面表达 案例`),flatQuery(`${topic} product image sequence match cut`)],
   structureQueries:[...new Set(all.filter(m=>compatibleMethods.includes(m.id)).map(m=>flatQuery(m.query)))],
   instruction:'Actually search and inspect the visual method; reject 3D/CGI product-showcase references even if a title says MG. Keep authentic product images as flat assets. Expand to adjacent topics. Search strings are not research evidence.'},
  candidates,
  next:['Check user constraints and factual conditions; merge cosmetic duplicates and extend methods from observed references.','Compare different organizing methods; build only the frames or motion samples needed to decide.','For each viable direction, map content to visible events and obtainable assets, then compose within-film representations, scale and density under a coherent style; read references/visual-richness.md and references/richness-cases.md. Short or local tasks may stay simple; no effect quota.','Select autonomously using actual evidence across the relevant segments, ask the user only for unresolved meaningful choices.','Choose available tools by the selected design and deliverables, then check real output.'],
  limits:'No web access, free-text understanding, fact verification, visual quality scoring, rendering or automatic winner. Declared state matching cannot prove identity, paths, timing or aesthetics.'};
}
if(process.argv[1]&&pathToFileURL(process.argv[1]).href===import.meta.url){
 try{
  const args={};for(const token of process.argv.slice(2)){
   if(token==='--help'){args.help=true;continue;}
   const m=/^--(input|topic|relations|purpose|duration|mode|text)=(.+)$/.exec(token);if(!m)throw Error('Unknown argument: '+token);args[m[1]]=m[2];
  }
  if(args.help)console.log('node scripts/explore-directions.mjs --topic=产品 --relations=product,identity,sequence --duration=10 --mode=insert\nOr --input=brief.json with topic, relations[], optional purpose/duration/mode/methods[]. Every new method must declare rendering=flat-2d; unclassified/3D methods are excluded. --text=product-name only when the current user requests that name; it does not enable general type recipes. Outputs unvalidated seeds and unexecuted flat-reference queries, not a selected design or video. No narration/TTS.');
  else{
   let input;if(args.input){if(Object.keys(args).length!==1)throw Error('--input cannot be mixed with other arguments.');input=JSON.parse(readFileSync(args.input,'utf8').replace(/^\uFEFF/,''));}
   else{input={...args,relations:args.relations?.split(',').map(x=>x.trim())};if(args.duration!==undefined)input.duration=Number(args.duration);}
   console.log(JSON.stringify(explore(input),null,2));
  }
 }catch(e){console.error(e.message);process.exitCode=1;}
}
