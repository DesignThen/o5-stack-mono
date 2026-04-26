import { sentryTanstackStart } from "@sentry/tanstackstart-react/vite";
import tailwindcss from "@tailwindcss/vite";
import { devtools } from "@tanstack/devtools-vite";
import { tanstackStart } from "@tanstack/react-start/plugin/vite";
import viteReact from "@vitejs/plugin-react";
import { nitro } from "nitro/vite";
import { defineConfig, loadEnv } from "vite";
import { createWebEnv } from "./src/env.schema";

const config = defineConfig(({ mode }) => {
  const env = createWebEnv({
    ...loadEnv(mode, process.cwd(), ""),
    ...process.env,
  });

  return {
    resolve: {
      tsconfigPaths: true,
    },
    plugins: [
      devtools(),
      nitro(),
      tailwindcss(),
      tanstackStart(),
      viteReact(),
      sentryTanstackStart({
        org: env.VITE_SENTRY_ORG,
        project: env.VITE_SENTRY_PROJECT,
        authToken: env.SENTRY_AUTH_TOKEN,
      }),
    ],
  };
});

export default config;
