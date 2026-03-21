import { BasePage } from "./base-page.js";
import { AppModal } from "./components/app-modal.js";
import { ContactTeamModal } from "./components/contact-team-modal.js";

export class PreparationPage extends BasePage {
  constructor(page) {
    super(page);
    this.body = page.locator("body");
    this.heroTitle = this.getByTestId("hero-title");
    this.heroCard = this.getByTestId("hero-card");
    this.siteNav = this.getByTestId("site-nav");
    this.navMedication = this.getByTestId("nav-medication");
    this.navExamDay = this.getByTestId("nav-exam-day");
    this.navFaq = this.getByTestId("nav-faq");
    this.heroAnticoagulationWarning = this.getByTestId("hero-anticoagulation-warning");
    this.heroIronRow = this.getByTestId("hero-iron-row");
    this.heroIronLabel = this.getByTestId("hero-iron-label");
    this.heroSubcutaneousRow = this.getByTestId("hero-subcutaneous-row");
    this.heroSubcutaneousLabel = this.getByTestId("hero-subcutaneous-label");
    this.heroDulcolaxRow48 = this.getByTestId("hero-dulcolax-row-48");
    this.heroDulcolaxRow24 = this.getByTestId("hero-dulcolax-row-24");
    this.heroDulcolaxLabel48 = this.getByTestId("hero-dulcolax-label-48");
    this.heroDulcolaxLabel24 = this.getByTestId("hero-dulcolax-label-24");
    this.mobileNavToggle = this.getByTestId("mobile-nav-toggle");
    this.mobileNavBackdrop = this.getByTestId("mobile-nav-backdrop");
    this.accordionResidue = this.getByTestId("accordion-residue");
    this.accordionLiquid = this.getByTestId("accordion-liquid");
    this.accordionMedication = this.getByTestId("accordion-medication");
    this.accordionExamDay = this.getByTestId("accordion-exam-day");
    this.accordionFaq = this.getByTestId("accordion-faq");
    this.medicationText = this.getByTestId("medication-text");
    this.medicationStartAlert = this.getByTestId("medication-start-alert");
    this.medicationFastingAlert = this.getByTestId("medication-fasting-alert");
    this.medicationTips = this.getByTestId("medication-tips");
    this.medicationVideoGrid = this.getByTestId("medication-video-grid");
    this.examArrivalAlert = this.getByTestId("exam-arrival-alert");
    this.faqList = this.getByTestId("faq-list");
    this.contactTeamButton = this.getByTestId("contact-team-button");
  }

  videoCard(videoId) {
    return this.getByTestId(`video-card-${videoId}`);
  }

  videoTrigger(videoId) {
    return this.getByTestId(`video-trigger-${videoId}`);
  }

  faqItem(question) {
    return this.faqList.locator("details.faq-item").filter({
      has: this.page.getByText(question, { exact: true }),
    });
  }

  faqQuestion(question) {
    return this.faqItem(question).locator("summary");
  }

  async openMedicationSection() {
    await this.navMedication.click();
    await this.waitForUrlHash("#medicacao-preparacao");
    return this;
  }

  async openExamDaySection() {
    await this.navExamDay.click();
    await this.waitForUrlHash("#dia-exame");
    return this;
  }

  async expandResidueSection() {
    await this.accordionResidue.locator("summary").click();
    return this;
  }

  async expandLiquidSection() {
    await this.accordionLiquid.locator("summary").click();
    return this;
  }

  async expandMedicationSection() {
    await this.accordionMedication.locator("summary").click();
    return this;
  }

  async openFaqSection() {
    await this.navFaq.click();
    await this.waitForUrlHash("#faq");
    return this;
  }

  async expandFaq(question) {
    await this.faqQuestion(question).click();
    return this;
  }

  async openMobileNavigation() {
    await this.mobileNavToggle.click();
    return this;
  }

  async closeMobileNavigation() {
    await this.mobileNavBackdrop.click();
    return this;
  }

  async openMedicationVideo(videoId) {
    await this.videoTrigger(videoId).click();
    return new AppModal(this.page);
  }

  async openContactTeamForm() {
    await this.contactTeamButton.click();
    return new ContactTeamModal(this.page);
  }
}
