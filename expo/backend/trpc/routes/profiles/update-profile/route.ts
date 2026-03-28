import { z } from "zod";
import { protectedProcedure } from "@/backend/trpc/create-context";

const updateProfileSchema = z.object({
  userId: z.string(),
  updates: z.object({
    firstName: z.string().optional(),
    lastName: z.string().optional(),
    phone: z.string().optional(),
    dateOfBirth: z.string().optional(),
    height: z.number().optional(),
    currentWeight: z.number().optional(),
    targetWeight: z.number().optional(),
    fitnessGoals: z.array(z.string()).optional(),
    medicalConditions: z.array(z.string()).optional(),
  }),
});

export const updateProfileProcedure = protectedProcedure
  .input(updateProfileSchema)
  .mutation(async ({ input, ctx }) => {
    const existingProfile = await ctx.db.get(`profile:${input.userId}`);
    
    if (!existingProfile) {
      throw new Error("Profile not found");
    }
    
    const updatedProfile = {
      ...existingProfile,
      ...input.updates,
      updatedAt: new Date().toISOString(),
    };
    
    await ctx.db.set(`profile:${input.userId}`, updatedProfile);
    
    return updatedProfile;
  });