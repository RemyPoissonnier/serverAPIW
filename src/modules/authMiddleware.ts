// src/middleware/authMiddleware.ts (ou l'emplacement de ton choix)

import admin from 'firebase-admin';
import { Request, Response, NextFunction } from 'express';

// Note : Pour importer du JSON en TS, assure-toi d'avoir "resolveJsonModule": true dans ton tsconfig.json
import serviceAccount from '../../serviceAccountKey.json'; 

// Évite d'initialiser plusieurs fois si le fichier est importé à plusieurs endroits
if (!admin.apps.length) {
  admin.initializeApp({
    // On force le typage car le JSON est considéré comme "any" ou "object" par défaut
    credential: admin.credential.cert(serviceAccount as admin.ServiceAccount)
  });
}

// --- TYPAGE PERSONNALISÉ ---
// On crée une interface qui étend la requête Express de base
// pour lui ajouter la propriété 'user'
export interface AuthRequest extends Request {
  user?: admin.auth.DecodedIdToken;
}

export const verifierToken = async (req: Request, res: Response, next: NextFunction) => {
  // 1. On cherche le token
  const authHeader = req.headers.authorization;
  const token = authHeader && authHeader.split(' ')[1];

  if (!token) {
    // Le return est important pour arrêter l'exécution
    res.status(401).json({ message: "⛔ Stop ! Pas de bracelet (Token manquant)." });
    return;
  }

  try {
    // 2. Vérification Firebase
    const decodeValue = await admin.auth().verifyIdToken(token);
    
    // 3. On attache les infos. 
    // ASTUCE : On "force" le type de req ici pour dire à TS "T'inquiète, c'est une AuthRequest"
    (req as AuthRequest).user = decodeValue;
    
    // 4. On laisse passer
    next();
  } catch (e) {
    res.status(403).json({ message: "⛔ Faux bracelet ! (Token invalide)" });
    return;
  }
};