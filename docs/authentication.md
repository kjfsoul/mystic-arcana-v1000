# Authentication System Documentation

## Overview

The Mystic Arcana authentication system provides secure user authentication using Supabase Auth with support for email/password and Google OAuth providers. The system is built with Next.js 15, TypeScript, and follows modern security best practices.

## Architecture

### Core Components

1. **Supabase Clients** (`src/lib/supabase/`)
   - `client.ts` - Browser client for client-side operations
   - `server.ts` - Server client for SSR, API routes, and server actions

2. **Authentication Context** (`src/contexts/AuthContext.tsx`)
   - Global state management for authentication
   - Real-time session updates
   - User profile management

3. **UI Components** (`src/components/auth/`)
   - `AuthModal.tsx` - Unified login/signup modal
   - `AuthButton.tsx` - Smart authentication button
   - `UserMenu.tsx` - User dropdown menu

4. **Middleware** (`middleware.ts`)
   - Route protection
   - Session refresh
   - Automatic redirects

5. **OAuth Callback** (`src/app/auth/callback/route.ts`)
   - Handles OAuth code exchange
   - Secure session establishment

## Environment Variables

Create a `.env.local` file with the following variables:

```env
# Required - Get these from your Supabase project settings
NEXT_PUBLIC_SUPABASE_URL=your_supabase_project_url
NEXT_PUBLIC_SUPABASE_ANON_KEY=your_supabase_anon_key

# Optional - For server-side operations (if needed)
SUPABASE_SERVICE_ROLE_KEY=your_supabase_service_role_key
```

## Database Schema

The system expects the following Supabase database tables:

### Profiles Table

```sql
CREATE TABLE profiles (
  id UUID REFERENCES auth.users(id) PRIMARY KEY,
  email TEXT NOT NULL,
  full_name TEXT,
  avatar_url TEXT,
  birth_date DATE,
  birth_time TIME,
  birth_location TEXT,
  timezone TEXT,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Enable RLS
ALTER TABLE profiles ENABLE ROW LEVEL SECURITY;

-- Create policies
CREATE POLICY "Users can view own profile" ON profiles
  FOR SELECT USING (auth.uid() = id);

CREATE POLICY "Users can update own profile" ON profiles
  FOR UPDATE USING (auth.uid() = id);

CREATE POLICY "Users can insert own profile" ON profiles
  FOR INSERT WITH CHECK (auth.uid() = id);
```

### Readings Table

```sql
CREATE TABLE readings (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID REFERENCES profiles(id) ON DELETE CASCADE,
  type TEXT CHECK (type IN ('tarot', 'astrology', 'numerology')),
  title TEXT NOT NULL,
  content JSONB NOT NULL,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Enable RLS
ALTER TABLE readings ENABLE ROW LEVEL SECURITY;

-- Create policies
CREATE POLICY "Users can view own readings" ON readings
  FOR SELECT USING (auth.uid() = user_id);

CREATE POLICY "Users can create own readings" ON readings
  FOR INSERT WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update own readings" ON readings
  FOR UPDATE USING (auth.uid() = user_id);

CREATE POLICY "Users can delete own readings" ON readings
  FOR DELETE USING (auth.uid() = user_id);
```

## Supabase Configuration

### Auth Settings

1. **Email Templates**: Customize in Supabase Dashboard > Authentication > Email Templates
2. **URL Configuration**: Set Site URL and Redirect URLs in Auth settings
3. **OAuth Providers**: Configure Google OAuth in Auth > Providers

### Google OAuth Setup

1. Create a Google Cloud Project
2. Enable Google+ API
3. Create OAuth 2.0 credentials
4. Add authorized redirect URIs:
   - `https://your-project.supabase.co/auth/v1/callback`
5. Add credentials to Supabase Auth settings

## Usage Examples

### Basic Authentication

```tsx
import { useAuth } from '@/contexts/AuthContext'

function MyComponent() {
  const { user, signIn, signOut } = useAuth()

  if (user) {
    return (
      <div>
        <p>Welcome, {user.email}!</p>
        <button onClick={() => signOut()}>Sign Out</button>
      </div>
    )
  }

  return (
    <button onClick={() => signIn('user@example.com', 'password')}>
      Sign In
    </button>
  )
}
```

### Using the Auth Modal

```tsx
import { AuthModal } from '@/components/auth/AuthModal'

function App() {
  const [showAuth, setShowAuth] = useState(false)

  return (
    <>
      <button onClick={() => setShowAuth(true)}>Sign In</button>
      <AuthModal 
        open={showAuth} 
        onClose={() => setShowAuth(false)}
        defaultTab="signin"
      />
    </>
  )
}
```

### Server-Side Authentication

```tsx
import { createClient } from '@/lib/supabase/server'

export default async function ProtectedPage() {
  const supabase = createClient()
  const { data: { user } } = await supabase.auth.getUser()

  if (!user) {
    redirect('/auth/signin')
  }

  return <div>Protected content for {user.email}</div>
}
```

## Security Features

1. **Row Level Security (RLS)**: All database tables use RLS policies
2. **HTTPS Only**: All authentication flows require HTTPS in production
3. **Secure Cookies**: Session cookies are httpOnly and secure
4. **CSRF Protection**: Built-in CSRF protection via Supabase
5. **Rate Limiting**: Supabase provides built-in rate limiting

## Error Handling

The system includes comprehensive error handling:

- Network errors are caught and displayed to users
- Invalid credentials show appropriate messages
- OAuth errors redirect to error page
- Session expiry is handled automatically

## Testing

### Unit Tests

```bash
npm test
```

### Integration Tests

```bash
npm run test:e2e
```

## Deployment

### Environment Variables

Ensure all required environment variables are set in your deployment platform:

- Vercel: Add to Project Settings > Environment Variables
- Netlify: Add to Site Settings > Environment Variables
- Railway: Add to Project > Variables

### Redirect URLs

Update Supabase Auth settings with your production URLs:

- Site URL: `https://yourdomain.com`
- Redirect URLs: `https://yourdomain.com/auth/callback`

## Troubleshooting

### Common Issues

1. **"Invalid API key"**: Check environment variables
2. **OAuth redirect errors**: Verify redirect URLs in Supabase
3. **Session not persisting**: Check cookie settings and HTTPS
4. **RLS errors**: Verify database policies are correctly set

### Debug Mode

Enable debug logging by setting:

```env
NEXT_PUBLIC_SUPABASE_DEBUG=true
```

## Migration Guide

If migrating from an existing auth system:

1. Export user data from old system
2. Create Supabase users via Admin API
3. Migrate user profiles to new schema
4. Update frontend to use new auth components
5. Test thoroughly before switching over

## Support

For issues and questions:

1. Check this documentation
2. Review Supabase Auth documentation
3. Check GitHub issues
4. Contact development team
