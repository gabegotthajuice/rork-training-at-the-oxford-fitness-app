import { z } from "zod";
import { protectedProcedure } from "@/backend/trpc/create-context";

const createProfileSchema = z.object({
  userId: z.string(),
  userType: z.enum(["client", "trainer"]),
  firstName: z.string(),
  lastName: z.string(),
  email: z.string().email(),
  phone: z.string().optional(),
  dateOfBirth: z.string().optional(),
  height: z.number().optional(),
  targetWeight: z.number().optional(),
  fitnessGoals: z.array(z.string()).optional(),
  medicalConditions: z.array(z.string()).optional(),
  trainerId: z.string().optional(),
});

export const createProfileProcedure = protectedProcedure
  .input(createProfileSchema)
  .mutation(async ({ input, ctx }) => {
    const profile = {
      id: `profile_${Date.now()}`,
      ...input,
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
    };

    await ctx.db.set(`profile:${input.userId}`, profile);
    
    if (input.userType === "client" && input.trainerId) {
      const trainerClients = await ctx.db.get(`trainer:${input.trainerId}:clients`) || [];
      trainerClients.push(input.userId);
      await ctx.db.set(`trainer:${input.trainerId}:clients`, trainerClients);
    }

    return profile;
  });