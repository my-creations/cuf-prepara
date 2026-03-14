import { setupModal } from "../../js/modules/modal.js";
import { state } from "../../js/state.js";

describe("modal module", () => {
  const originalLang = state.lang;

  const setupDom = () => {
    document.body.innerHTML = `
      <div id="videoModal" aria-hidden="true">
        <button type="button" data-modal-close>Close</button>
        <div id="modalBody"></div>
      </div>
      <div id="videoGrid">
        <button type="button" id="videoBtn" data-video-id="video-1">Open</button>
      </div>
    `;

    return {
      modal: document.getElementById("videoModal"),
      modalBody: document.getElementById("modalBody"),
      videoGrid: document.getElementById("videoGrid"),
    };
  };

  afterEach(() => {
    state.lang = originalLang;
    document.body.innerHTML = "";
  });

  it("opens and closes modal through controls and UI events", () => {
    const elements = setupDom();
    state.lang = "en";

    const controls = setupModal(elements, () => "en", () => ({ videos: [] }));

    controls.openModal("<p>Modal content</p>");
    expect(elements.modal.classList.contains("is-open")).toBe(true);
    expect(elements.modal.getAttribute("aria-hidden")).toBe("false");

    elements.modal.querySelector("[data-modal-close]").click();
    expect(elements.modal.classList.contains("is-open")).toBe(false);
    expect(elements.modal.getAttribute("aria-hidden")).toBe("true");
    expect(elements.modalBody.innerHTML).toBe("");

    controls.openModal("<p>Modal content</p>");
    document.dispatchEvent(new KeyboardEvent("keydown", { key: "Escape" }));
    expect(elements.modal.classList.contains("is-open")).toBe(false);
    expect(elements.modal.getAttribute("aria-hidden")).toBe("true");
  });

  it("opens video placeholder content only for valid video buttons", () => {
    const elements = setupDom();
    state.lang = "en";

    setupModal(elements, () => "en", () => ({
      videos: [
        {
          id: "video-1",
          title: "Preparation video",
          description: "How to prepare for your exam",
        },
      ],
    }));

    document.getElementById("videoBtn").click();
    expect(elements.modal.classList.contains("is-open")).toBe(true);
    expect(elements.modalBody.textContent).toContain("Preparation video");
    expect(elements.modalBody.textContent).toContain("You can replace these videos");

    elements.modal.classList.remove("is-open");
    elements.modalBody.innerHTML = "";
    elements.videoGrid.innerHTML =
      '<button type="button" id="unknown" data-video-id="missing">Unknown</button>';
    document.getElementById("unknown").click();

    expect(elements.modal.classList.contains("is-open")).toBe(false);
    expect(elements.modalBody.innerHTML).toBe("");
  });

  it("covers non-closing clicks, non-escape keys and missing video grid fallback", () => {
    const elements = setupDom();
    state.lang = "en";

    const controls = setupModal(
      {
        modal: elements.modal,
        modalBody: elements.modalBody,
        videoGrid: null,
      },
      () => "en",
      () => null
    );

    controls.openModal("<p>Opened</p>");
    elements.modal.dispatchEvent(new MouseEvent("click", { bubbles: true }));
    expect(elements.modal.classList.contains("is-open")).toBe(true);

    document.dispatchEvent(new KeyboardEvent("keydown", { key: "Enter" }));
    expect(elements.modal.classList.contains("is-open")).toBe(true);

    const withGridControls = setupModal(elements, () => "en", () => null);
    withGridControls.openModal("<p>Opened</p>");

    elements.videoGrid.dispatchEvent(new MouseEvent("click", { bubbles: true }));
    expect(elements.modal.classList.contains("is-open")).toBe(true);

    elements.videoGrid.innerHTML =
      '<button type="button" id="missingVideo" data-video-id="does-not-exist">Missing</button>';
    document.getElementById("missingVideo").click();
    expect(elements.modalBody.innerHTML).toContain("Opened");
  });
});
