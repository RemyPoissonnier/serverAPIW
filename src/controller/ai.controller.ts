import { Request, Response } from "express";
import { generateVideo, getJobStatus } from "../modules/videoService"; // Ton module existant
import { GenerateRequestBody } from "../type";

export const generateVideoController = async (
  req: Request<{}, {}, GenerateRequestBody>,
  res: Response
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

export const getJobStatusController = async (req: Request, res: Response): Promise<any> => {
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