import { Hono } from "hono";
import { z } from "zod";
import { cloudStorage, healthDataStorage } from "../lib/cloud-storage";

const mealLogSchema = z.object({
  client_id: z.string(),
  date: z.string(), // YYYY-MM-DD
  meal_tag: z.enum(["B", "L", "D", "S"]), // Breakfast, Lunch, Dinner, Snack
  notes: z.string().optional(),
  calories: z.number().optional(),
  protein: z.number().optional(),
  carbs: z.number().optional(),
  fat: z.number().optional()
});

export const mealsRouter = new Hono();

// Log a meal with photo
mealsRouter.post("/log", async (c) => {
  try {
    const formData = await c.req.formData();
    
    const client_id = formData.get("client_id") as string;
    const date = formData.get("date") as string;
    const meal_tag = formData.get("meal_tag") as string;
    const notes = formData.get("notes") as string;
    const photo = formData.get("photo") as File;
    
    if (!client_id || !date || !meal_tag) {
      return c.json({ error: "Missing required fields" }, 400);
    }
    
    let photoUrl = "";
    let analysis = null;
    
    // Process photo if provided
    if (photo) {
      // Convert photo to base64 for AI analysis
      const buffer = await photo.arrayBuffer();
      const base64 = Buffer.from(buffer).toString("base64");
      photoUrl = `data:${photo.type};base64,${base64}`;
      
      // Analyze meal with AI
      try {
        const aiResponse = await fetch("https://toolkit.rork.com/text/llm/", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            messages: [
              {
                role: "system",
                content: "You are a nutrition expert. Analyze the meal photo and provide: estimated calories, protein (g), carbs (g), fat (g), and a brief compliance assessment (healthy/moderate/needs improvement). Return as JSON."
              },
              {
                role: "user",
                content: [
                  { type: "text", text: `Analyze this ${meal_tag === "B" ? "breakfast" : meal_tag === "L" ? "lunch" : meal_tag === "D" ? "dinner" : "snack"}. Notes: ${notes || "None"}` },
                  { type: "image", image: base64 }
                ]
              }
            ]
          })
        });
        
        if (aiResponse.ok) {
          const result = await aiResponse.json();
          try {
            analysis = JSON.parse(result.completion);
          } catch {
            analysis = { 
              calories: 0, 
              protein: 0, 
              carbs: 0, 
              fat: 0, 
              compliance: "Unable to analyze" 
            };
          }
        }
      } catch (error) {
        console.error("AI analysis error:", error);
      }
    }
    
    // Create meal entry
    const meal = {
      id: `meal_${Date.now()}`,
      client_id,
      date,
      meal_tag,
      notes,
      photo_url: photoUrl,
      analysis,
      calories: analysis?.calories || 0,
      protein: analysis?.protein || 0,
      carbs: analysis?.carbs || 0,
      fat: analysis?.fat || 0,
      compliance: analysis?.compliance || "not_analyzed",
      logged_at: new Date().toISOString()
    };
    
    // Store meal
    const mealsKey = `meals:${client_id}:${date}`;
    const dayMeals = await cloudStorage.get(mealsKey) || [];
    dayMeals.push(meal);
    await cloudStorage.set(mealsKey, dayMeals);
    
    // Update daily totals
    const totals = dayMeals.reduce((acc: any, m: any) => ({
      calories: acc.calories + (m.calories || 0),
      protein: acc.protein + (m.protein || 0),
      carbs: acc.carbs + (m.carbs || 0),
      fat: acc.fat + (m.fat || 0)
    }), { calories: 0, protein: 0, carbs: 0, fat: 0 });
    
    await cloudStorage.set(`meals:${client_id}:${date}:totals`, totals);
    
    // Store in health data for tracking
    await healthDataStorage.saveHealthData(client_id, {
      type: "meal",
      ...meal,
      timestamp: new Date().toISOString()
    });
    
    return c.json({ 
      success: true, 
      meal,
      daily_totals: totals,
      analysis 
    });
  } catch (error) {
    console.error("Meal log error:", error);
    return c.json({ 
      success: false, 
      error: error instanceof Error ? error.message : "Failed to log meal" 
    }, 400);
  }
});

// Get meals for a date
mealsRouter.get("/daily/:clientId/:date", async (c) => {
  try {
    const clientId = c.req.param("clientId");
    const date = c.req.param("date");
    
    const meals = await cloudStorage.get(`meals:${clientId}:${date}`) || [];
    const totals = await cloudStorage.get(`meals:${clientId}:${date}:totals`) || {
      calories: 0,
      protein: 0,
      carbs: 0,
      fat: 0
    };
    
    // Get target from profile
    const profile = await cloudStorage.get(`intakes:${clientId}`);
    const targets = {
      calories: profile?.calories_target || 2000,
      protein: profile?.protein_target || 150
    };
    
    // Calculate compliance
    const compliance = {
      calories: Math.min(100, (totals.calories / targets.calories) * 100),
      protein: Math.min(100, (totals.protein / targets.protein) * 100),
      overall: "good" as "good" | "moderate" | "poor"
    };
    
    if (compliance.calories < 80 || compliance.calories > 120) {
      compliance.overall = "moderate";
    }
    if (compliance.protein < 70) {
      compliance.overall = "poor";
    }
    
    return c.json({
      meals,
      totals,
      targets,
      compliance
    });
  } catch (error) {
    console.error("Get daily meals error:", error);
    return c.json({ 
      error: "Failed to get meals" 
    }, 500);
  }
});

// Get meal history
mealsRouter.get("/history/:clientId", async (c) => {
  try {
    const clientId = c.req.param("clientId");
    const days = parseInt(c.req.query("days") || "7");
    
    const history = [];
    const endDate = new Date();
    
    for (let i = 0; i < days; i++) {
      const date = new Date(endDate);
      date.setDate(date.getDate() - i);
      const dateStr = date.toISOString().split("T")[0];
      
      const meals = await cloudStorage.get(`meals:${clientId}:${dateStr}`) || [];
      const totals = await cloudStorage.get(`meals:${clientId}:${dateStr}:totals`);
      
      if (meals.length > 0 || totals) {
        history.push({
          date: dateStr,
          meals,
          totals: totals || { calories: 0, protein: 0, carbs: 0, fat: 0 },
          meal_count: meals.length
        });
      }
    }
    
    return c.json({ history });
  } catch (error) {
    console.error("Get meal history error:", error);
    return c.json({ 
      error: "Failed to get meal history" 
    }, 500);
  }
});

// Get meal library (all logged meals)
mealsRouter.get("/library/:clientId", async (c) => {
  try {
    const clientId = c.req.param("clientId");
    const keys = await cloudStorage.list(`meals:${clientId}:`);
    
    const library = [];
    for (const key of keys) {
      if (!key.endsWith(":totals")) {
        const meals = await cloudStorage.get(key);
        if (meals && Array.isArray(meals)) {
          library.push(...meals);
        }
      }
    }
    
    // Sort by date, newest first
    library.sort((a: any, b: any) => 
      new Date(b.logged_at).getTime() - new Date(a.logged_at).getTime()
    );
    
    return c.json({ 
      meals: library,
      total: library.length
    });
  } catch (error) {
    console.error("Get meal library error:", error);
    return c.json({ 
      error: "Failed to get meal library" 
    }, 500);
  }
});