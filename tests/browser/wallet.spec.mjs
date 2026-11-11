import { test, expect } from '@playwright/test';
for (const route of ['/wallet', '/dapp']) {
  test(`${route}: honest preview, navigation, mobile fit and no financial side effects`, async ({ page }) => {
    const errors = [];
    const requests = [];
    page.on('pageerror', error => errors.push(error.message));
    page.on('console', message => { if (message.type() === 'error') errors.push(message.text()); });
    page.on('request', request => requests.push(request.url()));
    await page.goto(route);
    await expect(page.getByRole('status')).toContainText('Frontend-only preview');
    await expect(page.getByRole('heading', { level: 1 })).toBeVisible();
    for (const name of ['Connect wallet', 'Send ATC', 'Make payment']) {
      await expect(page.getByRole('button', { name: new RegExp(name) })).toBeDisabled();
    }
    expect(await page.evaluate(() => typeof window.aetherion)).toBe('undefined');
    expect(await page.evaluate(() => document.documentElement.scrollWidth <= window.innerWidth)).toBe(true);
    await page.getByRole('navigation').getByRole('link', { name: route === '/wallet' ? 'Protocol' : 'Wallet', exact: true }).click();
    await expect(page).toHaveURL(route === '/wallet' ? /\/dapp$/ : /\/wallet$/);
    await expect(page.getByRole('link', { name: 'Read the whitepaper' })).toHaveAttribute('href', /github\.com\/AIFreedomTrustFederation\/Aether_Coin_biozonecurrency\/blob\/main\/WHITEPAPER\.md$/);
    expect(errors).toEqual([]);
    expect(requests.every(url => url.startsWith('http://127.0.0.1:4173/'))).toBe(true);
    expect(requests.filter(url => url.includes('/api/'))).toEqual([]);
  });
}
test('unavailable APIs and missing assets fail truthfully', async ({ request }) => {
  for (const prefix of ['/api', '/wallet/api', '/dapp/api']) {
    const response = await request.post(prefix + '/payments');
    expect(response.status()).toBe(503);
    expect((await response.json()).scope).toBe('frontend-only');
  }
  expect((await request.get('/assets/not-present.js')).status()).toBe(404);
});
