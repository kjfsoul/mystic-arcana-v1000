import { createClient } from "@supabase/supabase-js";

const supabaseUrl = "https://pqfsbxcbsxuyfgqrxdob.supabase.co";
const supabaseServiceKey =
  "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InBxZnNieGNic3h1eWZncXJ4ZG9iIiwicm9sZSI6InNlcnZpY2Vfcm9sZSIsImlhdCI6MTc0Nzk0OTgwMCwiZXhwIjoyMDYzNTI1ODAwfQ.MpxSuZQL4NZS-lTPkitBG4QdS_AMVw5xxNbbTmzIxOk";

const supabase = createClient(supabaseUrl, supabaseServiceKey);

async function checkJourneyEntriesTable() {
  try {
    console.log("Checking if journey_entries table exists...");

    // Try to query the table
    const { data, error } = await supabase
      .from("journey_entries")
      .select("*")
      .limit(1);

    if (error) {
      if (
        error.message.includes(
          'relation "public.journey_entries" does not exist',
        )
      ) {
        console.log(
          "Table does not exist. It needs to be created via Supabase Dashboard.",
        );
        console.log(
          "Please go to your Supabase Dashboard SQL Editor and run the migration manually.",
        );
        return false;
      } else {
        console.error("Error checking table:", error);
        return false;
      }
    }

    console.log("✅ journey_entries table exists!");
    return true;
  } catch (error) {
    console.error("Unexpected error:", error);
    return false;
  }
}

checkJourneyEntriesTable();
