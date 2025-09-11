import { z } from "zod";
import { publicProcedure } from "@/backend/trpc/create-context";

const getCalendarEventsSchema = z.object({
  tokens: z.string() // JSON string of Google OAuth tokens
});

export const getCalendarEventsProcedure = publicProcedure
  .input(getCalendarEventsSchema)
  .query(async ({ input }) => {
    try {
      const response = await fetch(`${process.env.API_URL || "http://localhost:3000"}/api/oxford/calendar/google/events`, {
        headers: {
          "x-google-tokens": input.tokens
        }
      });
      
      if (!response.ok) {
        throw new Error("Failed to get calendar events");
      }
      
      const result = await response.json();
      return result;
    } catch (error) {
      console.error("Get calendar events error:", error);
      throw new Error("Failed to get calendar events");
    }
  });