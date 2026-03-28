import { z } from 'zod';
import { protectedProcedure } from '../../../create-context';

const updateBusinessSchema = z.object({
  name: z.string().optional(),
  description: z.string().optional(),
  email: z.string().email().optional(),
  phone: z.string().optional(),
  website: z.string().url().optional(),
  address: z.object({
    street: z.string(),
    city: z.string(),
    state: z.string(),
    zipCode: z.string(),
    country: z.string()
  }).optional(),
  socialMedia: z.object({
    instagram: z.string().optional(),
    facebook: z.string().optional(),
    twitter: z.string().optional(),
    linkedin: z.string().optional()
  }).optional(),
  branding: z.object({
    primaryColor: z.string(),
    secondaryColor: z.string(),
    tagline: z.string(),
    logo: z.string().optional()
  }).optional(),
  policies: z.object({
    cancellation: z.string(),
    refund: z.string(),
    privacy: z.string(),
    terms: z.string()
  }).optional(),
  autoSyncToSquarespace: z.boolean().optional().default(true)
});

export const updateBusinessInfoProcedure = protectedProcedure
  .input(updateBusinessSchema)
  .mutation(async ({ input }) => {
    const { autoSyncToSquarespace, ...updateData } = input;

    try {
      console.log('Updating business information:', updateData);

      // In a real implementation, you would:
      // 1. Validate the user has permission to update business info
      // 2. Update the business info in your database
      // 3. Optionally sync to Squarespace if autoSyncToSquarespace is true

      // Simulate database update
      await new Promise(resolve => setTimeout(resolve, 1000));

      // Auto-sync to Squarespace if enabled
      if (autoSyncToSquarespace) {
        console.log('Auto-syncing updated business info to Squarespace...');
        
        // This would call the sync procedure
        // await syncToSquarespaceProcedure({ forceUpdate: true });
      }

      return {
        success: true,
        message: 'Business information updated successfully',
        updatedFields: Object.keys(updateData),
        autoSynced: autoSyncToSquarespace,
        lastUpdated: new Date().toISOString()
      };
    } catch (error) {
      console.error('Error updating business info:', error);
      throw new Error('Failed to update business information');
    }
  });