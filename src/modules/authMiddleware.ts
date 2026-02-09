import { Request, Response, NextFunction } from "express";
import admin from "firebase-admin";

// On définit une interface pour être propre avec TypeScript
export interface AuthRequest extends Request {
  user?: admin.auth.DecodedIdToken;
}

export const authMiddleware = async (req: Request, res: Response, next: NextFunction) => {
  const sessionCookie = req.cookies.session;
  const authHeader = req.headers.authorization;

  let decodedClaims;

  try {
    // CAS 1 : Priorité au Cookie (Pour ton site React Web)
    if (sessionCookie) {
      decodedClaims = await admin.auth().verifySessionCookie(sessionCookie, true);
    } 
    // CAS 2 : Fallback sur le Token (Pour Postman, Mobile, ou Scripts)
    else if (authHeader && authHeader.startsWith('Bearer ')) {
      const token = authHeader.split(' ')[1];
      decodedClaims = await admin.auth().verifyIdToken(token);
    } 
    // CAS 3 : Rien du tout
    else {
      return res.status(401).json({ error: "Non authentifié (Ni cookie, ni token trouvé)" });
    }

    // Si on arrive ici, c'est que l'un des deux a fonctionné !
    // On attache l'utilisateur à la requête
    (req as AuthRequest).user = decodedClaims;
    
    next(); // On ouvre la barrière

  } catch (error) {
    console.error("Erreur d'authentification:", error);
    // On renvoie une 401 générique pour ne pas trop en dire aux hackers
    return res.status(401).json({ error: "Session expirée ou Token invalide" });
  }
};