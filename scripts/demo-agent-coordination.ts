#!/usr/bin/env npx tsx

/**
 * Agent Coordination Demonstration
 * Shows agents working together on a complex tarot reading request
 */

import { messageBus } from "./agent-message-bus";

async function demonstrateCoordination() {
  console.log("🎯 Starting Agent Coordination Demonstration\n");

  // 1. Simulate a complex tarot reading request that requires multiple agents
  console.log(
    "📝 Step 1: User requests comprehensive tarot reading with cosmic influences",
  );

  const coordinationId = messageBus.requestCoordination({
    task_type: "tarot_reading",
    requesting_agent: "mysticArcana",
    required_agents: [
      "tarotDataEngine",
      "astronomicalVisualization",
      "legalComplianceAgent",
    ],
    context: {
      user_id: "demo_user_123",
      reading_type: "celtic_cross",
      birth_data: {
        date: "1990-06-15",
        time: "14:30",
        location: "San Francisco, CA",
      },
      special_requests: [
        "cosmic_influences",
        "current_planetary_positions",
        "privacy_compliant_interpretation",
      ],
    },
  });

  console.log(`✨ Coordination initiated: ${coordinationId}`);
  console.log("📡 Coordination requests sent to all required agents\n");

  // 2. Simulate agent responses
  await new Promise((resolve) => setTimeout(resolve, 1000));

  console.log("🃏 Step 2: Tarot Data Engine responds with deck information");
  messageBus.respondToCoordination(coordinationId, "tarotDataEngine", {
    deck_id: "00000000-0000-0000-0000-000000000001",
    deck_name: "Rider-Waite Tarot",
    cards_available: 78,
    special_cards_for_reading: [
      { id: "00-the-fool", name: "The Fool", cosmic_affinity: "uranus" },
      { id: "17-the-star", name: "The Star", cosmic_affinity: "aquarius" },
      { id: "21-the-world", name: "The World", cosmic_affinity: "saturn" },
    ],
    status: "ready_for_reading",
  });

  await new Promise((resolve) => setTimeout(resolve, 500));

  console.log(
    "⭐ Step 3: Astronomical Visualization Agent provides cosmic context",
  );
  messageBus.respondToCoordination(
    coordinationId,
    "astronomicalVisualization",
    {
      current_planetary_positions: {
        sun: { sign: "gemini", degree: 28.5, house: 3 },
        moon: { sign: "pisces", degree: 15.2, house: 12 },
        mercury: { sign: "gemini", degree: 22.1, house: 3 },
        venus: { sign: "cancer", degree: 8.7, house: 4 },
      },
      significant_aspects: [
        { type: "conjunction", planets: ["sun", "mercury"], orb: 1.2 },
        { type: "trine", planets: ["moon", "neptune"], orb: 0.8 },
      ],
      cosmic_weather: {
        intensity: "moderate",
        dominant_element: "air",
        lunar_phase: "waning_gibbous",
        retrograde_planets: ["pluto"],
      },
      visual_rendering_ready: true,
    },
  );

  await new Promise((resolve) => setTimeout(resolve, 500));

  console.log("⚖️  Step 4: Legal Compliance Agent ensures privacy protection");
  messageBus.respondToCoordination(coordinationId, "legalComplianceAgent", {
    privacy_compliance_check: "passed",
    data_handling_approved: true,
    spiritual_disclaimers: [
      "Entertainment purposes only",
      "Not a substitute for professional advice",
      "User birth data will be anonymized",
    ],
    gdpr_compliance: {
      consent_recorded: true,
      data_minimization: true,
      right_to_deletion: "available",
    },
    risk_assessment: "low",
    approved_for_processing: true,
  });

  await new Promise((resolve) => setTimeout(resolve, 1000));

  // 3. Check coordination completion
  const coordination = messageBus.getCoordinationStatus(coordinationId);

  if (coordination && coordination.status === "completed") {
    console.log("\n🎉 Step 5: Coordination completed successfully!");
    console.log("📋 All agents have responded and provided their data:");

    Object.entries(coordination.responses).forEach(
      ([agent, response]: [string, any]) => {
        console.log(`   • ${agent}: ${response.timestamp}`);
      },
    );

    console.log(
      "\n🔮 Step 6: Mystic Arcana can now generate the complete reading",
    );
    console.log("   ✨ Cosmic influences integrated");
    console.log("   🃏 Tarot deck data loaded");
    console.log("   ⚖️  Privacy compliance verified");
    console.log("   🌟 User experience enhanced through agent collaboration");
  } else {
    console.log("\n⚠️  Coordination still in progress or failed");
    console.log("Current status:", coordination?.status || "unknown");
  }

  // 4. Demonstrate broadcast messaging
  console.log("\n📻 Step 7: Broadcasting system update to all agents");

  const broadcastId = messageBus.broadcast(
    "system",
    "coordination_demo_complete",
    {
      demo_coordination_id: coordinationId,
      performance_metrics: {
        total_response_time: "2.5 seconds",
        agents_participated: 3,
        data_points_collected: 15,
        compliance_status: "verified",
      },
    },
    "medium",
  );

  console.log(`📡 Broadcast sent: ${broadcastId}`);

  // 5. Show final statistics
  console.log("\n📊 Final Message Bus Statistics:");
  const stats = messageBus.getStats();
  console.log(JSON.stringify(stats, null, 2));

  console.log(
    "\n✅ Demonstration complete! Agents successfully coordinated for complex task.",
  );
}

// Run the demonstration
if (require.main === module) {
  demonstrateCoordination().catch(console.error);
}
