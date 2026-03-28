import { z } from 'zod';
import { protectedProcedure } from '../../../create-context';

const linkSquarespaceSchema = z.object({
  squarespaceCustomerId: z.string(),
  accessToken: z.string(),
  customerData: z.object({
    email: z.string().email(),
    name: z.string(),
    websiteId: z.string(),
    orders: z.array(z.object({
      id: z.string(),
      status: z.string(),
      total: z.number(),
      items: z.array(z.object({
        productId: z.string(),
        name: z.string(),
        quantity: z.number(),
        price: z.number(),
        metadata: z.object({
          packageName: z.string().optional(),
          sessions: z.number().optional(),
        }).optional(),
      })),
      createdAt: z.string(),
    })),
  }),
});

export const linkSquarespaceAccountProcedure = protectedProcedure
  .input(linkSquarespaceSchema)
  .mutation(async ({ input }) => {
    const { squarespaceCustomerId, customerData } = input;
    const userId = `user_${Date.now()}`; // In real implementation, get from context

    if (!userId) {
      throw new Error('User not authenticated');
    }

    try {
      console.log('Linking Squarespace account for user:', userId);
      console.log('Squarespace Customer ID:', squarespaceCustomerId);
      console.log('Customer orders:', customerData.orders.length);

      // Calculate total sessions from orders
      let totalSessions = 0;
      let usedSessions = 0;
      const packages: Array<{
        name: string;
        sessions: number;
        usedSessions: number;
        purchaseDate: string;
        orderId: string;
        status: string;
      }> = [];

      customerData.orders.forEach(order => {
        order.items.forEach(item => {
          if (item.metadata?.sessions) {
            totalSessions += item.metadata.sessions;
            packages.push({
              name: item.metadata.packageName || item.name,
              sessions: item.metadata.sessions,
              usedSessions: 0, // Would be calculated from actual session records
              purchaseDate: order.createdAt,
              orderId: order.id,
              status: order.status,
            });
          }
        });
      });

      // In a real implementation, you would:
      // 1. Store the Squarespace customer ID and access token securely
      // 2. Link the user account to their Squarespace purchases
      // 3. Calculate available sessions from their package purchases
      // 4. Set up webhooks to track new purchases
      // 5. Store package and session data in your database

      const accountLinkData = {
        userId,
        squarespaceCustomerId,
        customerEmail: customerData.email,
        customerName: customerData.name,
        websiteId: customerData.websiteId,
        totalSessions,
        usedSessions,
        availableSessions: totalSessions - usedSessions,
        packages,
        linkedAt: new Date().toISOString(),
        lastSyncAt: new Date().toISOString(),
      };

      console.log('Account link successful:', {
        userId,
        squarespaceCustomerId,
        totalSessions,
        availableSessions: totalSessions - usedSessions,
        packagesCount: packages.length,
      });

      return {
        success: true,
        message: 'Squarespace account linked successfully',
        data: {
          squarespaceCustomerId,
          totalSessions,
          availableSessions: totalSessions - usedSessions,
          packages: packages.map(pkg => ({
            name: pkg.name,
            sessions: pkg.sessions,
            usedSessions: pkg.usedSessions,
            availableSessions: pkg.sessions - pkg.usedSessions,
            purchaseDate: pkg.purchaseDate,
            status: pkg.status,
          })),
        },
      };
    } catch (error) {
      console.error('Failed to link Squarespace account:', error);
      throw new Error('Failed to link Squarespace account for package tracking');
    }
  });