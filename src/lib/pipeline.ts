import type { z } from "zod";

import {
  stageKeys,
  type PipelineCard,
  type PipelineCardInput,
  type PipelineStage,
  type pipelineMoveSchema,
} from "@/lib/pipeline-shared";
import { getSupabaseAdminClient } from "@/lib/supabase/admin";

/** Accès aux fiches du pipeline. Réservé au serveur : utilise la clé de service. */

function mapCard(row: Record<string, unknown>): PipelineCard {
  const text = (value: unknown) => (typeof value === "string" && value ? value : undefined);

  return {
    id: String(row.id),
    stage: stageKeys.includes(row.stage as PipelineStage) ? (row.stage as PipelineStage) : "nouveau",
    position: Number(row.position ?? 0),
    firstName: String(row.first_name ?? ""),
    lastName: String(row.last_name ?? ""),
    companyName: text(row.company_name),
    companySiren: text(row.company_siren),
    email: text(row.email),
    phone: text(row.phone),
    estimatedAmount: row.estimated_amount === null || row.estimated_amount === undefined ? undefined : Number(row.estimated_amount),
    note: text(row.note),
    createdAt: String(row.created_at),
    updatedAt: String(row.updated_at),
  };
}

function toRow(input: PipelineCardInput) {
  const companyName = input.companyName?.trim() || null;

  return {
    stage: input.stage,
    first_name: input.firstName?.trim() ?? "",
    last_name: input.lastName.trim(),
    company_name: companyName,
    company_siren: companyName ? input.companySiren || null : null,
    email: input.email || null,
    phone: input.phone || null,
    estimated_amount: input.estimatedAmount ?? null,
    note: input.note || null,
    updated_at: new Date().toISOString(),
  };
}

/** La table n'existe pas encore tant que la migration n'a pas été exécutée. */
function isMissingTable(error: { code?: string; message?: string } | null) {
  return Boolean(error && (error.code === "42P01" || error.code === "PGRST205" || /pipeline_cards/.test(error.message ?? "")));
}

export async function getPipelineCards(): Promise<{ cards: PipelineCard[]; isReady: boolean }> {
  const supabase = getSupabaseAdminClient();

  if (!supabase) {
    return { cards: [], isReady: false };
  }

  const { data, error } = await supabase.from("pipeline_cards").select("*").order("position").order("created_at");

  if (error) {
    if (isMissingTable(error)) {
      return { cards: [], isReady: false };
    }

    throw new Error(error.message);
  }

  return { cards: (data ?? []).map((row) => mapCard(row as Record<string, unknown>)), isReady: true };
}

export async function savePipelineCard(input: PipelineCardInput) {
  const supabase = getSupabaseAdminClient();

  if (!supabase) {
    throw new Error("Base de données indisponible.");
  }

  if (input.id) {
    const { data, error } = await supabase.from("pipeline_cards").update(toRow(input)).eq("id", input.id).select("*").maybeSingle();

    if (error || !data) {
      throw new Error(error?.message ?? "Fiche introuvable.");
    }

    return mapCard(data as Record<string, unknown>);
  }

  // Une nouvelle fiche se place en bas de sa colonne.
  const { data: last } = await supabase
    .from("pipeline_cards")
    .select("position")
    .eq("stage", input.stage)
    .order("position", { ascending: false })
    .limit(1)
    .maybeSingle();

  const { data, error } = await supabase
    .from("pipeline_cards")
    .insert({ ...toRow(input), position: Number(last?.position ?? -1) + 1 })
    .select("*")
    .single();

  if (error || !data) {
    throw new Error(error?.message ?? "Impossible de créer la fiche.");
  }

  return mapCard(data as Record<string, unknown>);
}

export async function movePipelineCard(input: z.infer<typeof pipelineMoveSchema>) {
  const supabase = getSupabaseAdminClient();

  if (!supabase) {
    throw new Error("Base de données indisponible.");
  }

  const now = new Date().toISOString();
  const results = await Promise.all(
    input.orderedIds.map((cardId, index) =>
      supabase
        .from("pipeline_cards")
        .update(cardId === input.id ? { stage: input.stage, position: index, updated_at: now } : { position: index })
        .eq("id", cardId),
    ),
  );

  const failure = results.find((result) => result.error);

  if (failure?.error) {
    throw new Error(failure.error.message);
  }
}

export async function deletePipelineCard(id: string) {
  const supabase = getSupabaseAdminClient();

  if (!supabase) {
    throw new Error("Base de données indisponible.");
  }

  const { error } = await supabase.from("pipeline_cards").delete().eq("id", id);

  if (error) {
    throw new Error(error.message);
  }
}
