import { z } from 'zod';
import { publicProcedure } from '../../../create-context';

const webhookSchema = z.object({
  orderId: z.string(),
  status: z.string(),
  customerEmail: z.string(),
  productId: z.string(),
  amount: z.number(),
  currency: z.string(),
  metadata: z.object({
    packageName: z.string(),
    sessions: z.number(),
  }).optional(),
});

export const handleSquarespaceWebhookProcedure = publicProcedure
  .input(webhookSchema)
  .mutation(async ({ input }: { input: z.infer<typeof webhookSchema> }) => {
    const { orderId, status, customerEmail, productId, amount, metadata } = input;

    try {
      console.log('Received Squarespace webhook:', {
        orderId,
        status,
        customerEmail,
        productId,
        amount,
        metadata,
      });

      if (status === 'completed') {
        // Handle successful payment
        // 1. Create client record if doesn't exist
        // 2. Add purchased sessions to client account
        // 3. Send confirmation email
        // 4. Update internal records

        console.log(`Payment completed for order ${orderId}`);
        console.log(`Customer: ${customerEmail}`);
        console.log(`Package: ${metadata?.packageName || 'Unknown'}`);
        console.log(`Sessions: ${metadata?.sessions || 0}`);

        // In a real implementation, you would:
        // - Save order to database
        // - Create/update client profile
        // - Add sessions to client account
        // - Send confirmation email
        // - Trigger any automation workflows
      }

      return {
        success: true,
        message: 'Webhook processed successfully',
      };
    } catch (error) {
      console.error('Webhook processing error:', error);
      throw new Error('Failed to process webhook');
    }
  });