#!/usr/bin/env tsx

/**
 * Setup script for the Tarot Data Engine
 *
 * This script helps users set up the Tarot Data Engine by:
 * 1. Checking environment variables
 * 2. Testing database connection
 * 3. Running database migrations (if needed)
 * 4. Seeding the database with Rider-Waite deck
 * 5. Verifying the setup
 */

import { existsSync, readFileSync } from "fs";
import { createAdminClient } from "../src/lib/supabase/server";
import { seedTarotCards } from "./seed-tarot";
import { runAllTests } from "./test-tarot-api";

function checkEnvironmentVariables(): boolean {
  console.log("🔍 Checking environment variables...");

  const requiredVars = [
    "NEXT_PUBLIC_SUPABASE_URL",
    "NEXT_PUBLIC_SUPABASE_ANON_KEY",
    "SUPABASE_SERVICE_ROLE_KEY",
  ];

  const missing: string[] = [];

  for (const varName of requiredVars) {
    if (!process.env[varName]) {
      missing.push(varName);
    }
  }

  if (missing.length > 0) {
    console.log("❌ Missing environment variables:");
    missing.forEach((varName) => console.log(`   - ${varName}`));
    console.log("\n📝 Please:");
    console.log("   1. Copy .env.local.example to .env.local");
    console.log("   2. Fill in your Supabase credentials");
    console.log("   3. Run this script again");
    return false;
  }

  console.log("✅ All environment variables are set");
  return true;
}

function checkEnvFile(): boolean {
  console.log("📄 Checking .env.local file...");

  if (!existsSync(".env.local")) {
    console.log("⚠️ .env.local file not found");
    console.log(
      "📝 Please copy .env.local.example to .env.local and configure it",
    );
    return false;
  }

  const envContent = readFileSync(".env.local", "utf-8");
  const hasSupabaseUrl = envContent.includes("NEXT_PUBLIC_SUPABASE_URL=");
  const hasAnonKey = envContent.includes("NEXT_PUBLIC_SUPABASE_ANON_KEY=");
  const hasServiceKey = envContent.includes("SUPABASE_SERVICE_ROLE_KEY=");

  if (!hasSupabaseUrl || !hasAnonKey || !hasServiceKey) {
    console.log("⚠️ .env.local file is missing required Supabase variables");
    console.log("📝 Please ensure all Supabase variables are configured");
    return false;
  }

  console.log("✅ .env.local file looks good");
  return true;
}

async function checkDatabaseConnection(): Promise<boolean> {
  console.log("🔌 Testing database connection...");

  try {
    const supabase = createAdminClient();

    // Test basic connection
    const { data, error } = await supabase
      .from("decks")
      .select("count")
      .limit(1);

    if (error) {
      console.log("❌ Database connection failed:", error.message);
      return false;
    }

    console.log("✅ Database connection successful");
    return true;
  } catch (error) {
    console.log("❌ Database connection error:", (error as Error).message);
    return false;
  }
}

async function checkTablesExist(): Promise<boolean> {
  console.log("🗄️ Checking if tables exist...");

  try {
    const supabase = createAdminClient();

    // Check if decks table exists
    const { error: decksError } = await supabase
      .from("decks")
      .select("id")
      .limit(1);

    // Check if cards table exists
    const { error: cardsError } = await supabase
      .from("cards")
      .select("id")
      .limit(1);

    if (decksError || cardsError) {
      console.log("❌ Required tables not found");
      console.log("📝 Please run database migrations:");
      console.log("   npx supabase db push");
      return false;
    }

    console.log("✅ All required tables exist");
    return true;
  } catch (error) {
    console.log("❌ Error checking tables:", (error as Error).message);
    return false;
  }
}

async function setupTarotEngine(): Promise<void> {
  console.log("🃏 Mystic Arcana - Tarot Data Engine Setup\n");

  // Step 1: Check environment file
  if (!checkEnvFile()) {
    process.exit(1);
  }

  console.log("");

  // Step 2: Check environment variables
  if (!checkEnvironmentVariables()) {
    process.exit(1);
  }

  console.log("");

  // Step 3: Test database connection
  const connectionOk = await checkDatabaseConnection();
  if (!connectionOk) {
    console.log("\n💡 Troubleshooting tips:");
    console.log("   - Verify your Supabase project is active");
    console.log("   - Check your SUPABASE_URL and keys are correct");
    console.log("   - Ensure your Supabase project has the required tables");
    process.exit(1);
  }

  console.log("");

  // Step 4: Check tables exist
  const tablesOk = await checkTablesExist();
  if (!tablesOk) {
    process.exit(1);
  }

  console.log("");

  // Step 5: Seed the database
  console.log("🌱 Seeding database with Rider-Waite deck...");
  try {
    await seedTarotCards();
    console.log("✅ Database seeding completed");
  } catch (error) {
    console.log("❌ Seeding failed:", (error as Error).message);
    process.exit(1);
  }

  console.log("");

  // Step 6: Run verification tests
  console.log("🧪 Running verification tests...");
  try {
    await runAllTests();
  } catch (error) {
    console.log("❌ Tests failed:", (error as Error).message);
    process.exit(1);
  }

  console.log("\n🎉 Tarot Data Engine setup complete!");
  console.log("\n📚 Next steps:");
  console.log("   - Start the development server: npm run dev");
  console.log(
    "   - Test the API: http://localhost:3000/api/tarot/deck/00000000-0000-0000-0000-000000000001",
  );
  console.log("   - Read the documentation: docs/tarot-data-engine.md");
}

// Run setup if this file is executed directly
if (require.main === module) {
  setupTarotEngine().catch((error) => {
    console.error("💥 Setup failed:", error);
    process.exit(1);
  });
}

export { setupTarotEngine };
