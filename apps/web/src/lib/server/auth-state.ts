import { auth } from "@clerk/tanstack-react-start/server";
import { redirect } from "@tanstack/react-router";
import { createServerFn } from "@tanstack/react-start";
import { z } from "zod";

const inputSchema = z
  .object({
    redirectTo: z.string().optional(),
  })
  .optional();

export const isUser = createServerFn()
  .inputValidator(inputSchema)
  .handler(async ({ data }) => {
    const { isAuthenticated, userId } = await auth();

    if (!isAuthenticated) {
      // This will error because you're redirecting to a path that doesn't exist yet
      // You can create a sign-in route to handle this
      // See https://clerk.com/docs/tanstack-react-start/guides/development/custom-sign-in-or-up-page
      throw redirect({
        to: "/sign-in/$",
        search: { redirect: data?.redirectTo },
      });
    }

    return { userId };
  });

export const isGuest = createServerFn().handler(async () => {
  const { isAuthenticated } = await auth();

  if (isAuthenticated) {
    throw redirect({ to: "/" });
  }

  return {};
});
