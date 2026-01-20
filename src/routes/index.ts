import { Router } from "express";
import express from "express";
import { generateVideoController, getJobStatusController } from "../controller/ai.controller";
import { createCheckout } from "../controller/payment.controller";
import { handlePolarWebhook } from "../controller/webhook.controller";

const router = Router();

// --- WEBHOOKS (Cas spécial : Body RAW) ---
// On définit cette route AVANT les middlewares globaux JSON dans app.ts, 
// ou on applique le middleware raw ici spécifiquement.
router.post(
  "/webhooks/polar",
  express.raw({ type: "application/json" }),
  handlePolarWebhook
);

// --- API ROUTES (JSON) ---
router.post("/create-checkout", createCheckout);
router.post("/generate", generateVideoController);
router.get("/status/:requestId", getJobStatusController);

// --- HEALTH CHECK ---
router.get("/health", (_, res) => { res.json({ status: "Online" }); });

export default router;