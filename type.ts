// backend/src/types/ia.types.ts

export type IaModel = 'nanobanan' | 'runway' | 'pika' | 'luma' | 'custom';

// C'est le format que ta DB ou ton service de Job va stocker
export type IaJobStatus = 'queued' | 'running' | 'succeeded' | 'failed';

export interface IaJob {
  requestId: string;
  userId: string;
  model: IaModel;
  status: IaJobStatus;
  createdAt: Date;
  prompt: string;
  // Optionnel : stocker le résultat ici ou dans une table séparée
  result?: {
    previewUrl?: string;
    outputUrl?: string;
    error?: string;
  };
}

// C'est exactement ce que ton frontend attend (IaResponse)
export interface IaApiResponse {
  requestId: string;
  model: IaModel;
  status: IaJobStatus;
  previewUrl?: string;
  outputUrl?: string;
  error?: string;
}