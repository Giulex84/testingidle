import * as StellarSdk from "@stellar/stellar-sdk";

export default async function handler(req, res) {
  // Gestione CORS e metodo
  if (req.method !== 'POST') return res.status(405).json({ error: "Method not allowed" });

  const { uid, amount } = req.body;
  const PI_API_KEY = process.env.PI_API_KEY;
  const APP_SEED = process.env.PI_APP_WALLET_SEED;

  try {
    // 1. Chiamata a Pi Network per creare il pagamento
    const response = await fetch("https://api.minepi.com/v2/payments", {
      method: "POST",
      headers: {
        "Authorization": `Key ${PI_API_KEY}`,
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        payment: {
          amount: Number(amount),
          memo: "A2U Reward",
          metadata: { s: "a2u" },
          uid: uid
        }
      })
    });

    const data = await response.json();
    if (!response.ok) {
        console.error("Dettaglio Errore Pi API:", data);
        return res.status(400).json({ error: data.message || "Errore Pi API" });
    }

    const paymentId = data.identifier;

    // 2. Approvazione
    await fetch(`https://api.minepi.com/v2/payments/${paymentId}/approve`, {
      method: "POST",
      headers: { "Authorization": `Key ${PI_API_KEY}` }
    });

    // 3. Firma con Stellar
    const server = new StellarSdk.Horizon.Server("https://api.testnet.minepi.com");
    const keypair = StellarSdk.Keypair.fromSecret(APP_SEED);
    const account = await server.loadAccount(keypair.publicKey());
    
    const tx = new StellarSdk.TransactionBuilder(account, { 
        fee: "1000000", 
        networkPassphrase: "Pi Testnet" 
    })
      .addMemo(StellarSdk.Memo.text(paymentId.substring(0, 28)))
      .addOperation(StellarSdk.Operation.payment({
        destination: data.to_address,
        asset: StellarSdk.Asset.native(),
        amount: Number(amount).toFixed(7)
      }))
      .setTimeout(60).build();

    tx.sign(keypair);
    const result = await server.submitTransaction(tx);

    // 4. Completamento
    await fetch(`https://api.minepi.com/v2/payments/${paymentId}/complete`, {
      method: "POST",
      headers: { 
        "Authorization": `Key ${PI_API_KEY}`,
        "Content-Type": "application/json" 
      },
      body: JSON.stringify({ txid: result.hash })
    });

    return res.status(200).json({ success: true, txid: result.hash });

  } catch (err) {
    console.error("CRASH SERVER:", err.message);
    return res.status(500).json({ error: err.message });
  }
}
