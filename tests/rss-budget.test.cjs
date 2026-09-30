const test=require('node:test');
const assert=require('node:assert/strict');
const fs=require('node:fs');
const vm=require('node:vm');
const ts=require('typescript');

function load(fail=false){
  let calls=0;
  const state={fail,invalid:false,partial:false,offset:0};
  class Clock extends Date { static now(){return Date.now()+state.offset;} }
  const mod={exports:{}};
  const code=ts.transpileModule(fs.readFileSync('lib/rss.ts','utf8'),{
    compilerOptions:{module:ts.ModuleKind.CommonJS,target:ts.ScriptTarget.ES2022,esModuleInterop:true},
  }).outputText;
  vm.runInNewContext(code,{module:mod,exports:mod.exports,Date:Clock,Buffer,console:{error(){},warn(){}},
    require(name){
      if(name==='./ingest-budget') return {async fetchWithinBudget(url,init,deadline,timeout){
        calls++;assert.equal(timeout,10000);assert.ok(deadline<=Clock.now()+10000);
        if(state.fail || (state.partial && url.includes('anthropic.com')))throw new Error('upstream unavailable');
        if(state.invalid)return new Response('<html>Upstream error page</html>');
        return new Response('<rss><item><title>Bitcoin market update</title><link>https://example.invalid/article</link><description>Product test</description><pubDate>Wed, 30 Sep 2026 10:00:00 GMT</pubDate></item></rss>');
      }};
      return require(name);
    }});
  return {api:mod.exports,calls:()=>calls,state};
}
test('every public RSS source uses body-aware bounded fetch; warm cache avoids network',async()=>{
  const r=load();const first=await r.api.fetchAllFeeds();
  assert.equal(r.calls(),12);assert.equal(first.length,12);
  const second=await r.api.fetchAllFeeds();assert.equal(second,first);assert.equal(r.calls(),12);
});
test('failed sources do not hang or discard the handler response',async()=>{
  const r=load(true);const feeds=await r.api.fetchAllFeeds();assert.equal(feeds.length,0);assert.equal(r.calls(),12);
});
test('concurrent visitors share one refresh',async()=>{
  const r=load();await Promise.all(Array.from({length:8},()=>r.api.fetchAllFeeds()));
  assert.equal(r.calls(),12);
});
test('partial failures report the actual unavailable source',async()=>{
  const r=load();r.state.partial=true;const result=await r.api.fetchAllFeedsSnapshot();
  assert.equal(result.availableSources,11);assert.equal(result.partial,true);
  assert.deepEqual(Array.from(result.unavailableSources),['Anthropic']);assert.equal(result.stale,false);
});
test('total outage preserves last-known data and its original timestamp',async()=>{
  const r=load();const healthy=await r.api.fetchAllFeedsSnapshot();
  r.state.offset=300001;r.state.fail=true;
  const stale=await r.api.fetchAllFeedsSnapshot();
  assert.equal(stale.data,healthy.data);assert.equal(stale.timestamp,healthy.timestamp);
  assert.equal(stale.stale,true);assert.equal(stale.availableSources,0);
  assert.equal(stale.unavailableSources.length,12);
  await r.api.fetchAllFeedsSnapshot();assert.equal(r.calls(),24);
  r.state.offset+=30001;r.state.fail=false;
  const recovered=await r.api.fetchAllFeedsSnapshot();assert.equal(recovered.stale,false);
  assert.equal(recovered.availableSources,12);assert.equal(r.calls(),36);
});
test('HTML error pages with status 200 are not counted as valid RSS',async()=>{
  const r=load();r.state.invalid=true;const result=await r.api.fetchAllFeedsSnapshot();
  assert.equal(result.availableSources,0);assert.equal(result.stale,true);
});
