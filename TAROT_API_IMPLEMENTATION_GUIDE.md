# Enhanced Tarot API Implementation Guide

## Overview

This guide provides complete implementation for enhanced tarot API endpoints with AstrologyGuru integration, including hybrid readings that combine tarot wisdom with astrological insights.

## 🎯 Key Enhancements

### 1. **POST /api/tarot/draw** - Enhanced with Astrology

- Default spread type changed to '3-card' as requested
- Integrates real-time planetary positions via Swiss Ephemeris
- Provides cosmic timing advice for each card
- Supports birth data for personalized readings

### 2. **POST /api/tarot/shuffle** - Cosmic Randomization

- New algorithms: 'cosmic-fisher-yates' and 'quantum'
- Uses planetary positions for entropy seed
- Stores shuffle state for consistent draws
- Preview includes cosmic messages

### 3. **POST /api/tarot/save-reading** - Hybrid Storage

- Comprehensive validation with Zod schema
- Stores astrological insights alongside tarot data
- User quota management (50/day, 500/month)
- Public readings added to community feed

## 📝 Complete Endpoint Implementations

### Enhanced Draw Endpoint

```typescript
// File: /src/app/api/tarot/draw/route.ts

import { NextRequest, NextResponse } from "next/server";
import { createClient } from "@/lib/supabase/server";
import Logger from "@/utils/logger";
import { AstrologyGuruAgent } from "@/src/agents/astrology-guru";
import { SwissEphemerisShim } from "@/lib/astrology/SwissEphemerisShim";

export async function POST(request: NextRequest) {
  const startTime = Date.now();
  const logger = new Logger("tarot-api-enhanced");

  try {
    const body = await request.json();
    const {
      spread_type = "3-card", // Changed default to 3-card as requested
      user_id,
      deckId = "00000000-0000-0000-0000-000000000001",
      allowReversed = true,
      includeAstrology = true, // New: Include astrological insights
      birthData = null, // Optional: User's birth data for personalized readings
    } = body;

    // Validate spread_type
    const validSpreads = [
      "single",
      "3-card",
      "celtic-cross",
      "5-card",
      "7-card",
    ];
    if (!validSpreads.includes(spread_type)) {
      return NextResponse.json(
        {
          success: false,
          error:
            "Invalid spread_type. Must be one of: " + validSpreads.join(", "),
          code: "INVALID_SPREAD_TYPE",
        },
        { status: 400 },
      );
    }

    // [Rest of implementation continues as in JSON file...]
  } catch (error) {
    logger.error(
      "tarot_draw_enhanced_error",
      undefined,
      {},
      error as Error,
      "Enhanced draw failed",
    );
    return NextResponse.json(
      {
        success: false,
        error: "Internal server error",
        code: "INTERNAL_ERROR",
        details: error instanceof Error ? error.message : "Unknown error",
      },
      { status: 500 },
    );
  }
}
```

### Sample Request/Response

**Request:**

```json
POST /api/tarot/draw
{
  "spread_type": "3-card",
  "user_id": "123e4567-e89b-12d3-a456-426614174000",
  "includeAstrology": true,
  "birthData": {
    "latitude": 40.7128,
    "longitude": -74.0060,
    "timezone": "America/New_York"
  }
}
```

**Response:**

```json
{
  "success": true,
  "data": {
    "cards": [
      {
        "id": "card-001",
        "name": "The Fool",
        "position": "Past",
        "isReversed": false,
        "keywords": ["new beginnings", "innocence", "spontaneity"],
        "astrological_association": "Uranus"
      }
    ],
    "astrology": {
      "insights": [
        {
          "cardId": "card-001",
          "position": "Past",
          "planetaryRuler": "Uranus",
          "elementalBalance": "Strong air energy",
          "cosmicMessage": "The Fool appears during waxing moon, encouraging action on new beginnings",
          "timingAdvice": "Significant life theme unfolding over weeks/months"
        }
      ],
      "planetaryInfluences": {
        "moonPhase": "waxing_gibbous",
        "mercuryRetrograde": false,
        "dominantPlanets": [
          {
            "planet": "Sun",
            "sign": "Leo",
            "house": 10,
            "retrograde": false
          }
        ]
      },
      "cosmicTiming": {
        "favorable": "action",
        "moonPhaseAdvice": "Refine and adjust your approach",
        "bestTiming": "Next 3-5 days for implementation"
      }
    },
    "metadata": {
      "drawId": "draw_1706198400000_abc123",
      "timestamp": "2025-07-24T12:00:00Z",
      "spreadType": "3-card",
      "includesAstrology": true
    }
  }
}
```

## 🗄️ Database Schema

### Required Tables

```sql
-- Enhanced tarot_readings table
CREATE TABLE tarot_readings (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE,
  spread_type VARCHAR(50) NOT NULL,
  reading_type VARCHAR(20) DEFAULT 'tarot',
  cards_drawn JSONB NOT NULL,
  interpretation_text TEXT NOT NULL,
  question TEXT,
  notes TEXT,
  tags TEXT[],
  is_public BOOLEAN DEFAULT false,
  draw_id VARCHAR(100),
  cosmic_influence JSONB,
  astrological_insights JSONB,
  birth_data JSONB,
  metadata JSONB,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Indexes for performance
CREATE INDEX idx_tarot_readings_user_id ON tarot_readings(user_id);
CREATE INDEX idx_tarot_readings_spread_type ON tarot_readings(spread_type);
CREATE INDEX idx_tarot_readings_reading_type ON tarot_readings(reading_type);
CREATE INDEX idx_tarot_readings_created_at ON tarot_readings(created_at DESC);

-- Enable RLS
ALTER TABLE tarot_readings ENABLE ROW LEVEL SECURITY;

-- RLS Policies
CREATE POLICY users_can_view_own_readings ON tarot_readings
  FOR SELECT USING (auth.uid() = user_id);

CREATE POLICY users_can_view_public_readings ON tarot_readings
  FOR SELECT USING (is_public = true);

CREATE POLICY users_can_insert_own_readings ON tarot_readings
  FOR INSERT WITH CHECK (auth.uid() = user_id);
```

## 🧪 Testing with Postman

### Collection Setup

1. **Variables:**

   ```
   base_url: http://localhost:3000
   user_id: your-test-user-id
   auth_token: your-supabase-auth-token
   ```

2. **Test Scenarios:**
   - Basic 3-card draw without astrology
   - Enhanced draw with full astrological insights
   - Cosmic shuffle with preview
   - Save hybrid reading with cosmic influence
   - Retrieve saved readings with pagination

### Example Test Script

```javascript
// Postman Test for Draw Endpoint
pm.test("Status is 200", function () {
  pm.response.to.have.status(200);
});

pm.test("Response has required fields", function () {
  const jsonData = pm.response.json();
  pm.expect(jsonData).to.have.property("success", true);
  pm.expect(jsonData.data).to.have.property("cards");
  pm.expect(jsonData.data.cards).to.be.an("array");

  if (jsonData.data.astrology) {
    pm.expect(jsonData.data.astrology).to.have.property("insights");
    pm.expect(jsonData.data.astrology).to.have.property("planetaryInfluences");
  }
});

pm.test("Card count matches spread type", function () {
  const jsonData = pm.response.json();
  const spreadType = pm.request.body.spread_type || "3-card";
  const expectedCounts = {
    single: 1,
    "3-card": 3,
    "5-card": 5,
    "7-card": 7,
    "celtic-cross": 10,
  };

  pm.expect(jsonData.data.cards.length).to.equal(expectedCounts[spreadType]);
});
```

## 🔄 n8n Automation Workflow

### Daily Analytics Workflow

```json
{
  "name": "Tarot Analytics Pipeline",
  "nodes": [
    {
      "name": "Schedule",
      "type": "n8n-nodes-base.cron",
      "parameters": {
        "triggerTimes": {
          "item": [
            {
              "hour": 2,
              "minute": 0
            }
          ]
        }
      }
    },
    {
      "name": "Fetch Daily Stats",
      "type": "n8n-nodes-base.httpRequest",
      "parameters": {
        "method": "GET",
        "url": "={{$env.API_URL}}/api/tarot/analytics/daily",
        "authentication": "headerAuth",
        "headerAuth": {
          "name": "Authorization",
          "value": "Bearer {{$env.API_KEY}}"
        }
      }
    },
    {
      "name": "Process Analytics",
      "type": "n8n-nodes-base.function",
      "parameters": {
        "functionCode": "const stats = items[0].json;\n\n// Calculate key metrics\nconst metrics = {\n  date: new Date().toISOString().split('T')[0],\n  totalReadings: stats.totalReadings,\n  hybridReadings: stats.readingTypes.hybrid || 0,\n  popularSpread: Object.entries(stats.spreadTypes)\n    .sort(([,a], [,b]) => b - a)[0][0],\n  cosmicShuffles: stats.shuffleTypes['cosmic-fisher-yates'] || 0,\n  averageCardsPerReading: stats.averageCardsPerReading,\n  peakHour: stats.peakHour,\n  uniqueUsers: stats.uniqueUsers\n};\n\nreturn [{\n  json: metrics\n}];"
      }
    },
    {
      "name": "Store in Database",
      "type": "n8n-nodes-base.postgres",
      "parameters": {
        "operation": "insert",
        "table": "tarot_analytics",
        "columns": "date,total_readings,hybrid_readings,popular_spread,cosmic_shuffles,avg_cards,peak_hour,unique_users",
        "additionalFields": {}
      }
    },
    {
      "name": "Generate Report",
      "type": "n8n-nodes-base.html",
      "parameters": {
        "html": "<h2>Daily Tarot Analytics Report</h2>\n<p>Date: {{$json.date}}</p>\n<ul>\n  <li>Total Readings: {{$json.totalReadings}}</li>\n  <li>Hybrid Readings: {{$json.hybridReadings}}</li>\n  <li>Most Popular Spread: {{$json.popularSpread}}</li>\n  <li>Cosmic Shuffles: {{$json.cosmicShuffles}}</li>\n  <li>Peak Hour: {{$json.peakHour}}:00</li>\n  <li>Unique Users: {{$json.uniqueUsers}}</li>\n</ul>"
      }
    },
    {
      "name": "Send Email Report",
      "type": "n8n-nodes-base.emailSend",
      "parameters": {
        "toEmail": "admin@mysticarcana.com",
        "subject": "Daily Tarot Analytics - {{$json.date}}",
        "html": true,
        "htmlBody": "={{$node['Generate Report'].json.html}}"
      }
    }
  ]
}
```

### User Journey Tracking

```javascript
// n8n Function Node for User Journey Analysis
const readings = items[0].json.readings;
const userJourneys = {};

readings.forEach((reading) => {
  const userId = reading.user_id;
  if (!userJourneys[userId]) {
    userJourneys[userId] = {
      readingCount: 0,
      spreadsUsed: new Set(),
      hasUsedAstrology: false,
      firstReading: reading.created_at,
      lastReading: reading.created_at,
    };
  }

  userJourneys[userId].readingCount++;
  userJourneys[userId].spreadsUsed.add(reading.spread_type);
  userJourneys[userId].hasUsedAstrology =
    userJourneys[userId].hasUsedAstrology || reading.reading_type === "hybrid";
  userJourneys[userId].lastReading = reading.created_at;
});

// Convert Sets to Arrays for JSON
Object.keys(userJourneys).forEach((userId) => {
  userJourneys[userId].spreadsUsed = Array.from(
    userJourneys[userId].spreadsUsed,
  );
});

return Object.entries(userJourneys).map(([userId, journey]) => ({
  json: {
    userId,
    ...journey,
    journeyDuration:
      Math.floor(
        (new Date(journey.lastReading) - new Date(journey.firstReading)) /
          (1000 * 60 * 60 * 24),
      ) + " days",
  },
}));
```

## 🚀 Deployment Checklist

- [ ] Create required database tables and indexes
- [ ] Enable Row Level Security on all tables
- [ ] Set up RPC functions for user stats
- [ ] Configure environment variables
- [ ] Deploy enhanced API endpoints
- [ ] Test all endpoints with Postman
- [ ] Configure n8n workflows
- [ ] Set up monitoring and alerts
- [ ] Document API changes for frontend team

## 📊 Performance Metrics

### Expected Performance

- Draw endpoint: < 200ms average
- Shuffle endpoint: < 100ms average
- Save reading: < 150ms average
- Astrological calculations: < 500ms overhead

### Monitoring

```javascript
// Add to each endpoint
const performanceMetrics = {
  endpoint: "/api/tarot/draw",
  duration: Date.now() - startTime,
  includesAstrology: includeAstrology,
  cardCount: drawnCards.length,
  userId: user_id,
  timestamp: new Date().toISOString(),
};

// Log to monitoring service
logger.metric("api_performance", performanceMetrics);
```

## 🔐 Security Considerations

1. **Authentication**: All save operations require valid Bearer token
2. **Rate Limiting**: Implement at API Gateway level (50 req/min)
3. **Data Validation**: Zod schemas for all inputs
4. **SQL Injection**: Parameterized queries via Supabase
5. **CORS**: Configure allowed origins in Next.js config

## 📝 Summary

The enhanced tarot API now provides:

- ✅ Hybrid tarot-astrology readings
- ✅ Cosmic shuffle algorithms
- ✅ Comprehensive data persistence
- ✅ User analytics and quotas
- ✅ n8n automation ready
- ✅ Production-grade error handling
- ✅ Full TypeScript type safety

Ready for integration with frontend and automation workflows!
