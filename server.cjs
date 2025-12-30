// server.js
require('dotenv').config();
const express = require('express');
const cors = require('cors');
const { validateEvent } = require('@polar-sh/sdk/webhooks');

// server.js (Ajout)
const { Polar } = require('@polar-sh/sdk');

// On importe nos nouveaux "musiciens"
const { handlePurchase, handleSubscription } = require('./modules/paymentService');
const { generateVideo } = require('./modules/videoService.cjs');
// On importe auth juste pour être sûr que Firebase démarre
require('./modules/auth'); 

const app = express();
app.use(cors({ origin: true }));

const token = process.env.POLAR_ACCESS_TOKEN;
  
  // DEBUG : Affiche ça dans ton terminal Docker
  console.log("--------------------------------");
  console.log("🔑 DEBUG TOKEN :");
  console.log("Token présent ?", token ? "OUI" : "NON");
  if (token) console.log("Début du token :", token.substring(0, 10) + "...");
  console.log("Environnement visé : Sandbox");
  console.log("--------------------------------");

// --- LE DEBUGGER CORRIGÉ ---
app.post(
  '/api/webhooks/polar', 
  // IMPORTANT : On force la lecture en mode "Brut" (Raw)
  express.raw({ type: 'application/json' }), 
  async (req, res) => {
    
    const webhookSecret = process.env.POLAR_WEBHOOK_SECRET;

    

    if (!webhookSecret) {
        return res.status(500).send("Erreur serveur: Secret manquant");
    }

    let event;
    try {
      // ✅ CORRECTION ICI : On passe 'req.headers' en entier, pas juste la signature
      event = validateEvent(req.body, req.headers, webhookSecret);
      console.log("✅ SUCCÈS ! Signature validée. Type:", event.type);
    } catch (err) {
      console.error('❌ ÉCHEC VALIDATION :', err.message);
      return res.status(400).send('Webhook Error: ' + err.message);
    }

    console.log("event type === " , event.type);
    

    // --- GESTION DES ÉVÉNEMENTS ---
    try {
        if (event.type === 'checkout.created') {
            await handlePurchase(event.data);
        } else if (event.type === 'subscription.created') {
            await handleSubscription(event.data);
        }
        res.send({ received: true });
    } catch (err) {
        console.error("Erreur logique métier :", err);
        res.status(500).send("Erreur serveur");
    }
  }
);


// On initialise le client Polar avec ton token d'accès (PAS le secret du webhook)
// Tu trouves ce token dans Polar > Settings > Developers > Personal Access Tokens
const polar = new Polar({
  accessToken: process.env.POLAR_ACCESS_TOKEN, 
  server: 'sandbox', // Mets 'production' quand tu passeras en vrai
});

app.use(express.json());

app.post('/api/create-checkout', async (req, res) => {
  const { productId, userId } = req.body;

  if (!productId || !userId) {
    return res.status(400).json({ error: "Missing productId or userId" });
  }

  try {
    console.log(`⏳ Création checkout pour ${userId} avec produit ${productId}...`);

    // ✅ CORRECTION ICI : c'est polar.checkouts.create (sans .custom)
    const checkout = await polar.checkouts.create({
      products: [productId], // Attention : Polar veut un tableau [], même pour un seul produit
      metadata: {
        userId: userId
      },
      successUrl: "http://localhost:5173/success?checkout_id={CHECKOUT_ID}", // Redirection après paiement
      // redirectToCheckout: true // Optionnel, selon la version du SDK
    });

    console.log("✅ Lien créé :", checkout.url);
    res.json({ url: checkout.url });

  } catch (error) {
    console.error("❌ Erreur création checkout:", error);
    res.status(500).json({ error: "Impossible de créer le paiement. Vérifie tes IDs produits." });
  }

});

// Nouvelle route protégée pour générer
app.post('/api/generate', async (req, res) => {
  // Idéalement, ici tu devrais vérifier le Token Firebase envoyé par le front
  // Pour faire simple au début, on prend le userId du body, 
  // MAIS en prod il faudra décoder le header Authorization.
  
  const { userId, prompt } = req.body;

  console.log("userId : ", userId , "\n prompt :", prompt);
  

  if (!userId || !prompt) {
    return res.status(400).json({ error: "UserId et Prompt requis" });
  }

  try {
    const result = await generateVideo(userId, prompt);
    console.log("result => " , result);
    
    return res.json({ success: true, data: result });
    
  } catch (error) {
    if (error.message === "SOLDE_INSUFFISANT") {
      return res.status(402).json({ error: "Pas assez de jetons ! Rechargez votre compte." });
    }
    return res.status(500).json({ error: error.message });
  }
});

app.get('/api/status', (req, res) => res.json({ status: 'Online' }));

/**
 * ------------------------------------------------------------------
 * NOUVELLE ROUTE : Récupération du statut d'un job IA
 * Correspond à : GET /api/status/:requestId TODO to modified 
 * ------------------------------------------------------------------
 */
app.get('/api/status/:requestId', async (req, res) => {
  const { requestId } = req.params;

  // Validation basique
  if (!requestId) {
    return res.status(400).json({ error: "RequestId manquant" });
  }

  try {
    // Appel au service (Business Logic)
    const job = await getJobStatus(requestId);

    // Si le job n'existe pas (404 est important pour le polling du front)
    if (!job) {
      return res.status(404).json({ error: "Job introuvable ou expiré" });
    }

    // On renvoie exactement la structure IaResponse attendue par ton front
    return res.json({
      requestId: job.requestId,
      model: job.model || 'custom', // Valeur par défaut si manquant
      status: job.status,           // 'queued' | 'running' | 'succeeded' | 'failed'
      previewUrl: job.previewUrl,
      outputUrl: job.outputUrl,
      error: job.error
    });

  } catch (error) {
    console.error(`❌ Erreur status pour ${requestId}:`, error);
    return res.status(500).json({ error: "Erreur interne lors de la vérification du statut" });
  }
});

// Attention : Tu as déjà une route app.get('/api/status').
// Express est malin, '/api/status' est différent de '/api/status/:requestId'.
// Mais pour la clarté, renomme ton ancienne route 'health-check' ou garde-la en bas.
app.get('/api/health', (req, res) => res.json({ status: 'Online' }));

const PORT = process.env.PORT || 3000;
app.listen(PORT, () => console.log(`🚀 Server running on port ${PORT}`));