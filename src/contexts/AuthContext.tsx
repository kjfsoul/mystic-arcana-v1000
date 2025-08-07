"use client";

import { AuthError, AuthResponse, Session, User } from "@supabase/supabase-js";
import React, { createContext, useContext, useEffect, useState } from "react";
import { supabase } from "../lib/supabase/client";
import { profileService, UserProfile } from "../services/profileService";
/* eslint-disable no-unused-vars */
interface AuthContextType {
  user: User | null;
  session: Session | null;
  loading: boolean;
  signUp: (
    email: string,
    password: string,
    profileData?: UserProfile,
  ) => Promise<AuthResponse>;
  signIn: (email: string, password: string) => Promise<AuthResponse>;
  signInWithGoogle: () => Promise<{
    error: AuthError | null;
    isAuthenticated?: boolean;
  }>;
  signOut: () => Promise<{ error: AuthError | null }>;
  isGuest: boolean;
}
/* eslint-enable no-unused-vars */
const AuthContext = createContext<AuthContextType | undefined>(undefined);
export function AuthProvider({ children }: { children: React.ReactNode }) {
  const [user, setUser] = useState<User | null>(null);
  const [session, setSession] = useState<Session | null>(null);
  const [loading, setLoading] = useState(true);
  useEffect(() => {
    // Get initial session
    const getInitialSession = async () => {
      console.log("🔄 Getting initial session...");
      try {
        const {
          data: { session },
          error,
        } = await supabase.auth.getSession();
        if (error) {
          console.error("❌ Error getting session:", error);
        } else {
          console.log("✅ Initial session loaded:", {
            user: session?.user?.email || "none",
            session: session ? "present" : "missing",
            accessToken: session?.access_token ? "present" : "missing",
          });
        }
        setSession(session);
        setUser(session?.user ?? null);
      } catch (error) {
        console.error("❌ Unexpected error getting session:", error);
      } finally {
        setLoading(false);
      }
    };
    getInitialSession();
    // Listen for auth changes
    const {
      data: { subscription },
    } = supabase.auth.onAuthStateChange(async (event, session) => {
      console.log("🔄 Auth state change:", {
        event,
        user: session?.user?.email || "none",
        session: session ? "present" : "missing",
      });
      setSession(session);
      setUser(session?.user ?? null);
      setLoading(false);
    });
    return () => subscription.unsubscribe();
  }, []);
  const signUp = async (
    email: string,
    password: string,
    profileData?: UserProfile,
  ): Promise<AuthResponse> => {
    const authResponse = await supabase.auth.signUp({
      email,
      password,
      options: {
        emailRedirectTo: `${window.location.origin}/auth/callback`,
      },
    });
    // If signup is successful and user is created
    if (authResponse.data?.user && !authResponse.error) {
      // Create profile if profile data is provided
      if (profileData && Object.keys(profileData).length > 0) {
        try {
          await profileService.createProfile(
            authResponse.data.user.id,
            profileData,
          );
          console.log("✅ Profile created successfully");
        } catch (profileError) {
          console.error("❌ Error creating profile:", profileError);
          // Don't return error here as auth was successful
        }
      }
      if (!authResponse.data.session) {
        console.log("📧 Email confirmation required for:", email);
      }
    }
    return authResponse;
  };
  const signIn = async (email: string, password: string) => {
    return await supabase.auth.signInWithPassword({ email, password });
  };
  const signInWithGoogle = async () => {
    return await supabase.auth.signInWithOAuth({
      provider: "google",
      options: {
        redirectTo: `${window.location.origin}/auth/callback`,
      },
    });
  };
  const signOut = async () => {
    const result = await supabase.auth.signOut();
    // Clear API auth cache on logout
    try {
      const { APIAuthHelper } = await import("../utils/apiAuth");
      APIAuthHelper.clearCache();
    } catch (error) {
      console.warn("Failed to clear API auth cache:", error);
    }
    return result;
  };
  const value = {
    user,
    session,
    loading,
    signUp,
    signIn,
    signInWithGoogle,
    signOut,
    isGuest: !user,
  };
  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
}
export function useAuth() {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error("useAuth must be used within an AuthProvider");
  }
  return context;
}
