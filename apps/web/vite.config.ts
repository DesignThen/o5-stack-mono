import { sentryTanstackStart } from "@sentry/tanstackstart-react/vite";
import tailwindcss from "@tailwindcss/vite";
import { devtools } from "@tanstack/devtools-vite";
import { tanstackStart } from "@tanstack/react-start/plugin/vite";
import viteReact from "@vitejs/plugin-react";
import { nitro } from "nitro/vite";
import { defineConfig, loadEnv } from "vite";
import viteTsConfigPaths from "vite-tsconfig-paths";
import { createWebEnv } from "./src/env.schema";

const config = defineConfig(({ mode }) => {
	const env = createWebEnv({
		...loadEnv(mode, process.cwd(), ""),
		...process.env,
	});
	const shouldUploadSourcemaps = Boolean(
		env.SENTRY_AUTH_TOKEN && env.VITE_SENTRY_ORG && env.VITE_SENTRY_PROJECT,
	);

	return {
		build: {
			sourcemap: "hidden",
		},
		nitro: {
			noExternals: false,
		},
		resolve: {
			dedupe: ["react", "react-dom"],
			tsconfigPaths: true,
		},
		plugins: [
			devtools(),
			nitro(),
			viteTsConfigPaths({
				projects: ["./tsconfig.json"],
			}),
			tailwindcss(),
			tanstackStart(),
			viteReact(),

			sentryTanstackStart({
				org: env.VITE_SENTRY_ORG,
				project: env.VITE_SENTRY_PROJECT,
				authToken: env.SENTRY_AUTH_TOKEN,
				sourcemaps: {
					disable: shouldUploadSourcemaps ? false : "disable-upload",
				},
				errorHandler: (error) => {
					console.warn(
						"[sentry-vite-plugin] Sentry release/source map upload failed; continuing build without uploaded source maps.",
					);
					console.warn(error);
				},
			}),
		],
	};
});

export default config;
