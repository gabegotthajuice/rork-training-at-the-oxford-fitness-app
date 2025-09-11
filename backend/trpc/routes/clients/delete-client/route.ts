import { z } from "zod";
import { protectedProcedure } from "@/backend/trpc/create-context";

const deleteClientSchema = z.object({
  clientId: z.string().min(1, "Client ID is required"),
});

export const deleteClientProcedure = protectedProcedure
  .input(deleteClientSchema)
  .mutation(async ({ ctx, input }) => {
    console.log('Deleting client:', input.clientId);
    
    // Get existing clients from cloud storage
    const existingClients = await ctx.db.get('clients') || {};
    
    // Check if client exists
    if (!existingClients[input.clientId]) {
      throw new Error(`Client with ID ${input.clientId} not found`);
    }
    
    // Store client info for response
    const deletedClient = existingClients[input.clientId];
    
    // Delete the client
    delete existingClients[input.clientId];
    
    // Save updated clients back to cloud storage
    await ctx.db.set('clients', existingClients);
    
    console.log('Client deleted successfully:', deletedClient.name);
    
    return {
      success: true,
      message: `${deletedClient.name} has been removed from your client roster.`,
      deletedClient,
    };
  });