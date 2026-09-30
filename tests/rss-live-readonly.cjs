// Fetch public RSS only; no database, credentials or write operations.
const fs=require('node:fs');
const vm=require('node:vm');
const ts=require('typescript');
const compile=path=>ts.transpileModule(fs.readFileSync(path,'utf8'),{
  compilerOptions:{module:ts.ModuleKind.CommonJS,target:ts.ScriptTarget.ES2022,esModuleInterop:true},
}).outputText;
const budget={exports:{}};
vm.runInNewContext(compile('lib/ingest-budget.ts'),{module:budget,exports:budget.exports,
  fetch,Response,AbortSignal,AbortController,Date,setTimeout,clearTimeout});
const rss={exports:{}};
vm.runInNewContext(compile('lib/rss.ts'),{module:rss,exports:rss.exports,Date,Buffer,console,
  require(name){if(name==='./ingest-budget')return budget.exports;return require(name);}});
const started=Date.now();
rss.exports.fetchAllFeedsSnapshot().then(snapshot=>{
  const openAIItems=snapshot.data.filter(item=>item.source==='OpenAI Blog').length;
  console.log(JSON.stringify({durationMs:Date.now()-started,count:snapshot.data.length,
    availableSources:snapshot.availableSources,unavailableSources:snapshot.unavailableSources,
    stale:snapshot.stale,openAIItems}));
  if(snapshot.stale || openAIItems===0)process.exitCode=1;
}).catch(()=>{console.error('Public RSS verification failed');process.exitCode=1;});
