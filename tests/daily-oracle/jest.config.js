module.exports = {
  displayName: "Daily Oracle Tests",
  testMatch: ["<rootDir>/tests/daily-oracle/**/*.test.ts"],
  preset: "ts-jest",
  testEnvironment: "node",
  setupFilesAfterEnv: ["<rootDir>/tests/daily-oracle/setup.ts"],
  collectCoverageFrom: [
    "src/app/api/daily-oracle/**/*.ts",
    "src/lib/daily-oracle/**/*.ts",
    "src/components/daily-oracle/**/*.tsx",
    "!**/*.d.ts",
    "!**/node_modules/**",
    "!**/coverage/**",
  ],
  coverageThreshold: {
    global: {
      branches: 80,
      functions: 80,
      lines: 80,
      statements: 80,
    },
  },
  testTimeout: 30000,
  verbose: true,
  reporters: [
    "default",
    [
      "jest-html-reporters",
      {
        publicPath: "./test-results/daily-oracle",
        filename: "daily-oracle-test-report.html",
        expand: true,
        hideIcon: false,
        pageTitle: "Daily Oracle Test Report",
      },
    ],
  ],
};
