# 🏗️ Mystic Arcana Technical Architecture

## Authentication & Database Layer

### Supabase Configuration

**Environment Variables Convention:**

```bash
# CLIENT-SIDE (Browser-accessible)
NEXT_PUBLIC_SUPABASE_URL=https://pqfsbxcbsxuyfgqrxdob.supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY=eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...

# SERVER-SIDE (API routes only - NEVER add NEXT_PUBLIC_ prefix!)
SUPABASE_SERVICE_ROLE_KEY=your-service-role-key-here
```

**Client Architecture:**

- **Client-side**: `src/lib/supabase.ts` - Uses anon key for user operations
- **Server-side**: `src/lib/supabase-server.ts` - Uses service role for admin operations
- **Auth Context**: `src/contexts/AuthContext.tsx` - Manages authentication state

### Database Schema

**Core Tables:**

- `auth.users` - Supabase managed user accounts
- `public.users` - Extended user profile data
- `public.user_profiles` - Birth data, preferences, chosen reader
- `public.tarot_readings` - Reading history with interpretations

**Security:**

- Row Level Security (RLS) enabled on all tables
- Users can only access their own data
- Service role bypasses RLS for admin operations

### Authentication Flows

**Email/Password:**

1. Client → `supabase.auth.signUp()` → User created
2. Email verification (optional)
3. Client → `supabase.auth.signInWithPassword()` → Session established

**Google OAuth:**

1. Client → `supabase.auth.signInWithOAuth(google)` → Google redirect
2. User consent → Google callback with code
3. `/auth/callback` → `exchangeCodeForSession()` → Session established
4. Redirect to application home page

**Session Management:**

- Sessions persist in localStorage
- Auto-refresh tokens before expiration
- `onAuthStateChange` listeners update application state

### Callback URL Configuration

**Development:**

- Supabase Dashboard → Authentication → Providers → Google
- Add redirect URL: `http://localhost:3000/auth/callback`

**Production:**

- Add: `https://yourdomain.com/auth/callback`
- Add: `https://pqfsbxcbsxuyfgqrxdob.supabase.co/auth/v1/callback`

## Frontend Architecture

### Component Structure

```
src/
├── components/
│   ├── auth/           # Authentication components
│   ├── tarot/          # Tarot-specific UI
│   ├── astronomical/   # Star field & cosmic UI
│   └── effects/        # Visual effects (galaxy background)
├── contexts/
│   └── AuthContext.tsx # Global auth state management
├── lib/
│   ├── supabase.ts     # Client-side Supabase
│   └── supabase-server.ts # Server-side Supabase
└── app/
    ├── auth/callback/  # OAuth callback handler
    └── api/            # Server-side API routes
```

### State Management

- **Authentication**: React Context (`AuthContext`)
- **UI State**: React useState/useReducer
- **Server State**: Supabase real-time subscriptions

### Performance Optimizations

- **Star Rendering**: WebGL2 for 100,000+ stars at 60 FPS
- **Code Splitting**: Next.js automatic route-based splitting
- **Image Optimization**: Next.js Image component
- **Caching**: Browser localStorage for session persistence

## Development Guidelines

### Environment Setup

1. Copy `.env.local.example` to `.env.local`
2. Add `SUPABASE_SERVICE_ROLE_KEY` from Supabase dashboard
3. Configure Google OAuth redirect URLs
4. Run `npm run dev` for development server

### Security Best Practices

- ✅ Never expose service role key to client-side
- ✅ Use anon key for all client-side operations
- ✅ Implement RLS policies for data protection
- ✅ Validate user permissions on server-side
- ✅ Sanitize all user inputs

### Testing Strategy

- **Unit Tests**: Component and utility function testing
- **Integration Tests**: Authentication flow testing
- **E2E Tests**: Complete user journey testing
- **Manual Testing**: Cross-browser and device testing

### Deployment Configuration

**Environment Variables per Environment:**

```bash
# Development
NEXT_PUBLIC_SUPABASE_URL=https://pqfsbxcbsxuyfgqrxdob.supabase.co
SUPABASE_SERVICE_ROLE_KEY=sb_dev_key

# Staging
NEXT_PUBLIC_SUPABASE_URL=https://staging-project.supabase.co
SUPABASE_SERVICE_ROLE_KEY=sb_staging_key

# Production
NEXT_PUBLIC_SUPABASE_URL=https://prod-project.supabase.co
SUPABASE_SERVICE_ROLE_KEY=sb_prod_key
```

**OAuth Callback URLs per Environment:**

- Development: `http://localhost:3000/auth/callback`
- Staging: `https://staging.mysticarcana.com/auth/callback`
- Production: `https://mysticarcana.com/auth/callback`
