// src/app.ts
import express from "express";
import cors from "cors";
import router from "./routes";
import "./modules/auth"; // Ton side-effect auth

const app = express();

// 1. Sécurité & CORS
app.use(cors({ origin: true, credentials: true }));

// 2. IMPORTANT : Le parser JSON global
// Note : Pour que le webhook fonctionne avec express.raw, 
// soit on le met dans un routeur séparé, soit on s'assure que la route webhook 
// gère son propre parsing (ce qu'on a fait dans routes/index.ts).
// Express exécute les middlewares en cascade. 
// Ici, on va utiliser une astuce pour ne parser en JSON que si ce n'est PAS le webhook.
app.use((req, res, next) => {
  if (req.originalUrl.includes("/api/webhooks/polar")) {
    next();
  } else {
    express.json()(req, res, next);
  }
});

app.use(express.urlencoded({ extended: true })); // Pour les formulaires classiques

// 3. Montage des routes
app.use("/api", router);

export default app;