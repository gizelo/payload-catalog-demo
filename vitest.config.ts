import { defineConfig } from 'vitest/config'

export default defineConfig({
  test: {
    environment: 'node',
    env: { DATABASE_URL: 'file:./test.db', PAYLOAD_SECRET: 'test-secret' },
    testTimeout: 60_000,
    hookTimeout: 120_000,
  },
})
