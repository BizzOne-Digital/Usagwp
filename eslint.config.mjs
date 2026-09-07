import { dirname } from "path";
import { fileURLToPath } from "url";
import { FlatCompat } from "@eslint/eslintrc";

const compat = new FlatCompat({ baseDirectory: dirname(fileURLToPath(import.meta.url)) });

// Generated files (next-env.d.ts, .next) are excluded: they are rewritten by
// the framework and are not ours to lint.
const config = [
  {
    ignores: [
      ".next/**",
      "node_modules/**",
      ".agents/**",
      "next-env.d.ts",
      "eslint.config.mjs",
    ],
  },
  ...compat.extends("next/core-web-vitals", "next/typescript"),
];

export default config;
