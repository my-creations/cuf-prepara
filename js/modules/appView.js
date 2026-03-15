import { checklistKey, defaultExamTime } from "../constants.js";
import { applyTranslations } from "../i18n.js";
import {
  buildExamDateTime,
  buildSchedule,
  renderHeroSummary,
} from "./calendar.js";
import {
  renderFaq,
  renderFoodGrid,
  renderFocusList,
  renderInfoCard,
  renderOrderedInfoList,
  renderRecipes,
  renderShoppingList,
  renderVideos,
} from "./renderers.js";
import { formatDate, formatTime } from "../utils/dates.js";
import { getMedicationLabel, getMedicationName } from "../utils/medication.js";

export const createAppViewController = ({ elements, state, getContent }) => {
  const renderMedicationStartAlert = (content) => {
    if (!elements.plenvuText || !content) {
      return;
    }

    const alert = document.createElement("div");
    alert.className = "info-card prep-alert";
    alert.setAttribute("data-testid", "medication-start-alert");
    alert.textContent = content;

    elements.plenvuText.appendChild(alert);
  };

  const renderPlenvuPrepGuide = () => {
    if (!elements.plenvuText) {
      return;
    }

    if (state.medication !== "plenvu") {
      return;
    }

    const isPortuguese = state.lang === "pt";
    const illustration = isPortuguese
      ? {
          horizontal: "assets/plenvu-preparation-horizontal-pt.svg",
          vertical: "assets/plenvu-preparation-vertical-pt.svg",
          alt: "Esquema visual da preparação com Plenvu, com instruções para a primeira e segunda toma.",
          label: "Resumo visual da toma de Plenvu",
        }
      : {
          horizontal: "assets/plenvu-preparation-horizontal-en.svg",
          vertical: "assets/plenvu-preparation-vertical-en.svg",
          alt: "Visual Plenvu preparation guide with first-dose and second-dose instructions.",
          label: "Plenvu dose summary",
        };

    const guide = document.createElement("section");
    guide.className = "prep-guide";
    guide.setAttribute("aria-label", illustration.label);

    const picture = document.createElement("picture");
    picture.className = "prep-guide-picture";

    const mobileSource = document.createElement("source");
    mobileSource.media = "(max-width: 720px)";
    mobileSource.srcset = illustration.vertical;

    const image = document.createElement("img");
    image.className = "prep-guide-image";
    image.src = illustration.horizontal;
    image.alt = illustration.alt;
    image.loading = "lazy";
    image.decoding = "async";

    picture.append(mobileSource, image);
    guide.appendChild(picture);
    elements.plenvuText.appendChild(guide);
  };

  const renderMedicationSectionLabels = () => {
    const label = getMedicationLabel(state.lang, state.medication);

    if (elements.navPlenvuLink) {
      elements.navPlenvuLink.textContent = label;
    }

    if (elements.accordionPlenvuTitle) {
      elements.accordionPlenvuTitle.textContent = label;
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

  const updateCalendar = () => {
    if (!state.examDate) {
      renderHeroSummary(elements, [], state.lang, state);
      renderAccordionMeta();
      return;
    }

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

    renderHeroSummary(elements, schedule, state.lang, state);
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
      {
        ...content,
        shoppingList: (content.shoppingList || []).filter((item) => item.category === "other"),
      },
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
    const medicationName = getMedicationName(state.medication);
    const basePlenvuText = content.accordion?.plenvuText || "";
    const medicationNoteTemplate = content.accordion?.plenvuMedicationNote || "";
    const medicationNote =
      medicationName && medicationNoteTemplate
        ? medicationNoteTemplate.replace("$medicamento", medicationName)
        : "";
    const plenvuText = [basePlenvuText, medicationNote].filter(Boolean).join(" ");
    renderInfoCard(elements.plenvuText, plenvuText);
    renderMedicationStartAlert(content.accordion?.medicationStartAlert || "");
    renderPlenvuPrepGuide();

    const medicationFastingAlert = content.accordion?.medicationFastingAlert || "";
    if (elements.medicationFastingAlertBlock) {
      elements.medicationFastingAlertBlock.hidden = !medicationFastingAlert;
    }
    renderInfoCard(elements.medicationFastingAlert, medicationFastingAlert);

    const plenvuTips = content.accordion?.plenvuTips || [];
    const showPlenvuTips = state.medication === "plenvu" && plenvuTips.length > 0;
    if (elements.plenvuTipsBlock) {
      elements.plenvuTipsBlock.hidden = !showPlenvuTips;
    }
    if (showPlenvuTips) {
      renderOrderedInfoList(elements.plenvuTips, plenvuTips);
    } else if (elements.plenvuTips) {
      elements.plenvuTips.innerHTML = "";
    }

    const plenvuVideoId = content.accordion?.plenvuVideoId;
    const plenvuVideo = content.videos?.filter((video) => video.id === plenvuVideoId);
    renderVideos(elements.plenvuVideoGrid, plenvuVideo || []);

    renderInfoCard(elements.examLocation, content.accordion?.examLocation || "");
    renderInfoCard(elements.examChecklist, content.accordion?.examChecklist || "");

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

    renderFocusList(
      elements.residueFocus,
      content.accordion?.residueFocusTitle || "",
      content.accordion?.residueFocus || []
    );
    renderFocusList(
      elements.liquidFocus,
      content.accordion?.liquidFocusTitle || "",
      content.accordion?.liquidFocus || []
    );

    if (state.isConstipated) {
      renderInfoCard(elements.residueDulcolaxReminder, content.accordion?.dulcolaxReminder || "");
      renderInfoCard(elements.liquidDulcolaxReminder, content.accordion?.dulcolaxReminder || "");
      elements.residueDulcolaxReminder?.classList.remove("is-hidden");
      elements.liquidDulcolaxReminder?.classList.remove("is-hidden");
    } else {
      elements.residueDulcolaxReminder?.classList.add("is-hidden");
      elements.liquidDulcolaxReminder?.classList.add("is-hidden");
    }
  };

  const applyLanguage = (lang) => {
    state.lang = lang;
    document.documentElement.lang = lang;

    document.querySelectorAll(".lang-btn").forEach((button) => {
      button.classList.toggle("is-active", button.dataset.lang === lang);
    });

    applyTranslations();
    renderMedicationSectionLabels();

    const content = getContent(lang) || getContent("pt");
    if (content) {
      renderAccordionContent(content);
      renderFaq(elements, content);
    }

    renderAccordionMeta();
    updateCalendar();
  };

  return {
    applyLanguage,
    updateCalendar,
    renderAccordionContent,
    renderAccordionMeta,
    renderMedicationSectionLabels,
  };
};
