import { getText } from "../i18n.js";
import { loadJson, saveJson } from "../utils/storage.js";

export const renderShoppingList = (listElement, content, checklistKey, lang, medication, isConstipated) => {
  if (!listElement) {
    return;
  }

  listElement.innerHTML = "";
  const savedState = loadJson(checklistKey, {});

  const shoppingItems = [...content.shoppingList];

  // Update the prep solution item with the selected medication
  if (medication) {
    const prepItem = shoppingItems.find(item => item.id === "prep");
    if (prepItem) {
      const medicationName = medication.charAt(0).toUpperCase() + medication.slice(1);
      prepItem.text = medicationName;
    }
  }

  // Add Dulcolax as separate item if constipated
  if (isConstipated && !shoppingItems.find(item => item.id === "dulcolax")) {
    shoppingItems.push({
      id: "dulcolax",
      text: lang === "pt" ? "Dulcolax (4 comprimidos)" : "Dulcolax (4 tablets)"
    });
  }

  shoppingItems.forEach((item) => {
    const wrapper = document.createElement("label");
    wrapper.className = "check-item";
    const checkbox = document.createElement("input");
    checkbox.type = "checkbox";
    checkbox.dataset.checkId = item.id;
    checkbox.checked = Boolean(savedState[item.id]);
    checkbox.addEventListener("change", () => {
      const nextState = loadJson(checklistKey, {});
      nextState[item.id] = checkbox.checked;
      saveJson(checklistKey, nextState);
      document.querySelectorAll(`input[data-check-id="${item.id}"]`).forEach((input) => {
        if (input !== checkbox) {
          input.checked = checkbox.checked;
        }
      });
    });
    const text = document.createElement("span");
    text.textContent = item.text;
    wrapper.appendChild(checkbox);
    wrapper.appendChild(text);
    listElement.appendChild(wrapper);
  });
};

export const renderRecipes = (listElement, recipes, options = {}) => {
  if (!listElement) {
    return;
  }
  listElement.innerHTML = "";
  const { phase } = options;
  const filtered = phase ? recipes.filter((recipe) => recipe.phase === phase) : recipes;
  filtered.forEach((recipe) => {
    const card = document.createElement("div");
    card.className = "card";
    card.innerHTML = `
      ${recipe.phase ? `<span class="card-tag">${recipe.phase}</span>` : ""}
      <h3>${recipe.title}</h3>
      <p class="recipe-meta">${recipe.description}</p>
    `;
    listElement.appendChild(card);
  });
};

export const renderVideos = (listElement, videos) => {
  if (!listElement) {
    return;
  }
  listElement.innerHTML = "";
  videos.forEach((video) => {
    const card = document.createElement("div");
    card.className = "media-card";
    card.innerHTML = `
      <div class="media-thumb">
        <span class="media-duration">${video.duration}</span>
      </div>
      <div>
        <h3>${video.title}</h3>
        <p class="recipe-meta">${video.description}</p>
      </div>
      <button class="btn ghost" data-video-id="${video.id}">
        ${getText("media.play")}
      </button>
    `;
    listElement.appendChild(card);
  });
};

export const renderFoodGrid = (listElement, items) => {
  if (!listElement) {
    return;
  }
  listElement.innerHTML = "";
  items.forEach((item) => {
    const card = document.createElement("div");
    card.className = "food-card";
    
    const iconSvg = item.icon === "check" 
      ? `<svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="#22c55e" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><polyline points="20 6 9 17 4 12"></polyline></svg>`
      : item.icon === "cross"
      ? `<svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="#ef4444" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><line x1="18" y1="6" x2="6" y2="18"></line><line x1="6" y1="6" x2="18" y2="18"></line></svg>`
      : "";
    
    card.innerHTML = `
      <div class="food-image">
        <span>${getText("accordion.blocks.photoLabel")}</span>
      </div>
      <div class="food-content">
        <h4><span class="food-icon">${iconSvg}</span>${item.title}</h4>
        ${item.detail ? `<p class="recipe-meta">${item.detail}</p>` : ""}
      </div>
    `;
    listElement.appendChild(card);
  });
};

export const renderInfoCard = (element, content) => {
  if (!element) {
    return;
  }
  if (!content) {
    element.innerHTML = "";
    return;
  }
  if (Array.isArray(content)) {
    const list = content.map((item) => `<li>${item}</li>`).join("");
    element.innerHTML = `<ul>${list}</ul>`;
    return;
  }
  element.textContent = content;
};

export const renderFocusList = (element, title, items) => {
  if (!element) {
    return;
  }
  element.innerHTML = "";
  if (!items || items.length === 0) {
    return;
  }
  const titleNode = document.createElement("span");
  titleNode.className = "phase-focus-title";
  titleNode.textContent = title;
  element.appendChild(titleNode);
  items.forEach((item) => {
    const chip = document.createElement("span");
    chip.className = "phase-chip";
    chip.textContent = item;
    element.appendChild(chip);
  });
};


export const renderFaq = (elements, content) => {
  if (!elements.faqList) {
    return;
  }
  elements.faqList.innerHTML = "";
  content.faqs.forEach((faq) => {
    const item = document.createElement("details");
    item.className = "faq-item";
    item.open = false;
    item.innerHTML = `
      <summary><span>${faq.question}</span></summary>
      <p>${faq.answer}</p>
    `;
    elements.faqList.appendChild(item);
  });
};
