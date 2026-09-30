const test = require('node:test');
const assert = require('node:assert/strict');
const fs = require('node:fs');
const vm = require('node:vm');
const ts = require('typescript');

async function run({auth='Bearer test-secret',key='fake-service-key',dry=false,existing=false,insertError=false}={}) {
  let writes=0, clients=0;
  const query={ select(){return this;}, order(){return this;}, limit(){return this;}, eq(){return this;},
    insert(){writes++; return Promise.resolve({error:insertError?{message:'fake'}:null});},
    then(resolve){return Promise.resolve({data:existing?[{id:1}]:[],count:10,error:null}).then(resolve);} };
  const module={exports:{}};
  const code=ts.transpileModule(fs.readFileSync('app/api/cron/ingest/route.ts','utf8'),
    {compilerOptions:{module:ts.ModuleKind.CommonJS,target:ts.ScriptTarget.ES2022,esModuleInterop:true}}).outputText;
  const context={module,exports:module.exports,Date,console:{info(){},error(){}},
    process:{env:{SUPABASE_SERVICE_KEY:key,CRON_SECRET:'test-secret'}},
    require(name){
      if(name==='next/server') return {NextResponse:{json:(body,opts={})=>({body,status:opts.status||200})}};
      if(name==='@supabase/supabase-js') return {createClient(){clients++;return {from(){return query;}};}};
      if(name.includes('ingest-budget')) return {fetchWithinBudget:async()=>new Response('<rss><item><title>Example source article title</title><link>https://example.invalid</link></item></rss>')};
      if(name==='crypto') return require('node:crypto');
      throw new Error('Unexpected dependency '+name);
    }};
  vm.runInNewContext(code,context);
  const response=await module.exports.GET({headers:{get(){return auth;}},
    nextUrl:new URL('https://example.invalid/api/cron/ingest'+(dry?'?dry_run=1':''))});
  return {response,writes,clients};
}
test('unauthorized requests do not access database',async()=>{
  const r=await run({auth:'wrong'});assert.equal(r.response.status,401);assert.equal(r.clients,0);
});
test('missing service key does not access database',async()=>{
  const r=await run({key:''});assert.equal(r.response.status,500);assert.equal(r.clients,0);
});
test('dry run performs no writes',async()=>{
  const r=await run({dry:true});assert.equal(r.writes,0);assert.equal(r.response.body.dryRun,true);
});
test('existing items are not inserted',async()=>{
  const r=await run({existing:true});assert.equal(r.writes,0);assert.equal(r.response.body.skipped,12);
});
test('normal ingestion preserves twelve independent sources',async()=>{
  const r=await run();assert.equal(r.writes,12);assert.equal(r.response.body.inserted,12);assert.equal(r.response.body.success,true);
});
test('database errors do not claim success',async()=>{
  const r=await run({insertError:true});assert.equal(r.response.body.success,false);assert.equal(r.response.body.errors,12);
});
