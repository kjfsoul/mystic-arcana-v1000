'use client';

import { createBrowserClient } from '@supabase/ssr';

export default function TestOAuth() {
  const supabase = createBrowserClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
  );

  const testGoogleAuth = async () => {
    const { data, error } = await supabase.auth.signInWithOAuth({
      provider: 'google',
      options: {
        redirectTo: `${window.location.origin}/auth/callback`
      }
    });
    
    console.log('OAuth response:', { data, error });
    
    if (error) {
      alert(`Error: ${error.message}`);
    }
  };

  return (
    <div style={{ padding: '2rem' }}>
      <h1>Test OAuth</h1>
      <button 
        onClick={testGoogleAuth}
        style={{ 
          padding: '1rem 2rem', 
          fontSize: '1rem',
          cursor: 'pointer',
          backgroundColor: '#4285f4',
          color: 'white',
          border: 'none',
          borderRadius: '4px'
        }}
      >
        Test Google Sign In
      </button>
      <p style={{ marginTop: '1rem' }}>
        Check console for OAuth response
      </p>
    </div>
  );
}