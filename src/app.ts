import express from "express";
import cors from "cors";
import router from "./routes";
import "./modules/auth"; 
import cookieParser from "cookie-parser";

const app = express();

// 1. Sécurité & CORS (Indispensable pour Railway)
app.use(cors({ 
  // Remplace par l'URL de ton front sur Vercel/Netlify en production
  origin: process.env.NODE_ENV === 'production' 
    ? ["https://ton-site-ia.vercel.app", "https://ton-autre-domaine.com"] 
    : "http://localhost:5173", 
  credentials: true 
}));

// 2. COOKIES
app.use(cookieParser());

// 3. Middlewares de Parsing (Gestion intelligente du Webhook)
// On utilise une condition pour ne PAS parser en JSON si c'est le webhook Polar
app.use((req, res, next) => {
  if (req.originalUrl.startsWith("/webhooks/polar")) {
    next();
  } else {
    express.json()(req, res, next);
  }
});

app.use(express.urlencoded({ extended: true }));

// 4. Montage des routes
app.use("/", router);

export default app;