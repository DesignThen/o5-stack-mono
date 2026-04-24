import { httpRouter } from "convex/server";
import { handleClerkWebhook } from "./clerk";

// define the webhook handler

// define the http router
const http = httpRouter();

// define the webhook route
http.route({
  path: "/clerk-event",
  method: "POST",
  handler: handleClerkWebhook,
});

export default http;
