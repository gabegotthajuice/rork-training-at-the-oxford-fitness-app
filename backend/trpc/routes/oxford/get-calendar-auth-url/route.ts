import { publicProcedure } from "@/backend/trpc/create-context";

export const getCalendarAuthUrlProcedure = publicProcedure
  .query(async () => {
    try {
      const response = await fetch(`${process.env.API_URL || "http://localhost:3000"}/api/oxford/calendar/google/authurl`);
      
      if (!response.ok) {
        throw new Error("Failed to get auth URL");
      }
      
      const result = await response.json();
      return result;
    } catch (error) {
      console.error("Get calendar auth URL error:", error);
      throw new Error("Failed to get calendar auth URL");
    }
  });