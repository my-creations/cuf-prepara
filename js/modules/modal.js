import { getText } from "../i18n.js";
export const setupModal = (elements, getLang, getContent) => {
  const openModal = (content) => {
    elements.modalBody.innerHTML = content;
    elements.modal.classList.add("is-open");
    elements.modal.setAttribute("aria-hidden", "false");
  };

  const closeModal = () => {
    elements.modal.classList.remove("is-open");
    elements.modal.setAttribute("aria-hidden", "true");
    elements.modalBody.innerHTML = "";
  };

  elements.modal.addEventListener("click", (event) => {
    if (event.target.hasAttribute("data-modal-close")) {
      closeModal();
    }
  });

  document.addEventListener("keydown", (event) => {
    if (event.key === "Escape") {
      closeModal();
    }
  });

  if (elements.videoGrid) {
    elements.videoGrid.addEventListener("click", (event) => {
      const button = event.target.closest("button[data-video-id]");
      if (!button) {
        return;
      }
      const videoId = button.dataset.videoId;
      const content = getContent(getLang()) || { videos: [] };
      const video = content.videos.find((item) => item.id === videoId);
      if (!video) {
        return;
      }
      openModal(`
        <div class="modal-placeholder">
          <h3>${video.title}</h3>
          <p>${video.description}</p>
          <p>${getText("media.subtitle")}</p>
        </div>
      `);
    });
  }
};
