import { z } from "zod";
import { protectedProcedure } from "@/backend/trpc/create-context";
import { healthDataStorage } from "@/backend/lib/cloud-storage";

const healthDataSchema = z.object({
  userId: z.string(),
  data: z.object({
    weight: z.number().optional(),
    waterIntake: z.number().optional(), // in ml
    proteinIntake: z.number().optional(), // in grams
    caloriesIntake: z.number().optional(),
    caloriesBurned: z.number().optional(),
    steps: z.number().optional(),
    sleepHours: z.number().optional(),
    heartRate: z.number().optional(),
    bloodPressure: z.object({
      systolic: z.number(),
      diastolic: z.number(),
    }).optional(),
    bodyFat: z.number().optional(),
    muscleMass: z.number().optional(),
    workoutDuration: z.number().optional(), // in minutes
    workoutType: z.string().optional(),
    mood: z.enum(["excellent", "good", "neutral", "poor", "terrible"]).optional(),
    notes: z.string().optional(),
    timestamp: z.string(),
    source: z.enum(["manual", "healthkit", "googlefit"]).default("manual"),
  }),
});

export const syncHealthDataProcedure = protectedProcedure
  .input(healthDataSchema)
  .mutation(async ({ input }) => {
    const healthData = {
      ...input.data,
      userId: input.userId,
      syncedAt: new Date().toISOString(),
    };
    
    const key = await healthDataStorage.saveHealthData(input.userId, healthData);
    
    return {
      success: true,
      dataId: key,
      syncedAt: healthData.syncedAt,
    };
  });