# Squarespace Integration Setup Guide

This guide will help you integrate Squarespace Commerce with your fitness app for seamless client purchases.

## Overview

The app now includes:
- **Packages Screen** (`/packages`) - Displays training packages with purchase buttons
- **Backend API Routes** - Handles checkout creation and webhook processing
- **Squarespace Commerce Integration** - Connects to your Squarespace store

## Setup Steps

### 1. Squarespace Store Setup

1. **Create Products in Squarespace:**
   - Log into your Squarespace site
   - Go to Commerce → Products
   - Create products matching the packages in the app:
     - `starter-package-4-sessions` - $299 (4 sessions)
     - `premium-package-12-sessions` - $799 (12 sessions) 
     - `elite-package-24-sessions` - $1499 (24 sessions)

2. **Enable Commerce API:**
   - Go to Settings → Developer Tools
   - Generate API keys for your store
   - Note your Site ID and API Key

### 2. Backend Configuration

Update the backend routes with your actual Squarespace credentials:

```typescript
// backend/trpc/routes/payments/create-squarespace-checkout/route.ts

const SQUARESPACE_API_KEY = process.env.SQUARESPACE_API_KEY;
const SQUARESPACE_SITE_ID = process.env.SQUARESPACE_SITE_ID;

export const createSquarespaceCheckoutProcedure = protectedProcedure
  .input(createCheckoutSchema)
  .mutation(async ({ input }) => {
    const { productId, packageName, price, sessions } = input;

    try {
      // Create checkout session with Squarespace Commerce API
      const response = await fetch(`https://api.squarespace.com/1.0/commerce/orders`, {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${SQUARESPACE_API_KEY}`,
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          websiteId: SQUARESPACE_SITE_ID,
          lineItems: [{
            productId: productId,
            quantity: 1,
            customizations: {
              packageName,
              sessions: sessions.toString()
            }
          }],
          // Add customer info, shipping, etc.
        })
      });

      const order = await response.json();
      
      return {
        success: true,
        checkoutUrl: order.checkoutUrl,
        orderId: order.id,
      };
    } catch (error) {
      console.error('Squarespace checkout error:', error);
      throw new Error('Failed to create checkout session');
    }
  });
```

### 3. Environment Variables

Add these to your environment:

```env
SQUARESPACE_API_KEY=your_api_key_here
SQUARESPACE_SITE_ID=your_site_id_here
SQUARESPACE_WEBHOOK_SECRET=your_webhook_secret_here
```

### 4. Webhook Setup

1. **Configure Webhook in Squarespace:**
   - Go to Settings → Developer Tools → Webhooks
   - Add webhook URL: `https://your-domain.com/api/trpc/payments.handleSquarespaceWebhook`
   - Select events: `order.create`, `order.update`

2. **Webhook Handler:**
   The webhook handler is already set up to:
   - Verify webhook signatures
   - Process completed orders
   - Add sessions to client accounts
   - Send confirmation emails

### 5. Testing

1. **Test Mode:**
   - Use Squarespace's sandbox environment for testing
   - Test with small amounts first

2. **Verify Integration:**
   - Navigate to `/packages` in your app
   - Click "Purchase Package" on any package
   - Should redirect to Squarespace checkout
   - Complete test purchase
   - Verify webhook receives order data

## Squarespace Commerce API Reference

### Key Endpoints:

- **Create Order:** `POST /1.0/commerce/orders`
- **Get Order:** `GET /1.0/commerce/orders/{orderId}`
- **Update Order:** `PUT /1.0/commerce/orders/{orderId}`

### Authentication:
```javascript
headers: {
  'Authorization': 'Bearer YOUR_API_KEY',
  'Content-Type': 'application/json'
}
```

## Security Considerations

1. **Webhook Verification:**
   - Always verify webhook signatures
   - Use HTTPS for all endpoints
   - Validate all incoming data

2. **API Keys:**
   - Store in environment variables
   - Never commit to version control
   - Rotate regularly

3. **Order Validation:**
   - Verify order amounts match expected prices
   - Check product IDs are valid
   - Prevent duplicate processing

## Customization

### Adding New Packages:

1. **Update packages array** in `app/packages.tsx`:
```typescript
{
  id: 'new-package',
  name: 'New Package',
  price: 599,
  sessions: 8,
  squarespaceProductId: 'new-package-8-sessions',
  // ... other properties
}
```

2. **Create corresponding product** in Squarespace Commerce

3. **Update backend validation** if needed

### Styling:
- Modify `app/packages.tsx` styles to match your brand
- Update colors, fonts, and layout as needed
- Add your logo and branding elements

## Troubleshooting

### Common Issues:

1. **Checkout URL not opening:**
   - Check API credentials
   - Verify product IDs match Squarespace
   - Check network connectivity

2. **Webhooks not received:**
   - Verify webhook URL is accessible
   - Check webhook signature validation
   - Review Squarespace webhook logs

3. **Orders not processing:**
   - Check webhook handler logs
   - Verify order status mapping
   - Ensure database connections work

### Debug Mode:
Enable detailed logging in development:
```typescript
console.log('Squarespace API Response:', response);
console.log('Order Data:', order);
```

## Production Deployment

1. **SSL Certificate:** Ensure HTTPS is enabled
2. **Environment Variables:** Set production API keys
3. **Monitoring:** Set up error tracking and logging
4. **Backup:** Regular database backups
5. **Testing:** Thorough end-to-end testing

## Support

For Squarespace Commerce API support:
- [Squarespace Developer Documentation](https://developers.squarespace.com/)
- [Commerce API Reference](https://developers.squarespace.com/commerce-apis)
- Squarespace Developer Support

---

This integration provides a seamless purchase experience for your clients while maintaining full control over your training packages and pricing.