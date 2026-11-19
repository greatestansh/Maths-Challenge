import AxeBuilder from '@axe-core/playwright';
import { expect, test } from '@playwright/test';

test('doubling changes both words and scales both exact distances', async ({ page }) => {
  await page.goto('/#distance');
  const lab = page.getByRole('region', { name: 'Double both numbers' });
  const readouts = lab.locator('.distance-pairs dd');
  const button = lab.getByRole('button', { name: 'Double both numbers' });
  await expect(readouts).toHaveText(['8', '1/8']);
  await button.press('Enter');
  await expect(readouts).toHaveText(['16', '1/16']);
  await expect(lab.locator('.bit-word .visually-hidden')).toHaveText(['2 in binary 0 0 0 1 0', '18 in binary 1 0 0 1 0']);
  for (let index = 1; index < 12; index++) await button.press('Space');
  await expect(readouts).toHaveText(['32768', '1/32768']);
  await lab.getByRole('button', { name: 'Reset' }).press('Space');
  await expect(readouts).toHaveText(['8', '1/8']);
});

test('predicts before recentering and keeps the highlighted subtree and membership', async ({ page }) => {
  await page.goto('/#geometry');
  const lab = page.getByRole('region', { name: 'Can the center move?' });
  const recenter = lab.getByRole('button', { name: 'Use 9 as center' });
  const examples = await lab.locator('.ball-examples').innerText();
  const highlighted = await lab.locator('.tree-node.tone-shared').allTextContents();
  const marker = lab.locator('.center-marker');
  await expect(marker).toHaveAttribute('data-center-address', '4:1');
  const firstPosition = await marker.evaluate((element) => element.getAttribute('style'));
  await expect(lab.locator('.level-label').last()).toHaveText('mod 16');
  await expect(lab.locator('[data-node-key="4:1"].tone-shared, [data-node-key="4:9"].tone-shared')).toHaveCount(2);
  await expect(recenter).toBeDisabled();
  await lab.getByRole('button', { name: 'Different members' }).press('Enter');
  await recenter.press('Space');
  await expect(lab.getByText('Center 9', { exact: true })).toBeVisible();
  await expect(marker).toHaveAttribute('data-center-address', '4:9');
  expect(await marker.evaluate((element) => element.getAttribute('style'))).not.toBe(firstPosition);
  await expect(lab.locator('.ball-examples')).toHaveText(examples);
  expect(await lab.locator('.tree-node.tone-shared').allTextContents()).toEqual(highlighted);
});

test('compares nested and disjoint classes and reports the chapter in view', async ({ page }) => {
  await page.goto('/');
  const nav = page.getByRole('navigation', { name: 'Chapters' });
  await expect(nav.getByRole('link', { name: 'Puzzle' })).toHaveAttribute('aria-current', 'location');
  await nav.getByRole('link', { name: 'Geometry' }).press('Enter');
  await expect(page.locator('.chapter-position')).toHaveText('Chapter 4 of 8 Geometry');
  await expect(nav.getByRole('link', { name: 'Geometry' })).toHaveAttribute('aria-current', 'location');
  const figures = page.getByRole('group', { name: 'Nested and disjoint subtrees' }).getByRole('figure');
  await expect(figures.nth(0).locator('[data-node-key="3:1"].tone-shared')).toHaveCount(1);
  await expect(figures.nth(0).locator('[data-node-key="4:9"].tone-b')).toHaveCount(1);
  await expect(figures.nth(1).locator('[data-node-key="3:1"].tone-shared')).toHaveCount(1);
  await expect(figures.nth(1).locator('[data-node-key="3:3"].tone-b')).toHaveCount(1);
  await page.locator('#integers').evaluate((element) => element.scrollIntoView());
  await expect(page.locator('.chapter-position')).toHaveText('Chapter 8 of 8 Integers');
  await expect(page.locator('#integers summary').first()).toHaveText('When is the 2-adic error to −1 first at most 1/64?');
});

test('highlights both largest distances and handles repeated and negative points', async ({ page }) => {
  await page.goto('/#geometry');
  const lab = page.getByRole('region', { name: 'Which pair splits first?' });
  const distances = lab.locator('.distance-pairs strong');
  await expect(distances).toHaveText(['1/8', '1/2', '1/2']);
  await expect(lab.locator('.largest strong')).toHaveText(['1/2', '1/2']);
  const c = lab.getByRole('textbox', { name: 'Point C' });
  await c.fill('-7');
  await c.press('Enter');
  await expect(distances).toHaveText(['1/8', '1/8', '1/16']);
  await c.fill('1');
  await c.press('Enter');
  await expect(distances).toHaveText(['1/8', '0', '1/8']);
  await expect(lab.getByText(/Two names refer to the same point/)).toBeVisible();
  const b = lab.getByRole('textbox', { name: 'Point B' });
  await b.fill('1');
  await b.press('Enter');
  await expect(distances).toHaveText(['0', '0', '0']);
  await expect(lab.getByText(/All three names refer to the same point/)).toBeVisible();
});

test('accepts just one extension at every precision and preserves earlier bits', async ({ page }) => {
  await page.goto('/#fraction');
  const lab = page.locator('[aria-labelledby="fraction-builder-title"]');
  const digits = lab.getByRole('group', { name: 'Choose the next binary digit' });
  const expected = [1, 3, 3, 11, 11, 43, 43, 171];
  let prior = 0;
  for (const [index, value] of expected.entries()) {
    const bit = value === prior ? 0 : 1;
    const candidates = [prior, prior + 2 ** index];
    await expect(digits.locator('.candidate-product')).toHaveText(candidates.map((candidate) => `3 × ${candidate} = ${3 * candidate}`));
    await expect(digits.locator('.fraction-candidate strong')).toHaveText(candidates.map((candidate) => String(3 * candidate % (2 ** (index + 1)))));
    await digits.getByRole('button', { name: new RegExp(`^Bit ${1 - bit}`) }).press('Enter');
    await expect(lab.getByText(/The fixed window stays the same/)).toBeVisible();
    if (index) await expect(lab.getByText(`Accepted remainder ${prior} modulo ${2 ** index}.`)).toBeVisible();
    await digits.getByRole('button', { name: `Bit ${bit} · try ${value}` }).press('Space');
    await expect(lab.getByText(`Accepted remainder ${value} modulo ${2 ** (index + 1)}.`)).toBeVisible();
    await expect(lab.locator('.bit-word .newest-bit')).toHaveText(String(bit));
    expect(value % (2 ** index)).toBe(prior);
    prior = value;
  }
  await expect(lab.getByRole('heading', { name: 'You built the first eight low bits of 1/3.' })).toBeFocused();
  await expect(lab.locator('.fraction-expansion')).toHaveText('…101010112');
  await expect(lab.locator('.fraction-history code')).toHaveText(['1', '11', '011', '1011', '01011', '101011', '0101011', '10101011']);
  await expect(lab.locator('.fraction-history .newest-bit')).toHaveCount(1);
  await expect(lab.locator('annotation')).toHaveText(['3\\cdot 171=513', '513\\equiv 1\\pmod{256}']);
  await lab.getByRole('button', { name: 'Reset builder' }).press('Enter');
  await expect(lab.getByText(/There are no fixed bits yet/)).toBeVisible();
  await expect(lab.getByRole('table', { name: 'Accepted windows' })).toHaveCount(0);
});

test('carry playback cancels on pause, width change, reset and hidden tab', async ({ page }) => {
  await page.goto('/#carrying');
  const carry = page.locator('.carry-example');
  const width = carry.getByRole('combobox', { name: 'Bit width' });
  const play = carry.getByRole('button', { name: 'Play', exact: true });
  await width.selectOption('4');
  await carry.getByRole('button', { name: 'Step carry' }).press('Enter');
  await expect(carry.locator('.carry-arithmetic annotation')).toHaveText(['15+1=16', '14+2=16']);
  await play.click();
  await carry.getByRole('button', { name: 'Pause' }).click();
  await page.waitForTimeout(800);
  await expect(carry.getByText(/1 of 4 bits processed/)).toBeVisible();
  await play.click();
  await width.selectOption('8');
  await page.waitForTimeout(800);
  await expect(carry.getByText(/0 of 8 bits processed/)).toBeVisible();
  await play.click();
  await carry.getByRole('button', { name: 'Reset' }).click();
  await page.waitForTimeout(800);
  await expect(carry.getByText(/0 of 8 bits processed/)).toBeVisible();
  await play.click();
  await page.evaluate(() => {
    Object.defineProperty(document, 'hidden', { configurable: true, value: true });
    document.dispatchEvent(new Event('visibilitychange'));
    Reflect.deleteProperty(document, 'hidden');
  });
  await page.waitForTimeout(800);
  await expect(carry.getByText(/0 of 8 bits processed/)).toBeVisible();
  await width.selectOption('4');
  await play.click();
  await expect(carry.getByText('Carry-out at bit 4')).toBeVisible({ timeout: 7000 });
  await expect(play).toBeDisabled();
  await expect(carry.locator('.carry-arithmetic annotation')).toHaveText(['15+1=16', '16\\equiv 0\\pmod{16}']);
});

test('the eight stages, wide carry and challenge answers fit a narrow reduced-motion viewport', async ({ page }, info) => {
  await page.setViewportSize({ width: 320, height: 800 });
  await page.emulateMedia({ reducedMotion: 'reduce' });
  await page.goto('/#carrying');
  await expect(page.getByRole('navigation', { name: 'Chapters' }).getByRole('link')).toHaveCount(8);
  await page.locator('.carry-example').getByRole('combobox').selectOption('16');
  await page.locator('.carry-example').getByRole('button', { name: 'Step carry' }).press('Space');
  await expect(page.getByText('1 of 16 bits processed.', { exact: false })).toBeVisible();
  const binaryWindow = page.getByRole('region', { name: 'Binary carry window' });
  expect(await binaryWindow.evaluate((element) => {
    element.scrollLeft = element.scrollWidth;
    return element.scrollLeft;
  })).toBeGreaterThan(0);
  await page.locator('#integers summary').first().press('Enter');
  await expect(page.getByText(/At six terms the error/)).toBeVisible();
  const lab = page.locator('[aria-labelledby="fraction-builder-title"]');
  for (const bit of [1, 1, 0, 1, 0, 1, 0, 1]) await lab.getByRole('button', { name: new RegExp(`^Bit ${bit}`) }).press('Space');
  await expect(lab.locator('.fraction-history tbody tr')).toHaveCount(8);
  const ball = page.getByRole('region', { name: 'Can the center move?' });
  await ball.getByRole('button', { name: 'Same members' }).press('Space');
  await ball.getByRole('button', { name: 'Use 9 as center' }).press('Space');
  expect(await ball.locator('.center-marker').evaluate((element) => getComputedStyle(element).transitionDuration)).toBe('0s');
  expect(await page.evaluate(() => document.documentElement.scrollWidth)).toBe(320);
  expect((await new AxeBuilder({ page }).withTags(['wcag2a', 'wcag2aa', 'wcag21aa']).analyze()).violations).toEqual([]);
  const words = await page.locator('article .prose p:not(.source-note):not(.eyebrow)').evaluateAll((paragraphs) =>
    paragraphs.filter((paragraph) => !paragraph.closest('details,.carry-example')).flatMap((paragraph) => (paragraph.textContent ?? '').trim().split(/\s+/)).length);
  await info.attach('main-exposition-word-count', { body: String(words), contentType: 'text/plain' });
  expect(words).toBeGreaterThan(1950);
  expect(words).toBeLessThan(2550);
});

test('captures the geometry and fraction labs at desktop width', async ({ page }, info) => {
  await page.goto('/#geometry');
  await page.evaluate(() => document.fonts.ready);
  await page.getByRole('region', { name: 'Which pair splits first?' }).screenshot({ path: info.outputPath('geometry.png') });
  const fraction = page.getByRole('region', { name: 'Choose the next bit of 1/3' });
  for (const bit of [1, 1, 0, 1]) await fraction.getByRole('button', { name: new RegExp(`^Bit ${bit}`) }).click();
  await fraction.screenshot({ path: info.outputPath('fraction.png') });
  const ball = page.getByRole('region', { name: 'Can the center move?' });
  await ball.getByRole('button', { name: 'Same members' }).click();
  await ball.getByRole('button', { name: 'Use 9 as center' }).click();
  await ball.screenshot({ path: info.outputPath('recenter.png'), animations: 'disabled' });
  await page.getByRole('group', { name: 'Nested and disjoint subtrees' }).screenshot({ path: info.outputPath('ball-relationships.png') });
  const builder = page.locator('[aria-labelledby="fraction-builder-title"]');
  for (const bit of [0, 1, 0, 1]) await builder.getByRole('button', { name: new RegExp(`^Bit ${bit}`) }).click();
  await builder.screenshot({ path: info.outputPath('fraction-complete.png') });
});
