import * as StellarSdk from '@stellar/stellar-sdk';

export default async function handler(req, res) {
  if (req.method !== 'POST') return res.status(405).end();
  
  const { uid, amount } = req.body;
  const PI_API_KEY = process.env.PI_API_KEY;
  const APP_SEED = process.env.PI_APP_WALLET_SEED;

  try {
    // ... resto della logica (fetch, approve, ecc.) ...
    
    const server = new StellarSdk.Horizon.Server("https://api.testnet.minepi.com");
    const keypair = StellarSdk.Keypair.fromSecret(APP_SEED);
    
    // ... logica transazione ...
    
    return res.status(200).json({ success: true, txid: result.hash });
  } catch (err) {
    return res.status(500).json({ error: err.message });
  }
}
