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
  renderRecipes,
  renderShoppingList,
  renderVideos,
} from "./renderers.js";
import { formatDate, formatTime } from "../utils/dates.js";
import { getMedicationLabel, getMedicationName } from "../utils/medication.js";

export const createAppViewController = ({ elements, state, getContent }) => {
  const renderPlenvuPrepGuide = () => {
    if (!elements.plenvuText) {
      return;
    }

    if (state.medication !== "plenvu") {
      return;
    }

    const copy =
      state.lang === "pt"
        ? {
            dose1Title: "1ª Toma (Saqueta 1)",
            dose1Steps: [
              { label: "Preparação", value: "Dissolver em 500 ml de água fria" },
              { label: "Como tomar", value: "Beber lentamente em 45 minutos" },
              { label: "Depois", value: "Beber 500 ml de líquidos claros" },
            ],
            dose2Title: "2ª Toma (Saqueta A + B)",
            dose2Steps: [
              { label: "Preparação", value: "Dissolver em 500 ml de água fria" },
              { label: "Dividir", value: "4 copos de 125 ml (preparação)" },
              { label: "Líquidos claros", value: "4 copos de 125 ml (500 ml no total)" },
              { label: "Ritmo", value: "Alternar 1 copo de preparação + 1 copo de líquidos claros a cada 15–20 min" },
            ],
            note: "Pode beber mais líquidos claros se tolerar.",
            visualDose1: "Volume da 1ª toma",
            visualDose2: "Alternância da 2ª toma",
            visualPrep500: "Preparação 500 ml",
            visualClear500: "Líquidos claros 500 ml",
            visualPrep125: "Preparação 125 ml",
            visualClear125: "Líquidos claros 125 ml",
            everyLabel: "a cada",
          }
        : {
            dose1Title: "1st Dose (Sachet 1)",
            dose1Steps: [
              { label: "Preparation", value: "Dissolve in 500 ml of cold water" },
              { label: "How to take", value: "Drink slowly over 45 minutes" },
              { label: "Afterwards", value: "Drink 500 ml of clear liquids" },
            ],
            dose2Title: "2nd Dose (Sachet A + B)",
            dose2Steps: [
              { label: "Preparation", value: "Dissolve in 500 ml of cold water" },
              { label: "Split", value: "4 glasses of 125 ml (prep)" },
              { label: "Clear liquids", value: "4 glasses of 125 ml (500 ml total)" },
              { label: "Pace", value: "Alternate 1 prep glass + 1 clear-liquid glass every 15–20 min" },
            ],
            note: "You may drink more clear liquids if tolerated.",
            visualDose1: "1st dose volume",
            visualDose2: "2nd dose alternation",
            visualPrep500: "Prep 500 ml",
            visualClear500: "Clear liquids 500 ml",
            visualPrep125: "Prep 125 ml",
            visualClear125: "Clear liquids 125 ml",
            everyLabel: "every",
          };

    const guide = document.createElement("section");
    guide.className = "prep-guide";
    guide.setAttribute("aria-label", state.lang === "pt" ? "Resumo visual da toma de Plenvu" : "Plenvu dose summary");

    const dose1 = document.createElement("div");
    dose1.className = "prep-guide-card";
    dose1.innerHTML = `
      <h4>${copy.dose1Title}</h4>
      <ol class="prep-guide-steps">
        ${copy.dose1Steps
          .map(
            (step, index) => `
          <li>
            <span class="prep-guide-step-no">${index + 1}</span>
            <div>
              <strong>${step.label}</strong>
              <span>${step.value}</span>
            </div>
          </li>`
          )
          .join("")}
      </ol>
      <div class="prep-guide-visual" aria-label="${copy.visualDose1}">
        <div class="prep-guide-cup prep-guide-cup-prep">
          <span class="prep-guide-cup-shape" aria-hidden="true"></span>
          <span class="prep-guide-cup-label">${copy.visualPrep500}</span>
        </div>
        <span class="prep-guide-plus" aria-hidden="true">+</span>
        <div class="prep-guide-cup prep-guide-cup-clear">
          <span class="prep-guide-cup-shape" aria-hidden="true"></span>
          <span class="prep-guide-cup-label">${copy.visualClear500}</span>
        </div>
      </div>
    `;

    const dose2 = document.createElement("div");
    dose2.className = "prep-guide-card";
    dose2.innerHTML = `
      <h4>${copy.dose2Title}</h4>
      <ol class="prep-guide-steps">
        ${copy.dose2Steps
          .map(
            (step, index) => `
          <li>
            <span class="prep-guide-step-no">${index + 1}</span>
            <div>
              <strong>${step.label}</strong>
              <span>${step.value}</span>
            </div>
          </li>`
          )
          .join("")}
      </ol>
      <div class="prep-guide-visual prep-guide-visual-stack" aria-label="${copy.visualDose2}">
        <div class="prep-guide-visual-legend">
          <div class="prep-guide-cup prep-guide-cup-prep">
            <span class="prep-guide-cup-shape" aria-hidden="true"></span>
            <span class="prep-guide-cup-label">${copy.visualPrep125}</span>
          </div>
          <span class="prep-guide-plus" aria-hidden="true">+</span>
          <div class="prep-guide-cup prep-guide-cup-clear">
            <span class="prep-guide-cup-shape" aria-hidden="true"></span>
            <span class="prep-guide-cup-label">${copy.visualClear125}</span>
          </div>
        </div>
        <div class="prep-guide-repeat-marker" aria-label="${state.lang === "pt" ? "Repetir" : "Repeat"}">
          <svg viewBox="0 0 24 24" aria-hidden="true" focusable="false">
            <path d="M20 12a8 8 0 0 0-13.66-5.66" />
            <path d="M4 12a8 8 0 0 0 13.66 5.66" />
            <path d="M6 4v6h6" />
            <path d="M18 20v-6h-6" />
          </svg>
        </div>
        <div class="prep-guide-pair-grid" aria-hidden="true">
          ${Array.from({ length: 4 })
            .map(
              () => `
            <div class="prep-guide-pair">
              <div class="prep-guide-pair-cups">
                <span class="prep-guide-mini-cup prep-guide-mini-cup-prep"></span>
                <span class="prep-guide-mini-cup prep-guide-mini-cup-clear"></span>
              </div>
              <span class="prep-guide-pair-time">${copy.everyLabel} 15–20 min</span>
            </div>`
            )
            .join("")}
        </div>
      </div>
    `;

    const note = document.createElement("p");
    note.className = "prep-guide-note";
    note.textContent = copy.note;

    guide.append(dose1, dose2, note);
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
    renderPlenvuPrepGuide();

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
