const fs = require("fs").promises;
const path = require("path");

class ActivityLogger {
  constructor() {
    this.logsDir = path.join(__dirname, "agent-activity");
    this.errorsDir = path.join(__dirname, "errors");
    this.reportsDir = path.join(__dirname, "reports");
  }

  async logActivity(action) {
    const timestamp = new Date().toISOString();
    const date = timestamp.split("T")[0];
    const logFile = path.join(this.logsDir, `activity-${date}.json`);

    const logEntry = {
      timestamp,
      task: action.task,
      agent: action.agent || "system",
      status: action.status,
      duration: action.duration,
      metadata: action.metadata || {},
    };

    try {
      let logs = [];
      try {
        const existing = await fs.readFile(logFile, "utf-8");
        logs = JSON.parse(existing);
      } catch (e) {
        // File doesn't exist yet, start fresh
      }

      logs.push(logEntry);
      await fs.writeFile(logFile, JSON.stringify(logs, null, 2));

      // Check for errors and log separately
      if (action.status === "error") {
        await this.logError({
          ...logEntry,
          error: action.error,
          fix: action.fix,
        });
      }
    } catch (error) {
      console.error("Failed to log activity:", error);
    }
  }

  async logError(errorData) {
    const timestamp = new Date().toISOString();
    const date = timestamp.split("T")[0];
    const errorFile = path.join(this.errorsDir, `errors-${date}.json`);

    try {
      let errors = [];
      try {
        const existing = await fs.readFile(errorFile, "utf-8");
        errors = JSON.parse(existing);
      } catch (e) {
        // File doesn't exist yet
      }

      errors.push(errorData);
      await fs.writeFile(errorFile, JSON.stringify(errors, null, 2));

      // Critical error escalation
      if (errorData.error && errorData.error.severity === "critical") {
        await this.escalateCriticalError(errorData);
      }
    } catch (error) {
      console.error("Failed to log error:", error);
    }
  }

  async generateDailyReport() {
    const date = new Date().toISOString().split("T")[0];
    const activityFile = path.join(this.logsDir, `activity-${date}.json`);
    const errorFile = path.join(this.errorsDir, `errors-${date}.json`);
    const reportFile = path.join(this.reportsDir, `report-${date}.json`);

    try {
      let activities = [];
      let errors = [];

      try {
        activities = JSON.parse(await fs.readFile(activityFile, "utf-8"));
      } catch (e) {}

      try {
        errors = JSON.parse(await fs.readFile(errorFile, "utf-8"));
      } catch (e) {}

      const report = {
        date,
        generated: new Date().toISOString(),
        summary: {
          totalActivities: activities.length,
          totalErrors: errors.length,
          successRate:
            activities.length > 0
              ? (
                  (activities.filter((a) => a.status === "success").length /
                    activities.length) *
                  100
                ).toFixed(2) + "%"
              : "N/A",
          agentBreakdown: this.getAgentBreakdown(activities),
          taskBreakdown: this.getTaskBreakdown(activities),
          errorTypes: this.getErrorTypes(errors),
        },
        feedback: {
          prompt:
            "Was this accurate, robust, and well-documented? If not, flag for review.",
          flags: [],
        },
        activities: activities.slice(-10), // Last 10 activities
        errors: errors,
      };

      await fs.writeFile(reportFile, JSON.stringify(report, null, 2));
      return report;
    } catch (error) {
      console.error("Failed to generate report:", error);
      return null;
    }
  }

  getAgentBreakdown(activities) {
    const breakdown = {};
    activities.forEach((a) => {
      if (!breakdown[a.agent]) {
        breakdown[a.agent] = { total: 0, success: 0, error: 0 };
      }
      breakdown[a.agent].total++;
      if (a.status === "success") breakdown[a.agent].success++;
      if (a.status === "error") breakdown[a.agent].error++;
    });
    return breakdown;
  }

  getTaskBreakdown(activities) {
    const breakdown = {};
    activities.forEach((a) => {
      if (!breakdown[a.task]) {
        breakdown[a.task] = 0;
      }
      breakdown[a.task]++;
    });
    return breakdown;
  }

  getErrorTypes(errors) {
    const types = {};
    errors.forEach((e) => {
      const type = e.error?.type || "unknown";
      if (!types[type]) {
        types[type] = 0;
      }
      types[type]++;
    });
    return types;
  }

  async escalateCriticalError(errorData) {
    // In production, this would trigger email/SMS to founder
    console.error("CRITICAL ERROR - Requires immediate attention:", errorData);
    // TODO: Implement actual notification system
  }
}

module.exports = new ActivityLogger();
