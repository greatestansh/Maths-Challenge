import AxeBuilder from '@axe-core/playwright';
import { expect, test, type Page } from '@playwright/test';

const bridge = (page: Page) => page.getByRole('region', { name: 'Start with the bits on the right' });
const guide = (page: Page) => page.getByRole('region', { name: 'Build the tree one digit at a time' });
const finalLab = (page: Page) => page.getByRole('region', { name: 'Watch the same sum move two ways' });

test('connects shared low bits, equal remainders and divisibility across four checks', async ({ page }) => {
  await page.goto('/#distance');
  const lab = bridge(page);
  await expect(lab.locator('.low-bit-words .visually-hidden')).toHaveText(['1 in binary 0 0 0 1', '9 in binary 1 0 0 1']);
  await expect(lab.getByText('Shared suffix 001')).toBeVisible();
  await expect(lab.locator('.matching-bit')).toHaveCount(6);
  const back = lab.getByRole('button', { name: 'Back' });
  const next = lab.getByRole('button', { name: 'Next' });
  await expect(back).toBeDisabled();
  for (const modulus of [2, 4, 8]) {
    await expect(lab.getByText(`Both leave remainder 1 on division by ${modulus}.`)).toBeVisible();
    await expect(lab.getByText(`${modulus} divides the difference 8.`)).toBeVisible();
    await next.press('Enter');
  }
  await expect(lab.getByText('They leave remainders 1 and 9 on division by 16.')).toBeVisible();
  await expect(lab.locator('.inspected-bit:not(.matching-bit)')).toHaveCount(2);
  await expect(next).toBeDisabled();
  await back.press('Space');
  await expect(lab.getByText('Both leave remainder 1 on division by 8.')).toBeVisible();
});

test('reveals tree levels in order and keeps the explorer state when returning to the guide', async ({ page }) => {
  await page.goto('/#tree');
  const walkthrough = guide(page);
  const nodes = walkthrough.locator('.tree-node');
  const next = walkthrough.getByRole('button', { name: 'Next' });
  const back = walkthrough.getByRole('button', { name: 'Back' });
  await expect(nodes).toHaveCount(1);
  await expect(back).toBeDisabled();
  await next.press('Enter');
  await expect(walkthrough.getByRole('heading', { name: 'Split into even and odd' })).toBeVisible();
  await expect(walkthrough.locator('.branch-bit')).toHaveText(['0', '1']);
  await next.press('Space');
  await expect(nodes).toHaveCount(7);
  await expect(walkthrough.locator('.level-label').last()).toHaveText('mod 4');
  await next.press('Enter');
  await expect(nodes).toHaveCount(15);
  await expect(walkthrough.locator('.level-label').last()).toHaveText('mod 8');
  await expect(next).toBeDisabled();
  await back.press('Enter');
  await expect(nodes).toHaveCount(7);

  const explore = walkthrough.getByRole('button', { name: 'Explore freely' });
  await explore.press('Enter');
  const explorer = page.getByRole('region', { name: 'Compare paths through the tree' });
  await expect(explorer.getByRole('heading', { name: 'Compare paths through the tree' })).toBeFocused();
  await expect(explorer.getByText('What these paths tell us')).toBeVisible();
  const depth = explorer.getByRole('combobox', { name: 'Depth' });
  await depth.selectOption('2');
  await explorer.getByRole('button', { name: 'Return to guide' }).press('Enter');
  await expect(explore).toBeFocused();
  await expect(nodes).toHaveCount(7);
  await explore.press('Enter');
  await expect(depth).toHaveValue('2');
});

test('keeps both exact errors, the fixed chart and the low-bit window synchronized', async ({ page }) => {
  await page.goto('/#limit');
  const lab = finalLab(page);
  const slider = lab.getByRole('slider', { name: 'Number of terms' });
  const precision = lab.getByRole('combobox', { name: 'Precision k' });
  const ordinaryMarker = lab.locator('.ordinary-marker');
  const adicMarker = lab.locator('.adic-marker');
  const initialOrdinaryHeight = Number(await ordinaryMarker.getAttribute('y'));
  const initialAdicHeight = Number(await adicMarker.getAttribute('cy'));
  const fixedChartLines = lab.locator('.chart-gridline, .error-line');
  const fixedAxes = await fixedChartLines.evaluateAll((lines) => lines.map((line) => line.outerHTML));
  for (let index = 0; index < 4; index++) await slider.press('ArrowRight');
  await expect(lab.locator('.convergence-sum annotation')).toHaveText('S_{5}=2^{5}-1=31');
  await expect(lab.locator('.convergence-binary code')).toHaveText('11111');
  await expect(lab.locator('.convergence-numbers .tone-b')).toHaveText('32');
  await expect(lab.locator('.convergence-numbers .tone-a')).toHaveText('1/32');
  await expect(lab.locator('.convergence-path .matching-bit')).toHaveCount(10);
  await expect(lab.getByText('All 5 chosen low bits agree. Every subsequent sum keeps that agreement.')).toBeVisible();
  expect(Number(await ordinaryMarker.getAttribute('y'))).toBeLessThan(initialOrdinaryHeight);
  expect(Number(await adicMarker.getAttribute('cy'))).toBeGreaterThan(initialAdicHeight);
  expect(await fixedChartLines.evaluateAll((lines) => lines.map((line) => line.outerHTML))).toEqual(fixedAxes);
  await precision.selectOption('8');
  await expect(lab.getByText('The rightmost 5 bits agree. The full window agrees once the sum has 8 terms.')).toBeVisible();
  await expect(lab.locator('.convergence-path .visually-hidden')).toHaveText(['S5 low bits 0 0 0 1 1 1 1 1', '−1 low bits 1 1 1 1 1 1 1 1']);
  await slider.press('End');
  await expect(lab.locator('.convergence-numbers .tone-a')).toHaveText('1/1048576');
  await expect(lab.locator('.convergence-numbers .tone-b')).toHaveText('1048576');
  await expect(lab.getByText('All 8 chosen low bits agree. Every subsequent sum keeps that agreement.')).toBeVisible();
  await expect(page.getByRole('region', { name: 'Try a partial sum' }).getByRole('slider')).toHaveValue('20');
});

test('stops convergence playback at the last term and cancels on reset, precision changes and hidden tabs', async ({ page }) => {
  await page.goto('/#limit');
  const lab = finalLab(page);
  const slider = lab.getByRole('slider');
  const play = lab.getByRole('button', { name: 'Play' });
  const step = lab.getByRole('button', { name: 'Step' });
  const pause = lab.getByRole('button', { name: 'Pause' });
  await slider.press('End');
  await slider.press('ArrowLeft');
  await play.press('Enter');
  await expect(slider).toHaveValue('20');
  await expect(play).toBeDisabled();
  await expect(step).toBeDisabled();
  const precision = lab.getByRole('combobox', { name: 'Precision k' });
  await precision.selectOption('8');
  await lab.getByRole('button', { name: 'Reset' }).press('Enter');
  await expect(precision).toHaveValue('5');
  await expect(slider).toHaveValue('1');
  await step.press('Space');
  await expect(slider).toHaveValue('2');
  await play.click();
  await pause.click();
  await page.waitForTimeout(825);
  await expect(slider).toHaveValue('2');
  await play.click();
  await precision.selectOption('8');
  await page.waitForTimeout(825);
  await expect(slider).toHaveValue('2');
  await play.click();
  await lab.getByRole('button', { name: 'Reset' }).click();
  await page.waitForTimeout(825);
  await expect(slider).toHaveValue('1');
  await expect(precision).toHaveValue('5');
  await play.click();
  await page.evaluate(() => {
    Object.defineProperty(document, 'hidden', { configurable: true, value: true });
    document.dispatchEvent(new Event('visibilitychange'));
    Object.defineProperty(document, 'hidden', { configurable: true, value: false });
    document.dispatchEvent(new Event('visibilitychange'));
  });
  await expect(play).toBeEnabled();
  await page.waitForTimeout(825);
  await expect(slider).toHaveValue('1');
});

test('shows an explicit finite carry and separate congruence in the main reading path', async ({ page }) => {
  await page.goto('/#limit');
  await expect(page.getByRole('heading', { name: 'Why −1 has an all-ones expansion' })).toBeVisible();
  const carry = page.locator('.carry-example');
  for (let index = 0; index < 8; index++) await carry.getByRole('button', { name: 'Step carry' }).click();
  await expect(carry.locator('.carry-out annotation')).toHaveText('1\\cdot 2^{8}=256');
  await expect(carry.locator('.carry-arithmetic annotation')).toHaveText(['255+1=256', '256\\equiv 0\\pmod{256}']);
  await expect(carry.locator('.carry-words .visually-hidden').last()).toHaveText('Result low bits 0 0 0 0 0 0 0 0');
  await expect(page.getByText('The partial sums diverge in ordinary distance and converge to −1 in 2-adic distance.')).toBeVisible();
});

test('fits all three new lessons at 320 px with reduced motion and keyboard input', async ({ page }) => {
  await page.setViewportSize({ width: 320, height: 800 });
  await page.emulateMedia({ reducedMotion: 'reduce' });
  const errors: string[] = [];
  page.on('pageerror', (error) => errors.push(error.message));
  page.on('console', (message) => { if (message.type() === 'error') errors.push(message.text()); });
  await page.goto('/#distance');
  await bridge(page).getByRole('button', { name: 'Next' }).press('Enter');
  for (let index = 0; index < 3; index++) await guide(page).getByRole('button', { name: 'Next' }).press('Enter');
  const lab = finalLab(page);
  await lab.getByRole('combobox', { name: 'Precision k' }).selectOption('8');
  await lab.getByRole('slider').press('End');
  await expect(lab.locator('.convergence-binary code')).toHaveText('11111111111111111111');
  expect(await page.evaluate(() => document.documentElement.scrollWidth)).toBe(320);
  expect((await new AxeBuilder({ page }).withTags(['wcag2a', 'wcag2aa', 'wcag21aa']).analyze()).violations).toEqual([]);
  expect(errors).toEqual([]);
});

for (const width of [375, 1440]) {
  test(`captures the guided and final figures at ${width} px`, async ({ page }, info) => {
    await page.setViewportSize({ width, height: 960 });
    await page.goto('/#distance');
    await page.evaluate(() => document.fonts.ready);
    for (let index = 0; index < 3; index++) await bridge(page).getByRole('button', { name: 'Next' }).click();
    await bridge(page).screenshot({ path: info.outputPath('bridge.png') });
    for (let index = 0; index < 3; index++) await guide(page).getByRole('button', { name: 'Next' }).click();
    await guide(page).screenshot({ path: info.outputPath('guide.png') });
    const lab = finalLab(page);
    for (let index = 0; index < 4; index++) await lab.getByRole('button', { name: 'Step' }).click();
    await lab.screenshot({ path: info.outputPath('convergence.png') });
    const carry = page.locator('.carry-example');
    for (let index = 0; index < 8; index++) await carry.getByRole('button', { name: 'Step carry' }).click();
    await carry.screenshot({ path: info.outputPath('carry.png') });
  });
}
