import { defineConfig } from 'vitest/config';

export default defineConfig({
  test: {
    environment: 'jsdom',
    include: ['tests/unit/**/*.test.js'],
    globals: true,
    restoreMocks: true,
    clearMocks: true,
    coverage: {
      provider: 'istanbul',
      reporter: ['text', 'html', 'json-summary'],
      reportsDirectory: './coverage',
      include: [
        'js/constants.js',
        'js/state.js',
        'js/i18n.js',
        'js/data/content.js',
        'js/utils/**/*.js',
        'js/modules/appBootstrap.js',
        'js/modules/calendar.js',
        'js/modules/contactTeam.js',
        'js/modules/modal.js',
        'js/modules/navigation.js',
        'js/modules/renderers.js',
      ],
      thresholds: {
        statements: 80,
        branches: 80,
        functions: 80,
        lines: 80,
      },
    },
  },
});
