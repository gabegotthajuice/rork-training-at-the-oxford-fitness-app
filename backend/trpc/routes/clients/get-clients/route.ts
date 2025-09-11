import { z } from "zod";
import { protectedProcedure } from "@/backend/trpc/create-context";

const getClientsSchema = z.object({
  search: z.string().optional(),
  status: z.enum(['all', 'active', 'inactive', 'paused']).default('all'),
  limit: z.number().min(1).max(100).default(50),
  offset: z.number().min(0).default(0),
});

// Mock client data - in production this would come from database
const mockClients = [
  {
    id: 'client_1',
    name: 'Sarah Johnson',
    email: 'sarah.j@email.com',
    phone: '(555) 123-4567',
    age: 28,
    height: "5'6\"",
    currentWeight: 145,
    targetWeight: 135,
    bodyType: 'Mesomorph',
    activityLevel: 'Moderate',
    goals: 'Weight loss and muscle toning',
    packageType: '12-Session Package',
    sessionsTotal: 12,
    sessionsRemaining: 8,
    dietaryRestrictions: 'Gluten-free',
    medicalConditions: 'None',
    integrations: {
      smartScale: true,
      groupMe: true,
      myFitnessPal: false,
      appleHealth: true,
      googleFit: false,
    },
    selectedScaleBrand: 'Withings',
    joinDate: '2024-01-15',
    lastSession: '2024-12-18',
    progressScore: 85,
    status: 'active' as const,
    avatar: null,
    createdAt: '2024-01-15T10:00:00Z',
    updatedAt: '2024-12-18T15:30:00Z',
  },
  {
    id: 'client_2',
    name: 'Michael Chen',
    email: 'mchen@email.com',
    phone: '(555) 234-5678',
    age: 35,
    height: "5'10\"",
    currentWeight: 180,
    targetWeight: 170,
    bodyType: 'Endomorph',
    activityLevel: 'Active',
    goals: 'Strength building and fat loss',
    packageType: '8-Session Package',
    sessionsTotal: 8,
    sessionsRemaining: 4,
    dietaryRestrictions: 'None',
    medicalConditions: 'Previous knee injury',
    integrations: {
      smartScale: false,
      groupMe: true,
      myFitnessPal: true,
      appleHealth: false,
      googleFit: true,
    },
    selectedScaleBrand: null,
    joinDate: '2024-02-20',
    lastSession: '2024-12-17',
    progressScore: 72,
    status: 'active' as const,
    avatar: null,
    createdAt: '2024-02-20T09:15:00Z',
    updatedAt: '2024-12-17T14:45:00Z',
  },
  {
    id: 'client_3',
    name: 'Emily Rodriguez',
    email: 'emily.r@email.com',
    phone: '(555) 345-6789',
    age: 24,
    height: "5'4\"",
    currentWeight: 125,
    targetWeight: 130,
    bodyType: 'Ectomorph',
    activityLevel: 'Very Active',
    goals: 'Muscle gain and athletic performance',
    packageType: '16-Session Package',
    sessionsTotal: 16,
    sessionsRemaining: 12,
    dietaryRestrictions: 'Vegetarian',
    medicalConditions: 'None',
    integrations: {
      smartScale: true,
      groupMe: false,
      myFitnessPal: true,
      appleHealth: true,
      googleFit: false,
    },
    selectedScaleBrand: 'Fitbit Aria',
    joinDate: '2024-03-10',
    lastSession: '2024-12-16',
    progressScore: 91,
    status: 'active' as const,
    avatar: null,
    createdAt: '2024-03-10T11:30:00Z',
    updatedAt: '2024-12-16T16:20:00Z',
  },
];

export const getClientsProcedure = protectedProcedure
  .input(getClientsSchema)
  .query(async ({ input }) => {
    console.log('Fetching clients with filters:', input);
    
    let filteredClients = [...mockClients];
    
    // Apply search filter
    if (input.search) {
      const searchLower = input.search.toLowerCase();
      filteredClients = filteredClients.filter(client => 
        client.name.toLowerCase().includes(searchLower) ||
        client.email.toLowerCase().includes(searchLower) ||
        client.phone.includes(input.search!)
      );
    }
    
    // Apply status filter
    if (input.status !== 'all') {
      filteredClients = filteredClients.filter(client => client.status === input.status);
    }
    
    // Apply pagination
    const total = filteredClients.length;
    const paginatedClients = filteredClients.slice(input.offset, input.offset + input.limit);
    
    // Calculate stats
    const stats = {
      total: mockClients.length,
      active: mockClients.filter(c => c.status === 'active').length,
      inactive: 0, // No inactive clients in mock data
      paused: 0, // No paused clients in mock data
      totalSessions: mockClients.reduce((sum, c) => sum + c.sessionsRemaining, 0),
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