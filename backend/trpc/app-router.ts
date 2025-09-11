import { createTRPCRouter } from "./create-context";
import hiRoute from "./routes/example/hi/route";
import { createSquarespaceCheckoutProcedure } from "./routes/payments/create-squarespace-checkout/route";
import { handleSquarespaceWebhookProcedure } from "./routes/payments/handle-squarespace-webhook/route";

export const appRouter = createTRPCRouter({
  example: createTRPCRouter({
    hi: hiRoute,
  }),
  payments: createTRPCRouter({
    createSquarespaceCheckout: createSquarespaceCheckoutProcedure,
    handleSquarespaceWebhook: handleSquarespaceWebhookProcedure,
  }),
});

export type AppRouter = typeof appRouter;