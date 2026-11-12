/**
 * Entreprise rattachée à un rendez-vous (facultative).
 *
 * Elle est rangée dans la colonne JSON `custom_field_responses` sous deux clés
 * réservées, ce qui évite de modifier le schéma de la base. Ces clés ne sont
 * jamais exposées telles quelles : `splitCompany` les retire à la lecture.
 */
export const COMPANY_NAME_KEY = "__entreprise_nom";
export const COMPANY_SIREN_KEY = "__entreprise_siren";

export interface AppointmentCompany {
  name?: string;
  siren?: string;
}

/** Résultat renvoyé par la recherche d'entreprises. */
export interface CompanySuggestion {
  name: string;
  siren: string;
  location: string;
}

export function withCompany(responses: Record<string, string> | undefined, company: AppointmentCompany) {
  const merged: Record<string, string> = { ...(responses ?? {}) };
  const name = company.name?.trim();
  const siren = company.siren?.trim();

  delete merged[COMPANY_NAME_KEY];
  delete merged[COMPANY_SIREN_KEY];

  if (name) {
    merged[COMPANY_NAME_KEY] = name;

    // Un SIREN n'a de sens qu'accompagné du nom de l'entreprise.
    if (siren) {
      merged[COMPANY_SIREN_KEY] = siren;
    }
  }

  return merged;
}

export function splitCompany(responses: Record<string, string> | undefined) {
  if (!responses) {
    return { responses: undefined, company: {} as AppointmentCompany };
  }

  const { [COMPANY_NAME_KEY]: name, [COMPANY_SIREN_KEY]: siren, ...rest } = responses;

  return {
    responses: rest,
    company: { name: name || undefined, siren: siren || undefined } as AppointmentCompany,
  };
}

/** 424761419 → « 424 761 419 ». */
export function formatSiren(siren: string) {
  return siren.replace(/(\d{3})(?=\d)/g, "$1 ");
}
