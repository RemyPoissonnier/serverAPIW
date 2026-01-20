// src/config/polar.ts
import { Polar } from "@polar-sh/sdk";
import "dotenv/config";

const POLAR_ACCESS_TOKEN = process.env.POLAR_ACCESS_TOKEN;

if (!POLAR_ACCESS_TOKEN) {
  console.warn("⚠️ Attention: POLAR_ACCESS_TOKEN est manquant !");
}

// Pattern Singleton : on exporte une instance déjà prête
export const polar = new Polar({
  accessToken: POLAR_ACCESS_TOKEN,
  server: process.env.NODE_ENV === "production" ? "production" : "sandbox",
});

export const POLAR_WEBHOOK_SECRET = process.env.POLAR_WEBHOOK_SECRET;