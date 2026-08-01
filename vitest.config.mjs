import { defineConfig } from 'vitest/config';

export default defineConfig({
  test: {
    environment: 'node',
    include: ['**/*.test.js'],
    exclude: ['node_modules/**', '.next/**'],
    testTimeout: 30000,
    hookTimeout: 60000,
    env: { JWT_SECRET: 'test-secret-para-vitest' },
  },
});
