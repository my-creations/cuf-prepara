import { BasePage } from "../base-page.js";

export class AppModal extends BasePage {
  constructor(page) {
    super(page);
    this.root = this.getByTestId("app-modal");
    this.body = this.getByTestId("app-modal-body");
    this.closeButton = this.getByTestId("modal-close-button");
  }

  async close() {
    await this.closeButton.click();
    return this;
  }
}
