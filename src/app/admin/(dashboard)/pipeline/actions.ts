"use server";

import { revalidatePath } from "next/cache";

import { getAdminSession } from "@/lib/auth";
import { deletePipelineCard, movePipelineCard, savePipelineCard } from "@/lib/pipeline";
import { pipelineCardSchema, pipelineMoveSchema, type PipelineCard } from "@/lib/pipeline-shared";

type ActionResult<T = object> = ({ ok: true } & T) | { ok: false; error: string };

async function requireAdmin() {
  const session = await getAdminSession();
  return session.isAuthenticated;
}

function failure(error: unknown, fallback: string): { ok: false; error: string } {
  return { ok: false, error: error instanceof Error ? error.message : fallback };
}

export async function savePipelineCardAction(input: unknown): Promise<ActionResult<{ card: PipelineCard }>> {
  if (!(await requireAdmin())) {
    return { ok: false, error: "Session expirée. Reconnectez-vous." };
  }

  const parsed = pipelineCardSchema.safeParse(input);

  if (!parsed.success) {
    return { ok: false, error: parsed.error.issues[0]?.message ?? "La fiche contient une erreur." };
  }

  try {
    const card = await savePipelineCard(parsed.data);
    revalidatePath("/admin/pipeline");
    return { ok: true, card };
  } catch (error) {
    return failure(error, "Impossible d'enregistrer la fiche.");
  }
}

export async function movePipelineCardAction(input: unknown): Promise<ActionResult> {
  if (!(await requireAdmin())) {
    return { ok: false, error: "Session expirée. Reconnectez-vous." };
  }

  const parsed = pipelineMoveSchema.safeParse(input);

  if (!parsed.success) {
    return { ok: false, error: "Déplacement invalide." };
  }

  try {
    await movePipelineCard(parsed.data);
    revalidatePath("/admin/pipeline");
    return { ok: true };
  } catch (error) {
    return failure(error, "Impossible de déplacer la fiche.");
  }
}

export async function deletePipelineCardAction(id: string): Promise<ActionResult> {
  if (!(await requireAdmin())) {
    return { ok: false, error: "Session expirée. Reconnectez-vous." };
  }

  try {
    await deletePipelineCard(id);
    revalidatePath("/admin/pipeline");
    return { ok: true };
  } catch (error) {
    return failure(error, "Impossible de supprimer la fiche.");
  }
}
