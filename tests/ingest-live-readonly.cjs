// Real RSS and database reads, never an INSERT. No credential values are logged.
const fs = require('node:fs');
const vm = require('node:vm');
const ts = require('typescript');
if (!process.env.SUPABASE_SERVICE_KEY) throw new Error('Database credential unavailable');
const compile = path => ts.transpileModule(fs.readFileSync(path,'utf8'), {
  compilerOptions:{module:ts.ModuleKind.CommonJS,target:ts.ScriptTarget.ES2022,esModuleInterop:true},
}).outputText;
const budget={exports:{}};
vm.runInNewContext(compile('lib/ingest-budget.ts'), {module:budget,exports:budget.exports,
  fetch,Response,AbortSignal,AbortController,Date,setTimeout,clearTimeout});
const route={exports:{}};
vm.runInNewContext(compile('app/api/cron/ingest/route.ts'), {module:route,exports:route.exports,
  Date,console,process,require(name){
    if(name.includes('ingest-budget')) return budget.exports;
    return require(name);
  }});
route.exports.GET({headers:{get:()=> process.env.CRON_SECRET ? 'Bearer '+process.env.CRON_SECRET : null},
  nextUrl:new URL('https://local.invalid/api/cron/ingest?dry_run=1')}).then(async response=>{
    const body=await response.json();
    console.log(JSON.stringify({status:response.status,success:body.success,dryRun:body.dryRun,
      durationMs:body.durationMs,inserted:body.inserted,skipped:body.skipped,errors:body.errors,
      incomplete:body.incomplete,totalEvents:body.totalEvents}));
    if(response.status!==200 || !body.success || !body.dryRun || body.inserted!==0) process.exitCode=1;
  }).catch(()=>{console.error('Read-only integration check failed');process.exitCode=1;});
