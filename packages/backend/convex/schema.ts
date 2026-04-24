import { defineSchema, defineTable } from "convex/server";
import { v } from "convex/values";

export default defineSchema({
  users: defineTable({
    clerkUserId: v.optional(v.string()),
    clerkSyncTime: v.optional(v.number()),
    clerkDeletionTime: v.optional(v.number()),

    name: v.string(),
    email: v.string(),
    imageUrl: v.optional(v.string()),
  }).index("by_clerk_user_id", ["clerkUserId"]),

  organizations: defineTable({
    clerkOrgId: v.optional(v.string()),
    clerkSyncTime: v.optional(v.number()),
    clerkDeletionTime: v.optional(v.number()),

    name: v.string(),
    imageUrl: v.optional(v.string()),
  }).index("by_clerk_org_id", ["clerkOrgId"]),

  organizationMemberships: defineTable({
    clerkUserId: v.optional(v.string()),
    clerkOrgId: v.optional(v.string()),
    clerkOrgMemberId: v.string(),
    clerkSyncTime: v.optional(v.number()),
    clerkDeletionTime: v.optional(v.number()),

    role: v.string(),
  })
    .index("by_clerk_org_member_id", ["clerkOrgMemberId"])
    .index("by_clerk_user_id_and_clerk_org_id", ["clerkUserId", "clerkOrgId"]),
});
