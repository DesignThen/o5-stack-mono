//  @ts-check

/** @type {import('prettier').Config} */
const config = {
  endOfLine: "lf",
  trailingComma: "all",

  plugins: ["prettier-plugin-tailwindcss", "prettier-plugin-organize-imports"],
  tailwindStylesheet: "packages/ui/src/styles/globals.css",
  tailwindFunctions: ["cn", "cva"],
  overrides: [
    {
      files: ["*.json", "*.jsonc"],
      options: {
        trailingComma: "none",
      },
    },
  ],
};

export default config;
