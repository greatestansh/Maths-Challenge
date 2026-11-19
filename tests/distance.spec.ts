import AxeBuilder from '@axe-core/playwright';
import { expect, test, type Page } from '@playwright/test';

const distance = (page: Page) => page.getByRole('region', { name: 'Measure closeness two ways' });
const ordinary = (page: Page) => distance(page).getByRole('region', { name: 'Ordinary distance' });
const twoAdic = (page: Page) => distance(page).getByRole('region', { name: '2-adic distance' });

test('shows exact distances, signed factors, the ranking reversal, and ties', async ({ page }) => {
  await page.goto('/#distance');
  const lab = distance(page);
  await expect(ordinary(page).locator('.measurement-value strong')).toHaveText(['8']);
  await expect(ordinary(page).locator('.ruler-labels span')).toHaveText(['0', '4', '8']);
  await expect(twoAdic(page).locator('.measurement-value strong')).toHaveText(['1/8']);
  await expect(twoAdic(page).locator('.matched')).toHaveCount(6);
  await expect(lab.locator('.difference-ledger annotation')).toHaveText(['a-b=-8=2^{3}\\cdot(-1)', 'v_2(a-b)=3']);

  const toggle = lab.getByRole('checkbox', { name: 'Compare a second neighbor' });
  await toggle.focus();
  await toggle.press('Space');
  await expect(ordinary(page).locator('.measurement-value strong')).toHaveText(['8', '1']);
  await expect(twoAdic(page).locator('.measurement-value strong')).toHaveText(['1/8', '1']);
  await expect(ordinary(page).getByText('C (2) is the closer neighbor.')).toBeVisible();
  await expect(twoAdic(page).getByText('B (9) is the closer neighbor.')).toBeVisible();
  const candidate = lab.getByRole('textbox', { name: 'Neighbor C' });
  await toggle.press('Tab');
  await expect(candidate).toBeFocused();
  await candidate.fill('−7');
  await candidate.press('Tab');
  await expect(candidate).toHaveValue('-7');
  await expect(ordinary(page).getByText('Both neighbors are equally close.')).toBeVisible();
  await expect(twoAdic(page).getByText('Both neighbors are equally close.')).toBeVisible();
});

test('commits every preset and keeps the last valid comparison during invalid edits', async ({ page }) => {
  await page.goto('/#distance');
  const lab = distance(page);
  await lab.getByText('Example pairs', { exact: true }).click();
  for (const [preset, usual, adic] of [
    ['1 and 9', '8', '1/8'], ['1 and 2', '1', '1'], ['1 and 1025', '1024', '1/1024'],
    ['0 and 1024', '1024', '1/1024'], ['7 and 7', '0', '0'],
  ]) {
    await lab.getByRole('button', { name: preset, exact: true }).click();
    await expect(ordinary(page).locator('.measurement-value strong')).toHaveText([usual]);
    await expect(twoAdic(page).locator('.measurement-value strong')).toHaveText([adic]);
    if (adic === '1/1024') await expect(twoAdic(page).getByText('10 shared low bits. All 8 shown match.')).toBeVisible();
  }
  await expect(lab.locator('.difference-ledger annotation')).toHaveText(['a-b=0', 'v_2(a-b)=\\infty']);
  const neighbor = lab.getByRole('textbox', { name: 'Neighbor B' });
  for (const invalid of ['', '-', '1.5', '1e6', '1000001']) {
    await neighbor.fill(invalid);
    await neighbor.press('Enter');
    await expect(neighbor).toHaveAttribute('aria-invalid', 'true');
    await expect(lab.getByText(/Showing 7\./)).toBeVisible();
    await expect(twoAdic(page).locator('.measurement-value strong')).toHaveText(['0']);
  }
  const anchor = lab.getByRole('textbox', { name: 'Anchor A' });
  await anchor.fill('-1000000');
  await anchor.press('Enter');
  await neighbor.fill('+1000000');
  await neighbor.press('Enter');
  await expect(ordinary(page).locator('.measurement-value strong')).toHaveText(['2000000']);
  await lab.getByRole('button', { name: 'Reset comparison' }).click();
  await expect(neighbor).toHaveValue('9');
  await expect(twoAdic(page).locator('.measurement-value strong')).toHaveText(['1/8']);
});

test('steps through factorization, resets on a change, and handles zero without a division', async ({ page }) => {
  await page.goto('/#distance');
  const lab = distance(page);
  await lab.getByText('Factor a number', { exact: true }).click();
  const steps = lab.getByRole('group', { name: 'Factorization steps' });
  const step = steps.getByRole('button', { name: 'Step', exact: true });
  const quotients = lab.locator('.quotient-list li > span:last-child');
  await step.press('Space');
  await expect(quotients).toHaveText(['8', '4']);
  await lab.getByRole('textbox', { name: 'Neighbor B' }).fill('13');
  await lab.getByRole('textbox', { name: 'Neighbor B' }).press('Enter');
  await expect(quotients).toHaveText(['12']);
  await expect(lab.getByText('Divide the magnitude 12. Keep the negative sign on the odd factor.')).toBeVisible();
  await steps.getByRole('button', { name: 'Reveal all' }).click();
  await expect(quotients).toHaveText(['12', '6', '3']);
  await expect(lab.locator('.quotient-status annotation').first()).toHaveText('-12=2^{2}\\cdot(-3)');

  await lab.getByRole('button', { name: 'Try an integer' }).click();
  await step.click();
  await step.click();
  await step.click();
  await expect(quotients).toHaveText(['1000', '500', '250', '125']);
  await expect(step).toBeDisabled();
  await steps.getByRole('button', { name: 'Reset steps' }).click();
  await expect(quotients).toHaveText(['1000']);
  const examples = lab.getByRole('group', { name: 'Factorization examples' });
  await examples.getByRole('button', { name: '−12', exact: true }).click();
  await expect(quotients).toHaveText(['12']);
  await examples.getByRole('button', { name: '0', exact: true }).click();
  await expect(quotients).toHaveCount(0);
  await expect(step).toBeDisabled();
  await expect(lab.locator('.zero-valuation annotation')).toHaveText('v_2(0)=\\infty,\\quad |0|_2=0');
  await expect(lab.locator('.zero-valuation math')).toContainText('∞');
  await examples.getByRole('button', { name: 'Random integer' }).click();
  const random = BigInt(await lab.getByRole('textbox', { name: 'Integer to factor' }).inputValue());
  expect(random !== 0n && random >= -1000n && random <= 1000n).toBe(true);
});

test('keeps the prediction keyboard-operable with exact feedback', async ({ page }) => {
  await page.goto('/#distance');
  const lab = distance(page);
  const summary = lab.getByText('Make a prediction', { exact: true });
  await summary.focus();
  await summary.press('Enter');
  const questions = lab.getByRole('group', { name: 'Which has the smaller 2-adic norm, 48 or 80?' });
  await questions.getByRole('button', { name: '48' }).press('Space');
  await expect(lab.locator('.prediction-feedback annotation')).toHaveText(['|48|_2=\\frac{1}{16}', '|80|_2=\\frac{1}{16}']);
  const equal = questions.getByRole('button', { name: 'Equal' });
  await equal.press('Space');
  await expect(equal).toHaveAttribute('aria-pressed', 'true');
  await expect(lab.getByText(/^Yes\. The norms are equal\./)).toBeVisible();
});

test('fits 320 px with large values, all controls open, and reduced motion', async ({ page }) => {
  await page.setViewportSize({ width: 320, height: 800 });
  await page.emulateMedia({ reducedMotion: 'reduce' });
  const errors: string[] = [];
  page.on('pageerror', (error) => errors.push(error.message));
  await page.goto('/#distance');
  const lab = distance(page);
  await lab.getByRole('checkbox', { name: 'Compare a second neighbor' }).check();
  for (const [name, value] of [['Anchor A', '-1000000'], ['Neighbor B', '1000000']]) {
    const input = lab.getByRole('textbox', { name });
    await input.fill(value);
    await input.press('Enter');
  }
  await lab.getByText('Factor a number', { exact: true }).click();
  await lab.getByRole('button', { name: 'Reveal all' }).click();
  await lab.getByText('Make a prediction', { exact: true }).click();
  await lab.getByRole('button', { name: 'Equal' }).click();
  expect(await page.evaluate(() => document.documentElement.scrollWidth)).toBe(320);
  expect((await new AxeBuilder({ page }).include('#distance').withTags(['wcag2a', 'wcag2aa', 'wcag21aa']).analyze()).violations).toEqual([]);
  expect(errors).toEqual([]);
});

for (const width of [375, 1440]) {
  test(`captures the distance lab at ${width} px`, async ({ page }, info) => {
    await page.setViewportSize({ width, height: 960 });
    await page.goto('/#distance');
    await page.evaluate(() => document.fonts.ready);
    const lab = distance(page);
    await lab.getByRole('checkbox', { name: 'Compare a second neighbor' }).check();
    if (width === 1440) {
      await lab.getByText('Factor a number', { exact: true }).click();
      await lab.getByRole('button', { name: 'Try an integer' }).click();
      await lab.getByRole('button', { name: 'Reveal all' }).click();
    }
    expect(await page.evaluate(() => document.documentElement.scrollWidth)).toBe(width);
    await lab.screenshot({ path: info.outputPath('distance.png') });
  });
}
