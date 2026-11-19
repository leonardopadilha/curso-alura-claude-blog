import { defineConfig, devices } from '@playwright/test'

const PORT = 5173

export default defineConfig({
  testDir: './e2e',
  outputDir: './e2e/.results',
  reporter: [['list'], ['html', { outputFolder: './e2e/.report', open: 'never' }]],
  use: {
    baseURL: `http://localhost:${PORT}`,
    trace: 'retain-on-failure',
  },
  projects: [
    { name: 'desktop', use: { ...devices['Desktop Chrome'] } },
    { name: 'mobile', use: { ...devices['Pixel 7'] } },
  ],
  webServer: {
    command: `pnpm dev --port ${PORT} --strictPort`,
    url: `http://localhost:${PORT}/login`,
    reuseExistingServer: true,
  },
})
