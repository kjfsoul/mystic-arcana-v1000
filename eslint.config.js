import js from "@eslint/js";
import tseslint from "@typescript-eslint/eslint-plugin";
import tsparser from "@typescript-eslint/parser";
import reactHooksPlugin from "eslint-plugin-react-hooks";

export default [
  {
    // Migrate .eslintignore patterns here (ESLint v9+)
    ignores: [
      "venv-astrology/**",
      "venv/**",
      ".venv/**",
      "env/**",
      ".env/**",
      "node_modules/**",
      ".next/**",
      "dist/**",
      "build/**",
      "out/**",
      "**/__pycache__/**",
      "**/site-packages/**",
      "**/torch/**",
      "**/*.test.{js,jsx,ts,tsx}",
      "tests/**",
      // Keep docs and generic folders ignored
      "agents/**",
      "docs/**",
      ".git/**",
      ".vscode/**",
      ".idea/**",
      "coverage/**",
      ".nyc_output/**",
      ".cache/**",
      ".eslintcache",
      ".DS_Store",
      "Thumbs.db",
      "*.log",
      "*.pyc",
      "*.pyo",
      "*.pyd",
      "*.cjs",
      "temp/**",
      // Do NOT globally ignore scripts/** so we can control typed vs untyped via overrides below
      // Do NOT globally ignore mcp-servers/** so we can control typed vs untyped via overrides below
      // Allow Markdown/JSON/YAML to be processed by formatters if needed; if you want them ignored, uncomment:
      // '**/*.md','**/*.json','**/*.yml','**/*.yaml'
    ],
  },
  js.configs.recommended,
  {
    files: ["**/*.{js,jsx}"],
    languageOptions: {
      ecmaVersion: "latest",
      sourceType: "module",
      globals: {
        window: "readonly",
        document: "readonly",
        console: "readonly",
        setTimeout: "readonly",
        clearTimeout: "readonly",
        setInterval: "readonly",
        clearInterval: "readonly",
        fetch: "readonly",
        Headers: "readonly",
        Request: "readonly",
        Response: "readonly",
        URL: "readonly",
        Blob: "readonly",
        File: "readonly",
        FormData: "readonly",
        process: "readonly",
        global: "readonly",
        Buffer: "readonly",
        __dirname: "readonly",
        __filename: "readonly",
        module: "readonly",
        exports: "readonly",
        require: "readonly",
        globalThis: "readonly",
        navigator: "readonly",
        alert: "readonly",
        crypto: "readonly",
        performance: "readonly",
        Audio: "readonly",
        requestAnimationFrame: "readonly",
        cancelAnimationFrame: "readonly",
        localStorage: "readonly",
        sessionStorage: "readonly",
        NodeJS: "readonly",
      },
    },
    rules: {
      // Disable all problematic rules for JS files
      "no-unused-vars": "off",
      "no-empty": "off",
      "no-undef": "off",
      "no-cond-assign": "off",
      "no-console": "off",
      "no-debugger": "off",
      "no-alert": "off",
      "no-var": "off",
      "prefer-const": "off",
      "prefer-arrow-callback": "off",
      "no-case-declarations": "off",
      "no-useless-escape": "off",
      "no-useless-catch": "off",
      "no-unreachable": "off",
      "no-empty-pattern": "off",
      "no-prototype-builtins": "off",
      "no-dupe-keys": "off",
    },
  }, // end JS files override

  // Untyped TypeScript override for paths that should not use parserOptions.project
  {
    files: [
      "mcp-servers/custom/**/*.{ts,tsx}",
      "scripts/**/*.{ts,tsx}",
      "src/agents/**/*.{ts,tsx}",
    ],
    languageOptions: {
      parser: tsparser,
      parserOptions: {
        ecmaVersion: "latest",
        sourceType: "module",
        ecmaFeatures: { jsx: true },
        project: false, // disable typed linting here
        tsconfigRootDir: "./",
      },
      // keep minimal globals for untyped override to avoid TS parser expecting project
      globals: {
        window: "readonly",
        document: "readonly",
        console: "readonly",
        process: "readonly",
      },
    },
    plugins: {
      "@typescript-eslint": tseslint,
    },
    rules: {
      // Keep these relatively relaxed for untyped regions
    },
  },

  // Typed TypeScript for application code
  {
    files: ["src/**/*.{ts,tsx}"],
    languageOptions: {
      parser: tsparser,
      parserOptions: {
        ecmaVersion: "latest",
        sourceType: "module",
        ecmaFeatures: { jsx: true },
        project: "./tsconfig.json",
        tsconfigRootDir: "./",
      },
      globals: {
        window: "readonly",
        document: "readonly",
        console: "readonly",
        setTimeout: "readonly",
        clearTimeout: "readonly",
        setInterval: "readonly",
        clearInterval: "readonly",
        fetch: "readonly",
        Headers: "readonly",
        Request: "readonly",
        Response: "readonly",
        URL: "readonly",
        Blob: "readonly",
        File: "readonly",
        FormData: "readonly",
        process: "readonly",
        global: "readonly",
        Buffer: "readonly",
        __dirname: "readonly",
        __filename: "readonly",
        module: "readonly",
        exports: "readonly",
        require: "readonly",
        globalThis: "readonly",
        navigator: "readonly",
        alert: "readonly",
        crypto: "readonly",
        performance: "readonly",
        Audio: "readonly",
        requestAnimationFrame: "readonly",
        cancelAnimationFrame: "readonly",
        localStorage: "readonly",
        sessionStorage: "readonly",
        NodeJS: "readonly",
        React: "readonly",
      },
    },
    plugins: {
      "@typescript-eslint": tseslint,
      "react-hooks": reactHooksPlugin,
    },
    rules: {
      // retain your rule customizations as needed (kept minimal here)
    },
  }, // end typed TS override

  // Tests override
  {
    files: ["**/*.test.{js,jsx,ts,tsx}"],
    rules: {
      // Disable all rules for test files
      "@typescript-eslint/no-unused-vars": "off",
      "no-unused-vars": "off",
      "no-console": "off",
      "no-undef": "off",
    },
  },

  // Scripts override
  {
    files: ["scripts/**/*"],
    rules: {
      // Disable all rules for script files
      "@typescript-eslint/no-unused-vars": "off",
      "no-unused-vars": "off",
      "no-console": "off",
      "no-undef": "off",
    },
  },

  // Agents and docs override
  {
    files: ["agents/**/*", "docs/**/*"],
    rules: {
      // Disable all rules for agent and docs files
      "@typescript-eslint/no-unused-vars": "off",
      "no-unused-vars": "off",
      "no-console": "off",
      "no-undef": "off",
      "no-case-declarations": "off",
      "no-useless-escape": "off",
    },
  },
];
