import { translations } from "./data/translations.js";
import { loadContent } from "./data/content.js";
import { checklistKey, defaultExamTime } from "./constants.js";
import { state } from "./state.js";
import { applyTranslations } from "./i18n.js";
import { Wizard, hasCompletedWizard, getWizardData } from "./wizard.js";
import {
  buildExamDateTime,
  buildSchedule,
  downloadIcs,
  getDefaultExamDate,
  renderCalendarInfo,
  renderGoogleLinks,
  renderHeroSummary,
  renderTimeline,
  updateShareLink,
} from "./modules/calendar.js";
import {
  renderDietPhases,
  renderFaq,
  renderHighlights,
  renderImages,
  renderMedCards,
  renderRecipeFilters,
  renderRecipes,
  renderShoppingList,
  renderVideos,
} from "./modules/renderers.js";
import { setupModal } from "./modules/modal.js";

const elements = {
  examDate: document.getElementById("examDate"),
  examTime: document.getElementById("examTime"),
  heroExamDate: document.getElementById("heroExamDate"),
  heroDietDate: document.getElementById("heroDietDate"),
  heroMedsDate: document.getElementById("heroMedsDate"),
  heroHighlights: document.getElementById("heroHighlights"),
  timeline: document.getElementById("timeline"),
  calendarInfo: document.getElementById("calendarInfo"),
  googleEvents: document.getElementById("googleEvents"),
  toggleGoogle: document.getElementById("toggleGoogle"),
  downloadIcs: document.getElementById("downloadIcs"),
  shareLink: document.getElementById("shareLink"),
  copyLink: document.getElementById("copyLink"),
  dietPhases: document.getElementById("dietPhases"),
  medCards: document.getElementById("medCards"),
  shoppingList: document.getElementById("shoppingList"),
  recipeFilters: document.getElementById("recipeFilters"),
  recipeCards: document.getElementById("recipeCards"),
  videoGrid: document.getElementById("videoGrid"),
  imageGrid: document.getElementById("imageGrid"),
  faqList: document.getElementById("faqList"),
  modal: document.getElementById("videoModal"),
  modalBody: document.getElementById("modalBody"),
};

const contentCache = new Map();

const getContent = (lang) => contentCache.get(lang);

const updateCalendar = () => {
  if (!state.examDate) {
    renderHeroSummary(elements, [], state.lang);
    renderTimeline(elements, [], state.lang);
    renderCalendarInfo(elements, []);
    elements.googleEvents.classList.toggle("is-visible", false);
    updateShareLink(elements, state);
    return;
  }

  const examDateTime = buildExamDateTime(state.examDate, state.examTime || defaultExamTime);
  const schedule = buildSchedule(examDateTime, state.lang, state.isConstipated);

  renderHeroSummary(elements, schedule, state.lang);
  renderTimeline(elements, schedule, state.lang);
  renderCalendarInfo(elements, schedule);
  renderGoogleLinks(elements, schedule, state.lang);
  elements.googleEvents.classList.toggle("is-visible", state.showGoogleLinks);
  updateShareLink(elements, state);
};

const onRecipeFilterChange = (filter) => {
  state.recipeFilter = filter;
  const content = getContent(state.lang) || getContent("pt");
  renderRecipeFilters(
    elements,
    translations[state.lang] || translations.pt,
    state,
    onRecipeFilterChange
  );
  renderRecipes(elements, content, state);
};

const applyLanguage = (lang) => {
  state.lang = lang;
  document.documentElement.lang = lang;
  document.querySelectorAll(".lang-btn").forEach((button) => {
    button.classList.toggle("is-active", button.dataset.lang === lang);
  });
  applyTranslations();
  const content = getContent(lang) || getContent("pt");
  if (content) {
    renderHighlights(elements, content);
    renderDietPhases(elements, content);
    renderMedCards(elements, content);
    renderShoppingList(elements, content, checklistKey);
    renderRecipeFilters(
      elements,
      translations[lang] || translations.pt,
      state,
      onRecipeFilterChange
    );
    renderRecipes(elements, content, state);
    renderVideos(elements, content);
    renderImages(elements, content);
    renderFaq(elements, content);
  }
  updateCalendar();
};

const initCalendarInputs = () => {
  const params = new URLSearchParams(window.location.search);
  const urlLang = params.get("lang");
  const urlDate = params.get("exame");
  const urlTime = params.get("hora");

  if (urlLang && translations[urlLang]) {
    state.lang = urlLang;
  }

  if (urlDate) {
    state.examDate = urlDate;
  }
  if (urlTime) {
    state.examTime = urlTime;
  }

  if (!state.examDate) {
    state.examDate = getDefaultExamDate();
  }

  elements.examDate.value = state.examDate;
  elements.examTime.value = state.examTime || defaultExamTime;

  elements.examDate.addEventListener("change", (event) => {
    state.examDate = event.target.value;
    updateCalendar();
  });
  elements.examTime.addEventListener("change", (event) => {
    state.examTime = event.target.value;
    updateCalendar();
  });
};

const setupActions = () => {
  elements.toggleGoogle.addEventListener("click", () => {
    state.showGoogleLinks = !state.showGoogleLinks;
    elements.googleEvents.classList.toggle("is-visible", state.showGoogleLinks);
  });

  elements.downloadIcs.addEventListener("click", () => {
    const examDateTime = buildExamDateTime(state.examDate, state.examTime || defaultExamTime);
    const schedule = buildSchedule(examDateTime, state.lang, state.isConstipated);
    downloadIcs(schedule, state.lang);
  });

  elements.copyLink.addEventListener("click", async () => {
    try {
      await navigator.clipboard.writeText(elements.shareLink.value);
      const original = translations[state.lang].calendar.copyBtn;
      elements.copyLink.textContent = translations[state.lang].calendar.copySuccess;
      setTimeout(() => {
        elements.copyLink.textContent = original;
      }, 1400);
    } catch (error) {
      elements.shareLink.select();
      document.execCommand("copy");
    }
  });

  document.querySelectorAll(".lang-btn").forEach((button) => {
    button.addEventListener("click", () => applyLanguage(button.dataset.lang));
  });

  document.getElementById("resetWizard")?.addEventListener("click", () => {
    if (confirm("Deseja refazer a configuração? Todos os dados serão apagados.")) {
      Wizard.reset();
    }
  });
};

const handleWizardComplete = (wizardData) => {
  state.wizardCompleted = true;
  state.lang = wizardData.language;
  state.examDate = wizardData.examDate;
  state.examTime = wizardData.examTime || defaultExamTime;
  state.medication = wizardData.medication;
  state.isConstipated = wizardData.isConstipated;

  initializeApp();
};

const initializeApp = async () => {
  try {
    const contentPt = await loadContent("pt");
    const contentEn = await loadContent("en");
    contentCache.set("pt", contentPt);
    contentCache.set("en", contentEn);
  } catch (error) {
    console.error(error);
  }

  if (!state.wizardCompleted) {
    const savedWizard = getWizardData();
    if (savedWizard) {
      state.lang = savedWizard.language;
      state.examDate = savedWizard.examDate;
      state.examTime = savedWizard.examTime || defaultExamTime;
      state.medication = savedWizard.medication;
      state.isConstipated = savedWizard.isConstipated;
    }
  }

  initCalendarInputs();
  applyLanguage(state.lang);
  setupActions();
  setupModal(
    {
      modal: elements.modal,
      modalBody: elements.modalBody,
      videoGrid: elements.videoGrid,
    },
    () => state.lang,
    getContent
  );

  if (state.medication) {
    highlightMedication();
  }

  if (state.isConstipated) {
    showConstipationAlert();
  }
};

const highlightMedication = () => {
  console.log("Medicamento selecionado:", state.medication);
};

const showConstipationAlert = () => {
  console.log("Alerta de obstipacao ativo");
};

const init = () => {
  if (hasCompletedWizard()) {
    state.wizardCompleted = true;
    const savedWizard = getWizardData();
    if (savedWizard) {
      state.lang = savedWizard.language;
      state.examDate = savedWizard.examDate;
      state.examTime = savedWizard.examTime || defaultExamTime;
      state.medication = savedWizard.medication;
      state.isConstipated = savedWizard.isConstipated;
    }
    initializeApp();
  } else {
    const wizard = new Wizard(handleWizardComplete);
    wizard.init();
  }
};

init();
