import { z } from "zod";
import { publicProcedure } from "@/backend/trpc/create-context";

export const getCommunityFeedProcedure = publicProcedure
  .input(z.object({
    limit: z.number().optional().default(20)
  }).optional())
  .query(async ({ input }) => {
    try {
      const response = await fetch(
        `${process.env.API_URL || "http://localhost:3000"}/api/oxford/community/latest?limit=${input?.limit || 20}`
      );
      
      if (!response.ok) {
        throw new Error("Failed to fetch community feed");
      }
      
      const result = await response.json();
      return result;
    } catch (error) {
      console.error("Get community feed error:", error);
      throw new Error("Failed to fetch community feed");
    }
  });

export const postToCommunityProcedure = publicProcedure
  .input(z.object({
    text: z.string().min(1).max(1000),
    author_id: z.string().optional(),
    author_name: z.string().optional(),
    image_url: z.string().url().optional()
  }))
  .mutation(async ({ input }) => {
    try {
      const response = await fetch(
        `${process.env.API_URL || "http://localhost:3000"}/api/oxford/community/post`,
        {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify(input)
        }
      );
      
      if (!response.ok) {
        throw new Error("Failed to post to community");
      }
      
      const result = await response.json();
      return result;
    } catch (error) {
      console.error("Post to community error:", error);
      throw new Error("Failed to post to community");
    }
  });