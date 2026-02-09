import admin from "firebase-admin";

const serviceAccountVar = process.env.FIREBASE_SERVICE_ACCOUNT;

if (!serviceAccountVar) {
  throw new Error("La variable FIREBASE_SERVICE_ACCOUNT est manquante !");
}

// On parse le JSON stocké dans la variable d'environnement
const serviceAccount = JSON.parse(serviceAccountVar);

admin.initializeApp({
  credential: admin.credential.cert(serviceAccount),
  // Ajoute ici ton databaseURL si nécessaire
});

console.log("🔥 Firebase Admin initialisé avec succès");
export const  db = admin.firestore();