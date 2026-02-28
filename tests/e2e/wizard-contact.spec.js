import { test, expect } from '@playwright/test';

test.beforeEach(async ({ page }) => {
  await page.addInitScript(() => {
    localStorage.clear();
  });
});

test('wizard flow completes and contact popup opens', async ({ page }) => {
  await page.goto('/');

  await expect(page.locator('.wizard-step[data-step="0"]')).toBeVisible({ timeout: 10000 });

  await page.locator('[data-wizard-lang="en"]').click();
  await page.locator('#wizardNext').click();

  await page.locator('#wizardDateTrigger').click();
  await page.locator('#wizardDateToday').click();
  await page.locator('#wizardTimeTrigger').click();
  await page.locator('#wizardTimePanel button[data-time-value="08:30"]').click();
  await expect(page.locator('#wizardNext')).toBeEnabled();
  await page.locator('#wizardNext').click();

  await page.locator('[data-wizard-medication="plenvu"]').click();
  await page.locator('#wizardNext').click();

  await page.locator('[data-wizard-constipation="false"]').click();
  await page.locator('#wizardNext').click();

  await expect(page.locator('.wizard-step[data-step="4"] .wizard-step-subtitle')).toContainText('Anticoagulants');
  await expect(page.locator('.wizard-step[data-step="4"] .wizard-step-subtitle')).toContainText('Antiplatelets');
  await page.locator('[data-wizard-anticoagulation="false"]').click();
  await page.locator('#wizardNext').click();

  await page.locator('[data-wizard-iron="false"]').click();
  await page.locator('#wizardNext').click();

  await expect(page.locator('#wizardOverlay')).toBeHidden();

  await page.locator('#contactTeamBtn').click();
  await expect(page.locator('#videoModal')).toHaveClass(/is-open/);
  await expect(page.locator('#contactTeamForm')).toBeVisible();

  await page.locator('#contactTeamForm input[name="email"]').fill('user@example.com');
  await page.locator('#contactTeamForm textarea[name="issue"]').fill('Need help with preparation timings');

  await page.locator('#videoModal .modal-close').click();
  await expect(page.locator('#videoModal')).not.toHaveClass(/is-open/);
});
