import { fileURLToPath, URL } from "node:url";
import { defineConfig } from "vitest/config";

export default defineConfig({
  resolve: {
    alias: { "@": fileURLToPath(new URL("./src", import.meta.url)) },
  },
  test: {
    environment: "jsdom",
    setupFiles: ["./src/test/setup.ts"],
    include: ["src/**/*.test.{ts,tsx}"],
    coverage: {
      provider: "v8",
      reporter: ["text", "html", "json-summary"],
      include: [
        "src/lib/utils.ts",
        "src/lib/error-page.ts",
        "src/lib/exerciseVideo.ts",
        "src/lib/exerciseLibrary/match.ts",
        "src/i18n/index.ts",
        "src/i18n/seo.ts",
        "src/i18n/useLocale.ts",
        "src/hooks/useAuth.ts",
        "src/components/ExerciseDemo.tsx",
        "src/components/WorkoutResult.tsx",
        "src/components/LanguageSwitcher.tsx"
      ],
      exclude: ["src/**/*.test.*", "src/lib/exerciseLibrary/index.json"],
    },
  },
});