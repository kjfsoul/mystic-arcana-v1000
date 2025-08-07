import { createClient as _createClient } from "@/lib/supabase/server";
import { NextRequest, NextResponse } from "next/server";
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
  const code = searchParams.get("code");
  const next = searchParams.get("next") ?? "/";
  console.log("🔄 OAuth callback received:", { code: !!code, next });
  if (code) {
    try {
      const supabase = await _createClient();

      // Exchange the code for a session
      console.log("🔄 Exchanging code for session...");
      const { data, error } = await supabase.auth.exchangeCodeForSession(code);
      if (error) {
        console.error("❌ OAuth code exchange error:", error);

        // Provide user-friendly error messages
        let userMessage = error.message;
        if (error.message.includes("invalid request")) {
          userMessage =
            "Invalid authentication code. Please try signing in again.";
        } else if (error.message.includes("expired")) {
          userMessage =
            "Authentication code expired. Please try signing in again.";
        } else if (error.message.includes("already used")) {
          userMessage =
            "This authentication code has already been used. Please try signing in again.";
        }

        return NextResponse.redirect(
          `${origin}/auth/auth-code-error?error=${encodeURIComponent(userMessage)}`,
        );
      }
      if (data.session) {
        console.log(
          "✅ OAuth session created successfully for user:",
          data.session.user.email,
        );

        // The session is automatically handled by the createClient cookies configuration
        // Redirect to the intended destination
        return NextResponse.redirect(`${origin}${next}`);
      }
    } catch (error) {
      console.error("❌ Unexpected error in OAuth callback:", error);

      // Log detailed error for debugging
      if (error instanceof Error) {
        console.error("Error details:", {
          name: error.name,
          message: error.message,
          stack: error.stack,
        });
      }

      return NextResponse.redirect(
        `${origin}/auth/auth-code-error?error=${encodeURIComponent("An unexpected error occurred. Please try again or contact support if the issue persists.")}`,
      );
    }
  }
  // If no code is present, redirect to home with an error
  console.error("⚠️ OAuth callback missing code parameter");
  return NextResponse.redirect(
    `${origin}/auth/auth-code-error?error=missing_code`,
  );
}
