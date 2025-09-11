import { Hono } from "hono";
import { cloudStorage } from "../lib/cloud-storage";

export const calendarRouter = new Hono();

// Google Calendar OAuth flow
calendarRouter.get("/google/authurl", async (c) => {
  const clientId = process.env.GOOGLE_CLIENT_ID;
  const redirectUri = process.env.GOOGLE_REDIRECT_URI || "https://your-domain.com/api/oxford/calendar/google/oauth/callback";
  
  if (!clientId) {
    return c.json({ error: "Google OAuth not configured" }, 500);
  }
  
  const authUrl = `https://accounts.google.com/o/oauth2/v2/auth?` +
    `client_id=${clientId}&` +
    `redirect_uri=${encodeURIComponent(redirectUri)}&` +
    `response_type=code&` +
    `scope=${encodeURIComponent("https://www.googleapis.com/auth/calendar.readonly email profile")}&` +
    `access_type=offline&` +
    `prompt=consent`;
  
  return c.json({ url: authUrl });
});

// OAuth callback handler
calendarRouter.get("/google/oauth/callback", async (c) => {
  const code = c.req.query("code");
  const error = c.req.query("error");
  
  if (error) {
    return c.html(`
      <html>
        <body>
          <script>
            window.opener.postMessage({ error: "${error}" }, "*");
            window.close();
          </script>
        </body>
      </html>
    `);
  }
  
  if (!code) {
    return c.json({ error: "No authorization code received" }, 400);
  }
  
  try {
    // Exchange code for tokens
    const tokenResponse = await fetch("https://oauth2.googleapis.com/token", {
      method: "POST",
      headers: { "Content-Type": "application/x-www-form-urlencoded" },
      body: new URLSearchParams({
        code,
        client_id: process.env.GOOGLE_CLIENT_ID!,
        client_secret: process.env.GOOGLE_CLIENT_SECRET!,
        redirect_uri: process.env.GOOGLE_REDIRECT_URI!,
        grant_type: "authorization_code"
      })
    });
    
    const tokens = await tokenResponse.json();
    
    // Return tokens to the app via postMessage
    return c.html(`
      <html>
        <body>
          <script>
            window.opener.postMessage({ tokens: ${JSON.stringify(tokens)} }, "*");
            window.close();
          </script>
        </body>
      </html>
    `);
  } catch (error) {
    console.error("OAuth callback error:", error);
    return c.html(`
      <html>
        <body>
          <script>
            window.opener.postMessage({ error: "Failed to exchange code for tokens" }, "*");
            window.close();
          </script>
        </body>
      </html>
    `);
  }
});

// Get calendar events
calendarRouter.get("/google/events", async (c) => {
  const tokensHeader = c.req.header("x-google-tokens");
  
  if (!tokensHeader) {
    return c.json({ error: "No tokens provided" }, 401);
  }
  
  try {
    const tokens = JSON.parse(tokensHeader);
    const calendarId = process.env.GOOGLE_CALENDAR_ID || "primary";
    
    // Get events from Google Calendar
    const response = await fetch(
      `https://www.googleapis.com/calendar/v3/calendars/${calendarId}/events?` +
      `timeMin=${new Date().toISOString()}&` +
      `maxResults=50&` +
      `singleEvents=true&` +
      `orderBy=startTime`,
      {
        headers: {
          Authorization: `Bearer ${tokens.access_token}`
        }
      }
    );
    
    if (!response.ok) {
      throw new Error(`Calendar API error: ${response.status}`);
    }
    
    const data = await response.json();
    
    // Transform events for the app
    const events = data.items?.map((event: any) => ({
      id: event.id,
      title: event.summary,
      description: event.description,
      start: event.start?.dateTime || event.start?.date,
      end: event.end?.dateTime || event.end?.date,
      location: event.location,
      attendees: event.attendees?.map((a: any) => ({
        email: a.email,
        name: a.displayName,
        status: a.responseStatus
      }))
    })) || [];
    
    return c.json({ events });
  } catch (error) {
    console.error("Calendar events error:", error);
    return c.json({ 
      error: "Failed to fetch calendar events",
      details: error instanceof Error ? error.message : "Unknown error"
    }, 500);
  }
});

// Acuity Scheduling integration
calendarRouter.get("/acuity/appointments", async (c) => {
  const userId = c.req.header("x-user-id");
  const userEmail = c.req.header("x-user-email");
  
  if (!userId || !userEmail) {
    return c.json({ error: "User ID and email required" }, 400);
  }
  
  try {
    const acuityUserId = process.env.ACUITY_USER_ID;
    const acuityApiKey = process.env.ACUITY_API_KEY;
    
    if (!acuityUserId || !acuityApiKey) {
      return c.json({ error: "Acuity not configured" }, 500);
    }
    
    // Get appointments from Acuity
    const response = await fetch(
      `https://acuityscheduling.com/api/v1/appointments?email=${userEmail}`,
      {
        headers: {
          Authorization: `Basic ${Buffer.from(`${acuityUserId}:${acuityApiKey}`).toString("base64")}`
        }
      }
    );
    
    if (!response.ok) {
      throw new Error(`Acuity API error: ${response.status}`);
    }
    
    const appointments = await response.json();
    
    // Store appointments in cloud storage for offline access
    await cloudStorage.set(`appointments:${userId}`, appointments);
    
    return c.json({ appointments });
  } catch (error) {
    console.error("Acuity appointments error:", error);
    return c.json({ 
      error: "Failed to fetch appointments",
      details: error instanceof Error ? error.message : "Unknown error"
    }, 500);
  }
});