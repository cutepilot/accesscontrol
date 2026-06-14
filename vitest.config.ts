import { defineConfig } from 'vitest/config';

export default defineConfig({
  test: {
    globals: true,
    environment: 'node',
    include: ['test/**/*.{test,spec}.ts'],
    coverage: {
      provider: 'istanbul',
      reporter: ['text', 'lcov'],
      reportsDirectory: 'test/coverage',
      include: ['src/**/*.ts'],
      thresholds: {
        lines: 95,
        functions: 90,
        statements: 95,
        branches: 90
      }
    }
  }
});
