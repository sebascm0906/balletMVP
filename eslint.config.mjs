import nextVitals from "eslint-config-next/core-web-vitals";
import nextTypescript from "eslint-config-next/typescript";

const eslintConfig = [
  {
    ignores: [
      ".next/**",
      ".worktrees/**",
      "node_modules/**",
      "coverage/**",
      "dist/**",
      "out/**",
    ],
  },
  ...nextVitals,
  ...nextTypescript,
];

export default eslintConfig;
