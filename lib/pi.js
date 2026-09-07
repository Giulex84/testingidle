const PI_API_BASE="https://api.minepi.com/v2";
const BOOST_AMOUNT=0.1;
const BOOST_MEMO_PREFIX="Idle Realm Test Council Boost";
const BOOST_PRODUCT="idle_realm_test_council_boost_v1";
const REWARD_AMOUNT=0.1;
const REWARD_MEMO="Idle Realm Test Era Reward";

function getServerApiKey(){const k=process.env.PI_API_KEY;if(!k)throw new Error("PI_API_KEY not configured");return k;}
function bearer(req){const v=req.headers.authorization;if(!v||!v.startsWith("Bearer "))return null;return v.slice(7).trim()||null;}
async function verifyToken(token){const r=await fetch(`${PI_API_BASE}/me`,{headers:{Authorization:`Bearer ${token}`},cache:"no-store"});if(!r.ok)throw new Error("Unauthorized");const u=await r.json();if(!u?.uid)throw new Error("Invalid Pi user");return u;}
async function getPayment(id){const r=await fetch(`${PI_API_BASE}/payments/${encodeURIComponent(id)}`,{headers:{Authorization:`Key ${getServerApiKey()}`},cache:"no-store"});const d=await r.json().catch(()=>({}));if(!r.ok)throw new Error(d?.error||"Could not fetch payment");return d;}
async function piPost(path,body){const r=await fetch(`${PI_API_BASE}${path}`,{method:"POST",headers:{Authorization:`Key ${getServerApiKey()}`,...(body===undefined?{}:{"Content-Type":"application/json"})},...(body===undefined?{}:{body:JSON.stringify(body)})});const d=await r.json().catch(()=>({}));return {response:r,data:d};}
function validateBoost(p,uid,era){if(!p?.identifier||!p.user_uid)return"Malformed payment";if(p.user_uid!==uid)return"Payment does not belong to authenticated user";if(p.direction!=="user_to_app")return"Unexpected payment direction";if(p.network!=="Pi Testnet")return"Unexpected payment network";if(Number(p.amount)!==BOOST_AMOUNT)return"Unexpected payment amount";if(p.memo!==`${BOOST_MEMO_PREFIX} ${era}`)return"Unexpected payment memo";if(p.metadata?.product!==BOOST_PRODUCT||p.metadata?.era!==era)return"Unexpected payment metadata";if(p.status?.cancelled||p.status?.user_cancelled)return"Payment is cancelled";return null;}
function validateReward(p,uid,era){if(!p?.identifier||!p.user_uid)return"Malformed reward";if(p.user_uid!==uid)return"Reward does not belong to authenticated user";if(p.direction!=="app_to_user")return"Unexpected reward direction";if(p.network!=="Pi Testnet")return"Unexpected reward network";if(Number(p.amount)!==REWARD_AMOUNT)return"Unexpected reward amount";if(p.memo!==REWARD_MEMO)return"Unexpected reward memo";if(p.metadata?.event!=="era_complete"||p.metadata?.era!==era)return"Unexpected reward metadata";return null;}
module.exports={PI_API_BASE,BOOST_AMOUNT,BOOST_MEMO_PREFIX,BOOST_PRODUCT,REWARD_AMOUNT,REWARD_MEMO,getServerApiKey,bearer,verifyToken,getPayment,piPost,validateBoost,validateReward};