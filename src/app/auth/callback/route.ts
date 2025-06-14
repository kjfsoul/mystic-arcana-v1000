import { createClient } from '@/lib/supabase/server';
import { NextRequest, NextResponse } from 'next/server';

/**
 * OAuth Callback Route
 * 
 * Handles the code exchange for all OAuth providers (Google, etc.)
 * and securely creates a user session with proper cookie management.
 * 
 * This route is called by Supabase after successful OAuth authentication.
 */

export async function GET(request: NextRequest) {
  const { searchParams, origin } = new URL(request.url);
  const code = searchParams.get('code');
  const next = searchParams.get('next') ?? '/';

  console.log('🔄 OAuth callback received:', { code: !!code, next });

  if (code) {
    try {
      const supabase = await createClient();
      
      // Exchange the code for a session
      console.log('🔄 Exchanging code for session...');
      const { data, error } = await supabase.auth.exchangeCodeForSession(code);

      if (error) {
        console.error('❌ OAuth code exchange error:', error);
        return NextResponse.redirect(`${origin}/auth/auth-code-error?error=${encodeURIComponent(error.message)}`);
      }

      if (data.session) {
        console.log('✅ OAuth session created successfully for user:', data.session.user.email);
        
        // The session is automatically handled by the createClient cookies configuration
        // Redirect to the intended destination
        return NextResponse.redirect(`${origin}${next}`);
      }
    } catch (error) {
      console.error('❌ Unexpected error in OAuth callback:', error);
      return NextResponse.redirect(`${origin}/auth/auth-code-error?error=unexpected_error`);
    }
  }

  // If no code is present, redirect to home with an error
  console.error('⚠️ OAuth callback missing code parameter');
  return NextResponse.redirect(`${origin}/auth/auth-code-error?error=missing_code`);
}