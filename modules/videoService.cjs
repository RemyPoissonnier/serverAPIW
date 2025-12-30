// Ajoute une variable pour activer/désactiver le mode test
const MOCK_MODE = true; // ⬅️ Mets 'false' quand tu passeras en production
const COST_VEO = 10

async function generateVideo(userId, prompt) {
    const userRef = db.collection('users').doc(userId);

    console.log(userRef);
    

    // 1. DÉBIT (Ça, on le garde pour de vrai, pour tester la base de données)
    try {
        await db.runTransaction(async (t) => {
            // ... (ton code de transaction transaction existant) ...
             const doc = await t.get(userRef);
            if (!doc.exists) throw new Error("Utilisateur introuvable");
            const currentBalance = doc.data().wallet_balance || 0;
            if (currentBalance < COST_VEO) throw new Error("SOLDE_INSUFFISANT");
            t.update(userRef, { wallet_balance: currentBalance - COST_VEO });
        });
    } catch (e) {
        if (e.message === "SOLDE_INSUFFISANT") throw e;
        throw new Error("Erreur débit");
    }

    // 2. GÉNÉRATION (C'est ici qu'on triche)
    try {
        console.log(`🎬 Génération lancée pour ${userId}...`);

        if (MOCK_MODE) {
            // ON SIMULE L'ATTENTE (2 secondes)
            console.log("⚠️ MODE SIMULATION ACTIVÉ");
            await new Promise(resolve => setTimeout(resolve, 2000));

            // ON SIMULE UNE ERREUR ALEATOIRE (pour tester le remboursement)
            // Décommente la ligne dessous pour tester le remboursement 1 fois sur 2
            // if (Math.random() > 0.5) throw new Error("Simulation erreur Veo");

            // ON RENVOIE UNE FAUSSE VIDÉO
            return {
                requestId: "mock_video_123",
                status: "completed",
                outputUrl: "https://media.istockphoto.com/id/2190341611/fr/vid%C3%A9o/asian-sisters-business-travel-deux-s%C5%93urs-discutant-sur-le-canap%C3%A9-dans-le-hall-de-lh%C3%B4tel.mp4?s=mp4-640x640-is&k=20&c=mPKxWq1U74fa39pPhhOxi2JHEGtG2OierBBFkAWh1f0=" 
                // ^ C'est une vidéo libre de droit d'un chat qui dort
            };
        }

        // ... Ici ton vrai appel API Veo (Fetch) ...

    } catch (error) {
        // ... Ton code de remboursement existant ...
         console.error("❌ Erreur génération:", error);
         await userRef.update({ wallet_balance: admin.firestore.FieldValue.increment(COST_VEO) });
         throw new Error("Échec génération (Remboursé)");
    }
}

module.exports= {generateVideo};

