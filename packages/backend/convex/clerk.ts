import type { UserJSON, WebhookEvent } from "@clerk/backend";
import { ConvexError, v } from "convex/values";
import { Webhook } from "svix";
import { internal } from "./_generated/api";
import { httpAction, internalMutation } from "./_generated/server";
import { env } from "./lib/env";

async function validateWebhookEvent(
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
    event = wh.verify(body, {
      "svix-id": svixId,
      "svix-timestamp": svixTimestamp,
      "svix-signature": svixSignature,
    }) as WebhookEvent;
  } catch {
    return {
      success: false,
      response: new Response("Invalid signature", { status: 400 }),
    };
  }

  if (typeof event.type !== "string") {
    return {
      success: false,
      response: new Response("Unknown Payload Error", { status: 500 }),
    };
  }

  return { success: true, payload: event };
}

function getPrimaryEmail(user: UserJSON) {
  const primaryEmail = user.email_addresses.find(
    (e) => e.id === user.primary_email_address_id,
  );

  if (!primaryEmail) {
    throw new ConvexError("Primary email for user could not be found");
  }

  return primaryEmail;
}

export const handleClerkWebhook = httpAction(async (ctx, request) => {
  const event = await validateWebhookEvent(request);
  if (!event.success) return event.response;

  switch (event.payload.type) {
    case "user.created":
    case "user.updated": {
      const clerkUser = event.payload.data;
      await ctx.runMutation(internal.clerk.upsertUser, {
        name: [clerkUser.first_name, clerkUser.last_name].join(" "),
        email: getPrimaryEmail(clerkUser).email_address,
        imageUrl: clerkUser.image_url,
        clerkId: clerkUser.id,
      });
      break;
    }
    case "user.deleted": {
      const clerkId = event.payload.data.id!;
      await ctx.runMutation(internal.clerk.deleteUser, { clerkId });
      break;
    }

    case "organization.created":
    case "organization.updated": {
      const clerkOrg = event.payload.data;
      await ctx.runMutation(internal.clerk.upsertOrg, {
        name: clerkOrg.name,
        imageUrl: clerkOrg.image_url,
        clerkId: clerkOrg.id,
      });
      break;
    }
    case "organization.deleted": {
      const clerkId = event.payload.data.id!;
      await ctx.runMutation(internal.clerk.deleteOrg, { clerkId });
      break;
    }

    case "organizationMembership.created":
    case "organizationMembership.updated": {
      const clerkOrgMember = event.payload.data;

      await ctx.runMutation(internal.clerk.upsertOrgMember, {
        memberId: clerkOrgMember.id,
        orgId: clerkOrgMember.organization.id,
        userId: clerkOrgMember.public_user_data.user_id,
        role: clerkOrgMember.role,
      });
      break;
    }
    case "organizationMembership.deleted": {
      const clerkId = event.payload.data.id;
      await ctx.runMutation(internal.clerk.deleteOrgMember, { clerkId });
      break;
    }

    default: {
      console.log(`Ignored Clerk webhook event "${event.payload.type}"`);
    }
  }

  return new Response(null, { status: 200 });
});

export const upsertUser = internalMutation({
  args: {
    clerkId: v.string(),
    name: v.string(),
    email: v.string(),
    imageUrl: v.optional(v.string()),
  },
  returns: v.null(),
  handler: async (ctx, args) => {
    const existing = await ctx.db
      .query("users")
      .withIndex("by_clerk_user_id", (q) => q.eq("clerkUserId", args.clerkId))
      .unique();

    if (existing) {
      await ctx.db.patch(existing._id, {
        name: args.name,
        email: args.email,
        imageUrl: args.imageUrl,

        clerkSyncTime: Date.now(),
      });
    } else {
      await ctx.db.insert("users", {
        name: args.name,
        email: args.email,
        imageUrl: args.imageUrl,

        clerkUserId: args.clerkId,

        clerkSyncTime: Date.now(),
      });
    }

    return null;
  },
});

export const deleteUser = internalMutation({
  args: {
    clerkId: v.string(),
  },
  returns: v.null(),
  handler: async (ctx, args) => {
    const existing = await ctx.db
      .query("users")
      .withIndex("by_clerk_user_id", (q) => q.eq("clerkUserId", args.clerkId))
      .unique();

    if (!existing) {
      throw new ConvexError("Internal Error: Unable to delete user");
    }

    await ctx.db.patch(existing._id, {
      clerkDeletionTime: Number(new Date()),
    });

    return null;
  },
});

export const upsertOrg = internalMutation({
  args: {
    clerkId: v.string(),
    name: v.string(),
    username: v.optional(v.string()),
    imageUrl: v.optional(v.string()),
  },
  returns: v.null(),
  handler: async (ctx, args) => {
    const existing = await ctx.db
      .query("organizations")
      .withIndex("by_clerk_org_id", (q) => q.eq("clerkOrgId", args.clerkId))
      .unique();

    if (existing) {
      await ctx.db.patch(existing._id, {
        name: args.name,
        imageUrl: args.imageUrl,

        clerkSyncTime: Date.now(),
      });
    } else {
      await ctx.db.insert("organizations", {
        name: args.name,
        imageUrl: args.imageUrl,

        clerkOrgId: args.clerkId,

        clerkSyncTime: Date.now(),
      });
    }

    return null;
  },
});

export const deleteOrg = internalMutation({
  args: {
    clerkId: v.string(),
  },
  returns: v.null(),
  handler: async (ctx, args) => {
    const existing = await ctx.db
      .query("organizations")
      .withIndex("by_clerk_org_id", (q) => q.eq("clerkOrgId", args.clerkId))
      .unique();

    if (!existing) {
      throw new ConvexError("Internal Error: Unable to delete organization");
    }

    await ctx.db.patch(existing._id, {
      clerkDeletionTime: Number(new Date()),
    });

    return null;
  },
});

export const upsertOrgMember = internalMutation({
  args: {
    memberId: v.string(),
    userId: v.string(),
    orgId: v.string(),
    role: v.string(),
  },
  returns: v.null(),
  handler: async (ctx, args) => {
    const existing = await ctx.db
      .query("organizationMemberships")
      .withIndex("by_clerk_org_member_id", (q) =>
        q.eq("clerkOrgMemberId", args.memberId),
      )
      .unique();

    if (existing) {
      await ctx.db.patch(existing._id, {
        clerkUserId: args.userId,
        clerkOrgId: args.orgId,
        clerkOrgMemberId: args.memberId,
        role: args.role,

        clerkSyncTime: Date.now(),
      });
    } else {
      await ctx.db.insert("organizationMemberships", {
        clerkUserId: args.userId,
        clerkOrgId: args.orgId,
        clerkOrgMemberId: args.memberId,
        role: args.role,

        clerkSyncTime: Date.now(),
      });
    }

    return null;
  },
});

export const deleteOrgMember = internalMutation({
  args: {
    clerkId: v.string(),
  },
  returns: v.null(),
  handler: async (ctx, args) => {
    const existing = await ctx.db
      .query("organizationMemberships")
      .withIndex("by_clerk_org_member_id", (q) =>
        q.eq("clerkOrgMemberId", args.clerkId),
      )
      .unique();

    if (!existing) {
      throw new ConvexError(
        "Internal Error: Unable to delete organization member",
      );
    }

    await ctx.db.patch(existing._id, {
      clerkDeletionTime: Number(new Date()),
    });

    return null;
  },
});
