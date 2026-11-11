import path from "node:path";

import { defineConfig } from "vitest/config";

export default defineConfig({
  resolve: {
    alias: { "@": path.resolve(__dirname, "src") },
  },
  esbuild: { jsx: "automatic" },
  test: {
    // Les fichiers `._*` sont des résidus macOS créés sur les disques externes.
    exclude: ["**/node_modules/**", "**/.next/**", "**/._*"],
  },
});
