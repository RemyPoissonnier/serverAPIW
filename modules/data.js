// data.js
const { db } = require('./auth'); // Il a besoin de la connexion créée juste avant

// Ajoute des jetons au porte-monnaie
async function addTokensToWallet(userId, amount) {
  if (!userId) return;

  const userRef = db.collection('users').doc(userId);
  
  try {
    await db.runTransaction(async (t) => {
      const doc = await t.get(userRef);
      const currentBalance = doc.data()?.wallet_balance || 0;
      
      t.set(userRef, { 
          wallet_balance: currentBalance + amount,
          updatedAt: new Date() // J'utilise Date() standard c'est plus simple
      }, { merge: true }); // Merge permet de ne pas effacer les autres infos de l'user
    });
    console.log(`✅ DB: ${amount} jetons ajoutés pour ${userId}`);
  } catch (error) {
    console.error("❌ Erreur DB:", error);
  }
}

// Tu pourras ajouter d'autres fonctions ici plus tard (ex: decreaseTokens)

module.exports = { addTokensToWallet };