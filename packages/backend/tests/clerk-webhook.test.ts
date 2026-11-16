import { beforeEach, describe, expect, it, vi } from "vitest";
import { validateWebhookEvent } from "../convex/lib/clerkWebhook";

const { verify } = vi.hoisted(() => ({ verify: vi.fn() }));
vi.mock("svix", () => ({
	Webhook: class {
		verify = verify;
	},
}));
vi.mock("../convex/lib/env", () => ({
	env: { CLERK_WEBHOOK_SECRET: "test-secret" },
}));

function request(body: string, headers = true) {
	return new Request("https://example.com/clerk-event", {
		method: "POST",
		body,
		headers: headers
			? {
					"svix-id": "event-1",
					"svix-timestamp": "123",
					"svix-signature": "signature",
				}
			: {},
	});
}

beforeEach(() => {
	verify.mockReset();
});

describe("Clerk webhook validation", () => {
	it("parses the verified body when verification returns no payload", async () => {
		const body = JSON.stringify({
			type: "user.deleted",
			data: { id: "user-1" },
		});
		expect(await validateWebhookEvent(request(body))).toEqual({
			success: true,
			payload: JSON.parse(body),
		});
		expect(verify).toHaveBeenCalledWith(body, {
			"svix-id": "event-1",
			"svix-timestamp": "123",
			"svix-signature": "signature",
		});
	});

	it("rejects missing signature headers before verification", async () => {
		const result = await validateWebhookEvent(request("{}", false));
		expect(result.success).toBe(false);
		if (!result.success) expect(result.response.status).toBe(400);
		expect(verify).not.toHaveBeenCalled();
	});

	it("rejects the payload when signature verification fails", async () => {
		verify.mockImplementation(() => {
			throw new Error("invalid signature");
		});
		const result = await validateWebhookEvent(
			request('{"type":"user.deleted"}'),
		);
		expect(result.success).toBe(false);
		if (!result.success)
			expect(await result.response.text()).toBe("Invalid signature");
	});

	it("rejects malformed JSON after verification", async () => {
		const result = await validateWebhookEvent(request("not json"));
		expect(verify).toHaveBeenCalled();
		expect(result.success).toBe(false);
	});

	it.each(["null", "{}", '{"type":123}'])(
		"rejects a payload without an event type: %s",
		async (body) => {
			const result = await validateWebhookEvent(request(body));
			expect(result.success).toBe(false);
			if (!result.success) expect(result.response.status).toBe(500);
		},
	);
});
