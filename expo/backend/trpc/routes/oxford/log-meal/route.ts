import { z } from "zod";
import { publicProcedure } from "@/backend/trpc/create-context";

const logMealSchema = z.object({
  client_id: z.string(),
  date: z.string(),
  meal_tag: z.enum(["B", "L", "D", "S"]),
  notes: z.string().optional(),
  photo_base64: z.string().optional()
});

export const logMealProcedure = publicProcedure
  .input(logMealSchema)
  .mutation(async ({ input }) => {
    try {
      const formData = new FormData();
      formData.append("client_id", input.client_id);
      formData.append("date", input.date);
      formData.append("meal_tag", input.meal_tag);
      if (input.notes) formData.append("notes", input.notes);
      
      // Convert base64 to blob if photo provided
      if (input.photo_base64) {
        const base64Data = input.photo_base64.split(",")[1] || input.photo_base64;
        const byteCharacters = atob(base64Data);
        const byteNumbers = new Array(byteCharacters.length);
        for (let i = 0; i < byteCharacters.length; i++) {
          byteNumbers[i] = byteCharacters.charCodeAt(i);
        }
        const byteArray = new Uint8Array(byteNumbers);
        const blob = new Blob([byteArray], { type: "image/jpeg" });
        formData.append("photo", blob, "meal.jpg");
      }
      
      const response = await fetch(`${process.env.API_URL || "http://localhost:3000"}/api/oxford/meals/log`, {
        method: "POST",
        body: formData
      });
      
      if (!response.ok) {
        throw new Error("Failed to log meal");
      }
      
      const result = await response.json();
      return result;
    } catch (error) {
      console.error("Log meal error:", error);
      throw new Error("Failed to log meal");
    }
  });