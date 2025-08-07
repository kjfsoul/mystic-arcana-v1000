import js from '@eslint/js';
import tseslint from '@typescript-eslint/eslint-plugin';
import tsparser from '@typescript-eslint/parser';
import nextPlugin from '@next/eslint-plugin-next';

export default [
  js.configs.recommended,
  {
    files: ['**/*.{js,jsx,ts,tsx}'],
    languageOptions: {
      parser: tsparser,
      parserOptions: {
        ecmaVersion: 'latest',
        sourceType: 'module',
        ecmaFeatures: {
          jsx: true,
        },
      },
    },
    plugins: {
      '@typescript-eslint': tseslint,
      '@next/next': nextPlugin,
    },
    rules: {
      // React hooks - warn instead of error
      'react-hooks/exhaustive-deps': 'warn',
      
      // Next.js specific rules
      '@next/next/no-assign-module-variable': 'error',
      
      // TypeScript rules - make them warnings
      '@typescript-eslint/no-unused-vars': 'warn',
      '@typescript-eslint/no-explicit-any': 'warn',
      '@typescript-eslint/no-empty-function': 'warn',
      
      // General rules - relax them
      'no-console': 'warn',
      'no-debugger': 'warn',
      'no-alert': 'warn',
      'no-unused-vars': 'warn',
      
      // Import rules - disable problematic ones
      'import/no-extraneous-dependencies': 'off',
      'import/no-unresolved': 'off',
      'import/named': 'off',
      
      // React rules - relax them
      'react/prop-types': 'off',
      'react/require-default-props': 'off',
      'react/jsx-props-no-spreading': 'off',
      'react/jsx-key': 'warn',
      'react/react-in-jsx-scope': 'off',
      
      // JSX a11y - disable problematic ones
      'jsx-a11y/anchor-is-valid': 'off',
      'jsx-a11y/alt-text': 'warn',
      'jsx-a11y/heading-has-content': 'warn',
    },
    settings: {
      react: {
        version: 'detect',
      },
    },
  },
  {
    files: ['**/*.test.{js,jsx,ts,tsx}'],
    rules: {
      'react-hooks/exhaustive-deps': 'off',
      '@typescript-eslint/no-unused-vars': 'off',
      'no-unused-vars': 'off',
      'no-console': 'off',
    },
  },
  {
    files: ['scripts/**/*'],
    rules: {
      'no-console': 'off',
      '@typescript-eslint/no-unused-vars': 'off',
      'no-unused-vars': 'off',
    },
  },
];
