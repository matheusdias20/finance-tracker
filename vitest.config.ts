import { defineConfig } from 'vitest/config'
import react from '@vitejs/plugin-react'
import path from 'path'

export default defineConfig({
  plugins: [react()],
  test: {
    environment: 'jsdom',
    globals: true,
    setupFiles: ['__tests__/setup.ts'],
    coverage: {
      provider: 'v8',
      thresholds: {
        lines: 80,
        functions: 80,
        branches: 80,
        statements: 80,
      },
      include: [
        'src/core/services/**/*.ts',
        'src/infrastructure/database/repositories/**/*.ts',
        'src/app/api/**/*.ts',
        'src/presentation/components/**/*.tsx',
      ],
      exclude: [
        'src/**/*.d.ts',
        'src/infrastructure/database/schema/**',
        'src/infrastructure/database/seed.ts',
      ],
    },
  },
  resolve: {
    alias: {
      '@': path.resolve(__dirname, './src'),
    },
  },
})
