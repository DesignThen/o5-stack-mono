# O5 Stack App

```
npx tiged DesignThen/o5-stack-mono PROJECT_NAME
```

## Decisions

Convex is the backend for this project.

Clerk is the auth provider. Clerk user and organization state is synced into Convex through webhooks.

The web runtime env and Convex runtime env are intentionally separate. Web app values live in `apps/web/.env.local`; Convex backend values live in `packages/backend/.env.local` for local development and in Convex deployment env for deployed environments.

## Setup

### Convex

Convex setup happens from the backend package. Run the Convex CLI for `packages/backend` to create or connect a deployment.

> This should add its required environment variables into `packages/backend/.env.local`. You can also remove these values, and run the CLI again to set up or connect to a new instance.

Copy the generated Convex client values into `apps/web/.env.local` - You will need to prepend `VITE_`:

```env
VITE_CONVEX_SITE_URL="
VITE_CONVEX_URL="
```

### Auth

Auth requires your Convex CLI to be authenticated, and access to the [Clerk dashboard](https://dashboard.clerk.com/apps).

#### Setup

- [ ] Set up or select a [Clerk Application](https://dashboard.clerk.com/apps)
- [ ] Add `VITE_CLERK_PUBLISHABLE_KEY` to `apps/web/.env.local`
- [ ] Add `CLERK_SECRET_KEY` to `apps/web/.env.local`

#### Convex JWT

Log in to your [Clerk dashboard](https://dashboard.clerk.com/apps), select an application, and navigate to `Configure > Developers > Integrations`.

Enable the Convex integration, and select `Manage Integration`. Follow the setup steps to connect Clerk to Convex. This should enable a custom JWT template, which you can save without any other changes.

Take the provided `CLERK_FRONTEND_API_URL` value and set it as `CLERK_JWT_ISSUER_DOMAIN` in Convex.

```sh
bun x convex env set CLERK_JWT_ISSUER_DOMAIN "value"
```

#### Convex Webhooks

To continue you will need the HTTP endpoint URL for your Convex deployment. For cloud deployments, this is usually the one ending with the `.site` TLD. For example `https://your-domain-123.convex.site`.

Your webhook endpoint will use this and append `/clerk-event`. For example `https://your-domain-123.convex.site/clerk-event`.

Log in to your [Clerk dashboard](https://dashboard.clerk.com/apps), select an application, and navigate to `Configure > Developers > Webhooks`.

Create a new Webhook **Endpoint** with the following:

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

This will give you a `Signing Secret` which should be set in Convex.

```sh
bun x convex env set CLERK_WEBHOOK_SECRET "value"
```

For local development, also add it to `packages/backend/.env.local`:

```env
CLERK_WEBHOOK_SECRET="
```

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
