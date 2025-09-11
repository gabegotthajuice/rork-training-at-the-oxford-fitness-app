import { createTRPCRouter } from "./create-context";
import hiRoute from "./routes/example/hi/route";
import { createSquarespaceCheckoutProcedure } from "./routes/payments/create-squarespace-checkout/route";
import { handleSquarespaceWebhookProcedure } from "./routes/payments/handle-squarespace-webhook/route";
import { addClientProcedure } from "@/backend/trpc/routes/clients/add-client/route";
import { getClientsProcedure } from "@/backend/trpc/routes/clients/get-clients/route";
import { importContactsProcedure } from "@/backend/trpc/routes/clients/import-contacts/route";
import { createProfileProcedure } from "@/backend/trpc/routes/profiles/create-profile/route";
import { getProfileProcedure } from "@/backend/trpc/routes/profiles/get-profile/route";
import { updateProfileProcedure } from "@/backend/trpc/routes/profiles/update-profile/route";
import { syncHealthDataProcedure } from "@/backend/trpc/routes/health/sync-health-data/route";
import { getHealthDataProcedure } from "@/backend/trpc/routes/health/get-health-data/route";
import { getClientHealthDataProcedure } from "@/backend/trpc/routes/trainer/get-client-health-data/route";
import { getAllClientsDataProcedure } from "@/backend/trpc/routes/trainer/get-all-clients-data/route";

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
  profiles: createTRPCRouter({
    create: createProfileProcedure,
    get: getProfileProcedure,
    update: updateProfileProcedure,
  }),
  health: createTRPCRouter({
    sync: syncHealthDataProcedure,
    get: getHealthDataProcedure,
  }),
  trainer: createTRPCRouter({
    getClientHealth: getClientHealthDataProcedure,
    getAllClientsData: getAllClientsDataProcedure,
  }),
});

export type AppRouter = typeof appRouter;