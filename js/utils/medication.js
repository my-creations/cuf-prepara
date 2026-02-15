export const getMedicationName = (medication = "") => {
  if (!medication) {
    return "";
  }
  return medication.charAt(0).toUpperCase() + medication.slice(1);
};

export const getMedicationLabel = (lang, medication) => {
  const name = getMedicationName(medication);
  if (!name) {
    return lang === "pt" ? "Medicação" : "Medication";
  }
  return lang === "pt" ? `Toma do ${name}` : `Taking ${name}`;
};

export const getMedicationScheduleLabel = (lang, medication, hours) => {
  const base = getMedicationLabel(lang, medication);
  const suffix = lang === "pt" ? `${hours}h antes` : `${hours}h before`;
  return `${base} ${suffix}`;
};
