import { defineConfig } from 'vitest/config';

export default defineConfig({
  test: {
    environment: 'jsdom',
    setupFiles: ['./tests/setup.js', './tests/load-core.js', './tests/load-store.js'],
    include: ['tests/**/*.test.js'],
  },
});
