import { test, expect } from '@playwright/test';

test('teletext index, article navigation and gallery', async ({ page }) => {
 const errors: string[] = [];
 page.on('pageerror', error => errors.push(error.message));
 await page.setViewportSize({width:1440,height:1000});
 await page.goto('/');
 await expect(page.locator('.index-panel')).toBeVisible();
 await expect(page.locator('.latest-panel')).toBeVisible();
 const directoryPaths = await page.locator('.directory-links a, .category-links a').evaluateAll(links => links.map(link => link.getAttribute('href')!));
 await expect(page.locator('body')).toHaveCSS('color', 'rgb(18, 53, 114)');
 await expect(page.locator('[data-media-player], [data-tv-image], [data-solitaire], .taskbar')).toHaveCount(0);
 await page.screenshot({path:'tmp/teletext-desktop.png',fullPage:true});
 const latest = page.locator('.latest-list a').first();
 if (await latest.count()) {
  const title = await latest.locator('span').last().textContent();
  await latest.click();
  await expect(page.locator('article h1')).toHaveText(title!);
  await expect(page.locator('.reading-panel')).toBeVisible();
  await page.screenshot({path:'tmp/teletext-article.png',fullPage:true});
 }
 for (const url of ['/posts','/pages','/gallery','/404', ...directoryPaths]) {
  await page.goto(url);
  await expect(page.locator('main')).toBeVisible();
  await expect(page.locator('vite-error-overlay')).toHaveCount(0);
 }
 await page.goto('/gallery');
 const picture = page.locator('[data-gallery-image]').first();
 if(await picture.count()) {
  await picture.click();
  await expect(page.locator('dialog')).toBeVisible();
  await page.keyboard.press('Escape');
  await expect(page.locator('dialog')).not.toBeVisible();
 }
 expect(errors).toEqual([]);
});

test('all main pages fit mobile and tablet', async ({ page }) => {
 await page.emulateMedia({reducedMotion:'reduce'});
 for (const width of [320,375,768]) {
  await page.setViewportSize({width,height:900});
  for(const url of ['/','/posts','/pages','/gallery','/404']) {
   await page.goto(url);
   await expect(page.locator('main')).toBeVisible();
   expect(await page.evaluate(() => document.documentElement.scrollWidth <= innerWidth), `${url} at ${width}px`).toBe(true);
   if(width === 375 && url === '/') await page.screenshot({path:'tmp/teletext-mobile.png',fullPage:true});
  }
 }
});

test('navigation and images work without JavaScript', async ({ browser }) => {
 const context = await browser.newContext({javaScriptEnabled:false});
 const page = await context.newPage();
 await page.goto('http://localhost:4321/');
 await page.locator('.index-links a[href="/posts"]').click();
 await expect(page.locator('.section-banner')).toContainText('ARCHIVE');
 await page.goto('http://localhost:4321/gallery');
 const picture = page.locator('[data-gallery-image]').first();
 if(await picture.count()) {
  await expect(picture).toHaveAttribute('href', /^https?:\/\//);
  await expect(picture.locator('img')).toBeVisible();
 }
 await context.close();
});
