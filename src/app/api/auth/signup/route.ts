import { NextRequest, NextResponse } from 'next/server';
import { createClient } from '@/lib/supabase/server';
import Logger from '@/utils/logger';

const logger = new Logger('AuthSignupAPI');

export async function POST(request: NextRequest) {
  const { email, password } = await request.json();
  const supabase = await createClient();

  try {
    const { data, error } = await supabase.auth.signUp({
      email,
      password,
    });

    if (error) {
      logger.error('auth_signup_failed', undefined, error, `Signup failed for email: ${email}.`);
      return NextResponse.json({ error: error.message }, { status: 400 });
    }

    logger.info('auth_signup_success', data.user?.id, { email }, `User ${data.user?.id} signed up successfully.`);
    return NextResponse.json(data);
  } catch (error) {
    logger.error('auth_signup_internal_error', undefined, error as Error, 'Internal server error during signup.');
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}