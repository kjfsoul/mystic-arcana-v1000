import { supabase } from "@/lib/supabase/client";
/**
 * Enhanced authentication helper for API calls
 */
export class APIAuthHelper {
  private static sessionCache: { token: string; expiresAt: number } | null =
    null;
  private static readonly REFRESH_BUFFER_SECONDS = 300; // Refresh 5 minutes before expiry
  /**
   * Get a valid access token, refreshing if necessary
   */
  static async getValidAccessToken(): Promise<string | null> {
    try {
      // Check cache first
      if (
        this.sessionCache &&
        Date.now() <
          this.sessionCache.expiresAt - this.REFRESH_BUFFER_SECONDS * 1000
      ) {
        return this.sessionCache.token;
      }
      // Get fresh session
      const {
        data: { session },
        error,
      } = await supabase.auth.getSession();

      if (error) {
        console.error("Auth error getting session:", error);
        this.sessionCache = null;
        return null;
      }
      if (!session?.access_token) {
        console.warn("No access token in session");
        this.sessionCache = null;
        return null;
      }
      // Update cache
      this.sessionCache = {
        token: session.access_token,
        expiresAt: session.expires_at
          ? session.expires_at * 1000
          : Date.now() + 60 * 60 * 1000, // Default 1 hour
      };
      return session.access_token;
    } catch (error) {
      console.error("Unexpected error getting access token:", error);
      this.sessionCache = null;
      return null;
    }
  }
  /**
   * Create authenticated headers for API requests
   */
  static async createAuthHeaders(
    additionalHeaders: Record<string, string> = {},
  ): Promise<Headers> {
    const headers = new Headers({
      "Content-Type": "application/json",
      ...additionalHeaders,
    });
    const token = await this.getValidAccessToken();
    if (token) {
      headers.set("Authorization", `Bearer ${token}`);
    }
    return headers;
  }
  /**
   * Make an authenticated API request
   */
  static async authenticatedFetch(
    url: string,
    options: RequestInit = {},
  ): Promise<Response> {
    const headers = await this.createAuthHeaders(
      options.headers
        ? Object.fromEntries(new Headers(options.headers as HeadersInit))
        : {},
    );
    const response = await fetch(url, {
      ...options,
      headers,
    });
    // If we get 401, try once more with fresh token
    if (response.status === 401) {
      console.warn("API call got 401, refreshing token and retrying...");

      // Force refresh session
      const {
        data: { session },
        error,
      } = await supabase.auth.refreshSession();

      if (error || !session?.access_token) {
        console.error("Failed to refresh session:", error);
        throw new Error("Authentication failed - please sign in again");
      }
      // Update cache with new token
      this.sessionCache = {
        token: session.access_token,
        expiresAt: session.expires_at
          ? session.expires_at * 1000
          : Date.now() + 60 * 60 * 1000,
      };
      // Retry with new token
      const newHeaders = await this.createAuthHeaders(
        options.headers
          ? Object.fromEntries(new Headers(options.headers as HeadersInit))
          : {},
      );
      return fetch(url, {
        ...options,
        headers: newHeaders,
      });
    }
    return response;
  }
  /**
   * Check if user is currently authenticated
   */
  static async isAuthenticated(): Promise<boolean> {
    try {
      const {
        data: { session },
      } = await supabase.auth.getSession();
      return !!session?.access_token;
    } catch {
      return false;
    }
  }
  /**
   * Clear the session cache (call on logout)
   */
  static clearCache(): void {
    this.sessionCache = null;
  }
  /**
   * Get current user info
   */
  static async getCurrentUser() {
    try {
      const {
        data: { user },
        error,
      } = await supabase.auth.getUser();
      if (error) throw error;
      return user;
    } catch (error) {
      console.error("Error getting current user:", error);
      return null;
    }
  }
}
