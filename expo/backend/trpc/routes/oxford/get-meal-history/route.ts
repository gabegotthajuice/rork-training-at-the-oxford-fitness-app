import { z } from "zod";
import { publicProcedure } from "@/backend/trpc/create-context";

const getMealHistorySchema = z.object({
  clientId: z.string(),
  days: z.number().optional().default(7)
});

export const getMealHistoryProcedure = publicProcedure
  .input(getMealHistorySchema)
  .query(async ({ input }) => {
    try {
      const response = await fetch(`${process.env.API_URL || "http://localhost:3000"}/api/oxford/meals/history/${input.clientId}?days=${input.days}`);
      
      if (!response.ok) {
        throw new Error("Failed to get meal history");
      }
      
      const result = await response.json();
      return result;
    } catch (error) {
      console.error("Get meal history error:", error);
      throw new Error("Failed to get meal history");
    }
  });