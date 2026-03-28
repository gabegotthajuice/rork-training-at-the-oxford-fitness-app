import { Hono } from "hono";
import { createHmac } from "crypto";
import { cloudStorage, profileStorage } from "../lib/cloud-storage";

export const webhooksRouter = new Hono();

// Squarespace webhook handler
webhooksRouter.post("/squarespace", async (c) => {
  try {
    const signature = c.req.header("x-squarespace-signature");
    const body = await c.req.text();
    
    // Verify webhook signature
    const secret = process.env.SQUARESPACE_WEBHOOK_SECRET;
    if (secret && signature) {
      const expectedSignature = createHmac("sha256", secret)
        .update(body)
        .digest("base64");
      
      if (signature !== expectedSignature) {
        return c.json({ error: "Invalid signature" }, 401);
      }
    }
    
    const data = JSON.parse(body);
    console.log("Squarespace webhook received:", data.type);
    
    // Handle different webhook types
    switch (data.type) {
      case "order.create":
      case "order.update": {
        const order = data.data;
        
        // Store order
        const orderData = {
          id: order.id,
          client_id: order.customerId || order.customerEmail,
          status: order.fulfillmentStatus,
          amount: order.grandTotal?.value || 0,
          currency: order.grandTotal?.currency || "USD",
          created_at: order.createdOn,
          updated_at: order.modifiedOn,
          items: order.lineItems?.map((item: any) => ({
            name: item.productName,
            variant: item.variantName,
            quantity: item.quantity,
            price: item.unitPrice?.value || 0
          })) || []
        };
        
        await cloudStorage.set(`order:${order.id}`, orderData);
        
        // Update client's subscription status
        if (order.fulfillmentStatus === "FULFILLED") {
          const profile = await profileStorage.getProfile(orderData.client_id);
          if (profile) {
            await profileStorage.setProfile(orderData.client_id, {
              ...profile,
              subscription_status: "active",
              subscription_updated: new Date().toISOString(),
              last_payment: orderData.created_at
            });
          }
        }
        
        // Broadcast update (you can implement WebSocket here)
        console.log(`Order ${order.id} updated: ${order.fulfillmentStatus}`);
        break;
      }
      
      case "subscription.create":
      case "subscription.update":
      case "subscription.cancel": {
        const subscription = data.data;
        
        // Update subscription status
        await cloudStorage.set(`subscription:${subscription.id}`, {
          id: subscription.id,
          client_id: subscription.customerId,
          status: subscription.status,
          plan: subscription.planName,
          created_at: subscription.createdOn,
          updated_at: subscription.modifiedOn,
          next_billing: subscription.nextBillingDate
        });
        
        console.log(`Subscription ${subscription.id} updated: ${subscription.status}`);
        break;
      }
    }
    
    return c.json({ received: true });
  } catch (error) {
    console.error("Squarespace webhook error:", error);
    return c.json({ 
      error: "Webhook processing failed" 
    }, 500);
  }
});

// Acuity webhook handler
webhooksRouter.post("/acuity", async (c) => {
  try {
    const signature = c.req.header("x-acuity-signature");
    const body = await c.req.text();
    
    // Verify webhook signature
    const secret = process.env.ACUITY_WEBHOOK_SECRET;
    if (secret && signature) {
      const expectedSignature = createHmac("sha256", secret)
        .update(body)
        .digest("hex");
      
      if (signature !== expectedSignature) {
        return c.json({ error: "Invalid signature" }, 401);
      }
    }
    
    const data = JSON.parse(body);
    console.log("Acuity webhook received:", data.action);
    
    // Handle different webhook actions
    switch (data.action) {
      case "appointment.scheduled":
      case "appointment.rescheduled":
      case "appointment.canceled":
      case "appointment.completed": {
        const appointment = data.appointment || data;
        
        // Store appointment
        const appointmentData = {
          id: appointment.id,
          client_email: appointment.email,
          client_name: `${appointment.firstName} ${appointment.lastName}`,
          client_phone: appointment.phone,
          type: appointment.type || appointment.appointmentTypeID,
          date: appointment.date,
          time: appointment.time,
          datetime: appointment.datetime,
          duration: appointment.duration,
          status: data.action.replace("appointment.", ""),
          notes: appointment.notes,
          forms: appointment.forms || [],
          created_at: appointment.dateCreated,
          updated_at: new Date().toISOString()
        };
        
        await cloudStorage.set(`appointment:${appointment.id}`, appointmentData);
        
        // Find client by email and update their appointments
        const keys = await cloudStorage.list("profile:");
        for (const key of keys) {
          const profile = await cloudStorage.get(key);
          if (profile && profile.email === appointment.email) {
            const clientId = key.replace("profile:", "");
            
            // Store appointment under client
            const clientAppointments = await cloudStorage.get(`appointments:${clientId}`) || [];
            const existingIndex = clientAppointments.findIndex((a: any) => a.id === appointment.id);
            
            if (existingIndex >= 0) {
              clientAppointments[existingIndex] = appointmentData;
            } else {
              clientAppointments.push(appointmentData);
            }
            
            await cloudStorage.set(`appointments:${clientId}`, clientAppointments);
            
            // Broadcast update
            console.log(`Appointment ${appointment.id} ${data.action} for client ${clientId}`);
            break;
          }
        }
        break;
      }
      
      case "client.created":
      case "client.updated": {
        const client = data.client || data;
        
        // Store client info
        await cloudStorage.set(`acuity_client:${client.id}`, {
          id: client.id,
          email: client.email,
          firstName: client.firstName,
          lastName: client.lastName,
          phone: client.phone,
          notes: client.notes,
          created_at: client.dateCreated
        });
        
        console.log(`Acuity client ${client.id} ${data.action}`);
        break;
      }
    }
    
    return c.json({ received: true });
  } catch (error) {
    console.error("Acuity webhook error:", error);
    return c.json({ 
      error: "Webhook processing failed" 
    }, 500);
  }
});

// Generic webhook for testing
webhooksRouter.post("/test", async (c) => {
  try {
    const body = await c.req.json();
    console.log("Test webhook received:", body);
    
    // Store test webhook
    await cloudStorage.set(`webhook:test:${Date.now()}`, {
      ...body,
      received_at: new Date().toISOString()
    });
    
    return c.json({ 
      received: true,
      message: "Test webhook processed successfully"
    });
  } catch (error) {
    console.error("Test webhook error:", error);
    return c.json({ 
      error: "Test webhook failed" 
    }, 500);
  }
});