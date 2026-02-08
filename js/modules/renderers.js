import { getText } from "../i18n.js";
import { loadJson, saveJson } from "../utils/storage.js";

export const renderHighlights = (elements, content) => {
  elements.heroHighlights.innerHTML = "";
  content.heroHighlights.forEach((item) => {
    const card = document.createElement("div");
    card.className = "highlight";
    card.innerHTML = `
      <div class="highlight-title">${item.title}</div>
      <div class="highlight-text">${item.text}</div>
    `;
    elements.heroHighlights.appendChild(card);
  });
};

export const renderDietPhases = (elements, content) => {
  elements.dietPhases.innerHTML = "";
  content.dietPhases.forEach((phase) => {
    const card = document.createElement("div");
    card.className = "card";
    const list = phase.items.map((item) => `<li>${item}</li>`).join("");
    card.innerHTML = `
      <span class="card-tag">${phase.tag}</span>
      <h3>${phase.title}</h3>
      <ul>${list}</ul>
    `;
    elements.dietPhases.appendChild(card);
  });
};

export const renderMedCards = (elements, content) => {
  elements.medCards.innerHTML = "";
  content.medCards.forEach((cardData) => {
    const card = document.createElement("div");
    card.className = "card";
    const list = cardData.items.map((item) => `<li>${item}</li>`).join("");
    card.innerHTML = `
      <span class="card-tag">${cardData.tag}</span>
      <h3>${cardData.title}</h3>
      <ul>${list}</ul>
    `;
    elements.medCards.appendChild(card);
  });
};

export const renderShoppingList = (elements, content, checklistKey) => {
  elements.shoppingList.innerHTML = "";
  const savedState = loadJson(checklistKey, {});
  content.shoppingList.forEach((item) => {
    const wrapper = document.createElement("label");
    wrapper.className = "check-item";
    const checkbox = document.createElement("input");
    checkbox.type = "checkbox";
    checkbox.checked = Boolean(savedState[item.id]);
    checkbox.addEventListener("change", () => {
      const nextState = loadJson(checklistKey, {});
      nextState[item.id] = checkbox.checked;
      saveJson(checklistKey, nextState);
    });
    const text = document.createElement("span");
    text.textContent = item.text;
    wrapper.appendChild(checkbox);
    wrapper.appendChild(text);
    elements.shoppingList.appendChild(wrapper);
  });
};

export const renderRecipeFilters = (elements, translations, state, onFilterChange) => {
  elements.recipeFilters.innerHTML = "";
  const filters = translations.recipes.filters;
  const order = ["all", "breakfast", "lunch", "dinner", "snack"];
  order.forEach((key) => {
    const button = document.createElement("button");
    button.className = "filter-btn";
    button.dataset.filter = key;
    if (state.recipeFilter === key) {
      button.classList.add("is-active");
    }
    button.textContent = filters[key];
    button.addEventListener("click", () => onFilterChange(key));
    elements.recipeFilters.appendChild(button);
  });
};

export const renderRecipes = (elements, content, state) => {
  elements.recipeCards.innerHTML = "";
  const recipes = content.recipes;
  const filtered =
    state.recipeFilter === "all"
      ? recipes
      : recipes.filter((recipe) => recipe.category === state.recipeFilter);
  filtered.forEach((recipe) => {
    const card = document.createElement("div");
    card.className = "card";
    card.innerHTML = `
      <span class="card-tag">${recipe.phase}</span>
      <h3>${recipe.title}</h3>
      <p class="recipe-meta">${recipe.description}</p>
    `;
    elements.recipeCards.appendChild(card);
  });
};

export const renderVideos = (elements, content) => {
  elements.videoGrid.innerHTML = "";
  const videos = content.videos;
  videos.forEach((video) => {
    const card = document.createElement("div");
    card.className = "media-card";
    card.innerHTML = `
      <div class="media-thumb">${video.duration}</div>
      <div>
        <h3>${video.title}</h3>
        <p class="recipe-meta">${video.description}</p>
      </div>
      <button class="btn ghost" data-video-id="${video.id}">
        ${getText("media.play")}
      </button>
    `;
    elements.videoGrid.appendChild(card);
  });
};

export const renderImages = (elements, content) => {
  elements.imageGrid.innerHTML = "";
  content.images.forEach((image) => {
    const item = document.createElement("div");
    item.className = "gallery-item";
    item.innerHTML = `
      <strong>${image.title}</strong>
      <span>${image.description}</span>
    `;
    elements.imageGrid.appendChild(item);
  });
};

export const renderFaq = (elements, content) => {
  elements.faqList.innerHTML = "";
  content.faqs.forEach((faq) => {
    const item = document.createElement("div");
    item.className = "faq-item";
    item.innerHTML = `
      <h4>${faq.question}</h4>
      <p>${faq.answer}</p>
    `;
    elements.faqList.appendChild(item);
  });
};
