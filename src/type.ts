// src/types/index.ts

export interface CheckoutRequestBody {
  productId: string;
  userId: string;
}

export interface GenerateRequestBody {
  userId: string;
  prompt: string;
  options?: any; // Tu pourras préciser le type options plus tard
}

// backend/src/types/ia.types.ts

export type IaModel = 'nanobanan' | 'runway' | 'pika' | 'luma' | 'custom';

// C'est le format que ta DB ou ton service de Job va stocker
export type IaJobStatus = 'queued' | 'running' | 'succeeded' | 'failed';

// --- INTERFACES ---

export interface VideoJobResult {
    requestId: string;
    status: 'queued' | 'processing' | 'completed' | 'failed';
    outputUrl?: string;
    previewUrl?: string; // Ajouté au cas où tu as une preview
    format?: string;
    error?: string;
    model?: string;
}

export interface UserData {
    wallet_balance?: number;
    [key: string]: any;
}


// Interface pour décrire partiellement les données envoyées par Polar
export interface PolarWebhookData {
  metadata?: {
    userId?: string;
  };
  product?: {
    id: string;
    name?: string;
  };
  // On accepte d'autres champs éventuels
  [key: string]: any; 
}



export type OptionsIaRP = {
  aspectRatio: "16:9" | "9:16";

  resolution: "720p" | "1080p";

  durationSeconds: "4" | "6" | "8";
};

export type IaRequestPayload = {
  // model: IaModel
  // mode: IaGenerationMode
  userId: string;
  prompt: string;
  options : OptionsIaRP;
};