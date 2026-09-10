import { defineConfig } from '@playwright/test';
export default defineConfig({
	testDir: './tests',
	use: { baseURL: 'http://localhost:4321', channel: 'chrome', headless: true },
	outputDir: './tmp/test-results',
});
