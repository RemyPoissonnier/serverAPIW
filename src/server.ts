// src/server.ts
import "dotenv/config"; // Charge les variables .env tout de suite
import app from "./app";

const PORT = process.env.PORT || 3000;

app.listen(PORT, () => {
  console.log(`
  ---------------------------------------
  🚀 Server running on port ${PORT}
  🌍 Environment: ${process.env.NODE_ENV || 'development'}
  ---------------------------------------
  `);
});