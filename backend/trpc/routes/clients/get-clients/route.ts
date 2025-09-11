import { z } from "zod";
import { protectedProcedure } from "@/backend/trpc/create-context";

const getClientsSchema = z.object({
  search: z.string().optional(),
  status: z.enum(['all', 'active', 'inactive', 'paused']).default('all'),
  limit: z.number().min(1).max(100).default(50),
  offset: z.number().min(0).default(0),
});



export const getClientsProcedure = protectedProcedure
  .input(getClientsSchema)
  .query(async ({ ctx, input }) => {
    console.log('Fetching clients with filters:', input);
    
    // Get all clients from cloud storage
    const allClientsData = await ctx.db.get('clients') || {};
    let allClients = Object.values(allClientsData);
    
    // Apply search filter
    if (input.search) {
      const searchLower = input.search.toLowerCase();
      allClients = allClients.filter((client: any) => 
        client.name?.toLowerCase().includes(searchLower) ||
        client.email?.toLowerCase().includes(searchLower) ||
        client.phone?.includes(input.search!)
      );
    }
    
    // Apply status filter
    if (input.status !== 'all') {
      allClients = allClients.filter((client: any) => client.status === input.status);
    }
    
    // Sort by most recent first
    allClients.sort((a: any, b: any) => {
      const dateA = new Date(a.createdAt || 0).getTime();
      const dateB = new Date(b.createdAt || 0).getTime();
      return dateB - dateA;
    });
    
    // Apply pagination
    const total = allClients.length;
    const paginatedClients = allClients.slice(input.offset, input.offset + input.limit);
    
    // Calculate stats
    const stats = {
      total: allClients.length,
      active: allClients.filter((c: any) => c.status === 'active').length,
      inactive: allClients.filter((c: any) => c.status === 'inactive').length,
      paused: allClients.filter((c: any) => c.status === 'paused').length,
      totalSessions: allClients.reduce((sum: number, c: any) => sum + (c.sessionsRemaining || 0), 0),
    };
    
    return {
      clients: paginatedClients,
      stats,
      pagination: {
        total,
        offset: input.offset,
        limit: input.limit,
        hasMore: input.offset + input.limit < total,
      },
    };
  });