import { Hono } from "hono";
import { z } from "zod";
import { cloudStorage } from "../lib/cloud-storage";

const checkoutSchema = z.object({
  client_id: z.string(),
  plan_id: z.string(),
  amount_cents: z.number(),
  success_url: z.string().optional(),
  cancel_url: z.string().optional()
});

export const commerceRouter = new Hono();

// Create Squarespace checkout
commerceRouter.post("/squarespace/create-checkout", async (c) => {
  try {
    const body = await c.req.json();
    const data = checkoutSchema.parse(body);
    
    const apiKey = process.env.SQUARESPACE_API_KEY;
    const siteId = process.env.SQUARESPACE_SITE_ID;
    
    if (!apiKey || !siteId) {
      // Fallback to mock checkout for development
      const checkoutId = `checkout_${Date.now()}`;
      await cloudStorage.set(`checkout:${checkoutId}`, {
        ...data,
        status: "pending",
        created_at: new Date().toISOString()
      });
      
      return c.json({
        checkoutUrl: `https://checkout.example.com/mock/${checkoutId}`,
        checkoutId,
        mock: true
      });
    }
    
    // Create checkout with Squarespace Commerce API
    const response = await fetch(
      `https://api.squarespace.com/1.0/commerce/orders`,
      {
        method: "POST",
        headers: {
          "Authorization": `Bearer ${apiKey}`,
          "Content-Type": "application/json"
        },
        body: JSON.stringify({
          siteId,
          lineItems: [{
            variantId: data.plan_id,
            quantity: 1,
            customizations: {
              client_id: data.client_id
            }
          }],
          customerId: data.client_id,
          fulfillmentType: "DIGITAL",
          successUrl: data.success_url || "https://app.oxford.com/success",
          cancelUrl: data.cancel_url || "https://app.oxford.com/cancel"
        })
      }
    );
    
    if (!response.ok) {
      const error = await response.text();
      throw new Error(`Squarespace API error: ${error}`);
    }
    
    const order = await response.json();
    
    // Store checkout info
    await cloudStorage.set(`checkout:${order.id}`, {
      ...data,
      squarespace_order_id: order.id,
      checkout_url: order.checkoutUrl,
      status: "pending",
      created_at: new Date().toISOString()
    });
    
    return c.json({
      checkoutUrl: order.checkoutUrl,
      checkoutId: order.id,
      orderId: order.id
    });
  } catch (error) {
    console.error("Create checkout error:", error);
    return c.json({ 
      error: error instanceof Error ? error.message : "Failed to create checkout" 
    }, 400);
  }
});

// Get order status
commerceRouter.get("/order/:orderId", async (c) => {
  try {
    const orderId = c.req.param("orderId");
    const apiKey = process.env.SQUARESPACE_API_KEY;
    
    // Check local storage first
    const localOrder = await cloudStorage.get(`order:${orderId}`);
    if (localOrder) {
      return c.json(localOrder);
    }
    
    if (!apiKey) {
      return c.json({ error: "Order not found" }, 404);
    }
    
    // Fetch from Squarespace
    const response = await fetch(
      `https://api.squarespace.com/1.0/commerce/orders/${orderId}`,
      {
        headers: {
          "Authorization": `Bearer ${apiKey}`
        }
      }
    );
    
    if (!response.ok) {
      return c.json({ error: "Order not found" }, 404);
    }
    
    const order = await response.json();
    
    // Transform and cache
    const orderData = {
      id: order.id,
      client_id: order.customerId,
      status: order.fulfillmentStatus,
      amount: order.grandTotal.value,
      currency: order.grandTotal.currency,
      created_at: order.createdOn,
      items: order.lineItems.map((item: any) => ({
        name: item.productName,
        variant: item.variantName,
        quantity: item.quantity,
        price: item.unitPrice.value
      }))
    };
    
    await cloudStorage.set(`order:${orderId}`, orderData);
    
    return c.json(orderData);
  } catch (error) {
    console.error("Get order error:", error);
    return c.json({ 
      error: "Failed to get order" 
    }, 500);
  }
});

// Get client's orders
commerceRouter.get("/orders/:clientId", async (c) => {
  try {
    const clientId = c.req.param("clientId");
    const keys = await cloudStorage.list(`order:`);
    
    const orders = [];
    for (const key of keys) {
      const order = await cloudStorage.get(key);
      if (order && order.client_id === clientId) {
        orders.push(order);
      }
    }
    
    // Sort by date, newest first
    orders.sort((a, b) => 
      new Date(b.created_at).getTime() - new Date(a.created_at).getTime()
    );
    
    return c.json({ orders });
  } catch (error) {
    console.error("Get client orders error:", error);
    return c.json({ 
      error: "Failed to get orders" 
    }, 500);
  }
});

// Calculate subscription status
commerceRouter.get("/subscription/:clientId", async (c) => {
  try {
    const clientId = c.req.param("clientId");
    const keys = await cloudStorage.list(`order:`);
    
    let activeSubscription = null;
    let lastPayment = null;
    
    for (const key of keys) {
      const order = await cloudStorage.get(key);
      if (order && order.client_id === clientId && order.status === "FULFILLED") {
        if (!lastPayment || new Date(order.created_at) > new Date(lastPayment.created_at)) {
          lastPayment = order;
        }
      }
    }
    
    if (lastPayment) {
      // Check if subscription is still active (assuming 30-day billing)
      const paymentDate = new Date(lastPayment.created_at);
      const expiryDate = new Date(paymentDate);
      expiryDate.setDate(expiryDate.getDate() + 30);
      
      if (expiryDate > new Date()) {
        activeSubscription = {
          status: "active",
          plan: lastPayment.items[0]?.name || "Basic",
          expires_at: expiryDate.toISOString(),
          last_payment: lastPayment.created_at,
          amount: lastPayment.amount
        };
      } else {
        activeSubscription = {
          status: "expired",
          plan: lastPayment.items[0]?.name || "Basic",
          expired_at: expiryDate.toISOString(),
          last_payment: lastPayment.created_at
        };
      }
    }
    
    return c.json({
      subscription: activeSubscription || { status: "none" },
      payment_history: [lastPayment].filter(Boolean)
    });
  } catch (error) {
    console.error("Get subscription error:", error);
    return c.json({ 
      error: "Failed to get subscription" 
    }, 500);
  }
});