import { devices } from "@playwright/test";
import { test, expect } from "./fixtures.js";
import {
  getLocalizedContent,
  getLocalizedTranslations,
  getLocalizedVideo,
  getMedicationLabel,
  getMedicationName,
} from "./support/localized-data.js";

const iPhone13 = devices["iPhone 13"];
const enTranslations = getLocalizedTranslations("en");
const ptTranslations = getLocalizedTranslations("pt");
const enContent = getLocalizedContent("en");
const ptContent = getLocalizedContent("pt");

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

    await expect(preparationPage.heroTitle).toContainText(enTranslations.hero.title);
    await expect(preparationPage.siteNav).toBeVisible();
    await expect(preparationPage.heroAnticoagulationWarning).toHaveClass(/is-visible/);
    await expect(preparationPage.heroAnticoagulationWarning).toContainText(
      enTranslations.hero.anticoagPlanWarning
    );
    await expect(preparationPage.heroIronRow).toHaveClass(/is-visible/);
    await expect(preparationPage.heroSubcutaneousRow).toHaveClass(/is-visible/);
    await expect(preparationPage.heroDulcolaxRow48).toHaveClass(/is-visible/);
    await expect(preparationPage.heroDulcolaxRow24).toHaveClass(/is-visible/);
    await expect(preparationPage.heroSubcutaneousLabel).toContainText(
      enTranslations.hero.subcutaneousLabel
    );
    await expect(preparationPage.heroDulcolaxLabel48).toContainText(enTranslations.hero.dulcolaxLabel);
    await expect(preparationPage.heroDulcolaxLabel24).toContainText(enTranslations.hero.dulcolaxLabel);
    await expect(preparationPage.heroCard).toContainText(getMedicationLabel("en", "citrafleet"));

    await preparationPage.openMedicationSection();

    await expect(page).toHaveURL(/#medicacao-preparacao/);
    await expect(preparationPage.accordionMedication).toHaveJSProperty("open", true);
    await expect(preparationPage.medicationText).toContainText(
      enContent.accordion.plenvuMedicationNote.replace(
        "$medicamento",
        getMedicationName("citrafleet")
      )
    );
    await expect(preparationPage.videoCard(enContent.accordion.plenvuVideoId)).toBeVisible();

    await preparationPage.openMedicationVideo(enContent.accordion.plenvuVideoId);

    await expect(appModal.root).toHaveClass(/is-open/);
    await expect(appModal.body).toContainText(
      getLocalizedVideo("en", enContent.accordion.plenvuVideoId).title
    );

    await appModal.close();
    await expect(appModal.root).not.toHaveClass(/is-open/);

    await preparationPage.openExamDaySection();

    await expect(page).toHaveURL(/#dia-exame/);
    await expect(preparationPage.accordionExamDay).toHaveJSProperty("open", true);
    await expect(preparationPage.examArrivalAlert).toContainText(enContent.accordion.examArrivalAlert);
  });

  test("keeps accordion sections aligned to their start on desktop", async ({
    page,
    wizardPage,
    preparationPage,
  }) => {
    await wizardPage.complete({
      language: "pt",
      medication: "plenvu",
      isConstipated: true,
      takesAnticoagulation: false,
      takesSubcutaneousMedication: true,
      takesIronMedication: false,
    });

    await preparationPage.expandResidueSection();
    await expect(preparationPage.accordionResidue).toHaveJSProperty("open", true);

    await preparationPage.expandLiquidSection();
    await expect(preparationPage.accordionLiquid).toHaveJSProperty("open", true);
    await page.waitForFunction(() => {
      const top = document.getElementById("dieta-liquida")?.getBoundingClientRect().top;
      return typeof top === "number" && top >= -5 && top <= 160;
    });

    await preparationPage.expandMedicationSection();
    await expect(preparationPage.accordionMedication).toHaveJSProperty("open", true);
    await page.waitForFunction(() => {
      const top = document.getElementById("medicacao-preparacao")?.getBoundingClientRect().top;
      return typeof top === "number" && top >= -5 && top <= 160;
    });
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

    await expect(preparationPage.heroCard).toContainText(enTranslations.hero.cardTitle);
    await expect(preparationPage.heroCard).toContainText(getMedicationLabel("en", "moviprep"));
    await expect(preparationPage.heroCard).toContainText(enTranslations.hero.cardDiet);
    await expect(preparationPage.heroCard).toContainText(enTranslations.hero.cardExam);
    await expect(preparationPage.heroAnticoagulationWarning).toBeVisible();
    await expect(preparationPage.heroAnticoagulationWarning).toContainText(
      enTranslations.hero.anticoagPlanWarning
    );
    await expect(preparationPage.heroIronRow).toBeVisible();
    await expect(preparationPage.heroIronLabel).toContainText(enTranslations.hero.ironSuppLabel);
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

    await expect(preparationPage.heroCard).toContainText(ptTranslations.hero.cardTitle);
    await expect(preparationPage.heroCard).toContainText(getMedicationLabel("pt", "citrafleet"));
    await expect(preparationPage.heroCard).toContainText(ptTranslations.hero.cardDiet);
    await expect(preparationPage.heroCard).toContainText(ptTranslations.hero.cardExam);
    await expect(preparationPage.heroSubcutaneousRow).toBeVisible();
    await expect(preparationPage.heroSubcutaneousLabel).toContainText(
      ptTranslations.hero.subcutaneousLabel
    );
    await expect(preparationPage.heroDulcolaxRow48).toBeVisible();
    await expect(preparationPage.heroDulcolaxRow24).toBeVisible();
    await expect(preparationPage.heroDulcolaxLabel48).toContainText(ptTranslations.hero.dulcolaxLabel);
    await expect(preparationPage.heroDulcolaxLabel24).toContainText(ptTranslations.hero.dulcolaxLabel);
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

    await expect(preparationPage.heroCard).toContainText(getMedicationLabel("en", "moviprep"));

    await preparationPage.openMobileNavigation();
    await expect(preparationPage.body).toHaveClass(/nav-open/);

    await preparationPage.openFaqSection();

    await expect(page).toHaveURL(/#faq/);
    await expect(preparationPage.body).not.toHaveClass(/nav-open/);
    await expect(preparationPage.accordionFaq).toHaveJSProperty("open", true);
    await expect(preparationPage.faqList).toContainText(enContent.faqs[0].question);

    await preparationPage.openMobileNavigation();
    await expect(preparationPage.body).toHaveClass(/nav-open/);

    await preparationPage.closeMobileNavigation();
    await expect(preparationPage.body).not.toHaveClass(/nav-open/);
  });
});
