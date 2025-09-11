import { z } from 'zod';
import { protectedProcedure } from '../../../create-context';

const createCheckoutSchema = z.object({
  productId: z.string(),
  packageName: z.string(),
  price: z.number(),
  sessions: z.number(),
  customerInfo: z.object({
    email: z.string().email().optional(),
    name: z.string().optional(),
    phone: z.string().optional(),
  }).optional(),
});

interface BusinessInfo {
  name: string;
  email: string;
  phone: string;
  address: {
    street: string;
    city: string;
    state: string;
    zipCode: string;
    country: string;
  };
  branding: {
    primaryColor: string;
    secondaryColor: string;
    logo?: string;
  };
}

const getBusinessInfo = (): BusinessInfo => {
  return {
    name: "Elite Fitness Training",
    email: "info@elitefitnesstraining.com",
    phone: "+1 (555) 123-4567",
    address: {
      street: "123 Fitness Avenue",
      city: "Los Angeles",
      state: "California",
      zipCode: "90210",
      country: "United States"
    },
    branding: {
      primaryColor: "#001F3F",
      secondaryColor: "#FFD700",
      logo: "https://images.unsplash.com/photo-1571019613454-1cb2f99b2d8b?w=200&h=200&fit=crop&crop=center"
    }
  };
};

const SQUARESPACE_API_KEY = process.env.SQUARESPACE_API_KEY;
const SQUARESPACE_SITE_ID = process.env.SQUARESPACE_SITE_ID;

export const createSquarespaceCheckoutProcedure = protectedProcedure
  .input(createCheckoutSchema)
  .mutation(async ({ input }: { input: z.infer<typeof createCheckoutSchema> }) => {
    const { productId, packageName, price, sessions, customerInfo } = input;

    try {
      const businessInfo = getBusinessInfo();
      
      console.log('Creating checkout for:', {
        productId,
        packageName,
        price,
        sessions,
        customerInfo,
        businessInfo: businessInfo.name
      });

      // In a real implementation with Squarespace Commerce API:
      if (SQUARESPACE_API_KEY && SQUARESPACE_SITE_ID) {
        const orderData = {
          websiteId: SQUARESPACE_SITE_ID,
          lineItems: [{
            productId: productId,
            quantity: 1,
            customizations: {
              packageName,
              sessions: sessions.toString(),
              businessName: businessInfo.name,
              businessEmail: businessInfo.email,
              businessPhone: businessInfo.phone
            }
          }],
          customerInfo: {
            email: customerInfo?.email || '',
            firstName: customerInfo?.name?.split(' ')[0] || '',
            lastName: customerInfo?.name?.split(' ').slice(1).join(' ') || '',
            phone: customerInfo?.phone || ''
          },
          billingAddress: {
            addressLine1: businessInfo.address.street,
            city: businessInfo.address.city,
            state: businessInfo.address.state,
            postalCode: businessInfo.address.zipCode,
            countryCode: 'US'
          },
          metadata: {
            businessName: businessInfo.name,
            businessEmail: businessInfo.email,
            packageType: packageName,
            sessionCount: sessions,
            primaryColor: businessInfo.branding.primaryColor,
            secondaryColor: businessInfo.branding.secondaryColor,
            logo: businessInfo.branding.logo
          }
        };

        const response = await fetch(`https://api.squarespace.com/1.0/commerce/orders`, {
          method: 'POST',
          headers: {
            'Authorization': `Bearer ${SQUARESPACE_API_KEY}`,
            'Content-Type': 'application/json',
          },
          body: JSON.stringify(orderData)
        });

        if (!response.ok) {
          throw new Error(`Squarespace API error: ${response.status}`);
        }

        const order = await response.json();
        
        return {
          success: true,
          checkoutUrl: order.checkoutUrl,
          orderId: order.id,
          businessInfo: {
            name: businessInfo.name,
            email: businessInfo.email,
            branding: businessInfo.branding
          }
        };
      }

      // Fallback for demo/development
      const checkoutUrl = `https://your-squarespace-site.com/checkout?product=${productId}&price=${price}&business=${encodeURIComponent(businessInfo.name)}&email=${encodeURIComponent(businessInfo.email)}&color=${encodeURIComponent(businessInfo.branding.primaryColor)}`;

      // Simulate API delay
      await new Promise((resolve) => setTimeout(resolve, 1000));

      return {
        success: true,
        checkoutUrl,
        orderId: `order_${Date.now()}`,
        businessInfo: {
          name: businessInfo.name,
          email: businessInfo.email,
          branding: businessInfo.branding
        }
      };
    } catch (error) {
      console.error('Squarespace checkout error:', error);
      throw new Error('Failed to create checkout session');
    }
  });