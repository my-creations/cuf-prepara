import { test, expect } from '@playwright/test';

test.beforeEach(async ({ page }) => {
  await page.addInitScript(() => {
    localStorage.clear();
  });
});

const completeWizard = async (
  page,
  {
    language = 'en',
    medication = 'plenvu',
    isConstipated = false,
    takesAnticoagulation = false,
    takesIronMedication = false,
    time = '08:30',
  } = {}
) => {
  await expect(page.locator('.wizard-step[data-step="0"]')).toBeVisible({ timeout: 10000 });

  await page.locator(`[data-wizard-lang="${language}"]`).click();
  await page.locator('#wizardNext').click();

  await page.locator('#wizardDateTrigger').click();
  await page.locator('#wizardDateToday').click();
  await page.locator('#wizardTimeTrigger').click();
  await page.locator(`#wizardTimePanel button[data-time-value="${time}"]`).click();
  await expect(page.locator('#wizardNext')).toBeEnabled();
  await page.locator('#wizardNext').click();

  await page.locator(`[data-wizard-medication="${medication}"]`).click();
  await page.locator('#wizardNext').click();

  await page.locator(`[data-wizard-constipation="${isConstipated}"]`).click();
  await page.locator('#wizardNext').click();

  await page.locator(`[data-wizard-anticoagulation="${takesAnticoagulation}"]`).click();
  await page.locator('#wizardNext').click();

  await page.locator(`[data-wizard-iron="${takesIronMedication}"]`).click();
  await page.locator('#wizardNext').click();

  await expect(page.locator('#wizardOverlay')).toBeHidden();
};

test('wizard flow completes and contact popup opens', async ({ page }) => {
  await page.goto('/');

  await completeWizard(page, {
    language: 'en',
    medication: 'plenvu',
    isConstipated: false,
    takesAnticoagulation: false,
    takesIronMedication: false,
    time: '08:30',
  });

  await page.locator('#contactTeamBtn').click();
  await expect(page.locator('#videoModal')).toHaveClass(/is-open/);
  await expect(page.locator('#contactTeamForm')).toBeVisible();

  await page.locator('#contactTeamForm input[name="email"]').fill('user@example.com');
  await page.locator('#contactTeamForm textarea[name="issue"]').fill('Need help with preparation timings');

  await page.locator('#videoModal .modal-close').click();
  await expect(page.locator('#videoModal')).not.toHaveClass(/is-open/);
});

test('wizard with constipation and safety meds shows extra rows and downloads ICS', async ({ page }) => {
  await page.goto('/');

  await completeWizard(page, {
    language: 'pt',
    medication: 'citrafleet',
    isConstipated: true,
    takesAnticoagulation: true,
    takesIronMedication: true,
    time: '09:00',
  });

  await expect(page.locator('#heroDulcolaxRow48')).toHaveClass(/is-visible/);
  await expect(page.locator('#heroDulcolaxRow24')).toHaveClass(/is-visible/);
  await expect(page.locator('#heroAnticoagWarningRow')).toHaveClass(/is-visible/);
  await expect(page.locator('#heroIronRow')).toHaveClass(/is-visible/);
  await expect(page.locator('#heroIronValue')).not.toHaveText('--');

  const [download] = await Promise.all([
    page.waitForEvent('download'),
    page.locator('#downloadIcs').click(),
  ]);
  expect(download.suggestedFilename()).toMatch(/\.ics$/);
});

test('wizard completion persists after page reload', async ({ page }) => {
  await page.goto('/');

  await completeWizard(page, {
    language: 'en',
    medication: 'moviprep',
    isConstipated: false,
    takesAnticoagulation: false,
    takesIronMedication: false,
    time: '10:00',
  });

  await page.reload();

  await expect(page.locator('#wizardOverlay')).toBeHidden();
  await expect(page.locator('#contactTeamBtn')).toContainText('Contact the team');
  await expect(page.locator('#heroMedsLabel')).toContainText('Taking Moviprep');
});
