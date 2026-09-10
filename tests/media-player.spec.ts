import { test, expect } from '@playwright/test';

test('selected house track, disabled playback and stop lifecycle', async ({ page }) => {
 const errors: string[] = [];
 page.on('pageerror', e => errors.push(e.message));
 await page.goto('/');
 await expect(page.locator('[data-sequencer], [data-step], [data-tempo]')).toHaveCount(0);
 const audio = page.locator('[data-music]');
 const play = page.locator('[data-music-play]');
 const select = page.locator('[data-music-select]');
 await expect(select.locator('option')).toHaveCount(3);
 await select.selectOption('sunroom');
 await expect(page.locator('[data-song-title]')).toHaveText('Sunroom — Piano House');
 await play.click();
 await expect(audio).toHaveAttribute('src', 'https://assets.internet.tanka.cc/music/sunroom.wav');
 await expect(play).toHaveAttribute('aria-pressed', 'true');
 await expect(play).toBeDisabled();
 await expect(select).toBeDisabled();
 await expect.poll(() => audio.evaluate((a: HTMLAudioElement) => a.currentTime)).toBeGreaterThan(0);
 await expect.poll(() => page.locator('[data-spectrum] span').evaluateAll(bars => bars.some(b => parseFloat((b as HTMLElement).style.getPropertyValue('--h')) > 0))).toBe(true);
 await page.locator('[data-volume]').fill('0.1');
 await expect(audio).toHaveJSProperty('volume', 0.1);
 await page.locator('[data-music-stop]').click();
 await expect(audio).toHaveJSProperty('paused', true);
 await expect(play).toHaveAttribute('aria-pressed', 'false');
 await expect(play).toBeEnabled();
 await expect(select).toBeEnabled();
 await expect(page.locator('[data-waveform]')).toHaveAttribute('d', 'M0 20H256');
 await select.selectOption('neon');
 await play.click();
 await expect(play).toHaveAttribute('aria-pressed', 'true');
 await expect(audio).toHaveAttribute('src', 'https://assets.internet.tanka.cc/music/neon.wav');
 await page.evaluate(() => {
  Object.defineProperty(document, 'hidden', {configurable:true, get:()=>true});
  document.dispatchEvent(new Event('visibilitychange'));
 });
 await expect(audio).toHaveJSProperty('paused', true);
 await page.evaluate(() => {
  Object.defineProperty(document, 'hidden', {configurable:true, get:()=>false});
 });
 await play.click();
 await expect(play).toHaveAttribute('aria-pressed', 'true');
 await page.locator('[data-window="player"] [data-window-action="close"]').click();
 await expect(audio).toHaveJSProperty('paused', true);
 expect(errors).toEqual([]);
});

test('player fits mobile and uses classic colors', async ({ page }) => {
 await page.setViewportSize({width:320,height:900});
 await page.goto('/');
 await expect(page.locator('[data-media-player]')).toHaveCSS('background-color','rgb(192, 192, 192)');
 expect(await page.evaluate(() => document.documentElement.scrollWidth <= innerWidth)).toBe(true);
 await page.locator('[data-media-player]').screenshot({path:'tmp/house-player.png'});
});
