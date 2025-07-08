import { createClient } from "@/lib/supabase/server";
import Logger from "@/utils/logger";
import { NextRequest, NextResponse } from "next/server";

const logger = new Logger("AuthLoginAPI");

export async function POST(request: NextRequest) {
  const { email, password } = await request.json();
  const supabase = await createClient();

  try {
    const { data, error } = await supabase.auth.signInWithPassword({
      email,
      password,
    });

    if (error) {
      logger.error(
        "auth_login_failed",
        undefined,
        { email },
        error,
        `Login failed for email: ${email}.`
      );
      return NextResponse.json({ error: error.message }, { status: 401 });
    }

    logger.info(
      "auth_login_success",
      data.user?.id,
      { email },
      `User ${data.user?.id} logged in successfully.`
    );
    return NextResponse.json(data);
  } catch (error) {
    logger.error(
      "auth_login_internal_error",
      undefined,
      {},
      error as Error,
      "Internal server error during login."
    );
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    );
  }
}
