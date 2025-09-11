import { z } from "zod";
import { publicProcedure } from "@/backend/trpc/create-context";

const getIntakeStatusSchema = z.object({
  clientId: z.string()
});

export const getIntakeStatusProcedure = publicProcedure
  .input(getIntakeStatusSchema)
  .query(async ({ input }) => {
    try {
      const response = await fetch(`${process.env.API_URL || "http://localhost:3000"}/api/oxford/intake/status/${input.clientId}`);
      
      if (!response.ok) {
        throw new Error("Failed to get intake status");
      }
      
      const result = await response.json();
      return result;
    } catch (error) {
      console.error("Get intake status error:", error);
      throw new Error("Failed to get intake status");
    }
  });