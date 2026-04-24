/* eslint-disable @typescript-eslint/no-unnecessary-condition */
import { useAuth, useOrganization, useUser } from "@clerk/tanstack-react-start";
import { usePostHog } from "@posthog/react";
import { useLocation } from "@tanstack/react-router";
import { useEffect, useRef } from "react";

type PostHogPersonProperties = {
  email?: string;
  username?: string;
  first_name?: string;
  last_name?: string;
};

type PostHogOrganizationProperties = {
  slug?: string;
  name?: string;
};

const ORGANIZATION_GROUP_TYPE = "organization";

function buildPersonProperties(
  user: ReturnType<typeof useUser>["user"],
): PostHogPersonProperties {
  return {
    email: user?.primaryEmailAddress?.emailAddress,
    username: user?.username ?? undefined,
    first_name: user?.firstName ?? undefined,
    last_name: user?.lastName ?? undefined,
  };
}

function buildOrganizationProperties(args: {
  orgSlug: string | null;
  orgName?: string | null;
}): PostHogOrganizationProperties {
  return {
    slug: args.orgSlug ?? undefined,
    name: args.orgName ?? undefined,
  };
}

export default function PostHogClerkBridge() {
  const posthog = usePostHog();
  const location = useLocation();
  const { isLoaded, isSignedIn, userId, orgId, orgSlug } = useAuth();
  const { user } = useUser();
  const { organization } = useOrganization();

  const identifySignatureRef = useRef<string | null>(null);
  const groupSignatureRef = useRef<string | null>(null);
  const lastPageviewHrefRef = useRef<string | null>(null);

  useEffect(() => {
    if (!posthog || !isLoaded) return;

    if (!isSignedIn || !userId) {
      if (identifySignatureRef.current !== null) {
        posthog.reset();
        identifySignatureRef.current = null;
        groupSignatureRef.current = null;
      }
      return;
    }

    const personProperties = buildPersonProperties(user);
    const identifySignature = JSON.stringify({
      userId,
      ...personProperties,
    });

    if (identifySignatureRef.current === identifySignature) return;

    posthog.identify(userId, personProperties);
    identifySignatureRef.current = identifySignature;
  }, [isLoaded, isSignedIn, posthog, user, userId]);

  useEffect(() => {
    if (!posthog || !isLoaded) return;

    if (!isSignedIn || !userId) {
      if (groupSignatureRef.current !== null) {
        posthog.resetGroups();
        groupSignatureRef.current = null;
      }
      return;
    }

    if (!orgId) {
      if (groupSignatureRef.current !== null) {
        posthog.resetGroups();
        groupSignatureRef.current = null;
      }
      return;
    }

    const groupProperties = buildOrganizationProperties({
      orgSlug,
      orgName: organization?.name,
    });
    const groupSignature = JSON.stringify({
      orgId,
      ...groupProperties,
    });

    if (groupSignatureRef.current === groupSignature) return;

    posthog.group(ORGANIZATION_GROUP_TYPE, orgId, groupProperties);
    groupSignatureRef.current = groupSignature;
  }, [
    isLoaded,
    isSignedIn,
    orgId,
    orgSlug,
    organization?.name,
    posthog,
    userId,
  ]);

  useEffect(() => {
    if (!posthog) return;

    const currentHref = location.href;
    if (lastPageviewHrefRef.current === currentHref) return;

    const hash = location.hash ? `#${location.hash}` : "";
    const currentUrl =
      typeof window === "undefined"
        ? currentHref
        : `${window.location.origin}${currentHref}`;

    posthog.capture("$pageview", {
      $current_url: currentUrl,
      pathname: location.pathname,
      search: location.searchStr,
      hash,
      clerk_org_id: orgId ?? undefined,
      clerk_org_slug: orgSlug ?? undefined,
    });
    lastPageviewHrefRef.current = currentHref;
  }, [
    location.hash,
    location.href,
    location.pathname,
    location.searchStr,
    orgId,
    orgSlug,
    posthog,
  ]);

  return null;
}
