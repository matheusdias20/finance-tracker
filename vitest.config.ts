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
        lines: 50,
        functions: 40,
        branches: 45,
        statements: 50,
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
