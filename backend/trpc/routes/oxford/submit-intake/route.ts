import { z } from "zod";
import { publicProcedure } from "@/backend/trpc/create-context";

const intakeSchema = z.object({
  client_id: z.string(),
  email: z.string().email(),
  first_name: z.string(),
  last_name: z.string(),
  phone: z.string(),
  goals: z.string(),
  plan: z.string(),
  calories_target: z.number(),
  protein_target: z.number(),
  breakfast_time: z.string(),
  lunch_time: z.string(),
  dinner_time: z.string(),
  start_date: z.string()
});

export const submitIntakeProcedure = publicProcedure
  .input(intakeSchema)
  .mutation(async ({ input }) => {
    try {
      // Call Oxford intake endpoint
      const response = await fetch(`${process.env.API_URL || "http://localhost:3000"}/api/oxford/intake/submit`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(input)
      });
      
      if (!response.ok) {
        throw new Error("Failed to submit intake");
      }
      
      const result = await response.json();
      return result;
    } catch (error) {
      console.error("Submit intake error:", error);
      throw new Error("Failed to submit intake form");
    }
  });