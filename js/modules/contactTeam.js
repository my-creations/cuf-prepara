const escapeHtml = (value = "") =>
  String(value)
    .replaceAll("&", "&amp;")
    .replaceAll("<", "&lt;")
    .replaceAll(">", "&gt;")
    .replaceAll('"', "&quot;")
    .replaceAll("'", "&#39;");

const buildContactFormModalHtml = (getText) => `
  <div class="contact-modal">
    <h3 class="contact-modal-title">${escapeHtml(getText("contactForm.title"))}</h3>
    <p class="contact-modal-subtitle">${escapeHtml(getText("contactForm.subtitle"))}</p>
    <form id="contactTeamForm" class="contact-form">
      <label class="contact-form-field">
        <span class="contact-form-label">${escapeHtml(getText("contactForm.emailLabel"))}</span>
        <input
          class="contact-form-input"
          type="email"
          name="email"
          required
          autocomplete="email"
          placeholder="${escapeHtml(getText("contactForm.emailPlaceholder"))}"
        />
      </label>
      <label class="contact-form-field">
        <span class="contact-form-label">${escapeHtml(getText("contactForm.issueLabel"))}</span>
        <textarea
          class="contact-form-input contact-form-textarea"
          name="issue"
          rows="5"
          required
          placeholder="${escapeHtml(getText("contactForm.issuePlaceholder"))}"
        ></textarea>
      </label>
      <p class="contact-form-note">${escapeHtml(getText("contactForm.note"))}</p>
      <div class="contact-form-actions">
        <button type="button" class="btn ghost" data-modal-close>${escapeHtml(getText("contactForm.cancel"))}</button>
        <button type="submit" class="btn primary">${escapeHtml(getText("contactForm.send"))}</button>
      </div>
    </form>
  </div>
`;

const openContactTeamModal = ({
  modalControls,
  modalBody,
  getText,
  recipientEmail,
  navigate = (url) => {
    window.location.href = url;
  },
}) => {
  if (!modalControls || !modalBody) {
    return;
  }

  modalControls.openModal(buildContactFormModalHtml(getText));

  const form = modalBody.querySelector("#contactTeamForm");
  if (!form) {
    return;
  }

  form.addEventListener(
    "submit",
    (event) => {
      event.preventDefault();

      const formData = new FormData(form);
      const email = String(formData.get("email") || "").trim();
      const issue = String(formData.get("issue") || "").trim();

      if (!email || !issue) {
        form.reportValidity();
        return;
      }

      const subject = getText("contactForm.subject");
      const bodyLines = [
        `${getText("contactForm.bodyEmailLabel")}: ${email}`,
        "",
        `${getText("contactForm.bodyIssueLabel")}:`,
        issue,
      ];

      const mailtoUrl = `mailto:${recipientEmail}?subject=${encodeURIComponent(subject)}&body=${encodeURIComponent(bodyLines.join("\n"))}`;
      navigate(mailtoUrl);
      modalControls.closeModal();
    },
    { once: true }
  );
};

export const setupContactTeamAction = ({
  button,
  modalControls,
  modalBody,
  getText,
  recipientEmail,
  navigate,
}) => {
  if (!button) {
    return;
  }

  button.addEventListener("click", (event) => {
    event.preventDefault();
    openContactTeamModal({
      modalControls,
      modalBody,
      getText,
      recipientEmail,
      navigate,
    });
  });
};
