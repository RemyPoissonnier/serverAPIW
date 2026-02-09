import { Request, Response } from "express";
import { polar } from "../config/polar";
import { CheckoutRequestBody } from "../type";
import { getUserSubscription } from "../modules/paymentService";

export const createCheckout = async (
  req: Request<{}, {}, CheckoutRequestBody>,
  res: Response
): Promise<any> => {
  const { productId, userId, discountId } = req.body;

  if (!productId || !userId) {
    return res.status(400).json({ error: "Missing productId or userId" });
  }

  try {
    console.log(`⏳ Création checkout pour ${userId} avec produit ${productId}...`);

    const checkout = await polar.checkouts.create({
      products: [productId],
      discountId: discountId,
      metadata: { userId },
      successUrl: `${process.env.CLIENT_URL || 'http://localhost:5173'}/success?checkout_id={CHECKOUT_ID}`,
    });

    console.log("✅ Lien créé :", checkout.url);
    res.json({ url: checkout.url });
  } catch (error) {
    console.error("❌ Erreur création checkout:", error);
    res.status(500).json({ error: "Impossible de créer le paiement." });
  }
}

export const getSubscriptionStatus = async (req: Request, res: Response): Promise<any> => {
  // IMPORTANT : On suppose que ton middleware d'auth a ajouté `req.user`
  // Si tu n'as pas encore typé req.user, utilise (req as any).user temporairement
  const user = (req as any).user;

  console.log("User trying id ", user.uid );
  

  if (!user || !user.uid) {
    return res.status(401).json({ error: "Utilisateur non authentifié" });
  }

  try {
    const subscription = await getUserSubscription(user.uid); //TODO maybe to change

    return res.json({
      ...subscription
    });

  } catch (error) {
    return res.status(500).json({ error: "Erreur serveur lors de la vérification de l'abonnement" });
  }
};;