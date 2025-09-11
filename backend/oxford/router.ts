import { Hono } from "hono";
import { intakeRouter } from "./intake";
import { calendarRouter } from "./calendar";
import { communityRouter } from "./community";
import { mealsRouter } from "./meals";
import { commerceRouter } from "./commerce";
import { webhooksRouter } from "./webhooks";

export const oxfordRouter = new Hono();

// Mount sub-routers
oxfordRouter.route("/intake", intakeRouter);
oxfordRouter.route("/calendar", calendarRouter);
oxfordRouter.route("/community", communityRouter);
oxfordRouter.route("/meals", mealsRouter);
oxfordRouter.route("/commerce", commerceRouter);
oxfordRouter.route("/webhooks", webhooksRouter);

// Health check for Oxford integrations
oxfordRouter.get("/", (c) => {
  return c.json({ 
    status: "ok", 
    service: "Oxford Integrations",
    endpoints: [
      "/intake",
      "/calendar",
      "/community",
      "/meals",
      "/commerce",
      "/webhooks"
    ]
  });
});