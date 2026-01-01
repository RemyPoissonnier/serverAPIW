// src/index.ts
import "dotenv/config"; // Charge les variables .env
import express, { Request, Response } from "express";
import cors from "cors";
import { validateEvent } from "@polar-sh/sdk/webhooks";
import { Polar } from "@polar-sh/sdk";

// Import de tes modules locaux (assure-toi de les passer en .ts aussi ou garde l'extension si .js)
// Note : Le chemin './modules' suppose que le dossier est dans src/modules
import "./modules/auth"; // Juste pour l'init side-effect
import { handlePurchase, handleSubscription } from "./modules/paymentService";
import { generateVideo, getJobStatus } from "./modules/videoService";

// --- INTERFACES & TYPES ---

// Type pour le corps de la requête Checkout
interface CheckoutRequestBody {
  productId: string;
  userId: string;
}

// Type pour le corps de la requête Generate
interface GenerateRequestBody {
  userId: string;
  prompt: string;
}

// --- CONFIGURATION ---

const app = express();
app.use(cors({ origin: true }));

const POLAR_ACCESS_TOKEN = process.env.POLAR_ACCESS_TOKEN;
const POLAR_WEBHOOK_SECRET = process.env.POLAR_WEBHOOK_SECRET;

// DEBUG TOKEN
console.log("--------------------------------");
console.log("🔑 DEBUG TOKEN :");
console.log("Token présent ?", POLAR_ACCESS_TOKEN ? "OUI" : "NON");
if (POLAR_ACCESS_TOKEN)
  console.log("Début du token :", POLAR_ACCESS_TOKEN.substring(0, 10) + "...");
console.log("Environnement visé : Sandbox");
console.log("--------------------------------");

// --- WEBHOOK POLAR ---
// IMPORTANT : Placé avant express.json() pour capturer le body en raw
app.post(
  "/api/webhooks/polar",
  express.raw({ type: "application/json" }),
  async (req: Request, res: Response): Promise<any> => {
    if (!POLAR_WEBHOOK_SECRET) {
      return res.status(500).send("Erreur serveur: Secret manquant");
    }

    let event;
    try {
      // En TS avec express.raw, req.body est un Buffer.
      // validateEvent attend une string ou un Buffer, donc on cast.
      event = validateEvent(
        req.body as string | Buffer,
        req.headers as Record<string, string>, // On force le type ici
        POLAR_WEBHOOK_SECRET
      );
      console.log("✅ SUCCÈS ! Signature validée. Type:", event.type);
    } catch (err: any) {
      console.error("❌ ÉCHEC VALIDATION :", err.message);
      return res.status(400).send("Webhook Error: " + err.message);
    }

    console.log("event type === ", event.type);

    // --- GESTION DES ÉVÉNEMENTS ---
    try {
      if (event.type === "checkout.created") {
        await handlePurchase(event.data);
      } else if (event.type === "subscription.created") {
        await handleSubscription(event.data);
      }
      return res.send({ received: true });
    } catch (err) {
      console.error("Erreur logique métier :", err);
      return res.status(500).send("Erreur serveur");
    }
  }
);

// --- MIDDLEWARES GLOBAUX ---
// Pour toutes les autres routes, on veut du JSON classique
app.use(express.json());

// --- INITIALISATION CLIENT POLAR ---
const polar = new Polar({
  accessToken: POLAR_ACCESS_TOKEN,
  server: "sandbox", // Mets 'production' selon tes env vars plus tard
});

// --- ROUTES API ---

app.post(
  "/api/create-checkout",
  async (
    req: Request<{}, {}, CheckoutRequestBody>,
    res: Response
  ): Promise<any> => {
    const { productId, userId } = req.body;

    if (!productId || !userId) {
      return res.status(400).json({ error: "Missing productId or userId" });
    }

    try {
      console.log(
        `⏳ Création checkout pour ${userId} avec produit ${productId}...`
      );

      const checkout = await polar.checkouts.create({
        products: [productId],
        metadata: {
          userId: userId,
        },
        successUrl: "http://localhost:5173/success?checkout_id={CHECKOUT_ID}",
      });

      console.log("✅ Lien créé :", checkout.url);
      res.json({ url: checkout.url });
    } catch (error) {
      console.error("❌ Erreur création checkout:", error);
      res
        .status(500)
        .json({
          error: "Impossible de créer le paiement. Vérifie tes IDs produits.",
        });
    }
  }
);

app.post(
  "/api/generate",
  async (
    req: Request<{}, {}, GenerateRequestBody>,
    res: Response
  ): Promise<any> => {
    const { userId, prompt } = req.body;

    console.log("userId : ", userId, "\n prompt :", prompt);

    if (!userId || !prompt) {
      return res.status(400).json({ error: "UserId et Prompt requis" });
    }

    try {
      const result = await generateVideo(userId, prompt);
      console.log("result => ", result);

      return res.json({ success: true, data: result });
    } catch (error: any) {
      if (error.message === "SOLDE_INSUFFISANT") {
        return res
          .status(402)
          .json({ error: "Pas assez de jetons ! Rechargez votre compte." });
      }
      return res.status(500).json({ error: error.message || "Erreur interne" });
    }
  }
);

// Route Health Check (Status global du serveur)
app.get("/api/health", (req, res) => {
  res.json({ status: "Online" });
});

/**
 * Récupération du statut d'un job IA spécifique
 * GET /api/status/:requestId
 */
app.get(
  "/api/status/:requestId",
  async (req: Request, res: Response): Promise<any> => {
    const { requestId } = req.params;

    if (!requestId) {
      return res.status(400).json({ error: "RequestId manquant" });
    }

    try {
      // Note: Assure-toi que getJobStatus est bien exporté depuis ton videoService
      const job = await getJobStatus(requestId);

      if (!job) {
        return res.status(404).json({ error: "Job introuvable ou expiré" });
      }

      return res.json({
        requestId: job.requestId,
        model: job.model || "custom",
        status: job.status,
        previewUrl: job.previewUrl,
        outputUrl: job.outputUrl,
        error: job.error,
      });
    } catch (error) {
      console.error(`❌ Erreur status pour ${requestId}:`, error);
      return res
        .status(500)
        .json({ error: "Erreur interne lors de la vérification du statut" });
    }
  }
);

// --- DÉMARRAGE ---

const PORT = process.env.PORT || 3000;
app.listen(PORT, () => console.log(`🚀 Server running on port ${PORT}`));
