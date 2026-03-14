import { devices } from "@playwright/test";
import { test, expect } from "./fixtures.js";

const iPhone13 = devices["iPhone 13"];

test.describe("desktop preparation flow", () => {
  test("shows personalized preparation details and desktop navigation behavior", async ({
    page,
    wizardPage,
    preparationPage,
    appModal,
  }) => {
    await wizardPage.complete({
      language: "en",
      medication: "citrafleet",
      isConstipated: true,
      takesAnticoagulation: true,
      takesSubcutaneousMedication: true,
      takesIronMedication: true,
    });

    await expect(preparationPage.heroTitle).toContainText("Colonoscopy Preparation Guide");
    await expect(preparationPage.siteNav).toBeVisible();
    await expect(preparationPage.heroAnticoagulationWarning).toHaveClass(/is-visible/);
    await expect(preparationPage.heroIronRow).toHaveClass(/is-visible/);
    await expect(preparationPage.heroSubcutaneousRow).toHaveClass(/is-visible/);
    await expect(preparationPage.heroDulcolaxRow48).toHaveClass(/is-visible/);
    await expect(preparationPage.heroDulcolaxRow24).toHaveClass(/is-visible/);
    await expect(preparationPage.heroSubcutaneousLabel).toContainText("Stop Subcutaneous Medication");
    await expect(preparationPage.heroCard).toContainText("Taking Citrafleet");

    await preparationPage.openMedicationSection();

    await expect(page).toHaveURL(/#medicacao-preparacao/);
    await expect(preparationPage.accordionMedication).toHaveJSProperty("open", true);
    await expect(preparationPage.medicationText).toContainText("Citrafleet");
    await expect(preparationPage.videoCard("video-meds")).toBeVisible();

    await preparationPage.openMedicationVideo("video-meds");

    await expect(appModal.root).toHaveClass(/is-open/);
    await expect(appModal.body).toContainText("How to take the medication");
  });

  test("matches English personalized plan entries to the selected answers", async ({
    wizardPage,
    preparationPage,
  }) => {
    await wizardPage.complete({
      language: "en",
      medication: "moviprep",
      isConstipated: false,
      takesAnticoagulation: true,
      takesSubcutaneousMedication: false,
      takesIronMedication: true,
    });

    await expect(preparationPage.heroCard).toContainText("Personal plan");
    await expect(preparationPage.heroCard).toContainText("Taking Moviprep");
    await expect(preparationPage.heroCard).toContainText("Start of Diet");
    await expect(preparationPage.heroCard).toContainText("Exam");
    await expect(preparationPage.heroAnticoagulationWarning).toBeVisible();
    await expect(preparationPage.heroIronRow).toBeVisible();
    await expect(preparationPage.heroIronLabel).toContainText("Stop Supplements");
    await expect(preparationPage.heroSubcutaneousRow).toBeHidden();
    await expect(preparationPage.heroDulcolaxRow48).toBeHidden();
    await expect(preparationPage.heroDulcolaxRow24).toBeHidden();
  });

  test("matches Portuguese personalized plan entries to the selected answers", async ({
    wizardPage,
    preparationPage,
  }) => {
    await wizardPage.complete({
      language: "pt",
      medication: "citrafleet",
      isConstipated: true,
      takesAnticoagulation: false,
      takesSubcutaneousMedication: true,
      takesIronMedication: false,
    });

    await expect(preparationPage.heroCard).toContainText("Plano personalizado");
    await expect(preparationPage.heroCard).toContainText("Toma do Citrafleet");
    await expect(preparationPage.heroCard).toContainText("Início da Dieta");
    await expect(preparationPage.heroCard).toContainText("Exame");
    await expect(preparationPage.heroSubcutaneousRow).toBeVisible();
    await expect(preparationPage.heroSubcutaneousLabel).toContainText("Suspender Medicação Subcutânea");
    await expect(preparationPage.heroDulcolaxRow48).toBeVisible();
    await expect(preparationPage.heroDulcolaxRow24).toBeVisible();
    await expect(preparationPage.heroCard).toContainText("1ª Dose de Dulcolax");
    await expect(preparationPage.heroCard).toContainText("2ª Dose de Dulcolax");
    await expect(preparationPage.heroAnticoagulationWarning).toBeHidden();
    await expect(preparationPage.heroIronRow).toBeHidden();
  });
});

test.describe("mobile preparation flow", () => {
  test.use({
    viewport: iPhone13.viewport,
    userAgent: iPhone13.userAgent,
    deviceScaleFactor: iPhone13.deviceScaleFactor,
    isMobile: iPhone13.isMobile,
    hasTouch: iPhone13.hasTouch,
  });

  test("supports mobile navigation and section switching after the wizard", async ({
    page,
    wizardPage,
    preparationPage,
  }) => {
    await wizardPage.complete({
      language: "en",
      medication: "moviprep",
      isConstipated: false,
      takesAnticoagulation: false,
      takesIronMedication: false,
    });

    await expect(preparationPage.heroCard).toContainText("Taking Moviprep");

    await preparationPage.openMobileNavigation();
    await expect(preparationPage.body).toHaveClass(/nav-open/);

    await preparationPage.openFaqSection();

    await expect(page).toHaveURL(/#faq/);
    await expect(preparationPage.body).not.toHaveClass(/nav-open/);
    await expect(preparationPage.accordionFaq).toHaveJSProperty("open", true);
    await expect(preparationPage.faqList).toContainText("Can I take my usual medication?");

    await preparationPage.openMobileNavigation();
    await expect(preparationPage.body).toHaveClass(/nav-open/);

    await preparationPage.closeMobileNavigation();
    await expect(preparationPage.body).not.toHaveClass(/nav-open/);
  });
});
