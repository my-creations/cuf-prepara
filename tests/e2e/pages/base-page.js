const escapeRegex = (value) => value.replace(/[.*+?^${}()|[\]\\]/g, "\\$&");

export class BasePage {
  constructor(page) {
    this.page = page;
  }

  getByTestId(testId) {
    return this.page.getByTestId(testId);
  }

  async goto(path = "/") {
    await this.page.goto(path);
    return this;
  }

  async waitForUrlHash(hash) {
    await this.page.waitForURL(new RegExp(`${escapeRegex(hash)}$`));
    return this;
  }
}
