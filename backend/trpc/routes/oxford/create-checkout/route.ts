import { z } from "zod";
import { publicProcedure } from "@/backend/trpc/create-context";

const createCheckoutSchema = z.object({
  client_id: z.string(),
  plan_id: z.string(),
  amount_cents: z.number(),
  success_url: z.string().optional(),
  cancel_url: z.string().optional()
});

export const createCheckoutProcedure = publicProcedure
  .input(createCheckoutSchema)
  .mutation(async ({ input }) => {
    try {
      const response = await fetch(`${process.env.API_URL || "http://localhost:3000"}/api/oxford/commerce/squarespace/create-checkout`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(input)
      });
      
      if (!response.ok) {
        throw new Error("Failed to create checkout");
      }
      
      const result = await response.json();
      return result;
    } catch (error) {
      console.error("Create checkout error:", error);
      throw new Error("Failed to create checkout");
    }
  });