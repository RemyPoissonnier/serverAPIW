// auth.js
const admin = require('firebase-admin');
// Assure-toi que ce fichier est bien au même niveau
const serviceAccount = require('../serviceAccountKey.json'); 

// On initialise une seule fois
if (!admin.apps.length) {
  admin.initializeApp({
    credential: admin.credential.cert(serviceAccount)
  });
}

const db = admin.firestore();

// On exporte 'db' pour l'utiliser ailleurs (dans data.js)
module.exports = { admin, db };