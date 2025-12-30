const admin = require('firebase-admin');
const serviceAccount = require('../serviceAccountKey.json');

// On initialise Firebase avec la clé secrète (le "trousseau du patron")
admin.initializeApp({
  credential: admin.credential.cert(serviceAccount)
});

// Voici la fonction qui vérifie le bracelet
const verifierToken = async (req, res, next) => {
  // 1. On cherche le token dans l'en-tête de la requête (Authorization: Bearer <token>)
  const token = req.headers.authorization?.split(' ')[1];

  if (!token) {
    return res.status(401).json({ message: "⛔ Stop ! Pas de bracelet (Token manquant)." });
  }

  try {
    // 2. On demande à Firebase si le token est valide
    const decodeValue = await admin.auth().verifyIdToken(token);
    
    // 3. C'est valide ! On attache les infos de l'utilisateur à la requête
    req.user = decodeValue;
    
    // 4. On laisse passer
    next();
  } catch (e) {
    return res.status(403).json({ message: "⛔ Faux bracelet ! (Token invalide)" });
  }
};

module.exports = verifierToken;
