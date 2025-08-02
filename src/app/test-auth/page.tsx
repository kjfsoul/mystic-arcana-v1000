'use client';
import { useState } from 'react';
import { useAuth } from '@/contexts/AuthContext';
import { supabase } from '@/lib/supabase/client';
export default function TestAuthPage() {
  const { user, session, isGuest } = useAuth();
  const [testResult, setTestResult] = useState<string>('');
  const [loading, setLoading] = useState(false);
  const testSignUp = async () => {
    setLoading(true);
    const testEmail = `test${Date.now()}@example.com`;
    const testPassword = 'TestPassword123!';
    
    try {
      const { data, error } = await supabase.auth.signUp({
        email: testEmail,
        password: testPassword,
        options: {
          emailRedirectTo: `${window.location.origin}/auth/callback`
        }
      });
      
      if (error) {
        setTestResult(`❌ Signup Error: ${error.message}`);
      } else if (data.user && !data.session) {
        setTestResult(`📧 Success! Email confirmation required for: ${testEmail}`);
      } else if (data.session) {
        setTestResult(`✅ Success! Auto-logged in as: ${testEmail}`);
      } else {
        setTestResult('⚠️ Unexpected response');
      }
    } catch (err) {
      setTestResult(`❌ Exception: ${err}`);
    } finally {
      setLoading(false);
    }
  };
  const testSignIn = async () => {
    setLoading(true);
    try {
      const { data, error } = await supabase.auth.signInWithPassword({
        email: 'test@example.com',
        password: 'password'
      });
      
      if (error) {
        setTestResult(`❌ SignIn Error: ${error.message}`);
      } else if (data.session) {
        setTestResult(`✅ Signed in successfully!`);
      }
    } catch (err) {
      setTestResult(`❌ Exception: ${err}`);
    } finally {
      setLoading(false);
    }
  };
  const testGoogleOAuth = async () => {
    setLoading(true);
    try {
      const { error } = await supabase.auth.signInWithOAuth({
        provider: 'google',
        options: {
          redirectTo: `${window.location.origin}/auth/callback`
        }
      });
      
      if (error) {
        setTestResult(`❌ OAuth Error: ${error.message}`);
      } else {
        setTestResult(`✅ Redirecting to Google...`);
      }
    } catch (err) {
      setTestResult(`❌ Exception: ${err}`);
    } finally {
      setLoading(false);
    }
  };
  return (
    <div className="min-h-screen bg-black text-white p-8">
      <h1 className="text-3xl font-bold mb-8">Authentication Test Page</h1>
      
      <div className="mb-8 p-4 bg-gray-900 rounded">
        <h2 className="text-xl mb-4">Current Auth State:</h2>
        <pre className="text-sm">
          {JSON.stringify({
            isGuest,
            user: user?.email || null,
            session: !!session,
            userId: user?.id || null
          }, null, 2)}
        </pre>
      </div>
      <div className="space-y-4 mb-8">
        <button
          onClick={testSignUp}
          disabled={loading}
          className="px-4 py-2 bg-purple-600 hover:bg-purple-700 rounded disabled:opacity-50"
        >
          Test Sign Up
        </button>
        
        <button
          onClick={testSignIn}
          disabled={loading}
          className="px-4 py-2 bg-blue-600 hover:bg-blue-700 rounded disabled:opacity-50 ml-4"
        >
          Test Sign In
        </button>
        
        <button
          onClick={testGoogleOAuth}
          disabled={loading}
          className="px-4 py-2 bg-red-600 hover:bg-red-700 rounded disabled:opacity-50 ml-4"
        >
          Test Google OAuth
        </button>
      </div>
      {testResult && (
        <div className="p-4 bg-gray-900 rounded">
          <h3 className="text-lg mb-2">Test Result:</h3>
          <p>{testResult}</p>
        </div>
      )}
    </div>
  );
}
