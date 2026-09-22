const crypto=require("node:crypto");const store=require("./store");
const EVENTS=new Set(["login","game_action","era_advanced","boost_purchased","reward_sent"]);
function pseudonym(value){const secret=String(process.env.IDLE_METRICS_SECRET||process.env.PI_API_KEY||"").trim();if(!secret)throw new Error("Metrics secret is not configured");return crypto.createHmac("sha256",secret).update(value).digest("hex")}
async function safeRecordMetric(uid,event,dedupeId=""){if(!uid||!EVENTS.has(event))return false;try{const subject=pseudonym(`user:${uid}`),dedupe=dedupeId?pseudonym(`event:${uid}:${event}:${dedupeId}`):"";return await store.recordMetric(new Date().toISOString().slice(0,10),subject,event,dedupe)}catch{return false}}
module.exports={safeRecordMetric};
