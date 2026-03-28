import { createTRPCRouter } from "./create-context";
import hiRoute from "./routes/example/hi/route";
import { createSquarespaceCheckoutProcedure } from "./routes/payments/create-squarespace-checkout/route";
import { handleSquarespaceWebhookProcedure } from "./routes/payments/handle-squarespace-webhook/route";
import { addClientProcedure } from "@/backend/trpc/routes/clients/add-client/route";
import { getClientsProcedure } from "@/backend/trpc/routes/clients/get-clients/route";
import { importContactsProcedure } from "@/backend/trpc/routes/clients/import-contacts/route";
import { deleteClientProcedure } from "@/backend/trpc/routes/clients/delete-client/route";
import { createProfileProcedure } from "@/backend/trpc/routes/profiles/create-profile/route";
import { getProfileProcedure } from "@/backend/trpc/routes/profiles/get-profile/route";
import { updateProfileProcedure } from "@/backend/trpc/routes/profiles/update-profile/route";
import { syncHealthDataProcedure } from "@/backend/trpc/routes/health/sync-health-data/route";
import { getHealthDataProcedure } from "@/backend/trpc/routes/health/get-health-data/route";
import { getClientHealthDataProcedure } from "@/backend/trpc/routes/trainer/get-client-health-data/route";
import { getAllClientsDataProcedure } from "@/backend/trpc/routes/trainer/get-all-clients-data/route";
import { getBusinessInfoProcedure } from "@/backend/trpc/routes/business/get-business-info/route";
import { syncToSquarespaceProcedure } from "@/backend/trpc/routes/business/sync-to-squarespace/route";
import { updateBusinessInfoProcedure } from "@/backend/trpc/routes/business/update-business-info/route";
import { submitIntakeProcedure } from "@/backend/trpc/routes/oxford/submit-intake/route";
import { logMealProcedure } from "@/backend/trpc/routes/oxford/log-meal/route";
import { getCommunityFeedProcedure, postToCommunityProcedure } from "@/backend/trpc/routes/oxford/get-community-feed/route";
import { getCalendarAuthUrlProcedure } from "@/backend/trpc/routes/oxford/get-calendar-auth-url/route";
import { getCalendarEventsProcedure } from "@/backend/trpc/routes/oxford/get-calendar-events/route";
import { getDailyMealsProcedure } from "@/backend/trpc/routes/oxford/get-daily-meals/route";
import { getMealHistoryProcedure } from "@/backend/trpc/routes/oxford/get-meal-history/route";
import { createCheckoutProcedure } from "@/backend/trpc/routes/oxford/create-checkout/route";
import { getSubscriptionProcedure } from "@/backend/trpc/routes/oxford/get-subscription/route";
import { getIntakeStatusProcedure } from "@/backend/trpc/routes/oxford/get-intake-status/route";
import { linkSquarespaceAccountProcedure } from "@/backend/trpc/routes/auth/link-squarespace-account/route";

export const appRouter = createTRPCRouter({
  example: createTRPCRouter({
    hi: hiRoute,
  }),
  auth: createTRPCRouter({
    linkSquarespaceAccount: linkSquarespaceAccountProcedure,
  }),
  payments: createTRPCRouter({
    createSquarespaceCheckout: createSquarespaceCheckoutProcedure,
    handleSquarespaceWebhook: handleSquarespaceWebhookProcedure,
  }),
  business: createTRPCRouter({
    getInfo: getBusinessInfoProcedure,
    syncToSquarespace: syncToSquarespaceProcedure,
    updateInfo: updateBusinessInfoProcedure,
  }),
  clients: createTRPCRouter({
    add: addClientProcedure,
    getAll: getClientsProcedure,
    importContacts: importContactsProcedure,
    delete: deleteClientProcedure,
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
  oxford: createTRPCRouter({
    submitIntake: submitIntakeProcedure,
    getIntakeStatus: getIntakeStatusProcedure,
    logMeal: logMealProcedure,
    getDailyMeals: getDailyMealsProcedure,
    getMealHistory: getMealHistoryProcedure,
    getCommunityFeed: getCommunityFeedProcedure,
    postToCommunity: postToCommunityProcedure,
    getCalendarAuthUrl: getCalendarAuthUrlProcedure,
    getCalendarEvents: getCalendarEventsProcedure,
    createCheckout: createCheckoutProcedure,
    getSubscription: getSubscriptionProcedure,
  }),
});

export type AppRouter = typeof appRouter;