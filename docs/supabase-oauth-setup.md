# 🔐 Supabase Google OAuth Configuration Guide

## Critical Setup Steps for Google Authentication

### 1. Supabase Dashboard Configuration

**Navigate to Supabase Dashboard:**
1. Go to [https://supabase.com/dashboard](https://supabase.com/dashboard)
2. Select your project: `pqfsbxcbsxuyfgqrxdob`
3. Go to **Authentication** → **Providers**
4. Click on **Google**

**Configure Google Provider:**
1. **Enable** the Google provider
2. **Add Redirect URL**: `http://localhost:3000/auth/callback`
3. **Add these additional redirect URLs for production:**
   - `https://yourdomain.com/auth/callback`
   - `https://www.yourdomain.com/auth/callback`

### 2. Google Cloud Console Setup

**Create Google OAuth Credentials:**
1. Go to [Google Cloud Console](https://console.cloud.google.com/)
2. Navigate to **APIs & Services** → **Credentials**
3. Click **+ CREATE CREDENTIALS** → **OAuth 2.0 Client IDs**
4. Choose **Web application**
5. Add **Authorized redirect URIs**:
   ```
   http://localhost:3000/auth/callback
   https://pqfsbxcbsxuyfgqrxdob.supabase.co/auth/v1/callback
   ```

**Copy Credentials to Supabase:**
1. Copy the **Client ID** and **Client Secret** from Google Console
2. Paste them into the Supabase Google provider configuration
3. **Save** the configuration

### 3. Environment Variables Required

**Add to `.env.local`:**
```bash
# Supabase Service Role Key (CRITICAL - GET FROM DASHBOARD)
SUPABASE_SERVICE_ROLE_KEY=your-service-role-key-from-supabase-dashboard

# The existing public keys should remain:
NEXT_PUBLIC_SUPABASE_URL=https://pqfsbxcbsxuyfgqrxdob.supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY=eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...
```

**🚨 CRITICAL: How to Get Service Role Key:**
1. Supabase Dashboard → **Settings** → **API**
2. Copy the **service_role** key (NOT the anon key)
3. This key should **NEVER** have `NEXT_PUBLIC_` prefix!

### 4. Callback URL Patterns

**For Development:**
- `http://localhost:3000/auth/callback`

**For Production:**
- `https://yourdomain.com/auth/callback`
- `https://pqfsbxcbsxuyfgqrxdob.supabase.co/auth/v1/callback`

### 5. Common Issues & Solutions

**"Invalid API Key" Error:**
- ✅ **Fixed**: Added `SUPABASE_SERVICE_ROLE_KEY` to environment variables
- ✅ **Fixed**: Created separate server-side Supabase client

**"404 Not Found" on Google Callback:**
- ✅ **Fixed**: Updated auth callback route for better error handling
- 🔧 **Action Required**: Add redirect URL to Supabase dashboard (see step 1)

**Authentication Flows Not Working:**
- ✅ **Fixed**: Proper client/server Supabase client separation
- ✅ **Fixed**: Improved error handling in auth callback route

### 6. Testing Checklist

**Email/Password Signup:**
- [ ] Sign up with new email
- [ ] Check for successful user creation
- [ ] Verify session persistence

**Google OAuth:**
- [ ] Click "Sign in with Google"
- [ ] Complete Google OAuth flow
- [ ] Verify successful redirect to home page
- [ ] Check session persistence after page reload

**Session Management:**
- [ ] Sign out and verify session cleared
- [ ] Refresh page and verify session persistence
- [ ] Test with different browsers/incognito mode