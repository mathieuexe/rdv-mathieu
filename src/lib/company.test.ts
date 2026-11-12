import { describe, expect, it } from "vitest";

import { COMPANY_NAME_KEY, formatSiren, splitCompany, withCompany } from "./company";

describe("entreprise d'un rendez-vous", () => {
  it("range l'entreprise avec les réponses puis la restitue à part", () => {
    const stored = withCompany({ motif: "Site vitrine" }, { name: " OVH ", siren: "424761419" });
    const { responses, company } = splitCompany(stored);

    expect(company).toEqual({ name: "OVH", siren: "424761419" });
    expect(responses).toEqual({ motif: "Site vitrine" });
  });

  it("n'enregistre rien sans nom d'entreprise, même avec un SIREN", () => {
    expect(withCompany({ motif: "Audit" }, { name: "", siren: "424761419" })).toEqual({ motif: "Audit" });
  });

  it("ignore une clé réservée envoyée par le visiteur", () => {
    expect(withCompany({ [COMPANY_NAME_KEY]: "Faux" }, {})).toEqual({});
  });

  it("met en forme le SIREN", () => {
    expect(formatSiren("424761419")).toBe("424 761 419");
  });
});
