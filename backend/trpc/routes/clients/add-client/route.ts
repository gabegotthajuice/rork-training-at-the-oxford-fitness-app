import { z } from "zod";
import { protectedProcedure } from "@/backend/trpc/create-context";

const addClientSchema = z.object({
  name: z.string().min(1, "Name is required"),
  email: z.string().email("Valid email is required"),
  phone: z.string().min(1, "Phone is required"),
  age: z.string().optional(),
  height: z.string().optional(),
  currentWeight: z.string().optional(),
  targetWeight: z.string().optional(),
  bodyType: z.string().optional(),
  activityLevel: z.string().optional(),
  goals: z.string().optional(),
  packageType: z.string().optional(),
  sessionsTotal: z.string().optional(),
  dietaryRestrictions: z.string().optional(),
  medicalConditions: z.string().optional(),
  integrations: z.object({
    smartScale: z.boolean().default(false),
    groupMe: z.boolean().default(false),
    myFitnessPal: z.boolean().default(false),
    appleHealth: z.boolean().default(false),
    googleFit: z.boolean().default(false),
  }).optional(),
  selectedScaleBrand: z.string().optional(),
});

export const addClientProcedure = protectedProcedure
  .input(addClientSchema)
  .mutation(async ({ ctx, input }) => {
    console.log('Adding new client:', input);
    
    // Generate unique client ID
    const clientId = `client_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
    
    // Create client object
    const newClient = {
      id: clientId,
      name: input.name,
      email: input.email,
      phone: input.phone,
      age: input.age ? parseInt(input.age) : undefined,
      height: input.height,
      currentWeight: input.currentWeight ? parseFloat(input.currentWeight) : undefined,
      targetWeight: input.targetWeight ? parseFloat(input.targetWeight) : undefined,
      bodyType: input.bodyType,
      activityLevel: input.activityLevel,
      goals: input.goals,
      packageType: input.packageType,
      sessionsTotal: input.sessionsTotal ? parseInt(input.sessionsTotal) : 0,
      sessionsRemaining: input.sessionsTotal ? parseInt(input.sessionsTotal) : 0,
      dietaryRestrictions: input.dietaryRestrictions,
      medicalConditions: input.medicalConditions,
      integrations: input.integrations || {
        smartScale: false,
        groupMe: false,
        myFitnessPal: false,
        appleHealth: false,
        googleFit: false,
      },
      selectedScaleBrand: input.selectedScaleBrand,
      joinDate: new Date().toISOString().split('T')[0],
      lastSession: null,
      progressScore: 0,
      status: 'active' as const,
      avatar: null,
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
    };
    
    // Get existing clients from cloud storage
    const existingClients = await ctx.db.get('clients') || {};
    
    // Add new client to the collection
    existingClients[clientId] = newClient;
    
    // Save updated clients back to cloud storage
    await ctx.db.set('clients', existingClients);
    
    console.log('Client saved to cloud storage:', newClient);
    
    return {
      success: true,
      client: newClient,
      message: `${input.name} has been successfully added to your client roster.`,
    };
  });