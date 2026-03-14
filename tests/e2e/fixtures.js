import { test as base, expect } from "@playwright/test";
import { AppModal } from "./pages/components/app-modal.js";
import { ContactTeamModal } from "./pages/components/contact-team-modal.js";
import { PreparationPage } from "./pages/preparation-page.js";
import { WizardPage } from "./pages/wizard-page.js";

export const test = base.extend({
  resetClientState: [
    async ({ page }, use) => {
      await page.addInitScript(() => {
        const resetKey = "__cuf_prepara_storage_reset__";
        if (!sessionStorage.getItem(resetKey)) {
          localStorage.clear();
          sessionStorage.setItem(resetKey, "done");
        }
      });
      await use();
    },
    { auto: true },
  ],
  preparationPage: async ({ page }, use) => {
    await use(new PreparationPage(page));
  },
  wizardPage: async ({ page }, use) => {
    await use(new WizardPage(page));
  },
  appModal: async ({ page }, use) => {
    await use(new AppModal(page));
  },
  contactTeamModal: async ({ page }, use) => {
    await use(new ContactTeamModal(page));
  },
});

export { expect };
