# Backend Infrastructure & Database Schema

## Overview
This document outlines the complete backend infrastructure needed for the Oxford Fitness App, including database schema, API endpoints, integrations, and deployment requirements.

## Database Schema

### Core Tables

#### Users
```sql
CREATE TABLE users (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  email VARCHAR(255) UNIQUE NOT NULL,
  password_hash VARCHAR(255),
  role ENUM('client', 'trainer', 'admin') NOT NULL,
  first_name VARCHAR(100) NOT NULL,
  last_name VARCHAR(100) NOT NULL,
  phone VARCHAR(20),
  avatar_url TEXT,
  is_active BOOLEAN DEFAULT true,
  created_at TIMESTAMP DEFAULT NOW(),
  updated_at TIMESTAMP DEFAULT NOW()
);
```

#### Profiles
```sql
CREATE TABLE profiles (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID REFERENCES users(id) ON DELETE CASCADE,
  date_of_birth DATE,
  gender ENUM('male', 'female', 'other'),
  height_cm INTEGER,
  activity_level ENUM('sedentary', 'lightly_active', 'moderately_active', 'very_active', 'extremely_active'),
  goals TEXT[],
  medical_conditions TEXT[],
  allergies TEXT[],
  preferences JSONB,
  emergency_contact JSONB,
  created_at TIMESTAMP DEFAULT NOW(),
  updated_at TIMESTAMP DEFAULT NOW()
);
```

#### Trainer_Client_Relationships
```sql
CREATE TABLE trainer_client_relationships (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  trainer_id UUID REFERENCES users(id) ON DELETE CASCADE,
  client_id UUID REFERENCES users(id) ON DELETE CASCADE,
  status ENUM('active', 'inactive', 'pending') DEFAULT 'pending',
  start_date DATE,
  end_date DATE,
  notes TEXT,
  created_at TIMESTAMP DEFAULT NOW(),
  UNIQUE(trainer_id, client_id)
);
```

### Health Data Tables

#### Health_Metrics
```sql
CREATE TABLE health_metrics (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID REFERENCES users(id) ON DELETE CASCADE,
  metric_type ENUM('weight', 'body_fat', 'muscle_mass', 'water_percentage', 'bone_density', 'bmr', 'visceral_fat') NOT NULL,
  value DECIMAL(10,2) NOT NULL,
  unit VARCHAR(10) NOT NULL,
  recorded_at TIMESTAMP NOT NULL,
  source ENUM('manual', 'healthkit', 'google_fit', 'device') DEFAULT 'manual',
  device_info JSONB,
  created_at TIMESTAMP DEFAULT NOW()
);
```

#### Sleep_Data
```sql
CREATE TABLE sleep_data (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID REFERENCES users(id) ON DELETE CASCADE,
  sleep_date DATE NOT NULL,
  bedtime TIMESTAMP,
  wake_time TIMESTAMP,
  total_sleep_minutes INTEGER,
  deep_sleep_minutes INTEGER,
  rem_sleep_minutes INTEGER,
  light_sleep_minutes INTEGER,
  sleep_quality_score INTEGER CHECK (sleep_quality_score >= 1 AND sleep_quality_score <= 10),
  source ENUM('manual', 'healthkit', 'google_fit', 'device') DEFAULT 'manual',
  raw_data JSONB,
  created_at TIMESTAMP DEFAULT NOW(),
  UNIQUE(user_id, sleep_date)
);
```

#### Nutrition_Logs
```sql
CREATE TABLE nutrition_logs (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID REFERENCES users(id) ON DELETE CASCADE,
  log_date DATE NOT NULL,
  meal_type ENUM('breakfast', 'lunch', 'dinner', 'snack') NOT NULL,
  food_items JSONB NOT NULL,
  total_calories INTEGER,
  total_protein DECIMAL(8,2),
  total_carbs DECIMAL(8,2),
  total_fat DECIMAL(8,2),
  total_fiber DECIMAL(8,2),
  total_sugar DECIMAL(8,2),
  total_sodium DECIMAL(8,2),
  photo_urls TEXT[],
  notes TEXT,
  ai_analysis JSONB,
  compliance_score INTEGER CHECK (compliance_score >= 1 AND compliance_score <= 100),
  created_at TIMESTAMP DEFAULT NOW()
);
```

#### Water_Intake
```sql
CREATE TABLE water_intake (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID REFERENCES users(id) ON DELETE CASCADE,
  intake_date DATE NOT NULL,
  amount_ml INTEGER NOT NULL,
  recorded_at TIMESTAMP DEFAULT NOW(),
  source ENUM('manual', 'healthkit', 'google_fit') DEFAULT 'manual',
  UNIQUE(user_id, intake_date)
);
```

### Training & Sessions

#### Training_Sessions
```sql
CREATE TABLE training_sessions (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  trainer_id UUID REFERENCES users(id),
  client_id UUID REFERENCES users(id),
  session_type ENUM('personal_training', 'consultation', 'check_in', 'group_session') NOT NULL,
  scheduled_at TIMESTAMP NOT NULL,
  duration_minutes INTEGER DEFAULT 60,
  status ENUM('scheduled', 'completed', 'cancelled', 'no_show') DEFAULT 'scheduled',
  location TEXT,
  notes TEXT,
  session_data JSONB,
  created_at TIMESTAMP DEFAULT NOW(),
  updated_at TIMESTAMP DEFAULT NOW()
);
```

#### Workout_Plans
```sql
CREATE TABLE workout_plans (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  trainer_id UUID REFERENCES users(id),
  client_id UUID REFERENCES users(id),
  name VARCHAR(255) NOT NULL,
  description TEXT,
  plan_data JSONB NOT NULL,
  is_active BOOLEAN DEFAULT true,
  start_date DATE,
  end_date DATE,
  created_at TIMESTAMP DEFAULT NOW(),
  updated_at TIMESTAMP DEFAULT NOW()
);
```

#### Exercise_Logs
```sql
CREATE TABLE exercise_logs (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID REFERENCES users(id) ON DELETE CASCADE,
  workout_plan_id UUID REFERENCES workout_plans(id),
  exercise_date DATE NOT NULL,
  exercise_name VARCHAR(255) NOT NULL,
  sets_data JSONB NOT NULL,
  duration_minutes INTEGER,
  calories_burned INTEGER,
  notes TEXT,
  created_at TIMESTAMP DEFAULT NOW()
);
```

### Business & Payments

#### Business_Info
```sql
CREATE TABLE business_info (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  trainer_id UUID REFERENCES users(id) ON DELETE CASCADE,
  business_name VARCHAR(255) NOT NULL,
  description TEXT,
  address JSONB,
  phone VARCHAR(20),
  email VARCHAR(255),
  website_url TEXT,
  social_media JSONB,
  services JSONB,
  pricing JSONB,
  squarespace_site_id VARCHAR(255),
  squarespace_sync_enabled BOOLEAN DEFAULT false,
  created_at TIMESTAMP DEFAULT NOW(),
  updated_at TIMESTAMP DEFAULT NOW()
);
```

#### Subscriptions
```sql
CREATE TABLE subscriptions (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID REFERENCES users(id) ON DELETE CASCADE,
  plan_id VARCHAR(100) NOT NULL,
  status ENUM('active', 'cancelled', 'expired', 'pending') NOT NULL,
  current_period_start DATE NOT NULL,
  current_period_end DATE NOT NULL,
  amount_cents INTEGER NOT NULL,
  currency VARCHAR(3) DEFAULT 'USD',
  payment_provider ENUM('squarespace', 'stripe', 'paypal') NOT NULL,
  external_subscription_id VARCHAR(255),
  metadata JSONB,
  created_at TIMESTAMP DEFAULT NOW(),
  updated_at TIMESTAMP DEFAULT NOW()
);
```

#### Orders
```sql
CREATE TABLE orders (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID REFERENCES users(id),
  order_number VARCHAR(100) UNIQUE NOT NULL,
  status ENUM('pending', 'completed', 'cancelled', 'refunded') NOT NULL,
  total_amount_cents INTEGER NOT NULL,
  currency VARCHAR(3) DEFAULT 'USD',
  payment_provider ENUM('squarespace', 'stripe', 'paypal') NOT NULL,
  external_order_id VARCHAR(255),
  items JSONB NOT NULL,
  billing_address JSONB,
  shipping_address JSONB,
  metadata JSONB,
  created_at TIMESTAMP DEFAULT NOW(),
  updated_at TIMESTAMP DEFAULT NOW()
);
```

### Integrations & Sync

#### Health_Sync_Tokens
```sql
CREATE TABLE health_sync_tokens (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID REFERENCES users(id) ON DELETE CASCADE,
  provider ENUM('healthkit', 'google_fit', 'fitbit', 'garmin') NOT NULL,
  access_token TEXT,
  refresh_token TEXT,
  token_expires_at TIMESTAMP,
  sync_enabled BOOLEAN DEFAULT true,
  last_sync_at TIMESTAMP,
  sync_status ENUM('active', 'error', 'disabled') DEFAULT 'active',
  error_message TEXT,
  created_at TIMESTAMP DEFAULT NOW(),
  updated_at TIMESTAMP DEFAULT NOW(),
  UNIQUE(user_id, provider)
);
```

#### Calendar_Integrations
```sql
CREATE TABLE calendar_integrations (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID REFERENCES users(id) ON DELETE CASCADE,
  provider ENUM('google', 'outlook', 'apple', 'acuity') NOT NULL,
  access_token TEXT,
  refresh_token TEXT,
  token_expires_at TIMESTAMP,
  calendar_id VARCHAR(255),
  sync_enabled BOOLEAN DEFAULT true,
  last_sync_at TIMESTAMP,
  sync_settings JSONB,
  created_at TIMESTAMP DEFAULT NOW(),
  updated_at TIMESTAMP DEFAULT NOW(),
  UNIQUE(user_id, provider)
);
```

#### Community_Posts
```sql
CREATE TABLE community_posts (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID REFERENCES users(id),
  content TEXT NOT NULL,
  media_urls TEXT[],
  post_type ENUM('text', 'photo', 'video', 'achievement', 'check_in') DEFAULT 'text',
  visibility ENUM('public', 'trainer_only', 'private') DEFAULT 'public',
  likes_count INTEGER DEFAULT 0,
  comments_count INTEGER DEFAULT 0,
  metadata JSONB,
  created_at TIMESTAMP DEFAULT NOW(),
  updated_at TIMESTAMP DEFAULT NOW()
);
```

#### Community_Comments
```sql
CREATE TABLE community_comments (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  post_id UUID REFERENCES community_posts(id) ON DELETE CASCADE,
  user_id UUID REFERENCES users(id),
  content TEXT NOT NULL,
  parent_comment_id UUID REFERENCES community_comments(id),
  created_at TIMESTAMP DEFAULT NOW()
);
```

#### Community_Likes
```sql
CREATE TABLE community_likes (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  post_id UUID REFERENCES community_posts(id) ON DELETE CASCADE,
  user_id UUID REFERENCES users(id) ON DELETE CASCADE,
  created_at TIMESTAMP DEFAULT NOW(),
  UNIQUE(post_id, user_id)
);
```

## API Endpoints

### Authentication
- `POST /api/auth/register` - User registration
- `POST /api/auth/login` - User login
- `POST /api/auth/logout` - User logout
- `POST /api/auth/refresh` - Refresh access token
- `POST /api/auth/forgot-password` - Password reset request
- `POST /api/auth/reset-password` - Password reset confirmation

### Profile Management
- `GET /api/profiles/me` - Get current user profile
- `PUT /api/profiles/me` - Update current user profile
- `POST /api/profiles/setup` - Initial profile setup
- `POST /api/profiles/upload-avatar` - Upload profile picture

### Health Data Sync
- `POST /api/health/sync` - Sync health data from device
- `GET /api/health/metrics` - Get health metrics
- `POST /api/health/metrics` - Log health metric
- `GET /api/health/sleep` - Get sleep data
- `POST /api/health/sleep` - Log sleep data
- `GET /api/health/nutrition` - Get nutrition logs
- `POST /api/health/nutrition` - Log nutrition data
- `GET /api/health/water` - Get water intake
- `POST /api/health/water` - Log water intake

### Trainer-Client Management
- `GET /api/clients` - Get trainer's clients
- `POST /api/clients` - Add new client
- `DELETE /api/clients/:id` - Remove client
- `GET /api/clients/:id/health` - Get client health data
- `GET /api/clients/:id/progress` - Get client progress
- `POST /api/clients/import-contacts` - Import contacts

### Training Sessions
- `GET /api/sessions` - Get training sessions
- `POST /api/sessions` - Create training session
- `PUT /api/sessions/:id` - Update training session
- `DELETE /api/sessions/:id` - Cancel training session
- `GET /api/sessions/:id/details` - Get session details

### Workout Plans
- `GET /api/workout-plans` - Get workout plans
- `POST /api/workout-plans` - Create workout plan
- `PUT /api/workout-plans/:id` - Update workout plan
- `DELETE /api/workout-plans/:id` - Delete workout plan

### Business Management
- `GET /api/business/info` - Get business information
- `PUT /api/business/info` - Update business information
- `POST /api/business/sync-squarespace` - Sync with Squarespace

### Payments & Subscriptions
- `POST /api/payments/create-checkout` - Create payment checkout
- `GET /api/subscriptions/current` - Get current subscription
- `POST /api/subscriptions/cancel` - Cancel subscription
- `GET /api/orders` - Get order history

### Calendar Integration
- `GET /api/calendar/auth-url` - Get calendar auth URL
- `POST /api/calendar/connect` - Connect calendar
- `GET /api/calendar/events` - Get calendar events
- `POST /api/calendar/sync` - Sync calendar events

### Community
- `GET /api/community/feed` - Get community feed
- `POST /api/community/posts` - Create community post
- `POST /api/community/posts/:id/like` - Like post
- `POST /api/community/posts/:id/comments` - Add comment

### Oxford Integration Endpoints
- `POST /oxford/intake/submit` - Submit client intake
- `GET /oxford/calendar/google/authurl` - Get Google Calendar auth URL
- `GET /oxford/calendar/google/events` - Get Google Calendar events
- `POST /oxford/community/post` - Post to community
- `GET /oxford/community/latest` - Get latest community posts
- `POST /oxford/meals/log` - Log meal with AI analysis
- `GET /oxford/meals/daily` - Get daily meals
- `GET /oxford/meals/history` - Get meal history
- `POST /oxford/commerce/squarespace/create-checkout` - Create Squarespace checkout
- `GET /oxford/commerce/subscription` - Get subscription status

### Webhooks
- `POST /oxford/webhooks/acuity` - Acuity scheduling webhook
- `POST /oxford/webhooks/squarespace` - Squarespace order webhook
- `POST /api/webhooks/healthkit` - HealthKit data webhook
- `POST /api/webhooks/google-fit` - Google Fit data webhook

## Required Integrations

### Health Data
- **Apple HealthKit** - iOS health data sync
- **Google Fit** - Android health data sync
- **Fitbit API** - Fitbit device data
- **Garmin Connect** - Garmin device data

### Calendar Services
- **Google Calendar API** - Calendar integration
- **Microsoft Graph API** - Outlook calendar
- **Acuity Scheduling** - Appointment booking

### Payment Processing
- **Squarespace Commerce** - E-commerce integration
- **Stripe** - Payment processing
- **PayPal** - Alternative payment method

### Communication
- **GroupMe API** - Community chat
- **Twilio** - SMS notifications
- **SendGrid** - Email notifications

### AI & Analysis
- **OpenAI GPT-4** - Meal analysis and coaching
- **Google Vision API** - Food image recognition
- **Nutritionix API** - Food database

## Environment Variables

```env
# Database
DATABASE_URL=postgresql://user:password@localhost:5432/oxford_fitness
REDIS_URL=redis://localhost:6379

# Authentication
JWT_SECRET=your-jwt-secret
JWT_EXPIRES_IN=7d
REFRESH_TOKEN_SECRET=your-refresh-secret

# Health Integrations
HEALTHKIT_TEAM_ID=your-team-id
GOOGLE_FIT_CLIENT_ID=your-client-id
GOOGLE_FIT_CLIENT_SECRET=your-client-secret

# Calendar Integrations
GOOGLE_CLIENT_ID=your-google-client-id
GOOGLE_CLIENT_SECRET=your-google-client-secret
GOOGLE_REDIRECT_URI=https://your-domain.com/oauth/google/callback

# Acuity Scheduling
ACUITY_USER_ID=your-acuity-user-id
ACUITY_API_KEY=your-acuity-api-key
ACUITY_WEBHOOK_SECRET=your-webhook-secret

# Squarespace
SQUARESPACE_API_KEY=your-squarespace-api-key
SQUARESPACE_SITE_ID=your-site-id
SQUARESPACE_WEBHOOK_SECRET=your-webhook-secret

# Payment Processing
STRIPE_SECRET_KEY=sk_test_...
STRIPE_WEBHOOK_SECRET=whsec_...

# Communication
GROUPME_BOT_ID=your-bot-id
GROUPME_GROUP_ID=your-group-id
GROUPME_TOKEN=your-token
TWILIO_ACCOUNT_SID=your-account-sid
TWILIO_AUTH_TOKEN=your-auth-token
SENDGRID_API_KEY=your-sendgrid-key

# AI Services
OPENAI_API_KEY=your-openai-key
GOOGLE_VISION_API_KEY=your-vision-key
NUTRITIONIX_APP_ID=your-nutritionix-id
NUTRITIONIX_API_KEY=your-nutritionix-key

# File Storage
AWS_ACCESS_KEY_ID=your-access-key
AWS_SECRET_ACCESS_KEY=your-secret-key
AWS_S3_BUCKET=your-bucket-name
AWS_REGION=us-east-1

# App Configuration
APP_URL=https://your-domain.com
API_URL=https://your-domain.com/api
OXFORD_SERVICE_URL=https://your-domain.com/oxford
```

## Deployment Requirements

### Infrastructure
- **Database**: PostgreSQL 14+ with UUID extension
- **Cache**: Redis 6+ for session management and caching
- **File Storage**: AWS S3 or compatible object storage
- **Queue**: Redis-based job queue for background tasks

### Services
- **Main API**: Node.js/Hono backend with tRPC
- **Oxford Integrations**: Separate Node.js service for external integrations
- **WebSocket Server**: Real-time updates for live data sync
- **Cron Jobs**: Scheduled tasks for data sync and reporting

### Security
- JWT-based authentication with refresh tokens
- HTTPS/TLS encryption for all endpoints
- API rate limiting and request validation
- CORS configuration for mobile app domains
- Webhook signature verification

### Monitoring
- Health check endpoints for all services
- Error tracking and logging
- Performance monitoring
- Database query optimization
- API response time tracking

## Data Sync Strategy

### Real-time Updates
- WebSocket connections for live data updates
- Push notifications for important events
- Optimistic UI updates with conflict resolution

### Background Sync
- Periodic health data sync from connected devices
- Calendar event synchronization
- Community feed updates
- Subscription status checks

### Offline Support
- Local data caching with sync on reconnection
- Conflict resolution for offline changes
- Progressive data loading

## Backup & Recovery
- Daily automated database backups
- Point-in-time recovery capability
- File storage backup and versioning
- Disaster recovery procedures

This infrastructure provides a complete foundation for the Oxford Fitness App with scalable architecture, comprehensive health data integration, and robust business management features.