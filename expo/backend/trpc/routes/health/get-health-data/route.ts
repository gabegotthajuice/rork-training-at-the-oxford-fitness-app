import { z } from "zod";
import { protectedProcedure } from "@/backend/trpc/create-context";
import { healthDataStorage } from "@/backend/lib/cloud-storage";

export const getHealthDataProcedure = protectedProcedure
  .input(z.object({
    userId: z.string(),
    type: z.enum(["latest", "history"]).default("latest"),
    limit: z.number().optional().default(30),
  }))
  .query(async ({ input }) => {
    if (input.type === "latest") {
      const latestData = await healthDataStorage.getLatestHealthData(input.userId);
      return {
        type: "latest" as const,
        data: latestData,
      };
    } else {
      const history = await healthDataStorage.getHealthDataHistory(input.userId, input.limit);
      return {
        type: "history" as const,
        data: history,
      };
    }
  });