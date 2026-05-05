# Printing Productively

## Decisions

Convex is the backend for this project.

Clerk is the auth provider. Clerk user and organization state is synced into Convex through webhooks.

The web runtime env and Convex runtime env are intentionally separate. Web app values live in `apps/web/.env.local`; Convex backend values live in `packages/backend/.env.local` for local development and in Convex deployment env for deployed environments.

## Setup

> This setup assumes you have bun configured on your machine and have run `bun install` from the root of this repository.

### Convex

Convex setup happens from the backend package.

- [ ] Run `cd ./packages/backend && bun run dev` to create or connect a deployment.
- [ ] Copy the generated Convex client values into `apps/web/.env.local` - You will need to prepend `VITE_`:

```env
VITE_CONVEX_SITE_URL="
VITE_CONVEX_URL="
```

> This should add its required environment variables into `packages/backend/.env.local`. You can also remove these values, and run the CLI again to set up or connect to a new instance.

### Auth

> Auth requires your Convex CLI to be authenticated, and for you to have access to the [Clerk dashboard](https://dashboard.clerk.com/apps).

#### Setup

- [ ] Set up or select a [Clerk Application](https://dashboard.clerk.com/apps)
- [ ] Add `VITE_CLERK_PUBLISHABLE_KEY` to `apps/web/.env.local`
- [ ] Add `CLERK_SECRET_KEY` to `apps/web/.env.local`

From the [Clerk dashboard](https://dashboard.clerk.com/apps) select an application and complete the following:

#### 1 - Connect Clerk JWT to Convex

- [ ] Navigate to `Configure > Developers > Integrations` to enable the Convex integration. Select `Manage Integration` and Follow the setup steps to connect Clerk to your Convex instance.
- [ ] Take the provided `CLERK_FRONTEND_API_URL` value and save it in Convex as `CLERK_JWT_ISSUER_DOMAIN`.

> You can set Convex env variables via the dashboard, or the CLI with `npx convex env set CLERK_JWT_ISSUER_DOMAIN "frontend_api_url_value"`.

#### 2 - Connect Clerk Webhooks to Convex

> To continue you will need the HTTP endpoint URL for your Convex deployment. For cloud deployments, this is usually the one ending with the `.site` TLD. For example `https://your-domain-123.convex.site`.
> Your webhook endpoint will use this and append `/clerk-event`. For example `https://your-domain-123.convex.site/clerk-event`.

Still in the [Clerk dashboard](https://dashboard.clerk.com/apps)

- [ ] Navigate to `Configure > Developers > Webhooks`
- [ ] Create a new Webhook **Endpoint** with the following:

```
Endpoint URL: https://your-domain-123.convex.site/clerk-event
Subscribe to events:
- [x] organization:
   - [x] organization.created
   - [x] organization.deleted
   - [x] organization.updated
- [x] organizationMembership:
   - [x] organizationMembership.created
   - [x] organizationMembership.deleted
   - [x] organizationMembership.updated
- [x] user:
   - [x] user.created
   - [x] user.deleted
   - [x] user.updated
```

- [ ] Take the provided `Signing Secret` value and save it in Convex as `CLERK_WEBHOOK_SECRET`.

> You can set Convex env variables via the dashboard, or the CLI with `npx convex env set CLERK_WEBHOOK_SECRET "signing_secret_value"`.

### Sentry

Sentry is optional.

- [ ] Add `VITE_SENTRY_DSN` value to `apps/web/.env.local`
- [ ] Add `VITE_SENTRY_ORG` value to `apps/web/.env.local`
- [ ] Add `VITE_SENTRY_PROJECT` value to `apps/web/.env.local`
- [ ] Add `SENTRY_AUTH_TOKEN` value to `apps/web/.env.local`

### PostHog

PostHog is optional.

- [ ] Add `VITE_POSTHOG_KEY` value to `apps/web/.env.local`
- [ ] Add `VITE_POSTHOG_HOST` value to `apps/web/.env.local`
