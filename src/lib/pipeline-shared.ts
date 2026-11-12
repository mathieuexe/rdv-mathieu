import { z } from "zod";

/**
 * Définitions du pipeline partagées entre le serveur et le navigateur :
 * étapes, forme d'une fiche et règles de validation. Aucun accès à la base ici.
 */

/** Étapes du pipeline, dans l'ordre des colonnes du tableau. */
export const PIPELINE_STAGES = [
  { key: "nouveau", label: "Nouveau", accent: "bg-slate-400" },
  { key: "contacte", label: "Contacté", accent: "bg-sky-500" },
  { key: "rendez_vous", label: "Rendez-vous", accent: "bg-indigo-500" },
  { key: "proposition", label: "Proposition", accent: "bg-amber-500" },
  { key: "gagne", label: "Gagné", accent: "bg-emerald-500" },
  { key: "perdu", label: "Perdu", accent: "bg-rose-500" },
] as const;

export type PipelineStage = (typeof PIPELINE_STAGES)[number]["key"];

export const stageKeys = PIPELINE_STAGES.map((stage) => stage.key) as [PipelineStage, ...PipelineStage[]];

export interface PipelineCard {
  id: string;
  stage: PipelineStage;
  position: number;
  firstName: string;
  lastName: string;
  companyName?: string;
  companySiren?: string;
  email?: string;
  phone?: string;
  estimatedAmount?: number;
  note?: string;
  createdAt: string;
  updatedAt: string;
}

export const pipelineCardSchema = z.object({
  id: z.string().uuid().optional(),
  stage: z.enum(stageKeys),
  firstName: z.string().trim().max(80).optional().or(z.literal("")),
  lastName: z.string().trim().min(1, "Le nom du prospect est requis.").max(80),
  companyName: z.string().trim().max(150).optional().or(z.literal("")),
  companySiren: z.string().trim().regex(/^\d{9}$/, "Le SIREN est invalide.").optional().or(z.literal("")),
  email: z.string().trim().email("L'email est invalide.").optional().or(z.literal("")),
  phone: z.string().trim().max(30).optional().or(z.literal("")),
  estimatedAmount: z.number().min(0, "Le montant ne peut pas être négatif.").max(9_999_999).optional(),
  note: z.string().trim().max(2000, "La note est trop longue.").optional().or(z.literal("")),
});

export type PipelineCardInput = z.infer<typeof pipelineCardSchema>;

export const pipelineMoveSchema = z.object({
  id: z.string().uuid(),
  stage: z.enum(stageKeys),
  /** Identifiants des fiches de la colonne d'arrivée, dans leur nouvel ordre. */
  orderedIds: z.array(z.string().uuid()).max(500),
});
