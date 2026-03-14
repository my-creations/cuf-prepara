export const applyWizardDataToState = ({ appState, wizardData, defaultExamTime }) => {
  if (!wizardData) {
    return;
  }

  appState.lang = wizardData.language;
  appState.examDate = wizardData.examDate;
  appState.examTime = wizardData.examTime || defaultExamTime;
  appState.medication = wizardData.medication;
  appState.isConstipated = wizardData.isConstipated;
  appState.takesAnticoagulation = Boolean(wizardData.takesAnticoagulation);
  appState.takesSubcutaneousMedication = Boolean(wizardData.takesSubcutaneousMedication);
  appState.takesIronMedication = Boolean(wizardData.takesIronMedication);
};

export const preloadLocalizedContent = async ({
  contentCache,
  loadContent,
  languages = ["pt", "en"],
}) => {
  const entries = await Promise.all(
    languages.map(async (lang) => [lang, await loadContent(lang)])
  );

  entries.forEach(([lang, content]) => {
    contentCache.set(lang, content);
  });
};

export const initStateFromUrlParams = ({
  appState,
  search = window.location.search,
  translations,
  defaultExamTime,
  getDefaultExamDate,
}) => {
  const params = new URLSearchParams(search);
  const urlLang = params.get("lang");
  const urlDate = params.get("exame");
  const urlTime = params.get("hora");

  if (urlLang && translations[urlLang]) {
    appState.lang = urlLang;
  }

  if (urlDate) {
    appState.examDate = urlDate;
  }

  if (urlTime) {
    appState.examTime = urlTime;
  }

  if (!appState.examDate) {
    appState.examDate = getDefaultExamDate();
  }

  if (!appState.examTime) {
    appState.examTime = defaultExamTime;
  }
};
