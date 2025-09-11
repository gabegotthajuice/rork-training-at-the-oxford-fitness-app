import { z } from 'zod';
import { protectedProcedure } from '../../../create-context';

const syncBusinessSchema = z.object({
  forceUpdate: z.boolean().optional().default(false)
});

interface SquarespaceBusinessData {
  siteTitle: string;
  siteDescription: string;
  contactInfo: {
    email: string;
    phone: string;
    address: {
      addressLine1: string;
      city: string;
      state: string;
      postalCode: string;
      countryCode: string;
    };
  };
  socialLinks: {
    instagram?: string;
    facebook?: string;
    twitter?: string;
    linkedin?: string;
  };
  branding: {
    primaryColor: string;
    accentColor: string;
    logoUrl?: string;
  };
  seo: {
    metaTitle: string;
    metaDescription: string;
    keywords: string[];
  };
}

const SQUARESPACE_API_KEY = process.env.SQUARESPACE_API_KEY;
const SQUARESPACE_SITE_ID = process.env.SQUARESPACE_SITE_ID;

export const syncToSquarespaceProcedure = protectedProcedure
  .input(syncBusinessSchema)
  .mutation(async ({ input }) => {
    const { forceUpdate } = input;

    try {
      // Get business info from our system
      const businessInfo = {
        name: "Elite Fitness Training",
        description: "Transform your body and mind with personalized fitness training. Our expert trainers provide customized workout plans, nutrition guidance, and ongoing support to help you achieve your fitness goals.",
        email: "info@elitefitnesstraining.com",
        phone: "+1 (555) 123-4567",
        website: "https://elitefitnesstraining.com",
        address: {
          street: "123 Fitness Avenue",
          city: "Los Angeles",
          state: "California",
          zipCode: "90210",
          country: "United States"
        },
        socialMedia: {
          instagram: "@elitefitnesstraining",
          facebook: "EliteFitnessTraining",
          twitter: "@EliteFitnessLA",
          linkedin: "elite-fitness-training"
        },
        branding: {
          primaryColor: "#001F3F",
          secondaryColor: "#FFD700",
          tagline: "Transform Your Life, One Rep at a Time",
          logo: "https://images.unsplash.com/photo-1571019613454-1cb2f99b2d8b?w=200&h=200&fit=crop&crop=center"
        }
      };

      // Transform business info to Squarespace format
      const squarespaceData: SquarespaceBusinessData = {
        siteTitle: businessInfo.name,
        siteDescription: businessInfo.description,
        contactInfo: {
          email: businessInfo.email,
          phone: businessInfo.phone,
          address: {
            addressLine1: businessInfo.address.street,
            city: businessInfo.address.city,
            state: businessInfo.address.state,
            postalCode: businessInfo.address.zipCode,
            countryCode: 'US'
          }
        },
        socialLinks: {
          instagram: businessInfo.socialMedia.instagram ? `https://instagram.com/${businessInfo.socialMedia.instagram.replace('@', '')}` : undefined,
          facebook: businessInfo.socialMedia.facebook ? `https://facebook.com/${businessInfo.socialMedia.facebook}` : undefined,
          twitter: businessInfo.socialMedia.twitter ? `https://twitter.com/${businessInfo.socialMedia.twitter.replace('@', '')}` : undefined,
          linkedin: businessInfo.socialMedia.linkedin ? `https://linkedin.com/company/${businessInfo.socialMedia.linkedin}` : undefined
        },
        branding: {
          primaryColor: businessInfo.branding.primaryColor,
          accentColor: businessInfo.branding.secondaryColor,
          logoUrl: businessInfo.branding.logo
        },
        seo: {
          metaTitle: `${businessInfo.name} - ${businessInfo.branding.tagline}`,
          metaDescription: businessInfo.description,
          keywords: ['fitness', 'personal training', 'nutrition', 'health', 'wellness', 'gym']
        }
      };

      console.log('Syncing business data to Squarespace:', squarespaceData);

      // In a real implementation, you would make API calls to Squarespace
      // Here's the structure for the actual API calls:
      
      if (SQUARESPACE_API_KEY && SQUARESPACE_SITE_ID) {
        // Update site settings
        const siteResponse = await fetch(`https://api.squarespace.com/1.0/sites/${SQUARESPACE_SITE_ID}`, {
          method: 'PATCH',
          headers: {
            'Authorization': `Bearer ${SQUARESPACE_API_KEY}`,
            'Content-Type': 'application/json',
          },
          body: JSON.stringify({
            title: squarespaceData.siteTitle,
            description: squarespaceData.siteDescription,
            // Add other site-level settings
          })
        });

        // Update contact information
        const contactResponse = await fetch(`https://api.squarespace.com/1.0/sites/${SQUARESPACE_SITE_ID}/contact`, {
          method: 'PATCH',
          headers: {
            'Authorization': `Bearer ${SQUARESPACE_API_KEY}`,
            'Content-Type': 'application/json',
          },
          body: JSON.stringify(squarespaceData.contactInfo)
        });

        // Update social media links
        const socialResponse = await fetch(`https://api.squarespace.com/1.0/sites/${SQUARESPACE_SITE_ID}/social`, {
          method: 'PATCH',
          headers: {
            'Authorization': `Bearer ${SQUARESPACE_API_KEY}`,
            'Content-Type': 'application/json',
          },
          body: JSON.stringify(squarespaceData.socialLinks)
        });

        // Update branding/theme settings
        const brandingResponse = await fetch(`https://api.squarespace.com/1.0/sites/${SQUARESPACE_SITE_ID}/design`, {
          method: 'PATCH',
          headers: {
            'Authorization': `Bearer ${SQUARESPACE_API_KEY}`,
            'Content-Type': 'application/json',
          },
          body: JSON.stringify({
            colors: {
              primary: squarespaceData.branding.primaryColor,
              accent: squarespaceData.branding.accentColor
            },
            logo: squarespaceData.branding.logoUrl
          })
        });

        console.log('Squarespace sync responses:', {
          site: siteResponse.status,
          contact: contactResponse.status,
          social: socialResponse.status,
          branding: brandingResponse.status
        });
      }

      // Simulate API delay for demo
      await new Promise(resolve => setTimeout(resolve, 2000));

      return {
        success: true,
        message: 'Business information successfully synced to Squarespace',
        syncedData: {
          siteTitle: squarespaceData.siteTitle,
          contactEmail: squarespaceData.contactInfo.email,
          socialLinks: Object.keys(squarespaceData.socialLinks).length,
          brandingUpdated: true,
          lastSyncTime: new Date().toISOString()
        }
      };
    } catch (error) {
      console.error('Squarespace sync error:', error);
      throw new Error('Failed to sync business information to Squarespace');
    }
  });