import AxeBuilder from '@axe-core/playwright';
import { expect, test, type Page } from '@playwright/test';

const tree = (page: Page) => page.getByRole('region', { name: 'Compare paths through the tree' });

async function openTree(page: Page) {
  await page.getByRole('button', { name: 'Explore freely' }).click();
  return tree(page);
}

test('compares visible and hidden splits, zero, and draft input', async ({ page }) => {
  await page.goto('/#tree');
  const lab = await openTree(page);
  const readout = lab.locator('.tree-readout');
  await expect(readout).toContainText('Last shared depth 3. First different nodes at depth 4.');
  await expect(readout.locator('[data-distance]')).toHaveAttribute('data-distance', '1/8');
  await lab.getByRole('combobox', { name: 'Depth', exact: true }).selectOption('2');
  await expect(readout).toContainText('Same class at this resolution. Visible bound');
  await expect(readout.locator('math').last().locator('mfrac > mn')).toHaveText(['1', '4']);
  await expect(readout.locator('[data-distance]')).toHaveAttribute('data-distance', '1/8');
  const field = lab.getByRole('textbox', { name: 'Integer B' });
  await field.fill('-');
  await field.press('Enter');
  await expect(field).toHaveAttribute('aria-invalid', 'true');
  await expect(lab.getByText('Enter a signed whole number. Showing 9.')).toBeVisible();
  await expect(readout.locator('[data-distance]')).toHaveAttribute('data-distance', '1/8');
  await field.fill('1000001');
  await field.press('Enter');
  await expect(lab.getByText('Use an integer from −1,000,000 to 1,000,000. Showing 9.')).toBeVisible();
  await field.fill('1025');
  await field.press('Enter');
  await lab.getByRole('combobox', { name: 'Depth', exact: true }).selectOption('7');
  await expect(readout).toContainText('First different nodes at depth 11.');
  await expect(readout.locator('[data-distance]')).toHaveAttribute('data-distance', '1/1024');
  await expect(lab.getByText(/Diamonds group sibling subtrees/)).toBeVisible();
  await lab.getByRole('button', { name: 'Full tree' }).click();
  await expect(lab.locator('.tree-node')).toHaveCount(255);
  await expect(lab.locator('.tree-edge')).toHaveCount(254);
  const scrollArea = lab.locator('.diagram-scroll');
  const rootPosition = await scrollArea.evaluate((element) => element.scrollLeft);
  expect(rootPosition).toBeGreaterThan(0);
  await lab.getByRole('button', { name: 'Center path A' }).click();
  expect(await scrollArea.evaluate((element) => element.scrollLeft)).toBeGreaterThan(rootPosition);
  await field.fill('1');
  await field.press('Enter');
  await lab.getByRole('combobox', { name: 'Depth', exact: true }).selectOption('1');
  await expect(readout.locator('[data-distance]')).toHaveAttribute('data-distance', '0');
  await expect(readout).toContainText('Identical paths at every depth.');
  await lab.getByRole('button', { name: 'Reset tree' }).click();
  await expect(field).toHaveValue('9');
  await expect(lab.getByRole('combobox', { name: 'Depth', exact: true })).toHaveValue('4');
});

test('uses bit-reversal layout, preserves SVG focus, and recenters a closed ball', async ({ page }) => {
  await page.goto('/#tree');
  const lab = await openTree(page);
  await lab.getByRole('combobox', { name: 'Depth', exact: true }).selectOption('3');
  await expect(lab.locator('.tree-node').allTextContents()).resolves.toEqual([
    'ℤ₂', '0', '1', '0', '2', '1', '3', '0', '4', '2', '6', '1', '5', '3', '7',
  ]);
  await lab.getByRole('button', { name: 'Select ball', exact: true }).click();
  const examples = lab.getByText('−15, −7, 1, 9, 17, 25, 33, 41');
  await expect(examples).toBeVisible();
  const membership = await lab.locator('.tree-node.tone-shared').allTextContents();
  await lab.getByRole('button', { name: 'Use 9 as center' }).click();
  await expect(lab.getByText('Center 9', { exact: true })).toBeVisible();
  await expect(examples).toBeVisible();
  expect(await lab.locator('.tree-node.tone-shared').allTextContents()).toEqual(membership);
  await lab.getByRole('button', { name: 'Depth 0, 0 modulo 1' }).focus();
  await page.keyboard.press('ArrowRight');
  const child = lab.getByRole('button', { name: 'Depth 1, 0 modulo 2' });
  await expect(child).toBeFocused();
  await page.keyboard.press('Enter');
  await expect(child).toHaveAttribute('aria-pressed', 'true');
  await expect(child).toBeFocused();
});

test('traces negative residues and shares the term across the two experiments', async ({ page }) => {
  await page.goto('/');
  const lab = await openTree(page);
  await lab.getByRole('button', { name: 'Trace', exact: true }).click();
  await lab.getByRole('combobox', { name: 'Depth', exact: true }).selectOption('7');
  await expect(lab.getByText('−1 takes the 1 branch at every depth.')).toBeVisible();
  const traceRows = lab.locator('tbody tr');
  await expect(traceRows.last().getByRole('cell').nth(1)).toHaveText('127');
  await expect(traceRows.last().getByRole('cell').nth(2)).toHaveText('1');
  const opening = page.getByRole('region', { name: 'Try a partial sum' });
  const slider = opening.getByRole('slider');
  await slider.press('Home');
  for (let index = 0; index < 4; index++) await slider.press('ArrowRight');
  await opening.getByRole('button', { name: 'Reveal answer' }).click();
  await expect(opening.locator('#sum-reveal math')).toContainText('32');
  await lab.getByRole('button', { name: 'Convergence', exact: true }).click();
  await lab.getByRole('combobox', { name: 'Depth', exact: true }).selectOption('6');
  await expect(lab.getByRole('slider')).toHaveValue('5');
  await expect(lab.locator('tbody tr').nth(5)).toContainText('3131Same');
  await expect(lab.locator('tbody tr').nth(6)).toContainText('3163Different');
  await expect(lab.locator('[data-distance]')).toHaveAttribute('data-distance', '1/32');
  await lab.getByRole('slider').press('End');
  await expect(slider).toHaveValue('20');
  await expect(lab.locator('[data-distance]')).toHaveAttribute('data-distance', '1/1048576');
  await expect(lab.getByText(/First different nodes at depth 21/)).toBeVisible();
});

test('opening playback pauses and cancels a timer on reset and when scrolled away', async ({ page }) => {
  await page.goto('/#sums');
  const opening = page.getByRole('region', { name: 'Try a partial sum' });
  const slider = opening.getByRole('slider');
  await opening.getByRole('button', { name: 'Play' }).click();
  await expect(slider).toHaveValue('2');
  await opening.getByRole('button', { name: 'Pause' }).click();
  await page.waitForTimeout(800);
  await expect(slider).toHaveValue('2');
  await opening.getByRole('button', { name: 'Play' }).click();
  await opening.getByRole('button', { name: 'Reset' }).click();
  await page.waitForTimeout(800);
  await expect(slider).toHaveValue('1');
  await opening.getByRole('button', { name: 'Play' }).click();
  await page.locator('#tree').scrollIntoViewIfNeeded();
  await expect(opening.getByRole('button', { name: 'Play' })).toBeAttached();
  await page.waitForTimeout(800);
  await expect(slider).toHaveValue('1');
});

test('mobile keeps native selection, local scrolling, visible focus, and accessible names', async ({ page }) => {
  await page.setViewportSize({ width: 320, height: 800 });
  await page.emulateMedia({ reducedMotion: 'reduce' });
  const errors: string[] = [];
  page.on('pageerror', (error) => errors.push(error.message));
  page.on('console', (message) => { if (message.type() === 'error') errors.push(message.text()); });
  await page.goto('/#tree');
  const lab = await openTree(page);
  await expect(lab.getByRole('table')).toBeVisible();
  await expect(lab.locator('.tree-diagram')).toBeHidden();
  await lab.getByRole('button', { name: 'Select ball' }).click();
  const residue = lab.getByRole('button', { name: '9 modulo 16 from path B' });
  await expect(residue.evaluate((element) => element.getBoundingClientRect().height)).resolves.toBeGreaterThanOrEqual(44);
  await residue.focus();
  await page.keyboard.press('Space');
  await expect(residue).toBeFocused();
  await expect(lab.getByText('9 mod 16', { exact: true })).toBeVisible();
  await lab.getByRole('button', { name: 'Show diagram' }).click();
  await lab.getByRole('combobox', { name: 'Depth', exact: true }).selectOption('7');
  await lab.getByRole('button', { name: 'Full tree' }).click();
  expect(await page.evaluate(() => document.documentElement.scrollWidth)).toBe(320);
  expect(await lab.locator('.diagram-scroll').evaluate((element) => element.scrollWidth > element.clientWidth)).toBe(true);
  expect((await new AxeBuilder({ page }).withTags(['wcag2a', 'wcag2aa', 'wcag21aa']).analyze()).violations).toEqual([]);
  expect(errors).toEqual([]);
});

test('keeps a readable proof with JavaScript disabled', async ({ browser }) => {
  const context = await browser.newContext({ javaScriptEnabled: false });
  const page = await context.newPage();
  await page.goto('http://127.0.0.1:4179');
  await expect(page.getByRole('heading', { name: 'How can a growing sum approach −1?' })).toBeVisible();
  await expect(page.getByText(/This proves convergence to −1 in the 2-adic metric/)).toBeVisible();
  await context.close();
});

test('keeps the article and tree controls usable with text enlarged to 200%', async ({ page }) => {
  await page.goto('/#tree');
  await page.addStyleTag({ content: 'html { font-size: 200%; }' });
  const lab = await openTree(page);
  await lab.getByRole('button', { name: 'Select ball' }).click();
  await expect(lab.getByRole('button', { name: 'Use 9 as center' })).toBeVisible();
  expect(await page.evaluate(() => document.documentElement.scrollWidth)).toBe(1440);
});

for (const width of [375, 768, 1280, 1440]) {
  test(`captures opening and tree at ${width} px`, async ({ page }, info) => {
    await page.setViewportSize({ width, height: 960 });
    await page.goto('/');
    await page.evaluate(() => document.fonts.ready);
    expect(await page.evaluate(() => document.documentElement.scrollWidth)).toBe(width);
    await page.screenshot({ path: info.outputPath('opening.png') });
    await (await openTree(page)).screenshot({ path: info.outputPath('tree.png') });
  });
}
