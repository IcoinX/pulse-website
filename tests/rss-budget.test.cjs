const test=require('node:test');
const assert=require('node:assert/strict');
const fs=require('node:fs');
const vm=require('node:vm');
const ts=require('typescript');

function load(fail=false){
  let calls=0;
  const mod={exports:{}};
  const code=ts.transpileModule(fs.readFileSync('lib/rss.ts','utf8'),{
    compilerOptions:{module:ts.ModuleKind.CommonJS,target:ts.ScriptTarget.ES2022,esModuleInterop:true},
  }).outputText;
  vm.runInNewContext(code,{module:mod,exports:mod.exports,Date,Buffer,console:{error(){},warn(){}},
    require(name){
      if(name==='./ingest-budget') return {async fetchWithinBudget(url,init,deadline,timeout){
        calls++;assert.equal(timeout,10000);assert.ok(deadline<=Date.now()+10000);
        if(fail)throw new Error('upstream unavailable');
        return new Response('<rss><item><title>Bitcoin market update</title><link>https://example.invalid/article</link><description>Product test</description><pubDate>Wed, 30 Sep 2026 10:00:00 GMT</pubDate></item></rss>');
      }};
      return require(name);
    }});
  return {api:mod.exports,calls:()=>calls};
}
test('every public RSS source uses body-aware bounded fetch; warm cache avoids network',async()=>{
  const r=load();const first=await r.api.fetchAllFeeds();
  assert.equal(r.calls(),12);assert.equal(first.length,12);
  const second=await r.api.fetchAllFeeds();assert.equal(second,first);assert.equal(r.calls(),12);
});
test('failed sources do not hang or discard the handler response',async()=>{
  const r=load(true);const feeds=await r.api.fetchAllFeeds();assert.equal(feeds.length,0);assert.equal(r.calls(),12);
});
