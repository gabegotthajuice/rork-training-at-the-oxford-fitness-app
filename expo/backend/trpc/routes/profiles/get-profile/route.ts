import { z } from "zod";
import { protectedProcedure } from "@/backend/trpc/create-context";

export const getProfileProcedure = protectedProcedure
  .input(z.object({
    userId: z.string(),
  }))
  .query(async ({ input, ctx }) => {
    const profile = await ctx.db.get(`profile:${input.userId}`);
    
    if (!profile) {
      throw new Error("Profile not found");
    }
    
    return profile;
  });