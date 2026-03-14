import { AppModal } from "./app-modal.js";

export class ContactTeamModal extends AppModal {
  constructor(page) {
    super(page);
    this.form = this.getByTestId("contact-team-form");
    this.emailInput = this.getByTestId("contact-team-email-input");
    this.issueInput = this.getByTestId("contact-team-issue-input");
    this.submitButton = this.getByTestId("contact-team-submit-button");
    this.cancelButton = this.getByTestId("contact-team-cancel-button");
  }

  async fillForm({ email, issue }) {
    if (email !== undefined) {
      await this.emailInput.fill(email);
    }

    if (issue !== undefined) {
      await this.issueInput.fill(issue);
    }

    return this;
  }

  async submit() {
    await this.submitButton.click();
    return this;
  }
}
