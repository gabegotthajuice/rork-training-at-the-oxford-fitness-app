import { z } from "zod";
import { protectedProcedure } from "@/backend/trpc/create-context";
import { profileStorage, healthDataStorage } from "@/backend/lib/cloud-storage";

export const getAllClientsDataProcedure = protectedProcedure
  .input(z.object({
    trainerId: z.string(),
  }))
  .query(async ({ input }) => {
    // Get all clients for this trainer
    const clientIds = await profileStorage.getTrainerClients(input.trainerId);
    
    // Get profile and latest health data for each client
    const clientsData = await Promise.all(
      clientIds.map(async (clientId: string) => {
        const profile = await profileStorage.getProfile(clientId);
        const latestHealth = await healthDataStorage.getLatestHealthData(clientId);
        
        return {
          profile,
          latestHealth,
        };
      })
    );
    
    return {
      clients: clientsData.filter(client => client.profile !== undefined),
      totalClients: clientsData.length,
    };
  });