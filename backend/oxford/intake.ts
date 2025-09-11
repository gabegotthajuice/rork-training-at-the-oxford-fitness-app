import { Hono } from "hono";
import { z } from "zod";
import { cloudStorage, profileStorage } from "../lib/cloud-storage";

const intakeSchema = z.object({
  client_id: z.string(),
  email: z.string().email(),
  first_name: z.string(),
  last_name: z.string(),
  phone: z.string(),
  goals: z.string(),
  plan: z.string(),
  calories_target: z.number(),
  protein_target: z.number(),
  breakfast_time: z.string(),
  lunch_time: z.string(),
  dinner_time: z.string(),
  start_date: z.string()
});

export const intakeRouter = new Hono();

intakeRouter.post("/submit", async (c) => {
  try {
    const body = await c.req.json();
    const data = intakeSchema.parse(body);
    
    // Store intake data in cloud storage
    const intakeData = {
      ...data,
      submitted_at: new Date().toISOString(),
      status: "active"
    };
    
    await profileStorage.setProfile(data.client_id, {
      ...intakeData,
      type: "client",
      onboarding_completed: true
    });
    
    // Store intake form separately for records
    await cloudStorage.set(`intakes:${data.client_id}`, intakeData);
    
    return c.json({ 
      success: true, 
      message: "Intake submitted successfully",
      client_id: data.client_id 
    });
  } catch (error) {
    console.error("Intake submission error:", error);
    return c.json({ 
      success: false, 
      error: error instanceof Error ? error.message : "Failed to submit intake" 
    }, 400);
  }
});

intakeRouter.get("/status/:clientId", async (c) => {
  try {
    const clientId = c.req.param("clientId");
    
    const profile = await profileStorage.getProfile(clientId);
    const intakeData = await cloudStorage.get(`intakes:${clientId}`);
    
    return c.json({
      success: true,
      has_profile: !!profile,
      has_intake: !!intakeData,
      onboarding_completed: profile?.onboarding_completed || false,
      intake_data: intakeData
    });
  } catch (error) {
    console.error("Intake status error:", error);
    return c.json({ 
      success: false, 
      error: "Failed to get intake status" 
    }, 400);
  }
});