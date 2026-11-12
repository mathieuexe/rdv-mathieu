import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";

function mockGoogleTokenResponse(status: number, body: object) {
  vi.stubGlobal(
    "fetch",
    vi.fn(async () => new Response(JSON.stringify(body), { status, headers: { "Content-Type": "application/json" } })),
  );
}

describe("rafraîchissement du jeton Google", () => {
  beforeEach(() => {
    vi.resetModules();
    vi.stubEnv("GOOGLE_CLIENT_ID", "client-id");
    vi.stubEnv("GOOGLE_CLIENT_SECRET", "client-secret");
  });

  afterEach(() => {
    vi.unstubAllEnvs();
    vi.unstubAllGlobals();
  });

  it("traduit invalid_grant en demande de reconnexion", async () => {
    mockGoogleTokenResponse(400, { error: "invalid_grant", error_description: "Bad Request" });
    const google = await import("./google-calendar");

    const failure = await google.refreshGoogleAccessToken("jeton").catch((error: Error) => error);

    expect(failure).toBeInstanceOf(Error);
    expect(google.isGoogleReconnectRequired((failure as Error).message)).toBe(true);
  });

  it("signale des identifiants d'application refusés", async () => {
    mockGoogleTokenResponse(401, { error: "invalid_client", error_description: "Unauthorized" });
    const google = await import("./google-calendar");

    await expect(google.refreshGoogleAccessToken("jeton")).rejects.toThrow(/GOOGLE_CLIENT_ID/);
  });

  it("renvoie un nouveau jeton d'accès en cas de succès", async () => {
    mockGoogleTokenResponse(200, { access_token: "nouveau", expires_in: 3600 });
    const google = await import("./google-calendar");

    const tokens = await google.refreshGoogleAccessToken("jeton");

    expect(tokens.accessToken).toBe("nouveau");
    expect(tokens.refreshToken).toBe("jeton");
  });
});
