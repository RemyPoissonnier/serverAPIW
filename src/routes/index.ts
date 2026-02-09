import { Router } from "express";
import express from "express";
import {
  generateVideoController,
  getEnhancePrompt,
  getJobStatusController,
  saveGenerationController,
  getUserGenerationsController,
  getSlopParamsController,
  saveSlopParamsController,
} from "../controller/ai.controller";
import {
  createCheckout,
  getSubscriptionStatus,
} from "../controller/payment.controller";
import { handlePolarWebhook } from "../controller/webhook.controller";
import { authMiddleware } from "../modules/authMiddleware";
import { sessionLogin, logout } from "../controller/auth.controller";

// Importe tes contrôleurs ici

const router = Router();

// --- 1. WEBHOOKS (CRITIQUE : AVANT TOUT MIDDLEWARE JSON) ---
// Polar et Stripe ont besoin du corps "RAW" (brut) pour vérifier la signature.
// Si app.use(express.json()) est appelé avant, le webhook échouera.
router.post(
  "/webhooks/polar",
  express.raw({ type: "application/json" }),
  handlePolarWebhook
);

// --- 2. API ROUTES (AJOUT DES "/" MANQUANTS) ---
// En Express, les routes doivent commencer par un "/" sinon elles ne sont pas trouvées.
router.post("/create-checkout",authMiddleware, createCheckout);
router.post("/generate", authMiddleware, generateVideoController);
router.post("/save-generation", saveGenerationController);
router.get("/generations", authMiddleware, getUserGenerationsController);
router.get("/slop-params", authMiddleware, getSlopParamsController);
router.post("/slop-params", authMiddleware, saveSlopParamsController);
router.post("/prompt/enhance", authMiddleware, getEnhancePrompt);
router.get("/status/:requestId", getJobStatusController);
router.get("/subscription/me", authMiddleware, getSubscriptionStatus);

// --- 3. AUTHENTIFICATION ---
router.post("/sessionLogin", sessionLogin);
router.post("/logout", logout);

// --- 4. HEALTH CHECK & WELCOME ---
router.get("/health", (_, res) => {
  res.json({ status: "Online", timestamp: new Date().toISOString() });
});

router.get("/", (_, res) => {
  res.json({ message: "Welcome to Animals IA API" });
});

export default router;