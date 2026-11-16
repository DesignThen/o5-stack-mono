import type { WebhookEvent } from "@clerk/backend";
import { Webhook } from "svix";
import { env } from "./env";

export async function validateWebhookEvent(
	request: Request,
): Promise<
	| { success: true; payload: WebhookEvent }
	| { success: false; response: Response }
> {
	const svixId = request.headers.get("svix-id");
	const svixTimestamp = request.headers.get("svix-timestamp");
	const svixSignature = request.headers.get("svix-signature");
	if (!svixId || !svixTimestamp || !svixSignature) {
		return {
			success: false,
			response: new Response("Missing svix headers", { status: 400 }),
		};
	}

	const body = await request.text();
	const wh = new Webhook(env.CLERK_WEBHOOK_SECRET);

	let event: WebhookEvent;
	try {
		wh.verify(body, {
			"svix-id": svixId,
			"svix-timestamp": svixTimestamp,
			"svix-signature": svixSignature,
		});
		event = JSON.parse(body) as WebhookEvent;
	} catch {
		return {
			success: false,
			response: new Response("Invalid signature", { status: 400 }),
		};
	}

	if (!event || typeof event.type !== "string") {
		return {
			success: false,
			response: new Response("Unknown Payload Error", { status: 500 }),
		};
	}

	return { success: true, payload: event };
}
