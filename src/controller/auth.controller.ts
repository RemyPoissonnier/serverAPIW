// src/controllers/auth.controller.ts
import { Request, Response } from "express";
import admin from "firebase-admin";

export const sessionLogin = async (req: Request, res: Response) => {
  const idToken = req.body.idToken;

  if (!idToken) {
    return res.status(400).send('Token manquant');
  }

  // Durée du cookie : 5 jours
  const expiresIn = 60 * 60 * 24 * 5 * 1000;

  try {
    // 1. Création du cookie par Firebase
    const sessionCookie = await admin.auth().createSessionCookie(idToken, { expiresIn });

    // 2. Configuration sécurisée
    const options = {
      maxAge: expiresIn,
      httpOnly: true,  // Important pour la sécurité
      secure: process.env.NODE_ENV === 'production', 
      sameSite: 'strict' as const // 'as const' est nécessaire pour TypeScript ici
    };

    // 3. Envoi du cookie
    res.cookie('session', sessionCookie, options);
    
    console.log('✅ Cookie de session créé avec succès');
    res.status(200).json({ status: 'success' });

  } catch (error) {
    console.error('❌ Erreur création cookie:', error);
    res.status(401).send('UNAUTHORIZED REQUEST!');
  }
};

export const logout = (req: Request, res: Response) => {
  res.clearCookie('session');
  res.status(200).json({ status: 'success' });
};