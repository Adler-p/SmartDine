// eslint.config.js
import next from 'eslint-plugin-next';

export default [
  {
    ignores: ['node_modules/**', '.next/**'],
  },
  {
    files: ['**/*.{js,ts,jsx,tsx}'],
    plugins: {
      next,
    },
    rules: {
      ...next.configs.recommended.rules,
      // Add your custom rules here
    },
  },
];
