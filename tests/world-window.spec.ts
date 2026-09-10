import { test, expect } from '@playwright/test';

test('world window shares desktop sizing, close and restore behavior', async ({ page }) => {
 await page.setViewportSize({width:1440,height:1000});
 await page.goto('/');
 const world = page.locator('[data-window="nolongerexists"]');
 await expect(world).toBeVisible();
 const width = await world.evaluate(el => el.getBoundingClientRect().width);
 const peerWidth = await page.locator('[data-window="computer"]').evaluate(el => el.getBoundingClientRect().width);
 expect(Math.abs(width-peerWidth)).toBeLessThan(1);
 await world.locator('.win-titlebar').click();
 await expect(world).not.toHaveClass(/is-inactive/);
 await world.getByRole('button', {name:'閉じる',exact:true}).click();
 await expect(world).toBeHidden();
 await page.locator('#start-button').click();
 await page.locator('[data-window-action="restore-all"]').click();
 await expect(world).toBeVisible();
 await world.getByRole('button', {name:'OK',exact:true}).click();
 await expect(world).toBeHidden();
 await page.setViewportSize({width:375,height:900});
 await page.reload();
 await expect(world).toBeVisible();
 expect(await page.evaluate(() => document.documentElement.scrollWidth<=innerWidth)).toBe(true);
});
