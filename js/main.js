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
  renderGoogleLinks,
  renderHeroSummary,
} from "./modules/calendar.js";
import { formatDate, formatTime } from "./utils/dates.js";
import {
  renderFaq,
  renderFoodGrid,
  renderInfoCard,
  renderFocusList,
  renderRecipes,
  renderShoppingList,
  renderVideos,
} from "./modules/renderers.js";
import { setupModal } from "./modules/modal.js";

const elements = {
  siteNav: document.getElementById("siteNav"),
  mobileNavToggle: document.getElementById("mobileNavToggle"),
  mobileNavBackdrop: document.getElementById("mobileNavBackdrop"),
  heroExamDate: document.getElementById("heroExamDate"),
  heroDietDate: document.getElementById("heroDietDate"),
  heroMedsDate: document.getElementById("heroMedsDate"),
  heroMedsLabel: document.querySelector('[data-i18n="hero.cardMeds"]'),
  heroDulcolaxRow48: document.getElementById("heroDulcolaxRow48"),
  heroDulcolaxRow24: document.getElementById("heroDulcolaxRow24"),
  heroDulcolaxLabel48: document.getElementById("heroDulcolaxLabel48"),
  heroDulcolaxLabel24: document.getElementById("heroDulcolaxLabel24"),
  heroDulcolaxValue48: document.getElementById("heroDulcolaxValue48"),
  heroDulcolaxValue24: document.getElementById("heroDulcolaxValue24"),
  googleEvents: document.getElementById("googleEvents"),
  toggleGoogle: document.getElementById("toggleGoogle"),
  downloadIcs: document.getElementById("downloadIcs"),
  shoppingListResidue: document.getElementById("shoppingListResidue"),
  shoppingListLiquid: document.getElementById("shoppingListLiquid"),
  recipeCardsResidue: document.getElementById("recipeCardsResidue"),
  recipeCardsLiquid: document.getElementById("recipeCardsLiquid"),
  residueForbidden: document.getElementById("residueForbidden"),
  residueAllowed: document.getElementById("residueAllowed"),
  liquidForbidden: document.getElementById("liquidForbidden"),
  liquidAllowed: document.getElementById("liquidAllowed"),
  residueDulcolaxReminder: document.getElementById("residueDulcolaxReminder"),
  liquidDulcolaxReminder: document.getElementById("liquidDulcolaxReminder"),
  residueShoppingNote: document.getElementById("residueShoppingNote"),
  liquidShoppingNote: document.getElementById("liquidShoppingNote"),
  residueFocus: document.getElementById("residueFocus"),
  liquidFocus: document.getElementById("liquidFocus"),
  residueIntro: document.getElementById("residueIntro"),
  liquidIntro: document.getElementById("liquidIntro"),
  plenvuText: document.getElementById("plenvuText"),
  plenvuVideoGrid: document.getElementById("plenvuVideoGrid"),
  examLocation: document.getElementById("examLocation"),
  examChecklist: document.getElementById("examChecklist"),
  accordionMetaResidue: document.getElementById("accordionMetaResidue"),
  accordionMetaLiquid: document.getElementById("accordionMetaLiquid"),
  accordionMetaPlenvu: document.getElementById("accordionMetaPlenvu"),
  accordionMetaExam: document.getElementById("accordionMetaExam"),
  faqList: document.getElementById("faqList"),
  modal: document.getElementById("videoModal"),
  modalBody: document.getElementById("modalBody"),
};

const contentCache = new Map();

const getContent = (lang) => contentCache.get(lang);
const mobileMediaQuery = window.matchMedia("(max-width: 900px)");

const setCurrentNavItem = (targetId = "") => {
  document.querySelectorAll(".site-nav a").forEach((link) => {
    const linkTarget = link.getAttribute("href")?.replace("#", "");
    link.classList.toggle("is-current", Boolean(targetId) && linkTarget === targetId);
  });
};

const closeMobileNav = () => {
  document.body.classList.remove("nav-open");
  if (elements.mobileNavToggle) {
    elements.mobileNavToggle.setAttribute("aria-expanded", "false");
  }
};

const openMobileNav = () => {
  document.body.classList.add("nav-open");
  if (elements.mobileNavToggle) {
    elements.mobileNavToggle.setAttribute("aria-expanded", "true");
  }
};

const setupMobileNav = () => {
  const toggle = elements.mobileNavToggle;
  if (!toggle) {
    return;
  }

  toggle.addEventListener("click", () => {
    const shouldOpen = !document.body.classList.contains("nav-open");
    if (shouldOpen) {
      openMobileNav();
    } else {
      closeMobileNav();
    }
  });

  elements.mobileNavBackdrop?.addEventListener("click", closeMobileNav);
  document.addEventListener("keydown", (event) => {
    if (event.key === "Escape") {
      closeMobileNav();
    }
  });

  const onMediaChange = (event) => {
    if (!event.matches) {
      closeMobileNav();
    }
  };

  if (typeof mobileMediaQuery.addEventListener === "function") {
    mobileMediaQuery.addEventListener("change", onMediaChange);
  } else if (typeof mobileMediaQuery.addListener === "function") {
    mobileMediaQuery.addListener(onMediaChange);
  }
};

const setupAccordionBehavior = () => {
  const accordion = document.getElementById("prepAccordion");
  if (!accordion) {
    return;
  }

  const accordionItems = Array.from(accordion.querySelectorAll("details.accordion-item"));
  accordionItems.forEach((item) => {
    item.addEventListener("toggle", () => {
      if (!item.open) {
        return;
      }

      if (mobileMediaQuery.matches) {
        accordionItems.forEach((other) => {
          if (other !== item) {
            other.open = false;
          }
        });

        requestAnimationFrame(() => {
          item.scrollIntoView({ behavior: "smooth", block: "start" });
        });
      }

      setCurrentNavItem(item.id);
    });
  });
};

const updateCalendar = () => {
  if (!state.examDate) {
    renderHeroSummary(elements, [], state.lang, state);
    elements.googleEvents.classList.toggle("is-visible", false);
    renderAccordionMeta();
    return;
  }

  const examDateTime = buildExamDateTime(state.examDate, state.examTime || defaultExamTime);
  const schedule = buildSchedule(
    examDateTime,
    state.lang,
    state.isConstipated,
    state.medication
  );

  renderHeroSummary(elements, schedule, state.lang, state);
  renderGoogleLinks(elements, schedule, state.lang);
  elements.googleEvents.classList.toggle("is-visible", state.showGoogleLinks);
  renderAccordionMeta();
};

const renderAccordionContent = (content) => {
  const recipes = content.recipes || [];
  renderShoppingList(
    elements.shoppingListResidue,
    content,
    checklistKey,
    state.lang,
    state.medication,
    state.isConstipated
  );
  renderShoppingList(
    elements.shoppingListLiquid,
    content,
    checklistKey,
    state.lang,
    state.medication,
    state.isConstipated
  );
  renderRecipes(elements.recipeCardsResidue, recipes, { phase: content.accordion?.residuePhase });
  renderRecipes(elements.recipeCardsLiquid, recipes, { phase: content.accordion?.liquidPhase });
  renderFoodGrid(elements.residueForbidden, content.accordion?.residueForbidden || []);
  renderFoodGrid(elements.residueAllowed, content.accordion?.residueAllowed || []);
  renderFoodGrid(elements.liquidForbidden, content.accordion?.liquidForbidden || []);
  renderFoodGrid(elements.liquidAllowed, content.accordion?.liquidAllowed || []);
  renderInfoCard(elements.plenvuText, content.accordion?.plenvuText || "");
  const plenvuVideoId = content.accordion?.plenvuVideoId;
  const plenvuVideo = content.videos?.filter((video) => video.id === plenvuVideoId);
  renderVideos(elements.plenvuVideoGrid, plenvuVideo || []);
  renderInfoCard(elements.examLocation, content.accordion?.examLocation || "");
  renderInfoCard(elements.examChecklist, content.accordion?.examChecklist || []);
  if (elements.residueShoppingNote) {
    elements.residueShoppingNote.textContent = content.accordion?.residueShoppingNote || "";
  }
  if (elements.liquidShoppingNote) {
    elements.liquidShoppingNote.textContent = content.accordion?.liquidShoppingNote || "";
  }
  if (elements.residueIntro) {
    elements.residueIntro.textContent = content.accordion?.residueIntro || "";
  }
  if (elements.liquidIntro) {
    elements.liquidIntro.textContent = content.accordion?.liquidIntro || "";
  }
  renderFocusList(elements.residueFocus, content.accordion?.residueFocusTitle || "", content.accordion?.residueFocus || []);
  renderFocusList(elements.liquidFocus, content.accordion?.liquidFocusTitle || "", content.accordion?.liquidFocus || []);

  if (state.isConstipated) {
    renderInfoCard(elements.residueDulcolaxReminder, content.accordion?.dulcolaxReminder || "");
    renderInfoCard(elements.liquidDulcolaxReminder, content.accordion?.dulcolaxReminder || "");
    if (elements.residueDulcolaxReminder) {
      elements.residueDulcolaxReminder.classList.remove("is-hidden");
    }
    if (elements.liquidDulcolaxReminder) {
      elements.liquidDulcolaxReminder.classList.remove("is-hidden");
    }
  } else {
    if (elements.residueDulcolaxReminder) {
      elements.residueDulcolaxReminder.classList.add("is-hidden");
    }
    if (elements.liquidDulcolaxReminder) {
      elements.liquidDulcolaxReminder.classList.add("is-hidden");
    }
  }
};

const renderAccordionMeta = () => {
  if (!state.examDate) {
    const placeholders = [
      elements.accordionMetaResidue,
      elements.accordionMetaLiquid,
      elements.accordionMetaPlenvu,
      elements.accordionMetaExam,
    ];
    placeholders.forEach((node) => {
      if (node) {
        node.textContent = "--";
      }
    });
    return;
  }
  const examDateTime = buildExamDateTime(state.examDate, state.examTime || defaultExamTime);
  if (!examDateTime) {
    return;
  }

  const dietStart = new Date(examDateTime);
  dietStart.setDate(dietStart.getDate() - 3);
  dietStart.setHours(0, 0, 0, 0);

  const dietSecond = new Date(examDateTime);
  dietSecond.setDate(dietSecond.getDate() - 2);
  dietSecond.setHours(0, 0, 0, 0);

  const liquidDay = new Date(examDateTime);
  liquidDay.setDate(liquidDay.getDate() - 1);
  liquidDay.setHours(0, 0, 0, 0);

  const med10 = new Date(examDateTime);
  med10.setHours(med10.getHours() - 10);

  const dateOptions = { weekday: "long" };

  const rangeSeparator = state.lang === "pt" ? " e " : " and ";

  if (elements.accordionMetaResidue) {
    elements.accordionMetaResidue.textContent = `${formatDate(
      dietStart,
      state.lang,
      dateOptions
    )}${rangeSeparator}${formatDate(dietSecond, state.lang, dateOptions)}`;
  }
  if (elements.accordionMetaLiquid) {
    elements.accordionMetaLiquid.textContent = `${formatDate(
      liquidDay,
      state.lang,
      dateOptions
    )}`;
  }
  if (elements.accordionMetaPlenvu) {
    elements.accordionMetaPlenvu.textContent = `${formatDate(
      med10,
      state.lang,
      dateOptions
    )} · ${formatTime(med10, state.lang)}`;
  }
  if (elements.accordionMetaExam) {
    elements.accordionMetaExam.textContent = `${formatDate(
      examDateTime,
      state.lang,
      dateOptions
    )} · ${formatTime(examDateTime, state.lang)}`;
  }
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
    renderAccordionContent(content);
    renderFaq(elements, content);
  }
  renderAccordionMeta();
  updateCalendar();
};

const openAccordionFromHash = () => {
  const targetId = window.location.hash.replace("#", "");
  if (!targetId) {
    setCurrentNavItem("");
    return;
  }
  const target = document.getElementById(targetId);
  if (target && target.tagName === "DETAILS") {
    target.open = true;
    if (mobileMediaQuery.matches) {
      requestAnimationFrame(() => {
        target.scrollIntoView({ behavior: "smooth", block: "start" });
      });
    }
  }
  setCurrentNavItem(targetId);
};

const initCalendarState = () => {
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
  if (!state.examTime) {
    state.examTime = defaultExamTime;
  }
};

const setupActions = () => {
  elements.toggleGoogle.addEventListener("click", () => {
    state.showGoogleLinks = !state.showGoogleLinks;
    elements.googleEvents.classList.toggle("is-visible", state.showGoogleLinks);
  });

  elements.downloadIcs.addEventListener("click", () => {
    const examDateTime = buildExamDateTime(state.examDate, state.examTime || defaultExamTime);
    const schedule = buildSchedule(
      examDateTime,
      state.lang,
      state.isConstipated,
      state.medication
    );
    downloadIcs(schedule, state.lang);
  });

  document.querySelectorAll(".lang-btn").forEach((button) => {
    button.addEventListener("click", () => applyLanguage(button.dataset.lang));
  });

  document.getElementById("resetWizard")?.addEventListener("click", () => {
    if (confirm("Deseja refazer a configuração? Todos os dados serão apagados.")) {
      Wizard.reset();
    }
  });

  document.querySelectorAll(".site-nav a").forEach((link) => {
    link.addEventListener("click", () => {
      const targetId = link.getAttribute("href")?.replace("#", "");
      if (!targetId) {
        return;
      }
      const target = document.getElementById(targetId);
      if (target && target.tagName === "DETAILS") {
        target.open = true;
        if (mobileMediaQuery.matches) {
          requestAnimationFrame(() => {
            target.scrollIntoView({ behavior: "smooth", block: "start" });
          });
        }
      }

      setCurrentNavItem(targetId);
      closeMobileNav();
    });
  });

  window.addEventListener("hashchange", openAccordionFromHash);
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

  initCalendarState();
  applyLanguage(state.lang);
  setupMobileNav();
  setupAccordionBehavior();
  setupActions();
  setupModal(
    {
      modal: elements.modal,
      modalBody: elements.modalBody,
      videoGrid: elements.plenvuVideoGrid,
    },
    () => state.lang,
    getContent
  );

  openAccordionFromHash();
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
