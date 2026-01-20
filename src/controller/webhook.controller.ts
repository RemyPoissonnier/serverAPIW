import { Request, Response } from "express";
import { validateEvent } from "@polar-sh/sdk/webhooks";
import { POLAR_WEBHOOK_SECRET } from "../config/polar";
import { handlePurchase, handleSubscription } from "../modules/paymentService"; // Ton module existant

export const handlePolarWebhook = async (req: Request, res: Response): Promise<any> => {
  if (!POLAR_WEBHOOK_SECRET) {
    return res.status(500).send("Erreur serveur: Secret manquant");
  }

  let event;
  try {
    // req.body est un Buffer grâce à express.raw() dans la route
    event = validateEvent(
      req.body as string | Buffer,
      req.headers as Record<string, string>,
      POLAR_WEBHOOK_SECRET
    );
  } catch (err: any) {
    console.error("❌ ÉCHEC VALIDATION WEBHOOK :", err.message);
    return res.status(400).send("Webhook Error");
  }

  try {
    if (event.type === "checkout.created") {
      await handlePurchase(event.data);
    } else if (event.type === "subscription.created") {
      await handleSubscription(event.data);
    }
    res.send({ received: true });
  } catch (err) {
    console.error("Erreur logique métier :", err);
    res.status(500).send("Erreur serveur");
  }
};