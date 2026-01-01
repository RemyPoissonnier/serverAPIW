// auth.js
export const admin = require('firebase-admin');
// Assure-toi que ce fichier est bien au même niveau
import serviceAccount from '../../serviceAccountKey.json';

// On initialise une seule fois
if (!admin.apps.length) {
  admin.initializeApp({
    credential: admin.credential.cert(serviceAccount)
  });
}

export const  db = admin.firestore();