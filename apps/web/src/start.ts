import { clerkMiddleware } from "@clerk/tanstack-react-start/server";
import {
	sentryGlobalFunctionMiddleware,
	sentryGlobalRequestMiddleware,
	wrapMiddlewaresWithSentry,
} from "@sentry/tanstackstart-react";
import { createStart } from "@tanstack/react-start";

export const startInstance = createStart(() => {
	return {
		requestMiddleware: wrapMiddlewaresWithSentry({
			sentryGlobalRequestMiddleware,
			clerkMiddleware: clerkMiddleware(),
		}),
		functionMiddleware: wrapMiddlewaresWithSentry({
			sentryGlobalFunctionMiddleware,
		}),
	};
});
