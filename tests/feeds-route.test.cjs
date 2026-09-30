const test=require('node:test');
const assert=require('node:assert/strict');
const fs=require('node:fs');
const vm=require('node:vm');
const ts=require('typescript');
async function run({available=12,stale=false,fail=false}={}){
  const mod={exports:{}};
  const code=ts.transpileModule(fs.readFileSync('app/api/feeds/route.ts','utf8'),{
    compilerOptions:{module:ts.ModuleKind.CommonJS,target:ts.ScriptTarget.ES2022,esModuleInterop:true},
  }).outputText;
  vm.runInNewContext(code,{module:mod,exports:mod.exports,Date,console:{error(){}},
    require(name){
      if(name==='next/server')return {NextResponse:{json:(body,options)=>({body,...options})}};
      if(name==='@/lib/rss')return {async fetchAllFeedsSnapshot(){
        if(fail)throw new Error('sensitive-upstream-details');
        return {data:[{title:'Cached article'}],timestamp:1700000000000,checkedAt:1700000001000,
          availableSources:available,unavailableSources:available<12?['Example source']:[],
          partial:available<12,stale};
      }};
      throw new Error('Unexpected dependency '+name);
    }});
  return mod.exports.GET();
}
test('healthy response retains the data array and caching',async()=>{
  const r=await run();assert.equal(r.status,200);assert.equal(r.body.success,true);
  assert.equal(r.body.count,1);assert.match(r.headers['Cache-Control'],/s-maxage=300/);
});
test('partial response explicitly reports missing coverage',async()=>{
  const r=await run({available:11});assert.equal(r.status,200);
  assert.equal(r.body.health.partial,true);assert.equal(r.body.health.availableSources,11);
});
test('complete outage is 503, stale, and never cached by the CDN',async()=>{
  const r=await run({available:0,stale:true});assert.equal(r.status,503);
  assert.equal(r.body.success,false);assert.equal(r.body.health.stale,true);
  assert.equal(r.body.count,1);assert.equal(r.headers['Cache-Control'],'no-store');
  assert.equal(r.body.timestamp,'2023-11-14T22:13:20.000Z');
});
test('unexpected exceptions do not leak upstream details',async()=>{
  const r=await run({fail:true});assert.equal(r.status,500);
  assert.equal(JSON.stringify(r.body).includes('sensitive-upstream-details'),false);
  assert.equal(r.headers['Cache-Control'],'no-store');
});
test('static routing cannot override the outage cache policy',()=>{
  const configuration=JSON.parse(fs.readFileSync('vercel.json','utf8'));
  assert.equal(configuration.headers.some(rule=>rule.source==='/api/feeds'),false);
});
