import { defineConfig } from 'vitest/config';

export default defineConfig({
  test: {
    include: ['libs/**/*.spec.ts', 'apps/**/*.spec.ts', 'tools/**/*.spec.ts'],
    // Le test de strictness lance une compilation TypeScript complete.
    testTimeout: 60_000,
  },
});
