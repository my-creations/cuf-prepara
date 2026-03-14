import { test, expect } from "./fixtures.js";

test("wizard flow completes and contact popup opens", async ({
  wizardPage,
  preparationPage,
  contactTeamModal,
}) => {
  await wizardPage.goto();

  await expect(wizardPage.step("language")).toBeVisible({ timeout: 10000 });

  await wizardPage.selectLanguage("en");
  await wizardPage.continue();

  await wizardPage.selectExamDateToday();
  await wizardPage.selectExamTime("08:30");
  await expect(wizardPage.nextButton).toBeEnabled();
  await wizardPage.continue();

  await wizardPage.selectMedication("plenvu");
  await wizardPage.continue();

  await wizardPage.answerConstipation(false);
  await wizardPage.continue();

  await expect(wizardPage.stepSubtitle("anticoagulation")).toContainText("Anticoagulants");
  await expect(wizardPage.stepSubtitle("anticoagulation")).toContainText("Antiplatelets");
  await wizardPage.answerAnticoagulation(false);
  await wizardPage.continue();

  await expect(wizardPage.stepSubtitle("subcutaneous")).toContainText("Ozempic");
  await expect(wizardPage.stepSubtitle("subcutaneous")).toContainText("Mounjaro");
  await wizardPage.answerSubcutaneousMedication(false);
  await wizardPage.continue();

  await wizardPage.answerIronMedication(false);
  await wizardPage.continue();

  await expect(wizardPage.overlay).toBeHidden();

  await preparationPage.openContactTeamForm();

  await expect(contactTeamModal.root).toHaveClass(/is-open/);
  await expect(contactTeamModal.form).toBeVisible();

  await contactTeamModal.fillForm({
    email: "user@example.com",
    issue: "Need help with preparation timings",
  });

  await contactTeamModal.close();
  await expect(contactTeamModal.root).not.toHaveClass(/is-open/);
});

test("wizard with constipation and safety meds shows extra rows and downloads ICS", async ({
  page,
  wizardPage,
  preparationPage,
}) => {
  await wizardPage.complete({
    language: "pt",
    medication: "citrafleet",
    isConstipated: true,
    takesAnticoagulation: true,
    takesSubcutaneousMedication: true,
    takesIronMedication: true,
    examTime: "09:00",
  });

  await expect(preparationPage.heroDulcolaxRow48).toHaveClass(/is-visible/);
  await expect(preparationPage.heroDulcolaxRow24).toHaveClass(/is-visible/);
  await expect(preparationPage.heroAnticoagulationWarning).toHaveClass(/is-visible/);
  await expect(preparationPage.heroSubcutaneousRow).toHaveClass(/is-visible/);
  await expect(preparationPage.heroIronRow).toHaveClass(/is-visible/);
  await expect(page.locator("#heroIronValue")).not.toHaveText("--");
  await expect(page.locator("#heroSubcutaneousValue")).not.toHaveText("--");

  const [download] = await Promise.all([
    page.waitForEvent("download"),
    page.locator("#downloadIcs").click(),
  ]);
  expect(download.suggestedFilename()).toMatch(/\.ics$/);
});

test("wizard completion persists after page reload", async ({
  page,
  wizardPage,
  preparationPage,
}) => {
  await wizardPage.complete({
    language: "en",
    medication: "moviprep",
    isConstipated: false,
    takesAnticoagulation: false,
    takesSubcutaneousMedication: false,
    takesIronMedication: false,
    examTime: "10:00",
  });

  await page.reload();

  await expect(wizardPage.overlay).toBeHidden();
  await expect(preparationPage.contactTeamButton).toContainText("Contact the team");
  await expect(preparationPage.heroCard).toContainText("Taking Moviprep");
});
