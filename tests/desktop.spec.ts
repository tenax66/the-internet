import { test, expect } from '@playwright/test';

test('desktop, gallery and TV controls', async ({ page }) => {
	const errors: string[] = [];
	page.on('pageerror', error => errors.push(error.message));
	await page.setViewportSize({width:1440,height:1000});
	await page.goto('/');
	await expect(page.locator('[data-tv-image]')).toHaveAttribute('src', 'https://assets.internet.tanka.cc/broadcast/russian_monologue.gif');
	await expect(page.locator('[data-window="posts"]')).toBeVisible();
	await expect(page.locator('.latest-art img')).toHaveAttribute('src','https://assets.internet.tanka.cc/gallery/hills.png');
	await expect(page.locator('[data-window="nolongerexists"]')).toBeVisible();
	await page.screenshot({path:'tmp/desktop.png',fullPage:true});
	await page.locator('[data-power]').click();
	await expect(page.locator('.tv-off')).toBeVisible();
	await page.locator('[data-power]').click();
	await page.goto('/gallery');
	await expect(page.locator('[data-gallery-image]')).toHaveCount(2);
	await page.locator('[data-gallery-image]').first().click();
	await expect(page.locator('dialog')).toBeVisible();
	await page.keyboard.press('Escape');
	await expect(page.locator('dialog')).not.toBeVisible();
	expect(errors).toEqual([]);
});

test('mobile and reduced motion', async ({ page }) => {
	await page.emulateMedia({reducedMotion:'reduce'});
	for (const width of [375,320,768]) {
		await page.setViewportSize({width,height:900});
		await page.goto('/');
		expect(await page.evaluate(() => document.documentElement.scrollWidth <= innerWidth)).toBe(true);
		await expect(page.locator('[data-tv-status]')).toHaveText('静止中');
		await expect(page.locator('[data-media-player]')).toHaveCount(1);
		if (width === 375) await page.screenshot({path:'tmp/mobile.png',fullPage:true});
	}
});

test('images and content remain available without JavaScript', async ({ browser }) => {
	const context = await browser.newContext({javaScriptEnabled:false});
	const page = await context.newPage();
	await page.goto('http://localhost:4321/');
	await expect(page.locator('[data-window="posts"] a').first()).toBeVisible();
	await page.goto('http://localhost:4321/gallery');
	await page.locator('[data-gallery-image]').first().click();
	await expect(page).toHaveURL('https://assets.internet.tanka.cc/gallery/hills.png');
	await context.close();
});
