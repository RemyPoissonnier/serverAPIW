// src/server.ts
import "dotenv/config"; // Charge les variables .env tout de suite
import app from "./app";

const PORT: number = Number(process.env.PORT) || 3000;

app.listen(PORT, "0.0.0.0", () => {
  console.log(`Serveur prêt sur le port ${PORT}`);
});
