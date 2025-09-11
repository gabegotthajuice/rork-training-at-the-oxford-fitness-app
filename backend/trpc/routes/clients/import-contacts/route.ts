import { z } from "zod";
import { protectedProcedure } from "@/backend/trpc/create-context";

const importContactsSchema = z.object({
  contacts: z.array(z.object({
    id: z.string(),
    name: z.string(),
    phoneNumbers: z.array(z.object({
      number: z.string().optional(),
    })).optional(),
    emails: z.array(z.object({
      email: z.string().optional(),
    })).optional(),
  })),
  selectedContactIds: z.array(z.string()),
  defaultPackageType: z.string().optional(),
  defaultSessionsTotal: z.number().optional(),
});

export const importContactsProcedure = protectedProcedure
  .input(importContactsSchema)
  .mutation(async ({ ctx, input }) => {
    console.log('Importing contacts as clients:', input);
    
    const importedClients = [];
    const errors = [];
    
    // Get existing clients from cloud storage
    const existingClients = await ctx.db.get('clients') || {};
    
    for (const contactId of input.selectedContactIds) {
      const contact = input.contacts.find(c => c.id === contactId);
      
      if (!contact) {
        errors.push(`Contact with ID ${contactId} not found`);
        continue;
      }
      
      const phone = contact.phoneNumbers?.[0]?.number || '';
      const email = contact.emails?.[0]?.email || '';
      
      // Validate required fields
      if (!contact.name) {
        errors.push(`Contact ${contactId} has no name`);
        continue;
      }
      
      if (!email && !phone) {
        errors.push(`Contact ${contact.name} has no email or phone number`);
        continue;
      }
      
      // Generate unique client ID with timestamp to avoid collisions
      const clientId = `client_${Date.now()}_${contactId}_${Math.random().toString(36).substr(2, 9)}`;
      
      // Create client from contact
      const newClient = {
        id: clientId,
        name: contact.name,
        email: email || `${contact.name.toLowerCase().replace(/\s+/g, '.')}@example.com`,
        phone: phone || 'Not provided',
        age: undefined,
        height: undefined,
        currentWeight: undefined,
        targetWeight: undefined,
        bodyType: undefined,
        activityLevel: undefined,
        goals: 'To be determined during consultation',
        packageType: input.defaultPackageType || 'Consultation Package',
        sessionsTotal: input.defaultSessionsTotal || 1,
        sessionsRemaining: input.defaultSessionsTotal || 1,
        dietaryRestrictions: undefined,
        medicalConditions: undefined,
        integrations: {
          smartScale: false,
          groupMe: false,
          myFitnessPal: false,
          appleHealth: false,
          googleFit: false,
        },
        selectedScaleBrand: undefined,
        joinDate: new Date().toISOString().split('T')[0],
        lastSession: null,
        progressScore: 0,
        status: 'active' as const,
        avatar: null,
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString(),
        importedFromContacts: true,
      };
      
      // Add to existing clients
      existingClients[clientId] = newClient;
      importedClients.push(newClient);
    }
    
    // Save all clients back to cloud storage
    if (importedClients.length > 0) {
      await ctx.db.set('clients', existingClients);
    }
    
    console.log(`Successfully imported ${importedClients.length} clients`);
    if (errors.length > 0) {
      console.log('Import errors:', errors);
    }
    
    return {
      success: true,
      importedClients,
      errors,
      message: `Successfully imported ${importedClients.length} client${importedClients.length !== 1 ? 's' : ''} from your contacts.${errors.length > 0 ? ` ${errors.length} contact${errors.length !== 1 ? 's' : ''} could not be imported.` : ''}`,
    };
  });