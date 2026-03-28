# Authentication & Onboarding System

## Overview

This fitness app implements a comprehensive authentication and onboarding system with multiple OAuth providers, secure token storage, and a multi-step client intake process.

## Authentication Features

### 1. Multiple Authentication Methods

#### Email/Password Authentication
- Traditional email and password signup/login
- Role selection (Client or Trainer)
- Secure password handling

#### Google Sign-In
- OAuth 2.0 integration using Expo AuthSession
- Automatic profile data extraction
- Cross-platform support (iOS, Android, Web)

#### Apple Sign-In
- Native Apple Authentication integration
- iOS-specific implementation
- Automatic availability detection
- Full name and email scope requests

#### Squarespace Integration
- OAuth integration for existing Squarespace customers
- Automatic customer data sync
- Payment and subscription management

### 2. Secure Token Storage

#### Platform-Specific Storage
- **iOS/Android**: Expo SecureStore (Keychain/Keystore)
- **Web**: localStorage with encryption
- Automatic platform detection and appropriate storage selection

#### Token Management
- Secure access token storage
- Automatic token refresh handling
- Secure logout with complete token cleanup

### 3. User Profile Management

#### Comprehensive User Data
```typescript
interface User {
  id: string;
  email: string;
  name: string;
  firstName?: string;
  lastName?: string;
  role: 'client' | 'trainer';
  profileImage?: string;
  trainerId?: string;
  authProvider?: 'google' | 'apple' | 'squarespace' | 'email';
  squarespaceCustomerId?: string;
  subscription?: {
    plan: string;
    status: string;
    expiresAt: string;
  };
  profile?: {
    phone?: string;
    dateOfBirth?: string;
    height?: number;
    currentWeight?: number;
    targetWeight?: number;
    fitnessGoals?: string[];
    medicalConditions?: string[];
  };
}
```

## Onboarding System

### 1. Multi-Step Client Intake

#### Step 1: Personal Information
- First Name, Last Name
- Email, Phone Number
- Basic contact details

#### Step 2: Physical Profile
- Height and current weight
- Training experience
- Fitness background assessment

#### Step 3: Goals & Targets
- Detailed fitness goals
- Daily calorie targets
- Protein intake goals
- Timeline expectations

#### Step 4: Meal Schedule
- Breakfast, lunch, dinner times
- Eating pattern preferences
- Meal timing optimization

#### Step 5: Daily Habits
- Sleep hours tracking
- Water intake goals
- Activity level assessment
- Preferred workout times
- Weekly workout frequency

#### Step 6: Health & Progress
- Target weight goals
- Body fat percentage (if known)
- Medical conditions and injuries
- Current medications
- Food allergies and restrictions
- Stress level assessment

### 2. Data Integration

#### Oxford Integration System
- Comprehensive intake form submission
- Client ID generation and tracking
- Integration with meal logging system
- Health data synchronization

#### Health Kit Integration
- iOS HealthKit permissions
- Automatic health data sync
- Steps, sleep, weight, hydration tracking
- Active energy monitoring

#### Google Fit Integration
- Android health data sync
- Cross-platform health tracking
- Automatic data collection

## Authentication Flow

### 1. App Launch Flow
```
App Launch
    ↓
Check Authentication Status
    ↓
┌─────────────────┬─────────────────┐
│ Not Authenticated │ Authenticated    │
│        ↓         │        ↓         │
│   Auth Screen    │  Check Role      │
└─────────────────┘        ↓         │
                  ┌─────────────────┐
                  │ Trainer │ Client │
                  │    ↓    │   ↓    │
                  │Dashboard│Onboard │
                  └─────────────────┘
```

### 2. Client Onboarding Flow
```
New Client Registration
    ↓
Complete Authentication
    ↓
Check Onboarding Status
    ↓
┌─────────────────┬─────────────────┐
│ Not Completed   │ Completed       │
│        ↓        │        ↓        │
│ 6-Step Intake   │ Check Profile   │
│        ↓        │        ↓        │
│ Oxford Submit   │ Profile Setup   │
│        ↓        │        ↓        │
│ Mark Complete   │ Main App        │
└─────────────────┴─────────────────┘
```

### 3. OAuth Integration Flow
```
OAuth Provider Selection
    ↓
Provider Authentication
    ↓
Token Exchange
    ↓
User Data Extraction
    ↓
Local Profile Creation
    ↓
Secure Token Storage
    ↓
Onboarding Check
```

## Security Features

### 1. Token Security
- Secure storage using platform-specific secure storage
- Automatic token expiration handling
- Secure logout with complete cleanup
- Cross-platform encryption

### 2. Data Protection
- HIPAA-ready data handling
- Encrypted local storage
- Secure API communication
- Privacy-first design

### 3. Authentication Validation
- Input validation and sanitization
- Secure password requirements
- OAuth state verification
- CSRF protection

## Integration Points

### 1. Backend Integration
- tRPC API integration
- Real-time data synchronization
- Cloud storage integration
- Trainer-client data sharing

### 2. Health Data Integration
- Apple HealthKit integration
- Google Fit synchronization
- Fitbit OAuth support
- Smart scale Bluetooth LE

### 3. Calendar Integration
- Google Calendar sync
- Acuity Scheduling integration
- Session management
- Automated reminders

### 4. Payment Integration
- Squarespace Commerce integration
- Subscription management
- Package purchasing
- Automated billing

## Usage Examples

### Authentication Hook Usage
```typescript
const {
  isAuthenticated,
  user,
  hasCompletedOnboarding,
  hasCompletedProfileSetup,
  signInWithGoogle,
  signInWithApple,
  signInWithSquarespace,
  login,
  signup,
  logout
} = useAuth();
```

### Onboarding Integration
```typescript
// Complete onboarding
await completeOnboarding();

// Complete profile setup
await completeProfileSetup();

// Submit intake data
await submitIntake.mutateAsync({
  client_id: clientId,
  email: formData.email,
  // ... comprehensive intake data
});
```

### OAuth Implementation
```typescript
// Google Sign-In
const handleGoogleSignIn = async () => {
  try {
    await signInWithGoogle();
  } catch (error) {
    console.error('Google Sign-In failed:', error);
  }
};

// Apple Sign-In (iOS only)
const handleAppleSignIn = async () => {
  if (Platform.OS === 'ios' && isAppleSignInAvailable) {
    await signInWithApple();
  }
};
```

## Configuration

### Environment Variables
```env
EXPO_PUBLIC_GOOGLE_CLIENT_ID=your_google_client_id
EXPO_PUBLIC_SQUARESPACE_CLIENT_ID=your_squarespace_client_id
```

### OAuth Redirect URIs
- Google: Configured in Google Cloud Console
- Apple: Configured in Apple Developer Portal
- Squarespace: Configured in Squarespace Developer Portal

## Testing & Development

### Mock Authentication
- Development mode with mock users
- Simulated OAuth flows
- Test data generation
- Offline development support

### Error Handling
- Comprehensive error boundaries
- User-friendly error messages
- Automatic retry mechanisms
- Graceful degradation

This authentication system provides a robust, secure, and user-friendly experience for both clients and trainers, with comprehensive onboarding and health data integration capabilities.