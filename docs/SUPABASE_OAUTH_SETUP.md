# Supabase OAuth Configuration Guide

## Google OAuth Setup

### 1. Supabase Dashboard Configuration

1. Login to [Supabase Dashboard](https://supabase.com/dashboard)
2. Select your project
3. Navigate to **Authentication** → **Providers**
4. Find **Google** and click **Enable**

### 2. Redirect URLs Configuration

Add these URLs to the "Redirect URLs" field:

**Development:**

```
http://localhost:3000/auth/callback
http://localhost:3001/auth/callback
http://localhost:3002/auth/callback
```

**Production:**

```
https://yourdomain.com/auth/callback
https://www.yourdomain.com/auth/callback
```

### 3. Google Cloud Console Setup

1. Go to [Google Cloud Console](https://console.cloud.google.com/)
2. Create a new project or select existing
3. Enable Google+ API
4. Create OAuth 2.0 credentials
5. Add authorized redirect URIs:
   - `https://<your-supabase-project-ref>.supabase.co/auth/v1/callback`
6. Copy the Client ID and Client Secret

### 4. Add Google Credentials to Supabase

Back in Supabase Dashboard:

1. Paste your Google Client ID
2. Paste your Google Client Secret
3. Save the configuration

### 5. Test the Configuration

1. Run the development server: `npm run dev`
2. Navigate to `/test-oauth`
3. Click "Test Google Sign In"
4. You should be redirected to Google's login page
5. After login, you should be redirected back to `/auth/callback`

### Common Issues

1. **"Redirect URI mismatch"** - Ensure the redirect URLs in Supabase match exactly
2. **404 on callback** - Check that `/auth/callback/route.ts` exists
3. **"Invalid client"** - Verify Google credentials are correctly copied
4. **CORS errors** - Make sure your domain is in the allowed origins

### Current Application Configuration

The application is configured to use:

- Redirect URL: `${window.location.origin}/auth/callback`
- This dynamically adapts to your current domain
- OAuth handler: `/src/app/auth/callback/route.ts`
- Error page: `/auth/auth-code-error`
