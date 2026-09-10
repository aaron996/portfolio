// Downloads only explicitly named, previously reviewed source-manifest entries.
// Writes completed files atomically outside the production bundle.
const fs = require('node:fs');
const path = require('node:path');
const { Readable, Transform } = require('node:stream');
const { pipeline } = require('node:stream/promises');
const root=path.resolve(__dirname,'..');
const manifest=JSON.parse(fs.readFileSync(path.join(root,'docs/game-audio-audition-sources.json'),'utf8'));
const directory=path.join(root,'output','audio-audition','sources');
const ids=process.argv.slice(2);
if(!ids.length)throw Error('Specify reviewed source IDs, e.g. town-theme magic-town');
const sources=ids.map(id=>{const entry=manifest.sources.find(x=>x.id===id);if(!entry)throw Error('Unknown source '+id);return entry});
async function download(entry){
  if(path.basename(entry.file)!==entry.file)throw Error('Invalid source filename');
  const target=path.join(directory,entry.file),temporary=target+'.part';
  const response=await fetch(entry.url,{signal:AbortSignal.timeout(180000)});
  if(!response.ok||!response.body)throw Error(entry.id+': HTTP '+response.status);
  let bytes=0;
  const counter=new Transform({transform(chunk,encoding,done){bytes+=chunk.length;done(null,chunk)}});
  await pipeline(Readable.fromWeb(response.body),counter,fs.createWriteStream(temporary));
  const expected=Number(response.headers.get('content-length'));
  if(!bytes||(expected&&expected!==bytes))throw Error(entry.id+': incomplete download '+bytes+'/'+expected);
  fs.renameSync(temporary,target);
  console.log(entry.id+': '+bytes+' bytes');
}
fs.mkdirSync(directory,{recursive:true});
Promise.allSettled(sources.map(download)).then(results=>{
  results.forEach((result,i)=>{if(result.status==='rejected'){console.error(ids[i]+': '+result.reason);process.exitCode=1}});
});
