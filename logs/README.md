# Mystic Arcana Logging System

## Overview
This logging system tracks all agent and MCP activities, errors, and generates daily reports for the Mystic Arcana platform.

## Directory Structure
- `agent-activity/` - Daily activity logs in JSON format
- `errors/` - Error logs with immediate escalation for critical issues
- `reports/` - Daily summary reports with analytics and feedback

## Usage

```javascript
const logger = require('./activity-logger');

// Log an activity
await logger.logActivity({
  task: 'tarot_reading',
  agent: 'mystic-arcana-primary',
  status: 'success',
  duration: 1500,
  metadata: {
    userId: 'user123',
    readingType: 'three_card_spread'
  }
});

// Log an error
await logger.logActivity({
  task: 'astrology_chart',
  agent: 'mystic-arcana-primary',
  status: 'error',
  error: {
    type: 'API_ERROR',
    message: 'Ephemeris data unavailable',
    severity: 'medium'
  },
  fix: 'Fallback to cached ephemeris data'
});

// Generate daily report
const report = await logger.generateDailyReport();
```

## Report Format
Daily reports include:
- Total activities and success rate
- Agent performance breakdown
- Task distribution
- Error analysis
- Self-reflection feedback prompt
- Last 10 activities
- All errors for the day

## Critical Error Escalation
Errors marked with `severity: 'critical'` trigger immediate escalation to founder/partner via console (email/SMS to be implemented).

## Feedback Loop
Each report ends with: "Was this accurate, robust, and well-documented? If not, flag for review."