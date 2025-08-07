# 🧪 Authentication System Testing Guide

## Prerequisites

1. ✅ Add `SUPABASE_SERVICE_ROLE_KEY` to `.env.local`
2. ✅ Configure Google OAuth redirect URL in Supabase dashboard: `http://localhost:3000/auth/callback`
3. ✅ Restart development server: `npm run dev`

## Test Plan: Email/Password Authentication

### Test 1: New User Signup

```bash
# Expected Flow:
1. Navigate to auth modal/page
2. Enter: email="test@example.com", password="TestPass123!"
3. Click "Sign Up"

# Expected Results:
✅ No "Invalid API Key" error
✅ User account created in Supabase dashboard (Authentication > Users)
✅ Automatic sign-in after signup
✅ Redirect to home page with authenticated state
✅ User info displayed in UI (if implemented)

# Debug Commands:
console.log(supabase.auth.getUser())  // Should show user object
console.log(localStorage.getItem('supabase.auth.token'))  // Should show token
```

### Test 2: Existing User Sign In

```bash
# Expected Flow:
1. Use same credentials from Test 1
2. Click "Sign In"

# Expected Results:
✅ Successful authentication
✅ Session established
✅ Redirect to authenticated area
```

### Test 3: Session Persistence

```bash
# Expected Flow:
1. Sign in successfully
2. Refresh page (F5)
3. Open new tab to same localhost URL

# Expected Results:
✅ User remains signed in after refresh
✅ Authentication state persists across tabs
✅ No re-authentication required
```

## Test Plan: Google OAuth Authentication

### Test 4: Google OAuth Flow

```bash
# Expected Flow:
1. Click "Sign in with Google" button
2. Redirected to Google OAuth consent screen
3. Accept permissions
4. Redirected back to app

# Expected Results:
✅ No "404 Not Found" error on callback
✅ Successful redirect to http://localhost:3000/auth/callback
✅ Automatic redirect to home page (/)
✅ User authenticated and session established
✅ Google user info populated

# Debug URLs:
- Start: http://localhost:3000
- Google OAuth: https://accounts.google.com/oauth/authorize/...
- Callback: http://localhost:3000/auth/callback?code=...
- Final: http://localhost:3000/
```

### Test 5: Google Account Linking

```bash
# Test with existing email:
1. Create account with email/password first
2. Sign out
3. Try Google OAuth with same email

# Expected Results:
✅ Account linking OR clear error message
✅ No duplicate accounts created
```

## Test Plan: Error Handling

### Test 6: Invalid Credentials

```bash
# Test wrong password:
1. Enter correct email, wrong password
2. Click "Sign In"

# Expected Results:
✅ Clear error message displayed
✅ No application crash
✅ User can retry with correct credentials
```

### Test 7: Network Issues

```bash
# Simulate offline:
1. Disconnect internet
2. Attempt authentication

# Expected Results:
✅ Appropriate error message
✅ Graceful degradation
✅ Retry mechanism available
```

## Test Plan: Session Management

### Test 8: Sign Out

```bash
# Expected Flow:
1. Sign in successfully
2. Click "Sign Out" button

# Expected Results:
✅ Session cleared from browser
✅ Redirect to public page
✅ Authentication state reset
✅ Local storage cleaned up
```

### Test 9: Concurrent Sessions

```bash
# Expected Flow:
1. Sign in on Browser A
2. Sign in on Browser B (same account)
3. Sign out on Browser A

# Expected Results:
✅ Browser B session remains active OR
✅ Consistent session management across browsers
```

## Debugging Commands

### Browser Console Testing

```javascript
// Check current auth state
await supabase.auth.getUser();

// Check session
await supabase.auth.getSession();

// Test sign out
await supabase.auth.signOut();

// Check local storage
localStorage.getItem("supabase.auth.token");

// Listen to auth changes
supabase.auth.onAuthStateChange((event, session) => {
  console.log("Auth event:", event);
  console.log("Session:", session);
});
```

### Server Logs to Monitor

```bash
# Development console should show:
✅ No "Invalid API Key" errors
✅ Successful auth callbacks: "GET /auth/callback 200"
✅ No 500 server errors
✅ Proper redirects: "GET /auth/callback 302"
```

## Success Criteria

**All tests pass when:**

1. ✅ Email/password signup works without "Invalid API Key" error
2. ✅ Google OAuth completes without "404 Not Found" error
3. ✅ Sessions persist across page reloads
4. ✅ Sign out properly clears authentication state
5. ✅ Error messages are clear and actionable
6. ✅ No console errors during normal auth flows

## Common Issues & Quick Fixes

**"Invalid API Key" → Check `SUPABASE_SERVICE_ROLE_KEY` in `.env.local`**
**"404 Not Found" → Add `http://localhost:3000/auth/callback` to Supabase dashboard**
**Session not persisting → Check localStorage and browser settings**
**Google OAuth fails → Verify Google Cloud Console redirect URIs**
