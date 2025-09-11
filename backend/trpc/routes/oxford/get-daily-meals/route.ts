import { z } from "zod";
import { publicProcedure } from "@/backend/trpc/create-context";

const getDailyMealsSchema = z.object({
  clientId: z.string(),
  date: z.string() // YYYY-MM-DD
});

export const getDailyMealsProcedure = publicProcedure
  .input(getDailyMealsSchema)
  .query(async ({ input }) => {
    try {
      const response = await fetch(`${process.env.API_URL || "http://localhost:3000"}/api/oxford/meals/daily/${input.clientId}/${input.date}`);
      
      if (!response.ok) {
        throw new Error("Failed to get daily meals");
      }
      
      const result = await response.json();
      return result;
    } catch (error) {
      console.error("Get daily meals error:", error);
      throw new Error("Failed to get daily meals");
    }
  });