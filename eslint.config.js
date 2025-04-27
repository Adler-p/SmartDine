import { defineConfig } from 'eslint-config-next';

export default defineConfig({
  extends: ['next', 'next/core-web-vitals'],
  rules: {
    // Your custom rules can go here
  },
  overrides: [
    {
      files: ['*.ts', '*.tsx'],
      rules: {
        // TypeScript-specific rules can go here
      },
    },
  ],
});
