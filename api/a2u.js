import * as StellarSdk from "@stellar/stellar-sdk";

export default async function handler(req, res) {
  if (req.method !== 'POST') return res.status(405).send('Method Not Allowed');

  const { uid, amount } = req.body;
  const PI_API_KEY = process.env.PI_API_KEY; 
  const APP_SEED = process.env.PI_APP_WALLET_SEED;
  const BASE_URL = "https://api.minepi.com/v2/payments";

  try {
    // 1. Creazione pagamento su Pi Network
    const createRes = await fetch(BASE_URL, {
      method: "POST",
      headers: { "Authorization": PI_API_KEY, "Content-Type": "application/json" },
      body: JSON.stringify({ 
        payment: { amount: Number(amount), memo: "A2U Test", metadata: { s: "a2u" }, uid } 
      }),
    });

    const data = await createRes.json();
    if (!createRes.ok) throw new Error(data.message || "Errore Pi API");

    const paymentId = data.identifier;

    // 2. Approvazione
    await fetch(`${BASE_URL}/${paymentId}/approve`, {
      method: "POST",
      headers: { "Authorization": PI_API_KEY }
    });

    // 3. Blockchain Stellar (Pi Testnet)
    const server = new StellarSdk.Horizon.Server("https://api.testnet.minepi.com");
    const keypair = StellarSdk.Keypair.fromSecret(APP_SEED);
    const account = await server.loadAccount(keypair.publicKey());
    
    const shortMemo = paymentId.substring(0, 28);

    const tx = new StellarSdk.TransactionBuilder(account, { 
        fee: "1000000", 
        networkPassphrase: "Pi Testnet" 
      })
      .addMemo(StellarSdk.Memo.text(shortMemo))
      .addOperation(StellarSdk.Operation.payment({ 
        destination: data.to_address, 
        asset: StellarSdk.Asset.native(), 
        amount: Number(amount).toFixed(7) 
      }))
      .setTimeout(60).build();

    tx.sign(keypair);
    const result = await server.submitTransaction(tx);

    // 4. Completamento
    await fetch(`${BASE_URL}/${paymentId}/complete`, {
      method: "POST",
      headers: { "Authorization": PI_API_KEY, "Content-Type": "application/json" },
      body: JSON.stringify({ txid: result.hash }),
    });

    return res.status(200).json({ success: true, txid: result.hash });

  } catch (err) {
    return res.status(500).json({ error: err.message });
  }
}
