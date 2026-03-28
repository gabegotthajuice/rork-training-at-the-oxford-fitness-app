import { z } from 'zod';
import { protectedProcedure } from '../../../create-context';

interface BusinessInfo {
  name: string;
  description: string;
  email: string;
  phone: string;
  website: string;
  address: {
    street: string;
    city: string;
    state: string;
    zipCode: string;
    country: string;
  };
  socialMedia: {
    instagram?: string;
    facebook?: string;
    twitter?: string;
    linkedin?: string;
  };
  services: {
    id: string;
    name: string;
    description: string;
    price: number;
    duration: string;
    category: string;
  }[];
  branding: {
    primaryColor: string;
    secondaryColor: string;
    logo?: string;
    tagline: string;
  };
  policies: {
    cancellation: string;
    refund: string;
    privacy: string;
    terms: string;
  };
}

// This would typically come from your database
const getBusinessInfo = (): BusinessInfo => {
  return {
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
    services: [
      {
        id: "personal-training",
        name: "Personal Training Session",
        description: "One-on-one training session with certified trainer",
        price: 85,
        duration: "60 minutes",
        category: "Training"
      },
      {
        id: "nutrition-consultation",
        name: "Nutrition Consultation",
        description: "Personalized nutrition plan and dietary guidance",
        price: 120,
        duration: "45 minutes",
        category: "Nutrition"
      },
      {
        id: "body-composition",
        name: "Body Composition Analysis",
        description: "Comprehensive body composition scan and analysis",
        price: 50,
        duration: "30 minutes",
        category: "Assessment"
      }
    ],
    branding: {
      primaryColor: "#001F3F",
      secondaryColor: "#FFD700",
      tagline: "Transform Your Life, One Rep at a Time",
      logo: "https://images.unsplash.com/photo-1571019613454-1cb2f99b2d8b?w=200&h=200&fit=crop&crop=center"
    },
    policies: {
      cancellation: "24-hour cancellation policy. Sessions cancelled with less than 24 hours notice will be charged in full.",
      refund: "Refunds available within 7 days of purchase for unused sessions. Processing fee may apply.",
      privacy: "We protect your personal information and health data in accordance with HIPAA guidelines.",
      terms: "By purchasing our services, you agree to our terms of service and liability waiver."
    }
  };
};

export const getBusinessInfoProcedure = protectedProcedure
  .query(async () => {
    try {
      const businessInfo = getBusinessInfo();
      
      console.log('Retrieved business information');
      
      return {
        success: true,
        data: businessInfo
      };
    } catch (error) {
      console.error('Error getting business info:', error);
      throw new Error('Failed to retrieve business information');
    }
  });