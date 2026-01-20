import { Request, Response } from "express";
import { polar } from "../config/polar";
import { CheckoutRequestBody } from "../type";

export const createCheckout = async (
  req: Request<{}, {}, CheckoutRequestBody>,
  res: Response
): Promise<any> => {
  const { productId, userId } = req.body;

  if (!productId || !userId) {
    return res.status(400).json({ error: "Missing productId or userId" });
  }

  try {
    console.log(`⏳ Création checkout pour ${userId} avec produit ${productId}...`);

    const checkout = await polar.checkouts.create({
      products: [productId],
      metadata: { userId },
      successUrl: `${process.env.CLIENT_URL || 'http://localhost:5173'}/success?checkout_id={CHECKOUT_ID}`,
    });

    console.log("✅ Lien créé :", checkout.url);
    res.json({ url: checkout.url });
  } catch (error) {
    console.error("❌ Erreur création checkout:", error);
    res.status(500).json({ error: "Impossible de créer le paiement." });
  }
};