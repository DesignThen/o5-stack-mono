import { cleanup, render } from "@testing-library/react";
import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";
import PostHogClerkBridge from "./posthog-clerk-bridge";

const {
  mockUseAuth,
  mockUseLocation,
  mockUseOrganization,
  mockUsePostHog,
  mockUseUser,
} = vi.hoisted(() => ({
  mockUseAuth: vi.fn(),
  mockUseLocation: vi.fn(),
  mockUseOrganization: vi.fn(),
  mockUsePostHog: vi.fn(),
  mockUseUser: vi.fn(),
}));

vi.mock("@clerk/tanstack-react-start", () => ({
  useAuth: mockUseAuth,
  useOrganization: mockUseOrganization,
  useUser: mockUseUser,
}));

vi.mock("@posthog/react", () => ({
  usePostHog: mockUsePostHog,
}));

vi.mock("@tanstack/react-router", () => ({
  useLocation: mockUseLocation,
}));

type MockAuthState = {
  isLoaded: boolean;
  isSignedIn: boolean;
  userId: string | null;
  orgId: string | null;
  orgSlug: string | null;
};

type MockUserState = {
  user: {
    primaryEmailAddress?: { emailAddress?: string | null } | null;
    username?: string | null;
    firstName?: string | null;
    lastName?: string | null;
  } | null;
};

type MockOrganizationState = {
  organization: { name?: string | null } | null;
};

type MockLocationState = {
  href: string;
  pathname: string;
  search: Record<string, unknown>;
  searchStr: string;
  hash: string;
};

const posthogClient = {
  capture: vi.fn(),
  group: vi.fn(),
  identify: vi.fn(),
  reset: vi.fn(),
  resetGroups: vi.fn(),
};

let authState: MockAuthState;
let userState: MockUserState;
let organizationState: MockOrganizationState;
let locationState: MockLocationState;

function renderBridge() {
  return render(<PostHogClerkBridge />);
}

beforeEach(() => {
  vi.clearAllMocks();

  authState = {
    isLoaded: true,
    isSignedIn: false,
    userId: null,
    orgId: null,
    orgSlug: null,
  };
  userState = { user: null };
  organizationState = { organization: null };
  locationState = {
    href: "/",
    pathname: "/",
    search: {},
    searchStr: "",
    hash: "",
  };

  mockUseAuth.mockImplementation(() => authState);
  mockUseOrganization.mockImplementation(() => organizationState);
  mockUsePostHog.mockImplementation(() => posthogClient);
  mockUseUser.mockImplementation(() => userState);
  mockUseLocation.mockImplementation(() => locationState);
});

afterEach(() => {
  cleanup();
});

describe("PostHogClerkBridge", () => {
  it("does not identify on signed-out initial load", () => {
    renderBridge();

    expect(posthogClient.identify).not.toHaveBeenCalled();
    expect(posthogClient.capture).toHaveBeenCalledTimes(1);
    expect(posthogClient.capture).toHaveBeenCalledWith(
      "$pageview",
      expect.objectContaining({
        $current_url: `${window.location.origin}/`,
        pathname: "/",
        search: "",
        hash: "",
      }),
    );
  });

  it("identifies a signed-in user with Clerk user data", () => {
    authState = {
      ...authState,
      isSignedIn: true,
      userId: "user_123",
    };
    userState = {
      user: {
        primaryEmailAddress: { emailAddress: "user@example.com" },
        username: "ollie",
        firstName: "Ollie",
        lastName: "JT",
      },
    };

    renderBridge();

    expect(posthogClient.identify).toHaveBeenCalledTimes(1);
    expect(posthogClient.identify).toHaveBeenCalledWith("user_123", {
      email: "user@example.com",
      username: "ollie",
      first_name: "Ollie",
      last_name: "JT",
    });
  });

  it("identifies even when optional Clerk user fields are missing", () => {
    authState = {
      ...authState,
      isSignedIn: true,
      userId: "user_456",
    };
    userState = {
      user: {
        primaryEmailAddress: null,
        username: null,
        firstName: null,
        lastName: null,
      },
    };

    renderBridge();

    expect(posthogClient.identify).toHaveBeenCalledWith("user_456", {
      email: undefined,
      username: undefined,
      first_name: undefined,
      last_name: undefined,
    });
  });

  it("resets PostHog once after a signed-in user signs out", () => {
    authState = {
      ...authState,
      isSignedIn: true,
      userId: "user_123",
    };
    userState = {
      user: {
        primaryEmailAddress: { emailAddress: "user@example.com" },
      },
    };

    const view = renderBridge();
    expect(posthogClient.identify).toHaveBeenCalledTimes(1);

    authState = {
      ...authState,
      isSignedIn: false,
      userId: null,
    };
    userState = { user: null };
    view.rerender(<PostHogClerkBridge />);

    expect(posthogClient.reset).toHaveBeenCalledTimes(1);
  });

  it("binds the active Clerk organization as a PostHog group", () => {
    authState = {
      ...authState,
      isSignedIn: true,
      userId: "user_123",
      orgId: "org_123",
      orgSlug: "acme",
    };
    organizationState = {
      organization: {
        name: "Acme Inc",
      },
    };

    renderBridge();

    expect(posthogClient.group).toHaveBeenCalledTimes(1);
    expect(posthogClient.group).toHaveBeenCalledWith(
      "organization",
      "org_123",
      {
        slug: "acme",
        name: "Acme Inc",
      },
    );
  });

  it("updates the PostHog group when the active org changes", () => {
    authState = {
      ...authState,
      isSignedIn: true,
      userId: "user_123",
      orgId: "org_123",
      orgSlug: "acme",
    };
    organizationState = {
      organization: {
        name: "Acme Inc",
      },
    };

    const view = renderBridge();
    expect(posthogClient.group).toHaveBeenCalledTimes(1);

    authState = {
      ...authState,
      orgId: "org_456",
      orgSlug: "beta",
    };
    organizationState = {
      organization: {
        name: "Beta LLC",
      },
    };
    view.rerender(<PostHogClerkBridge />);

    expect(posthogClient.group).toHaveBeenCalledTimes(2);
    expect(posthogClient.group).toHaveBeenLastCalledWith(
      "organization",
      "org_456",
      {
        slug: "beta",
        name: "Beta LLC",
      },
    );
  });

  it("captures exactly one pageview per route change", () => {
    const view = renderBridge();
    expect(posthogClient.capture).toHaveBeenCalledTimes(1);

    locationState = {
      ...locationState,
      href: "/settings?tab=profile",
      pathname: "/settings",
      searchStr: "?tab=profile",
    };
    view.rerender(<PostHogClerkBridge />);

    expect(posthogClient.capture).toHaveBeenCalledTimes(2);
    expect(posthogClient.capture).toHaveBeenLastCalledWith(
      "$pageview",
      expect.objectContaining({
        $current_url: `${window.location.origin}/settings?tab=profile`,
        pathname: "/settings",
        search: "?tab=profile",
      }),
    );
  });

  it("does not duplicate pageviews on unrelated rerenders", () => {
    const view = renderBridge();
    expect(posthogClient.capture).toHaveBeenCalledTimes(1);

    view.rerender(<PostHogClerkBridge />);

    expect(posthogClient.capture).toHaveBeenCalledTimes(1);
  });

  it("captures anonymous pageviews across route changes while signed out", () => {
    const view = renderBridge();
    expect(posthogClient.identify).not.toHaveBeenCalled();
    expect(posthogClient.capture).toHaveBeenCalledTimes(1);

    locationState = {
      ...locationState,
      href: "/pricing#faq",
      pathname: "/pricing",
      hash: "faq",
    };
    view.rerender(<PostHogClerkBridge />);

    expect(posthogClient.identify).not.toHaveBeenCalled();
    expect(posthogClient.capture).toHaveBeenCalledTimes(2);
    expect(posthogClient.capture).toHaveBeenLastCalledWith(
      "$pageview",
      expect.objectContaining({
        pathname: "/pricing",
        hash: "#faq",
      }),
    );
  });

  it("uses the Clerk userId as the PostHog distinct ID", () => {
    authState = {
      ...authState,
      isSignedIn: true,
      userId: "clerk_user_789",
    };
    userState = {
      user: {
        primaryEmailAddress: { emailAddress: "user@example.com" },
      },
    };

    renderBridge();

    expect(posthogClient.identify).toHaveBeenCalledWith(
      "clerk_user_789",
      expect.any(Object),
    );
  });
});
