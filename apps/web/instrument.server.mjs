import * as Sentry from "@sentry/tanstackstart-react";

const sentryDsn =
	import.meta.env?.VITE_SENTRY_DSN ?? process.env.VITE_SENTRY_DSN;

if (!sentryDsn) {
	console.warn("VITE_SENTRY_DSN is not defined. Sentry is not running.");
} else {
	Sentry.init({
		dsn: sentryDsn,
		// Preserve user context without enabling the additional Sentry 11 data categories.
		dataCollection: {
			userInfo: true,
			httpBodies: [],
			graphQL: { document: false, variables: false },
			genAI: { inputs: false, outputs: false },
			mcp: { inputs: false, outputs: false },
			databaseQueryData: false,
			queues: false,
		},

		// Set tracesSampleRate to 1.0 to capture 100%
		// of transactions for tracing.
		// We recommend adjusting this value in production.
		// Learn more at https://docs.sentry.io/platforms/javascript/configuration/options/#traces-sample-rate
		tracesSampleRate: 1.0,
	});
}
