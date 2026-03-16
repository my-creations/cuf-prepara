import { BasePage } from "./base-page.js";
import { PreparationPage } from "./preparation-page.js";

export class WizardPage extends BasePage {
  constructor(page) {
    super(page);
    this.overlay = this.getByTestId("wizard-overlay");
    this.splash = this.getByTestId("wizard-splash");
    this.nextButton = this.getByTestId("wizard-next-button");
    this.backButton = this.getByTestId("wizard-back-button");
    this.dateTrigger = this.getByTestId("wizard-date-trigger");
    this.dateTodayButton = this.getByTestId("wizard-date-today");
    this.timeTrigger = this.getByTestId("wizard-time-trigger");
    this.timePanel = this.getByTestId("wizard-time-panel");
  }

  step(stepName) {
    return this.getByTestId(`wizard-step-${stepName}`);
  }

  stepTitle(stepName) {
    return this.step(stepName).getByTestId("wizard-step-title");
  }

  stepSubtitle(stepName) {
    return this.step(stepName).getByTestId("wizard-step-subtitle");
  }

  async goto() {
    await super.goto("/");
    return this.waitForReady();
  }

  async waitForReady() {
    await this.step("language").waitFor({ state: "visible" });
    return this;
  }

  async continue() {
    await this.nextButton.click();
    return this;
  }

  async selectLanguage(language) {
    await this.getByTestId(`wizard-language-${language}`).click();
    return this;
  }

  async selectExamDateToday() {
    await this.dateTrigger.click();
    await this.dateTodayButton.click();
    return this;
  }

  async selectExamTime(time) {
    await this.timeTrigger.click();
    await this.timePanel.getByRole("button", { name: time, exact: true }).click();
    return this;
  }

  async selectMedication(medication) {
    await this.getByTestId(`wizard-medication-${medication}`).click();
    return this;
  }

  async answerConstipation(value) {
    await this.getByTestId(`wizard-constipation-${String(value)}`).click();
    return this;
  }

  async answerAnticoagulation(value) {
    await this.getByTestId(`wizard-anticoagulation-${String(value)}`).click();
    return this;
  }

  async answerSubcutaneousMedication(value) {
    await this.getByTestId(`wizard-subcutaneous-${String(value)}`).click();
    return this;
  }

  async answerIronMedication(value) {
    await this.getByTestId(`wizard-iron-${String(value)}`).click();
    return this;
  }

  async complete({
    language = "en",
    examTime = "08:30",
    medication = "plenvu",
    isConstipated = false,
    takesAnticoagulation = false,
    takesSubcutaneousMedication = false,
    takesIronMedication = false,
  } = {}) {
    await this.goto();
    await this.selectLanguage(language);
    await this.continue();
    await this.selectExamDateToday();
    await this.selectExamTime(examTime);
    await this.continue();
    await this.selectMedication(medication);
    await this.continue();
    await this.answerConstipation(isConstipated);
    await this.continue();
    await this.answerAnticoagulation(takesAnticoagulation);
    await this.continue();
    await this.answerSubcutaneousMedication(takesSubcutaneousMedication);
    await this.continue();
    await this.answerIronMedication(takesIronMedication);
    await this.continue();
    await this.overlay.waitFor({ state: "hidden" });
    return new PreparationPage(this.page);
  }
}
