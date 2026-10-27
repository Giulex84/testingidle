const {test}=require('node:test');
const assert=require('node:assert/strict');
const {RedisModel}=require('./redis-model.cjs');
process.env.UPSTASH_REDIS_REST_URL='https://redis.test.invalid';
process.env.UPSTASH_REDIS_REST_TOKEN='dummy-test-token';
const store=require('../lib/store');
const engine=require('../lib/game-engine');
require('../lib/metrics').safeRecordMetric=async()=>false;
const auth=require('../api/auth');
const game=require('../api/game');
const key='idle:test:game:v4:alice';

async function isolated(fn){const db=new RedisModel(),restore=db.install();try{await fn(db)}finally{restore()}}
function response(){return {statusCode:200,setHeader(){},status(n){this.statusCode=n;return this;},json(data){this.data=data;return this;}}}

test('two writers cannot replace newer realm progress',()=>isolated(async db=>{
  db.string(key,JSON.stringify(engine.fresh()));
  const a=await store.getGameSnapshot('alice'),b=await store.getGameSnapshot('alice');
  a.state.production=500;b.state.production=33;
  await store.saveGame('alice',a.state,a.raw);
  await assert.rejects(store.saveGame('alice',b.state,b.raw),e=>e.status===409);
  assert.equal(JSON.parse(db.get(key)).production,500);
}));

test('simultaneous first login does not replace the first created realm',()=>isolated(async db=>{
  const a=await store.getGameSnapshot('alice'),b=await store.getGameSnapshot('alice');
  const first=engine.fresh();first.production=41;
  await store.saveGame('alice',first,a.raw);
  await assert.rejects(store.saveGame('alice',engine.fresh(),b.raw),e=>e.status===409);
  assert.equal(JSON.parse(db.get(key)).production,41);
}));

test('corrupt, empty and unsupported-version records are preserved',()=>isolated(async db=>{
  for(const raw of ['{broken','',JSON.stringify({v:3,production:900}),'null','[]']){
    db.string(key,raw);
    await assert.rejects(store.getGameSnapshot('alice'),e=>e.status===503);
    assert.equal(db.get(key),raw);
  }
  assert.equal(db.calls.filter(c=>c[0]==='EVAL').length,0);
}));

test('lost commit response can be retried with the same snapshot and payload',()=>isolated(async db=>{
  db.string(key,JSON.stringify(engine.fresh()));
  const snapshot=await store.getGameSnapshot('alice');snapshot.state.production=88;
  db.afterEval=()=>{db.afterEval=null;throw Error('simulated lost response');};
  await assert.rejects(store.saveGame('alice',snapshot.state,snapshot.raw));
  const committed=db.get(key);
  await store.saveGame('alice',snapshot.state,snapshot.raw);
  assert.equal(db.get(key),committed);
}));

test('explicit snapshot supports a replacement object from restart',()=>isolated(async db=>{
  const old=engine.fresh();old.production=800;db.string(key,JSON.stringify(old));
  const snapshot=await store.getGameSnapshot('alice'),restarted=engine.fresh();
  await store.saveGame('alice',restarted,snapshot.raw);
  assert.equal(JSON.parse(db.get(key)).production,restarted.production);
  await assert.rejects(store.saveGame('alice',restarted),/Missing realm snapshot/);
}));

test('login, polling and action endpoints refuse a concurrent overwrite',()=>isolated(async db=>{
  const redisFetch=global.fetch;
  global.fetch=async(url,options)=>String(url)==='https://api.minepi.com/v2/me'
    ? {ok:true,json:async()=>({uid:'alice',username:'Alice'})}:redisFetch(url,options);
  for(const [handler,method,body]of [[auth,'POST',{}],[game,'GET',{}],[game,'POST',{type:'policy',policy:'order'}]]){
    db.string(key,JSON.stringify(engine.fresh()));
    db.beforeEval=()=>{
      db.beforeEval=null;
      const newer=engine.fresh();newer.production=999;newer.policy='innovation';
      db.string(key,JSON.stringify(newer));
    };
    const res=response();await handler({method,body,headers:{authorization:'Bearer dummy'}},res);
    assert.equal(res.statusCode,409);
    assert.equal(JSON.parse(db.get(key)).production,999);
    assert.equal(JSON.parse(db.get(key)).policy,'innovation');
  }
}));
