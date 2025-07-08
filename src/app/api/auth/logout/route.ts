import { createClient } from "@/lib/supabase/server";
import Logger from "@/utils/logger";
import { NextResponse } from "next/server";

const logger = new Logger("AuthLogoutAPI");

export async function POST() {
  const supabase = await createClient();

  try {
    const { error } = await supabase.auth.signOut();

    if (error) {
      logger.error(
        "auth_logout_failed",
        undefined,
        {},
        error,
        "Logout failed."
      );
      return NextResponse.json({ error: error.message }, { status: 400 });
    }

    logger.info(
      "auth_logout_success",
      undefined,
      {},
      "User logged out successfully."
    );
    return NextResponse.json({ message: "Logged out successfully" });
  } catch (error) {
    logger.error(
      "auth_logout_internal_error",
      undefined,
      {},
      error as Error,
      "Internal server error during logout."
    );
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    );
  }
}
