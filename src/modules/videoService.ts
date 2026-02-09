// src/modules/videoService.ts

import { OptionsIaRP, UserData, VideoJobResult } from '../type';
import {admin, db } from './auth'; // On réutilise l'instance initialisée proprement
import { FieldValue } from 'firebase-admin/firestore'; // Pour l'incrément/remboursement

// --- CONFIGURATION ---
const MOCK_MODE = true; // ⬅️ Passe à false en prod
const COST_VEO = 0;

// URLs de test
const TEST_VIDEOS = {
    landscape: "http://commondatastorage.googleapis.com/gtv-videos-bucket/sample/BigBuckBunny.mp4",
    portrait: "https://res.cloudinary.com/demo/video/upload/w_720,h_1280,c_fill,g_auto/dog.mp4"
};



// --- FONCTIONS ---

export async function generateVideo(userId: string, prompt: string, options : OptionsIaRP): Promise<VideoJobResult> {
    const userRef = db.collection('users').doc(userId);

    console.log(`🚀 RUN GENERATION pour ${userId}`);

    // 1. DÉBIT (Transaction DB)
    try {
        await db.runTransaction(async (t : any) => {
            const doc = await t.get(userRef);
            if (!doc.exists) throw new Error("Utilisateur introuvable");
            
            const data = doc.data() as UserData;
            const currentBalance = data?.wallet_balance || 0;
            
            if (currentBalance < COST_VEO) {
                throw new Error("SOLDE_INSUFFISANT");
            }
            
            // On déduit les crédits
            t.update(userRef, { wallet_balance: currentBalance - COST_VEO });
        });
    } catch (e: any) {
        if (e.message === "SOLDE_INSUFFISANT") throw e;
        console.error("Erreur Transaction:", e);
        throw new Error("Erreur lors du débit des jetons");
    }

    // 2. GÉNÉRATION (Mock ou Réelle)
    try {
        console.log(`🎬 Génération lancée pour ${userId}...`);
        let result: VideoJobResult;

        if (MOCK_MODE) {
            console.log("🎬 MODE SIMULATION : Génération en cours...");
            
            const isVertical = options.aspectRatio == "9:16"

            const videoUrl = isVertical ? TEST_VIDEOS.portrait : TEST_VIDEOS.landscape;
            const format = isVertical ? "9:16 (TikTok)" : "16:9 (Paysage)";

            console.log(`📐 Format détecté : ${format}, pour ${options.durationSeconds}s de durée`);
            
            // Simulation d'attente (2.5s)
            await new Promise(resolve => setTimeout(resolve, 2500));

            result = {
                requestId: `mock_${Date.now()}`,
                status: "completed",
                outputUrl: videoUrl,
                format: format,
                model: 'veo-simulated'
            };
        } else {
            // TODO: Insérer ici ton vrai appel API (Veo, Sora, etc.)
            // const response = await fetch(...)
            throw new Error("API Réelle non implémentée (MOCK_MODE est false)");
        }

        // 3. SAUVEGARDE DANS FIRESTORE
        // On enregistre le lien dans la collection 'generations'
        await db.collection('generations').doc(result.requestId).set({
            userId,
            prompt,
            options,
            status: result.status,
            outputUrl: result.outputUrl,
            format: result.format,
            model: result.model,
            createdAt: FieldValue.serverTimestamp()
        });

        return result;

    } catch (error) {
        console.error("❌ Erreur génération:", error);
        
        // REMBOURSEMENT AUTOMATIQUE
        console.log("↩️ Remboursement des jetons...");
        await userRef.update({ 
            wallet_balance: FieldValue.increment(COST_VEO) 
        });
        
        throw new Error("Échec génération (Crédits remboursés)");
    }
}

/**
 * Récupère le statut d'un job depuis Firestore
 */
export async function getJobStatus(requestId: string): Promise<VideoJobResult | null> {
    try {
        const doc = await db.collection('generations').doc(requestId).get();
        
        if (!doc.exists) {
            // Fallback pour les anciens mocks si nécessaire, ou si non trouvé
            if (requestId.startsWith('mock_')) {
                return {
                    requestId,
                    status: 'completed',
                    outputUrl: TEST_VIDEOS.landscape,
                    model: 'veo-simulated'
                };
            }
            return null;
        }

        const data = doc.data();
        return {
            requestId: doc.id,
            status: data.status,
            outputUrl: data.outputUrl,
            error: data.error,
            format: data.format,
            model: data.model
        };
    } catch (error) {
        console.error("Erreur getJobStatus:", error);
        throw error;
    }
}