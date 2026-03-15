import { test, expect } from "./fixtures.js";
import {
  getLocalizedContent,
  getLocalizedVideo,
} from "./support/localized-data.js";

test("shows the full Plenvu guidance stack in Portuguese", async ({
  page,
  wizardPage,
  preparationPage,
}) => {
  const content = getLocalizedContent("pt");

  await wizardPage.complete({
    language: "pt",
    medication: "plenvu",
    isConstipated: false,
    takesAnticoagulation: false,
    takesSubcutaneousMedication: false,
    takesIronMedication: false,
  });

  await preparationPage.openMedicationSection();

  await expect(page).toHaveURL(/#medicacao-preparacao/);
  await expect(preparationPage.accordionMedication).toHaveJSProperty("open", true);
  await expect(preparationPage.medicationText).toContainText(content.accordion.plenvuText);
  await expect(preparationPage.medicationText).toContainText(
    content.accordion.plenvuMedicationNote.replace("$medicamento", "Plenvu")
  );
  await expect(preparationPage.medicationStartAlert).toContainText(content.accordion.medicationStartAlert);
  await expect(preparationPage.medicationText.locator(".prep-guide-image")).toHaveAttribute(
    "src",
    /plenvu-preparation-horizontal-pt\.svg/
  );
  await expect(preparationPage.medicationFastingAlert).toContainText(content.accordion.medicationFastingAlert);
  await expect(preparationPage.medicationTips.locator("ol li")).toHaveCount(
    content.accordion.plenvuTips.length
  );
  await expect(preparationPage.medicationTips).toContainText(content.accordion.plenvuTips[0]);
  await expect(preparationPage.medicationTips).toContainText(
    content.accordion.plenvuTips[content.accordion.plenvuTips.length - 1]
  );
  await expect(preparationPage.videoCard(content.accordion.plenvuVideoId)).toBeVisible();
  await expect(preparationPage.videoCard(content.accordion.plenvuVideoId)).toContainText(
    getLocalizedVideo("pt", content.accordion.plenvuVideoId).title
  );
});

["pt", "en"].forEach((language) => {
  test(`shows the updated FAQ content in ${language.toUpperCase()}`, async ({
    page,
    wizardPage,
    preparationPage,
  }) => {
    const content = getLocalizedContent(language);

    await wizardPage.complete({
      language,
      medication: "plenvu",
      isConstipated: false,
      takesAnticoagulation: false,
      takesSubcutaneousMedication: false,
      takesIronMedication: false,
    });

    await preparationPage.openFaqSection();

    await expect(page).toHaveURL(/#faq/);
    await expect(preparationPage.accordionFaq).toHaveJSProperty("open", true);
    await expect(preparationPage.faqList.locator("details.faq-item")).toHaveCount(content.faqs.length);

    for (const faq of content.faqs) {
      await expect(preparationPage.faqList).toContainText(faq.question);
      await preparationPage.expandFaq(faq.question);
      await expect(preparationPage.faqItem(faq.question)).toContainText(faq.answer);
    }
  });
});
