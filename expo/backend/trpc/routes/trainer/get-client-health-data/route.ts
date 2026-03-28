import { z } from "zod";
import { protectedProcedure } from "@/backend/trpc/create-context";
import { healthDataStorage, profileStorage } from "@/backend/lib/cloud-storage";

export const getClientHealthDataProcedure = protectedProcedure
  .input(z.object({
    trainerId: z.string(),
    clientId: z.string(),
    type: z.enum(["latest", "history"]).default("latest"),
    limit: z.number().optional().default(30),
  }))
  .query(async ({ input }) => {
    // Verify trainer has access to this client
    const trainerClients = await profileStorage.getTrainerClients(input.trainerId);
    
    if (!trainerClients.includes(input.clientId)) {
      throw new Error("Unauthorized: Client not associated with this trainer");
    }
    
    // Get client profile
    const clientProfile = await profileStorage.getProfile(input.clientId);
    
    // Get health data
    let healthData;
    if (input.type === "latest") {
      healthData = await healthDataStorage.getLatestHealthData(input.clientId);
    } else {
      healthData = await healthDataStorage.getHealthDataHistory(input.clientId, input.limit);
    }
    
    return {
      client: clientProfile,
      healthData: {
        type: input.type,
        data: healthData,
      },
    };
  });