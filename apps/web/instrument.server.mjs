import * as Sentry from "@sentry/tanstackstart-react";

const sentryDsn =
  import.meta.env?.VITE_SENTRY_DSN ?? process.env.VITE_SENTRY_DSN;

if (!sentryDsn) {
  console.warn("VITE_SENTRY_DSN is not defined. Sentry is not running.");
} else {
  Sentry.init({
    dsn: sentryDsn,
    // Adds request headers and IP for users, for more info visit:
    // https://docs.sentry.io/platforms/javascript/guides/tanstackstart-react/configuration/options/#sendDefaultPii
    sendDefaultPii: true,

    // Set tracesSampleRate to 1.0 to capture 100%
    // of transactions for tracing.
    // We recommend adjusting this value in production.
    // Learn more at https://docs.sentry.io/platforms/javascript/configuration/options/#traces-sample-rate
    tracesSampleRate: 1.0,

    // Enable logs to be sent to Sentry
    enableLogs: true,
  });
}
