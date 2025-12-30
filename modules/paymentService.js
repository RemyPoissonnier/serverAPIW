// modules/paymentService.js
const { db } = require('./auth'); // Import de Firebase

// Dictionnaire : ID Produit Polar => Nombre de jetons
const PRODUCT_TOKENS = {
    "79eddeb7-82d2-4f53-9ef9-2aceca39f415": 100,  // Product test 100
    "b332d0ab-28c6-4c0e-87e7-052ce9d9c3ec": 105 //sub month test per month
};

async function handlePurchase(data) {
    const userId = data.metadata?.userId; // On récupère l'ID qu'on a passé lors du checkout
    const productId = data.product.id;

    if (!userId) {
        console.error("⚠️ Pas de userId dans les métadonnées !");
        return;
    }

    const tokens = PRODUCT_TOKENS[productId] || 0;

    if (tokens > 0) {
        await addTokensToUser(userId, tokens);
    }
}

async function handleSubscription(data) {
    const userId = data.metadata?.userId;
    // Logique pour abonnement (ex: 300 jetons par mois)
    if (userId) {
        await addTokensToUser(userId, 300);
    }
}

// Fonction utilitaire pour écrire dans Firebase
async function addTokensToUser(userId, amount) {
    const userRef = db.collection('users').doc(userId);
    
    try {
        await db.runTransaction(async (t) => {
            const doc = await t.get(userRef);
            const currentBalance = doc.data()?.wallet_balance || 0;
            const newBalance = currentBalance + amount;

            t.set(userRef, { 
                wallet_balance: newBalance 
            }, { merge: true });
            
            console.log(`💰 WALLET: ${amount} jetons ajoutés à ${userId}. Nouveau solde : ${newBalance}`);
        });
    } catch (e) {
        console.error("❌ Erreur Firebase:", e);
    }
}

module.exports = { handlePurchase, handleSubscription };