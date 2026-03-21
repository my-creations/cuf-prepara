import { translations } from "./data/translations.js";
import { loadContent } from "./data/content.js";
import { defaultExamTime } from "./constants.js";
import { state } from "./state.js";
import { getText } from "./i18n.js";
import { Wizard, hasCompletedWizard, getWizardData } from "./wizard.js";
import {
  buildExamDateTime,
  buildSchedule,
  downloadIcs,
  getDefaultExamDate,
} from "./modules/calendar.js";
import { setupModal } from "./modules/modal.js";
import { setupContactTeamAction } from "./modules/contactTeam.js";
import { createNavigationController } from "./modules/navigation.js";
import { createAppViewController } from "./modules/appView.js";
import {
  applyWizardDataToState,
  initStateFromUrlParams,
  preloadLocalizedContent,
} from "./modules/appBootstrap.js";

const elements = {
  siteNav: document.getElementById("siteNav"),
  mobileNavToggle: document.getElementById("mobileNavToggle"),
  mobileNavBackdrop: document.getElementById("mobileNavBackdrop"),
  heroExamDate: document.getElementById("heroExamDate"),
  heroDietDate: document.getElementById("heroDietDate"),
  heroMedsDate: document.getElementById("heroMedsDate"),
  heroMedsLabel: document.querySelector('[data-i18n="hero.cardMeds"]'),
  heroAnticoagWarningRow: document.getElementById("heroAnticoagWarningRow"),
  heroIronRow: document.getElementById("heroIronRow"),
  heroIronLabel: document.getElementById("heroIronLabel"),
  heroIronValue: document.getElementById("heroIronValue"),
  heroSubcutaneousRow: document.getElementById("heroSubcutaneousRow"),
  heroSubcutaneousLabel: document.getElementById("heroSubcutaneousLabel"),
  heroSubcutaneousValue: document.getElementById("heroSubcutaneousValue"),
  heroDulcolaxRow48: document.getElementById("heroDulcolaxRow48"),
  heroDulcolaxRow24: document.getElementById("heroDulcolaxRow24"),
  heroDulcolaxLabel48: document.getElementById("heroDulcolaxLabel48"),
  heroDulcolaxLabel24: document.getElementById("heroDulcolaxLabel24"),
  heroDulcolaxValue48: document.getElementById("heroDulcolaxValue48"),
  heroDulcolaxValue24: document.getElementById("heroDulcolaxValue24"),
  downloadIcs: document.getElementById("downloadIcs"),
  navPlenvuLink: document.querySelector('a[data-i18n="nav.plenvu"]'),
  accordionPlenvuTitle: document.querySelector('[data-i18n="accordion.sections.plenvu.title"]'),
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
  medicationFastingAlertBlock: document.getElementById("medicationFastingAlertBlock"),
  medicationFastingAlert: document.getElementById("medicationFastingAlert"),
  plenvuTipsBlock: document.getElementById("plenvuTipsBlock"),
  plenvuTips: document.getElementById("plenvuTips"),
  plenvuVideoGrid: document.getElementById("plenvuVideoGrid"),
  examLocation: document.getElementById("examLocation"),
  examArrivalAlertBlock: document.getElementById("examArrivalAlertBlock"),
  examArrivalAlert: document.getElementById("examArrivalAlert"),
  examChecklist: document.getElementById("examChecklist"),
  accordionMetaResidue: document.getElementById("accordionMetaResidue"),
  accordionMetaLiquid: document.getElementById("accordionMetaLiquid"),
  accordionMetaPlenvu: document.getElementById("accordionMetaPlenvu"),
  accordionMetaExam: document.getElementById("accordionMetaExam"),
  faqList: document.getElementById("faqList"),
  modal: document.getElementById("videoModal"),
  modalBody: document.getElementById("modalBody"),
  contactTeamBtn: document.getElementById("contactTeamBtn"),
};

const contentCache = new Map();
const contactTeamEmail = "";
let modalControls = null;

const getNavigationType = () => {
  const navigationEntry = performance.getEntriesByType("navigation")[0];
  if (navigationEntry?.type) {
    return navigationEntry.type;
  }

  if (performance.navigation?.type === performance.navigation.TYPE_RELOAD) {
    return "reload";
  }

  return "navigate";
};

const getSplashDuration = () => {
  if (window.matchMedia("(prefers-reduced-motion: reduce)").matches) {
    return 0;
  }

  return window.matchMedia("(pointer: coarse)").matches ? 900 : 2000;
};

const setSplashCopy = (lang = "pt") => {
  const localizedWizard = translations[lang]?.wizard || translations.pt?.wizard || {};
  const splashTitle = document.querySelector("#wizardSplash .wizard-splash-logo");

  if (splashTitle) {
    splashTitle.textContent = localizedWizard.splashTitle || "CUF Prepara";
  }
};

const scrollPageToTop = ({ clearHash = false } = {}) => {
  if ("scrollRestoration" in window.history) {
    window.history.scrollRestoration = "manual";
  }

  if (clearHash && window.location.hash) {
    window.history.replaceState(null, "", `${window.location.pathname}${window.location.search}`);
  }

  window.scrollTo({ top: 0, left: 0, behavior: "auto" });
};

const runAppEntryTransition = async ({ lang = "pt", clearHash = false, task }) => {
  const splashDuration = getSplashDuration();

  if (splashDuration <= 0) {
    scrollPageToTop({ clearHash });
    await task();
    scrollPageToTop();
    return;
  }

  try {
    await ensureStylesheet("css/wizard.css", "wizardStylesheet");
  } catch (error) {
    console.error(error);
  }

  const overlay = document.getElementById("wizardOverlay");
  const splash = document.getElementById("wizardSplash");
  const container = document.getElementById("wizardContainer");

  if (!overlay || !splash) {
    scrollPageToTop({ clearHash });
    await task();
    scrollPageToTop();
    return;
  }

  setSplashCopy(lang);
  overlay.classList.remove("is-hidden");
  splash.classList.remove("is-hidden");
  container?.classList.add("is-hidden");
  scrollPageToTop({ clearHash });

  await Promise.all([
    Promise.resolve().then(task),
    new Promise((resolve) => setTimeout(resolve, splashDuration)),
  ]);

  splash.classList.add("is-hidden");
  overlay.classList.add("is-hidden");
  scrollPageToTop();
};

const getContent = (lang) => contentCache.get(lang);
const mobileMediaQuery = window.matchMedia("(max-width: 900px)");
const navigation = createNavigationController({ elements, mobileMediaQuery });
const appView = createAppViewController({ elements, state, getContent });

const ensureStylesheet = (href, id) =>
  new Promise((resolve, reject) => {
    const existing = id ? document.getElementById(id) : null;
    if (existing instanceof HTMLLinkElement) {
      if (existing.sheet) {
        resolve(existing);
        return;
      }

      const onLoad = () => {
        cleanup();
        resolve(existing);
      };
      const onError = () => {
        cleanup();
        reject(new Error(`Failed to load stylesheet: ${href}`));
      };
      const cleanup = () => {
        existing.removeEventListener("load", onLoad);
        existing.removeEventListener("error", onError);
      };

      existing.addEventListener("load", onLoad, { once: true });
      existing.addEventListener("error", onError, { once: true });
      return;
    }

    const link = document.createElement("link");
    link.rel = "stylesheet";
    link.href = href;
    if (id) {
      link.id = id;
    }
    link.addEventListener("load", () => resolve(link), { once: true });
    link.addEventListener("error", () => reject(new Error(`Failed to load stylesheet: ${href}`)), {
      once: true,
    });
    document.head.append(link);
  });

const setupActions = () => {
  elements.downloadIcs.addEventListener("click", () => {
    const examDateTime = buildExamDateTime(state.examDate, state.examTime || defaultExamTime);
    const schedule = buildSchedule(
      examDateTime,
      state.lang,
      state.isConstipated,
      state.medication,
      state.takesAnticoagulation,
      state.takesSubcutaneousMedication,
      state.takesIronMedication
    );
    downloadIcs(schedule, state.lang);
  });

  document.querySelectorAll(".lang-btn").forEach((button) => {
    button.addEventListener("click", () => appView.applyLanguage(button.dataset.lang));
  });

  document.querySelectorAll("[data-reset-wizard-trigger]").forEach((button) => {
    button.addEventListener("click", () => {
      if (confirm("Deseja refazer a configuração? Todos os dados serão apagados.")) {
        Wizard.reset();
      }
    });
  });

  document.querySelectorAll(".site-nav a").forEach((link) => {
    link.addEventListener("click", (event) => {
      const targetId = link.getAttribute("href")?.replace("#", "");
      if (!targetId) {
        return;
      }

      const target = document.getElementById(targetId);
      if (target && target.tagName === "DETAILS") {
        if (window.location.hash === `#${targetId}`) {
          event.preventDefault();
          navigation.openAccordionFromHash();
        }
      } else {
        navigation.setCurrentNavItem(targetId);
      }

      navigation.closeMobileNav();
    });
  });

  window.addEventListener("hashchange", navigation.openAccordionFromHash);
};

const handleWizardComplete = async (wizardData) => {
  state.wizardCompleted = true;
  applyWizardDataToState({
    appState: state,
    wizardData,
    defaultExamTime,
  });

  scrollPageToTop({ clearHash: true });
  await initializeApp();
  scrollPageToTop();
};

const initializeApp = async () => {
  if (!state.wizardCompleted) {
    const savedWizard = getWizardData();
    applyWizardDataToState({
      appState: state,
      wizardData: savedWizard,
      defaultExamTime,
    });
  }

  initStateFromUrlParams({
    appState: state,
    translations,
    defaultExamTime,
    getDefaultExamDate,
  });

  // Render language strings + hero/timeline metadata immediately to reduce CLS before JSON content loads.
  appView.applyLanguage(state.lang);

  try {
    await preloadLocalizedContent({
      contentCache,
      loadContent,
      languages: ["pt", "en"],
    });
  } catch (error) {
    console.error(error);
  }

  appView.applyLanguage(state.lang);
  navigation.setupMobileNav();
  navigation.setupAccordionBehavior();

  modalControls = setupModal(
    {
      modal: elements.modal,
      modalBody: elements.modalBody,
      videoGrid: elements.plenvuVideoGrid,
    },
    () => state.lang,
    getContent
  );

  setupContactTeamAction({
    button: elements.contactTeamBtn,
    modalControls,
    modalBody: elements.modalBody,
    getText,
    recipientEmail: contactTeamEmail,
  });

  setupActions();
  navigation.openAccordionFromHash();
};

const init = async () => {
  if (hasCompletedWizard()) {
    state.wizardCompleted = true;
    const savedWizard = getWizardData();
    applyWizardDataToState({
      appState: state,
      wizardData: savedWizard,
      defaultExamTime,
    });

    if (getNavigationType() === "reload") {
      await runAppEntryTransition({
        lang: state.lang,
        clearHash: true,
        task: initializeApp,
      });
    } else {
      await initializeApp();
    }

    return;
  }

  try {
    await ensureStylesheet("css/wizard.css", "wizardStylesheet");
  } catch (error) {
    console.error(error);
  }

  const wizard = new Wizard(handleWizardComplete);
  wizard.init();
};

init();
