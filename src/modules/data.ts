// src/modules/data.ts
import { db } from "./auth";


// Petite interface pour dire à TS ce qu'il y a dans ton user
// Ça évite les erreurs du type "Property 'wallet_balance' does not exist"
interface UserData {
  wallet_balance?: number;
  updatedAt?: Date | FirebaseFirestore.Timestamp;
  [key: string]: any; // Pour autoriser d'autres champs éventuels
}

// Ajoute des jetons au porte-monnaie
export async function addTokensToWallet(userId: string, amount: number): Promise<void> {
  if (!userId) return;

  const userRef = db.collection('users').doc(userId);
  
  try {
    await db.runTransaction(async (t : any) => {
      const doc = await t.get(userRef);
      
      // On dit à TS : "Les données que tu récupères ressemblent à UserData"
      const data = doc.data() as UserData | undefined;
      
      const currentBalance = data?.wallet_balance || 0;
      
      t.set(userRef, { 
          wallet_balance: currentBalance + amount,
          updatedAt: new Date() 
      }, { merge: true });
    });
    
    console.log(`✅ DB: ${amount} jetons ajoutés pour ${userId}`);
  } catch (error) {
    console.error("❌ Erreur DB:", error);
    // C'est une bonne pratique de "relancer" l'erreur pour que l'API le sache
    throw error; 
  }
}