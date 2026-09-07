function cfg(){const url=process.env.IDLE_KV_REST_API_URL||process.env.IDLE_KV_KV_REST_API_URL||process.env.KV_REST_API_URL||process.env.UPSTASH_REDIS_REST_URL;const token=process.env.IDLE_KV_REST_API_TOKEN||process.env.IDLE_KV_KV_REST_API_TOKEN||process.env.KV_REST_API_TOKEN||process.env.UPSTASH_REDIS_REST_TOKEN;return url&&token?{url:url.replace(/\/$/,""),token}:null;}
async function cmd(parts){const c=cfg();if(!c)throw new Error("Persistent store not configured");const r=await fetch(c.url,{method:"POST",headers:{Authorization:`Bearer ${c.token}`,"Content-Type":"application/json"},body:JSON.stringify(parts),cache:"no-store"});const d=await r.json().catch(()=>({}));if(!r.ok||d?.error)throw new Error(d?.error||"Store request failed");return d?.result;}
const gameKey=u=>`idle:test:game:v4:${u}`,boostKey=(u,e)=>`idle:test:boost:${u}:${e}`,payKey=p=>`idle:test:payment:${p}`,rewardKey=(u,e)=>`idle:test:reward:${u}:${e}`,rewardLockKey=(u,e)=>`idle:test:reward-lock:${u}:${e}`,paymentLockKey=p=>`idle:test:payment-lock:${p}`;
function configured(){return !!cfg();}
async function claimPayment(uid,id){const x=await cmd(["SET",payKey(id),uid,"NX"]);if(x==="OK")return;const owner=await cmd(["GET",payKey(id)]);if(owner!==uid)throw new Error("Payment already belongs to another account");}
async function acquirePaymentLock(id){const token=`${Date.now()}:${Math.random().toString(36).slice(2)}`;const x=await cmd(["SET",paymentLockKey(id),token,"NX","EX",120]);return x==="OK"?token:null;}
async function releasePaymentLock(id,token){const key=paymentLockKey(id);if((await cmd(["GET",key]))===token)await cmd(["DEL",key]);}
async function hasBoost(uid,era){return configured()&&(await cmd(["GET",boostKey(uid,era)]))==="1";}
async function grantBoost(uid,era,id){await claimPayment(uid,id);await cmd(["SET",boostKey(uid,era),"1"]);}
async function getGame(uid){if(!configured())return null;const raw=await cmd(["GET",gameKey(uid)]);if(!raw)return null;try{return JSON.parse(raw)}catch{return null}}
async function saveGame(uid,state){await cmd(["SET",gameKey(uid),JSON.stringify(state)]);return state;}
async function acquireRewardLock(uid,era){const token=`${Date.now()}:${Math.random().toString(36).slice(2)}`;const x=await cmd(["SET",rewardLockKey(uid,era),token,"NX","EX",180]);return x==="OK"?token:null;}
async function releaseRewardLock(uid,era,token){const key=rewardLockKey(uid,era);if((await cmd(["GET",key]))===token)await cmd(["DEL",key]);}
async function setReward(uid,era,value){await cmd(["SET",rewardKey(uid,era),JSON.stringify(value)]);}
async function getReward(uid,era){if(!configured())return null;const raw=await cmd(["GET",rewardKey(uid,era)]);if(!raw)return null;try{return JSON.parse(raw)}catch{return {status:String(raw)}}}
module.exports={configured,claimPayment,acquirePaymentLock,releasePaymentLock,hasBoost,grantBoost,getGame,saveGame,acquireRewardLock,releaseRewardLock,setReward,getReward};