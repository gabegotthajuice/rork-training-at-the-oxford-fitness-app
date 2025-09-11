import { z } from "zod";
import { publicProcedure } from "@/backend/trpc/create-context";

const getSubscriptionSchema = z.object({
  clientId: z.string()
});

export const getSubscriptionProcedure = publicProcedure
  .input(getSubscriptionSchema)
  .query(async ({ input }) => {
    try {
      const response = await fetch(`${process.env.API_URL || "http://localhost:3000"}/api/oxford/commerce/subscription/${input.clientId}`);
      
      if (!response.ok) {
        throw new Error("Failed to get subscription");
      }
      
      const result = await response.json();
      return result;
    } catch (error) {
      console.error("Get subscription error:", error);
      throw new Error("Failed to get subscription");
    }
  });