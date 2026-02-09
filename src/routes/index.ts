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

const router = Router();

// --- WEBHOOKS (Cas spécial : Body RAW) ---
// On définit cette route AVANT les middlewares globaux JSON dans app.ts,
// ou on applique le middleware raw ici spécifiquement.
router.post(
  "/webhooks/polar",
  express.raw({ type: "application/json" }),
  handlePolarWebhook,
);

// --- API ROUTES (JSON) ---
router.post("create-checkout", createCheckout);
router.post("generate", generateVideoController);
router.post("save-generation", saveGenerationController);
router.get("generations", authMiddleware, getUserGenerationsController);
router.get("slop-params", authMiddleware, getSlopParamsController);
router.post("slop-params", authMiddleware, saveSlopParamsController);
router.post("prompt/enhance", getEnhancePrompt);
router.get("status/:requestId", getJobStatusController);
router.get("subscription/me", authMiddleware, getSubscriptionStatus);

// --- AUTHENTIFICATION (AJOUTE ÇA ICI) ---
router.post("sessionLogin", sessionLogin);
router.post("logout", logout);

// --- HEALTH CHECK ---
router.get("health", (_, res) => {
  res.json({ status: "Online" });
});

router.get("/", (_, res) => {
  res.json({ message: "Welcome" });
});
export default router;
