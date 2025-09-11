# Squarespace Integration Setup Guide

This guide will help you integrate Squarespace Commerce with your fitness app for seamless client purchases and automatic business information synchronization.

## Overview

The app now includes:
- **Packages Screen** (`/packages`) - Displays training packages with purchase buttons
- **Business Settings Screen** (`/business-settings`) - Manage and sync business information
- **Backend API Routes** - Handles checkout creation, webhook processing, and business data sync
- **Squarespace Commerce Integration** - Connects to your Squarespace store
- **Automatic Business Information Sync** - Keeps your Squarespace site updated with your business details

## Setup Steps

### 1. Business Information Setup

1. **Configure Your Business Details:**
   - Navigate to `/business-settings` in your app
   - Fill in your business information:
     - Business name, email, phone, website
     - Physical address
     - Social media handles
     - Branding colors and tagline
     - Business policies
   - Enable auto-sync to Squarespace
   - Click "Sync to Squarespace" to push your information

### 2. Squarespace Store Setup

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

### 3. Backend Configuration

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

### 4. Environment Variables

Add these to your environment:

```env
SQUARESPACE_API_KEY=your_api_key_here
SQUARESPACE_SITE_ID=your_site_id_here
SQUARESPACE_WEBHOOK_SECRET=your_webhook_secret_here
```

### 5. Webhook Setup

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

### 6. Testing

1. **Test Mode:**
   - Use Squarespace's sandbox environment for testing
   - Test with small amounts first

2. **Verify Integration:**
   - Navigate to `/packages` in your app
   - Click "Purchase Package" on any package
   - Should redirect to Squarespace checkout
   - Complete test purchase
   - Verify webhook receives order data

## Business Information Sync Features

### Automatic Synchronization

The app automatically syncs the following business information to Squarespace:

1. **Site Settings:**
   - Site title and description
   - Contact information (email, phone, address)
   - SEO metadata

2. **Branding:**
   - Primary and secondary colors
   - Logo URL
   - Brand tagline

3. **Social Media Links:**
   - Instagram, Facebook, Twitter, LinkedIn
   - Automatically formats URLs from handles

4. **Commerce Integration:**
   - Business information embedded in checkout process
   - Custom order metadata with business details
   - Branded checkout experience

### Business Settings API Endpoints

- **Get Business Info:** `trpc.business.getInfo.useQuery()`
- **Update Business Info:** `trpc.business.updateInfo.useMutation()`
- **Sync to Squarespace:** `trpc.business.syncToSquarespace.useMutation()`

### Usage Examples

```typescript
// Get business information
const businessQuery = trpc.business.getInfo.useQuery();

// Update business information
const updateMutation = trpc.business.updateInfo.useMutation();
updateMutation.mutate({
  name: "Elite Fitness Training",
  email: "info@elitefitnesstraining.com",
  branding: {
    primaryColor: "#001F3F",
    secondaryColor: "#FFD700",
    tagline: "Transform Your Life, One Rep at a Time"
  },
  autoSyncToSquarespace: true
});

// Manual sync to Squarespace
const syncMutation = trpc.business.syncToSquarespace.useMutation();
syncMutation.mutate({ forceUpdate: true });
```

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

### Business Information Customization

1. **Update Business Data:**
   - Modify the `getBusinessInfo()` function in backend routes
   - Add new fields to the `BusinessInfo` interface
   - Update the sync logic in `syncToSquarespaceProcedure`

2. **Custom Branding:**
   - Add logo upload functionality
   - Implement custom color picker
   - Add font selection options

3. **Extended Social Media:**
   - Add YouTube, TikTok, Pinterest links
   - Custom social media platform support
   - Social media analytics integration

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

### Business Sync Issues:

1. **Sync failing:**
   - Check Squarespace API credentials
   - Verify site permissions
   - Check network connectivity
   - Review API rate limits

2. **Information not updating:**
   - Force refresh the sync
   - Check Squarespace site cache
   - Verify API endpoint availability
   - Review webhook logs

3. **Branding not applying:**
   - Check color format (hex codes)
   - Verify logo URL accessibility
   - Review Squarespace theme compatibility
   - Check CSS override conflicts

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