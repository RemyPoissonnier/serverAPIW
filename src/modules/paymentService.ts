import { PolarWebhookData, UserData } from '../type';
import { db } from './auth';


// Dictionnaire : ID Produit Polar => Nombre de jetons
// Record<string, number> assure que les clés sont des strings et les valeurs des nombres
const PRODUCT_TOKENS: Record<string, number> = {
    "79eddeb7-82d2-4f53-9ef9-2aceca39f415": 100,  // Product test 100
    "b332d0ab-28c6-4c0e-87e7-052ce9d9c3ec": 105   // sub month test per month
};

export async function handlePurchase(data: PolarWebhookData): Promise<void> {
    const userId = data.metadata?.userId; 
    
    // Sécurité : on vérifie que product existe
    const productId = data.product?.id;

    if (!userId) {
        console.error("⚠️ Pas de userId dans les métadonnées !");
        return;
    }

    if (!productId) {
        console.error("⚠️ Pas de product ID dans le webhook !");
        return;
    }

    const tokens = PRODUCT_TOKENS[productId] || 0;

    if (tokens > 0) {
        await addTokensToUser(userId, tokens);
    } else {
        console.warn(`⚠️ Produit ${productId} inconnu ou sans jetons définis.`);
    }
}

export async function handleSubscription(data: PolarWebhookData): Promise<void> {
    const userId = data.metadata?.userId;
    
    // Logique pour abonnement (ex: 300 jetons par mois)
    if (userId) {
        await addTokensToUser(userId, 300);
    } else {
        console.error("⚠️ Subscription créée sans userId dans les metadata");
    }
}

// Fonction utilitaire pour écrire dans Firebase
// Note : Pas besoin de l'exporter si elle n'est utilisée que dans ce fichier
async function addTokensToUser(userId: string, amount: number): Promise<void> {
    const userRef = db.collection('users').doc(userId);
    
    try {
        await db.runTransaction(async (t : any) => {
            const doc = await t.get(userRef);
            
            // Cast explicite des données
            const userData = doc.data() as UserData | undefined;
            const currentBalance = userData?.wallet_balance || 0;
            const newBalance = currentBalance + amount;

            t.set(userRef, { 
                wallet_balance: newBalance 
            }, { merge: true });
            
            console.log(`💰 WALLET: ${amount} jetons ajoutés à ${userId}. Nouveau solde : ${newBalance}`);
        });
    } catch (e) {
        console.error("❌ Erreur Firebase transaction:", e);
        // Optionnel : throw e; si tu veux que l'appelant sache qu'il y a eu erreur
    }
}