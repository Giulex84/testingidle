const ERAS=["foundations","bronze","iron"];
const ERA_INDEX={foundations:0,bronze:1,iron:2};
const SLOTS={foundations:9,bronze:12,iron:15};
const COST={settlement:18,workshop:24,council:34,mine:30,farm:22,library:38};
const ICON={settlement:"🏠",workshop:"⚒️",council:"🏛️",mine:"⛏️",farm:"🌾",library:"📚"};
const ACTION_COOLDOWN_MS=1800;
const MAX_OFFLINE_SECONDS=7200;
const EVENTS=[
  {id:"harvest",title:"A generous harvest",text:"Farmers report an unexpected surplus.",choices:[
    {id:"store",label:"Store reserves",effects:{food:22,stability:3},note:"Food reserves secured."},
    {id:"feast",label:"Hold a public feast",effects:{food:-8,stability:9,pop:2},note:"The realm celebrates together."}
  ]},
  {id:"caravan",title:"A merchant caravan",text:"Traders offer tools in exchange for supplies.",choices:[
    {id:"trade",label:"Trade supplies",effects:{food:-12,production:28},note:"New tools accelerate production."},
    {id:"tax",label:"Collect passage tax",effects:{production:12,stability:-3},note:"The treasury grows, but merchants grumble."}
  ]},
  {id:"dispute",title:"A guild dispute",text:"Craftsmen and settlers demand a ruling.",choices:[
    {id:"mediate",label:"Mediate fairly",effects:{stability:8,production:-8},note:"A slower day, but trust improves."},
    {id:"favorGuild",label:"Favor the guild",effects:{production:20,stability:-7},note:"Output rises while resentment spreads."}
  ]},
  {id:"frontier",title:"Frontier opportunity",text:"Scouts find fertile land beyond the walls.",choices:[
    {id:"settle",label:"Support settlers",effects:{food:-15,pop:4,stability:-4},note:"New families expand the realm."},
    {id:"survey",label:"Survey first",effects:{knowledge:10,stability:2},note:"Careful maps reveal future opportunities."}
  ]},
  {id:"scholar",title:"A wandering scholar",text:"A scholar offers knowledge in exchange for patronage.",choices:[
    {id:"sponsor",label:"Sponsor research",effects:{production:-15,knowledge:16},note:"New ideas spread through the city."},
    {id:"decline",label:"Decline politely",effects:{stability:1},note:"Resources remain focused on the present."}
  ]}
];

function fresh(){return {v:4,era:"foundations",pop:12,production:32,bronze:0,food:24,knowledge:0,stability:88,buildings:["workshop"],councilLv:0,policy:"balanced",completedEras:[],eraStartedAt:Date.now(),lastTick:Date.now(),lastAction:0,nextEventAt:Date.now()+45000,pendingEvent:null,eventSeq:0,events:["Kingdom founded. Your council awaits direction."],updatedAt:Date.now()};}
function clamp(s){s.pop=Math.max(0,Math.min(1e6,s.pop));s.production=Math.max(0,Math.min(1e9,s.production));s.bronze=Math.max(0,Math.min(1e9,s.bronze));s.food=Math.max(0,Math.min(1e9,s.food));s.knowledge=Math.max(0,Math.min(1e9,s.knowledge));s.stability=Math.max(0,Math.min(100,s.stability));return s;}
function counts(s){const c={};for(const b of s.buildings)c[b]=(c[b]||0)+1;return c;}
function policyMods(policy){if(policy==="growth")return {prod:1.12,food:0.92,stab:-0.012};if(policy==="order")return {prod:0.92,food:1,stab:0.026};if(policy==="innovation")return {prod:1.02,food:0.96,stab:-0.005,knowledge:1.45};return {prod:1,food:1,stab:0.008,knowledge:1};}
function rates(s,hasBoost=false){const c=counts(s),p=policyMods(s.policy);let prod=(c.workshop||0)*0.28+(c.library||0)*0.06;let food=(c.farm||0)*0.24-(s.pop*0.004);let bronze=(c.mine||0)*0.075;let knowledge=(c.library||0)*0.11;let stab=0.008-(c.mine||0)*0.018-(c.workshop||0)*0.006+(c.council||0)*0.012;
  prod*=p.prod;food*=p.food;knowledge*=p.knowledge||1;stab+=p.stab||0;
  if(s.councilLv===1)stab+=0.01;if(s.councilLv===2)stab+=0.02;if(s.councilLv===3)stab+=0.03;
  if(hasBoost)stab+=0.018;
  if(s.food<=1)stab-=0.045;
  return {production:prod,food,bronze,knowledge,stability:stab};}
function pushLog(s,msg){s.events=[msg,...(s.events||[])].slice(0,12);}
function maybeEvent(s,now){if(s.pendingEvent||now<s.nextEventAt)return;const ev=EVENTS[s.eventSeq%EVENTS.length];s.pendingEvent={id:ev.id,title:ev.title,text:ev.text,choices:ev.choices.map(c=>({id:c.id,label:c.label}))};s.eventSeq++;s.nextEventAt=now+70000+((s.eventSeq%3)*15000);pushLog(s,`Event: ${ev.title}`);}
function advance(s,now=Date.now(),hasBoost=false){if(!s||s.v!==4)s=fresh();const from=Number(s.lastTick)||now;const secs=Math.max(0,Math.min(MAX_OFFLINE_SECONDS,(now-from)/1000));if(secs>0){const r=rates(s,hasBoost);s.production+=r.production*secs;s.food+=r.food*secs;s.bronze+=r.bronze*secs;s.knowledge+=r.knowledge*secs;s.stability+=r.stability*secs;if(s.food<=0){s.food=0;s.pop=Math.max(4,s.pop-(0.012*secs));}s.lastTick=now;clamp(s);}maybeEvent(s,now);s.updatedAt=now;return s;}
function objectives(s){const c=counts(s);if(s.era==="foundations")return [
  {id:"settle",label:"Build 3 Settlements",done:(c.settlement||0)>=3},
  {id:"work",label:"Reach 80 Production",done:s.production>=80},
  {id:"council",label:"Establish the Council",done:s.councilLv>=1},
  {id:"stable",label:"Keep Stability at 65%+",done:s.stability>=65}
];if(s.era==="bronze")return [
  {id:"mine",label:"Operate 2 Mines",done:(c.mine||0)>=2},
  {id:"bronze",label:"Stockpile 90 Bronze",done:s.bronze>=90},
  {id:"council2",label:"Upgrade to Council II",done:s.councilLv>=2},
  {id:"knowledge",label:"Reach 35 Knowledge",done:s.knowledge>=35}
];return [
  {id:"pop",label:"Reach Population 48",done:s.pop>=48},
  {id:"knowledge",label:"Reach 100 Knowledge",done:s.knowledge>=100},
  {id:"council3",label:"Upgrade to Council III",done:s.councilLv>=3},
  {id:"stable",label:"Keep Stability at 72%+",done:s.stability>=72}
];}
function summary(s,hasBoost=false){return {...s,rates:rates(s,hasBoost),objectives:objectives(s),slots:SLOTS[s.era],costs:COST,canAdvance:objectives(s).every(o=>o.done)};}
function requireAction(s){const wait=ACTION_COOLDOWN_MS-(Date.now()-(Number(s.lastAction)||0));if(wait>0){const e=new Error(`Council is busy. Try again in ${Math.ceil(wait/1000)}s.`);e.status=429;throw e;}}
function spend(s,key,amount){if(s[key]<amount){const e=new Error(`Not enough ${key}.`);e.status=409;throw e;}s[key]-=amount;}
function applyEffects(s,effects){for(const[k,v]of Object.entries(effects||{})){if(k==="production")s.production+=v;else if(k==="stability")s.stability+=v;else if(k in s&&typeof s[k]==="number")s[k]+=v;}clamp(s);}
function action(s,input){requireAction(s);const type=input?.type;s.lastAction=Date.now();if(type==="build"){const b=input.building;if(!ICON[b]||!["settlement","workshop","council","mine","farm","library"].includes(b))throw new Error("Unknown building");if(s.buildings.length>=SLOTS[s.era]){const e=new Error("No free city slots.");e.status=409;throw e;}if(b==="mine"&&s.era==="foundations")throw new Error("Mines unlock in the Bronze Age.");if(b==="library"&&s.era==="foundations")throw new Error("Libraries unlock in the Bronze Age.");if(b==="council"&&s.councilLv>0)throw new Error("Council already established.");spend(s,"production",COST[b]);s.buildings.push(b);if(b==="settlement"){s.pop+=5;s.food+=4;s.stability-=4;}if(b==="council"){s.councilLv=1;s.stability+=8;}pushLog(s,`${ICON[b]} ${b[0].toUpperCase()+b.slice(1)} built.`);
  }else if(type==="remove"){const i=Math.trunc(Number(input.index));const b=s.buildings[i];if(!b)throw new Error("Nothing to remove.");if(b==="workshop"&&counts(s).workshop<=1)throw new Error("Your realm needs at least one Workshop.");s.buildings.splice(i,1);if(b==="settlement")s.pop=Math.max(4,s.pop-5);if(b==="council")s.councilLv=0;pushLog(s,`${ICON[b]||"🏚️"} ${b} removed.`);
  }else if(type==="upgradeCouncil"){if(s.councilLv===1&&s.era!=="foundations"){spend(s,"bronze",38);s.councilLv=2;s.stability+=5;pushLog(s,"Council II established.");}else if(s.councilLv===2&&s.era==="iron"){spend(s,"bronze",72);spend(s,"knowledge",35);s.councilLv=3;s.stability+=6;pushLog(s,"Council III established.");}else throw new Error("Council upgrade is not available yet.");
  }else if(type==="policy"){if(!["balanced","growth","order","innovation"].includes(input.policy))throw new Error("Unknown policy.");s.policy=input.policy;pushLog(s,`Policy changed to ${input.policy}.`);
  }else if(type==="event"){if(!s.pendingEvent)throw new Error("No event is awaiting a decision.");const def=EVENTS.find(e=>e.id===s.pendingEvent.id),choice=def?.choices.find(c=>c.id===input.choice);if(!choice)throw new Error("Invalid event choice.");applyEffects(s,choice.effects);pushLog(s,choice.note);s.pendingEvent=null;
  }else if(type==="advanceEra"){if(!objectives(s).every(o=>o.done)){const e=new Error("Era objectives are not complete.");e.status=409;throw e;}if(s.era==="foundations"){spend(s,"production",65);s.completedEras=[...new Set([...s.completedEras,"foundations"])];s.era="bronze";s.production=Math.max(s.production,30);s.bronze=0;s.knowledge=0;s.eraStartedAt=Date.now();pushLog(s,"The Bronze Age begins.");}else if(s.era==="bronze"){spend(s,"bronze",90);s.completedEras=[...new Set([...s.completedEras,"bronze"])];s.era="iron";s.production=Math.max(s.production,45);s.knowledge=Math.max(s.knowledge,25);s.eraStartedAt=Date.now();pushLog(s,"The Iron Age begins.");}else throw new Error("Iron Age is the current frontier.");
  }else if(type==="restart"){const keepCompleted=[...(s.completedEras||[])];s=fresh();s.completedEras=keepCompleted;pushLog(s,"A new realm has been founded.");
  }else throw new Error("Unsupported game action");clamp(s);s.updatedAt=Date.now();return s;}
module.exports={ERAS,ERA_INDEX,SLOTS,COST,ICON,fresh,advance,summary,action};