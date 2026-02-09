import { Request, Response } from "express";
import { generateVideo, getJobStatus } from "../modules/videoService"; // Ton module existant
import { GenerateRequestBody } from "../type";

export const generateVideoController = async (
  req: Request<{}, {}, GenerateRequestBody>,
  res: Response,
): Promise<any> => {
  const { userId, prompt, options } = req.body;

  if (!userId || !prompt) {
    return res.status(400).json({ error: "UserId et Prompt requis" });
  }

  try {
    const result = await generateVideo(userId, prompt, options);
    return res.json({ success: true, data: result });
  } catch (error: any) {
    if (error.message === "SOLDE_INSUFFISANT") {
      return res.status(402).json({ error: "Pas assez de jetons !" });
    }
    return res.status(500).json({ error: error.message || "Erreur interne" });
  }
};

export const getJobStatusController = async (
  req: Request,
  res: Response,
): Promise<any> => {
  const { requestId } = req.params;

  if (!requestId) return res.status(400).json({ error: "RequestId manquant" });

  try {
    const job = await getJobStatus(requestId);
    if (!job) return res.status(404).json({ error: "Job introuvable" });

    return res.json({
      requestId: job.requestId,
      status: job.status,
      outputUrl: job.outputUrl,
      error: job.error,
    });
  } catch (error) {
    return res.status(500).json({ error: "Erreur interne status" });
  }
};

export const saveGenerationController = async (
  req: Request,
  res: Response,
): Promise<any> => {
  const { userId, requestId, prompt, options, model, outputUrl, status } = req.body;

  if (!userId || !requestId) {
    return res.status(400).json({ error: "UserId et RequestId requis" });
  }

  try {
    const { db } = require("../modules/auth");
    const { FieldValue } = require("firebase-admin/firestore");

    const generationData = {
      requestId,
      prompt,
      options,
      model,
      videoUrl: outputUrl,
      status: status || "succeeded",
      createdAt: FieldValue.serverTimestamp(),
      expiresAt: FieldValue.serverTimestamp(), // Tu pourras ajuster la logique d'expiration ici
    };

    // 1. Sauvegarde dans la collection globale (pour getJobStatus)
    await db.collection("generations").doc(requestId).set(generationData, { merge: true });

    // 2. Sauvegarde dans la sous-collection de l'utilisateur (pour l'affichage UI)
    await db.collection("users").doc(userId).collection("generations").doc(requestId).set(generationData);

    console.log(`✅ Generation ${requestId} sauvegardée pour l'user ${userId}`);
    return res.json({ success: true });
  } catch (error: any) {
    console.error("Erreur save-generation:", error);
    return res.status(500).json({ error: "Erreur lors de la sauvegarde" });
  }
};

export const getUserGenerationsController = async (
  req: Request,
  res: Response,
): Promise<any> => {
  const userId = (req as any).user?.uid;

  if (!userId) {
    return res.status(401).json({ error: "Utilisateur non identifié" });
  }

  try {
    const { db } = require("../modules/auth");
    
    // On récupère les 50 dernières pour être sûr d'en avoir 10 uniques après filtrage
    const snapshot = await db.collection("users")
      .doc(userId)
      .collection("generations")
      .orderBy("createdAt", "desc")
      .limit(50)
      .get();

    const generations: any[] = [];
    const seenPrompts = new Set();

    snapshot.forEach((doc: any) => {
      const data = doc.data();
      if (data.prompt && !seenPrompts.has(data.prompt)) {
        seenPrompts.add(data.prompt);
        generations.push({
          id: doc.id,
          ...data
        });
      }
    });

    // On ne garde que les 10 premières uniques
    return res.json(generations.slice(0, 10));
    
  } catch (error) {
    console.error("Erreur getUserGenerations:", error);
    return res.status(500).json({ error: "Erreur lors de la récupération des générations" });
  }
};

export const getSlopParamsController = async (
  req: Request,
  res: Response,
): Promise<any> => {
  const userId = (req as any).user?.uid;

  if (!userId) {
    return res.status(401).json({ error: "Utilisateur non identifié" });
  }

  try {
    const { db } = require("../modules/auth");
    const doc = await db.collection("users").doc(userId).collection("settings").doc("slopParams").get();

    if (!doc.exists) {
      return res.json({});
    }

    return res.json(doc.data());
  } catch (error) {
    console.error("Erreur getSlopParams:", error);
    return res.status(500).json({ error: "Erreur lors de la récupération des paramètres" });
  }
};

export const saveSlopParamsController = async (
  req: Request,
  res: Response,
): Promise<any> => {
  const userId = (req as any).user?.uid;
  const params = req.body;

  if (!userId) {
    return res.status(401).json({ error: "Utilisateur non identifié" });
  }

  try {
    const { db } = require("../modules/auth");
    await db.collection("users").doc(userId).collection("settings").doc("slopParams").set({
      ...params,
      updatedAt: new Date()
    }, { merge: true });

    return res.json({ success: true });
  } catch (error) {
    console.error("Erreur saveSlopParams:", error);
    return res.status(500).json({ error: "Erreur lors de la sauvegarde des paramètres" });
  }
};

export const getEnhancePrompt = async (
  req: Request,
  res: Response,
): Promise<any> => {
  try {
    const { prompt } = req.body;

    console.log("prompt => ", prompt);
    

    if (!prompt) {
      return res.status(400).json({ error: "Le prompt est requis." });
    }

    // --- PHASE DE TEST ---
    // On simule une réponse améliorée sans appeler Google Gemini pour le moment
    const enhancedPrompt = `Ceci est une version améliorée de test pour : "${prompt}". (Prêt pour intégration Google Gemini)`;

    // Simulation d'un léger délai de traitement pour tester ton Loader2 côté React
    setTimeout(() => {
      res.json({
        success: true,
        originalPrompt: prompt,
        enhancedPrompt: enhancedPrompt,
      });
    }, 1000);
  } catch (error) {
    console.error("Erreur Enhance API:", error);
    res.status(500).json({ error: "Erreur interne du serveur" });
  }
};
