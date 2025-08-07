#!/usr/bin/env npx tsx

/**
 * Email System Setup Script
 * Helps configure automated email notifications
 */

import { readFileSync, writeFileSync, existsSync } from "fs";
import { join } from "path";
import * as readline from "readline";

const rl = readline.createInterface({
  input: process.stdin,
  output: process.stdout,
});

function question(query: string): Promise<string> {
  return new Promise((resolve) => {
    rl.question(query, resolve);
  });
}

async function setupEmailSystem() {
  console.log("🔮 Mystic Arcana Email Notification Setup\n");

  const envPath = join(process.cwd(), ".env.local");
  const examplePath = join(process.cwd(), ".env.email.example");

  // Check if .env.local already exists
  let existingEnv = "";
  if (existsSync(envPath)) {
    existingEnv = readFileSync(envPath, "utf-8");
    console.log("📝 Found existing .env.local file\n");
  }

  console.log("📧 Email Configuration Setup\n");
  console.log("To use Gmail SMTP, you need:");
  console.log("1. Gmail account with 2-Factor Authentication enabled");
  console.log(
    "2. App-specific password generated from Google Account settings",
  );
  console.log(
    "3. Go to: Google Account > Security > 2-Step Verification > App passwords\n",
  );

  const emailUser = await question(
    "Enter your email address (for sending notifications): ",
  );
  const emailPass = await question(
    "Enter your Gmail app password (16 characters): ",
  );

  console.log("\n📅 Schedule Configuration\n");
  const dailyTime =
    (await question("Daily report time (default 09:00): ")) || "09:00";
  const urgentInterval =
    (await question("Urgent check interval in minutes (default 15): ")) || "15";

  console.log("\n📬 Recipient Configuration\n");
  const recipient =
    (await question("Recipient email (default kjfsoul@gmail.com): ")) ||
    "kjfsoul@gmail.com";

  // Create email configuration
  const emailConfig = `
# Email Configuration for Mystic Arcana Notifications
EMAIL_USER=${emailUser}
EMAIL_PASS=${emailPass}

# Notification Settings
NOTIFICATION_RECIPIENT=${recipient}
DAILY_REPORT_TIME=${dailyTime}
URGENT_CHECK_INTERVAL=${urgentInterval}
`;

  // Merge with existing .env.local or create new
  let finalEnv = emailConfig;
  if (existingEnv) {
    // Remove existing email config lines
    const cleanedEnv = existingEnv
      .split("\n")
      .filter(
        (line) =>
          !line.startsWith("EMAIL_") &&
          !line.startsWith("NOTIFICATION_") &&
          !line.startsWith("DAILY_REPORT_") &&
          !line.startsWith("URGENT_CHECK_"),
      )
      .join("\n");

    finalEnv = cleanedEnv + "\n" + emailConfig;
  }

  writeFileSync(envPath, finalEnv.trim() + "\n");

  console.log("\n✅ Email configuration saved to .env.local\n");

  // Test email setup
  console.log("🧪 Testing email configuration...\n");

  try {
    // Import and test email system
    const { emailNotifier } = await import("../src/agents/email-notifier");

    const testEmail = await question("Send test email now? (y/n): ");
    if (testEmail.toLowerCase() === "y") {
      console.log("📤 Sending test email...");
      await emailNotifier.sendReport();
      console.log("✅ Test email sent successfully!");
    }
  } catch (error) {
    console.log(
      `❌ Email test failed: ${error instanceof Error ? error.message : "Unknown error"}`,
    );
    console.log(
      "Check your credentials and try again with: npm run email:test",
    );
  }

  console.log("\n📋 Next Steps:");
  console.log("1. Start email scheduler: npm run email:start");
  console.log("2. Send test report: npm run email:test");
  console.log('3. Send urgent notification: npm run email:urgent "message"');
  console.log("4. Manual report: npm run email:send\n");

  console.log("🔧 Email Commands Available:");
  console.log("- npm run email:start    # Start automated scheduler");
  console.log("- npm run email:test     # Send test report");
  console.log("- npm run email:send     # Send immediate report");
  console.log("- npm run email:urgent   # Send urgent notification\n");

  console.log("📧 Email Schedule:");
  console.log(`- Daily reports: ${dailyTime} every day`);
  console.log(`- Urgent checks: Every ${urgentInterval} minutes`);
  console.log(`- Recipient: ${recipient}\n`);

  rl.close();
}

if (require.main === module) {
  setupEmailSystem().catch(console.error);
}
