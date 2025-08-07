# Mystic Arcana Setup Guide

## Prerequisites

1. **Node.js** (v18 or higher)
2. **Supabase Account** (free tier is sufficient)

## Quick Setup

### 1. Install Dependencies

```bash
npm install
```

### 2. Supabase Setup

1. Create a new project at [supabase.com](https://supabase.com)
2. Go to Settings → API in your Supabase dashboard
3. Copy your `URL` and `anon` key

### 3. Environment Configuration

1. Copy the environment template:

   ```bash
   cp .env.local.example .env.local
   ```

2. Update `.env.local` with your Supabase credentials:
   ```
   NEXT_PUBLIC_SUPABASE_URL=your_supabase_url
   NEXT_PUBLIC_SUPABASE_ANON_KEY=your_supabase_anon_key
   ```

### 4. Database Setup

1. In your Supabase dashboard, go to the SQL Editor
2. Run the migration file: `supabase/migrations/001_initial_schema.sql`

### 5. Authentication Configuration (Optional)

To enable Google OAuth:

1. Go to Authentication → Providers in Supabase
2. Enable Google provider
3. Configure your OAuth app in Google Cloud Console
4. Add your Google client ID and secret to Supabase

### 6. Run the Application

```bash
npm run dev
```

Visit [http://localhost:3000](http://localhost:3000) to see your application.

## Features Implemented

### ✅ Authentication System

- Email/password signup and login
- Google OAuth integration
- Guest user support
- Secure session management

### ✅ Tarot Reading Engine

- Three spread types: Daily Card, Past/Present/Future, Celtic Cross
- 3D card flip animations
- Mock tarot deck with beautiful SVG cards
- Cosmic influence integration

### ✅ User Experience

- **Guest Flow**: Free Daily Card reading with signup prompt
- **Registered Flow**: Full access to all spreads with saved readings
- Responsive design with mobile support
- Accessibility features (WCAG 2.2+ compliant)

### ✅ Database Integration

- Automatic reading saving for registered users
- User profiles and preferences
- Reading history and statistics

## What Works Right Now

1. **Homepage**: Beautiful galaxy background with interactive panels
2. **Guest Experience**:
   - Click "Tarot Reading Room" → Enter Tarot Realm
   - Select "Daily Card" → Draw Cards → Experience card flip
   - After reading completion, signup prompt appears
3. **Authentication**:
   - Signup/login modal with email or Google
   - Session persistence across browser sessions
4. **Registered Experience**:
   - Access to all spread types
   - Automatic reading saving
   - No signup prompts

## Next Steps for Production

1. **Replace Mock Data**:
   - Integrate real tarot deck (78 cards)
   - Add actual card artwork or use Rider-Waite deck
   - Enhance interpretation algorithms

2. **Enhanced Features**:
   - Reading history dashboard
   - Virtual reader personalities
   - Advanced cosmic weather integration

3. **Deployment**:
   - Deploy to Vercel/Netlify
   - Configure production Supabase
   - Set up custom domain

## Troubleshooting

### "Supabase client not configured"

- Ensure `.env.local` has correct Supabase credentials
- Restart development server after adding environment variables

### Authentication not working

- Check Supabase dashboard for user creation
- Verify RLS policies are properly configured
- Check browser console for authentication errors

### Cards not flipping

- Ensure images are loading properly
- Check browser console for JavaScript errors
- Verify Framer Motion is installed

## Architecture

- **Frontend**: Next.js 15 with React 19
- **Styling**: CSS Modules with responsive design
- **Animations**: Framer Motion for smooth transitions
- **Authentication**: Supabase Auth with RLS
- **Database**: PostgreSQL via Supabase
- **State Management**: React Context for auth
