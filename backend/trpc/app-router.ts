import { createTRPCRouter } from "./create-context";
import hiRoute from "./routes/example/hi/route";
import { createSquarespaceCheckoutProcedure } from "./routes/payments/create-squarespace-checkout/route";
import { handleSquarespaceWebhookProcedure } from "./routes/payments/handle-squarespace-webhook/route";
import { addClientProcedure } from "@/backend/trpc/routes/clients/add-client/route";
import { getClientsProcedure } from "@/backend/trpc/routes/clients/get-clients/route";
import { importContactsProcedure } from "@/backend/trpc/routes/clients/import-contacts/route";

export const appRouter = createTRPCRouter({
  example: createTRPCRouter({
    hi: hiRoute,
  }),
  payments: createTRPCRouter({
    createSquarespaceCheckout: createSquarespaceCheckoutProcedure,
    handleSquarespaceWebhook: handleSquarespaceWebhookProcedure,
  }),
  clients: createTRPCRouter({
    add: addClientProcedure,
    getAll: getClientsProcedure,
    importContacts: importContactsProcedure,
  }),
});

export type AppRouter = typeof appRouter;