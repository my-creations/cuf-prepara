import { readFileSync } from "node:fs";

import { translations } from "../../../js/data/translations.js";
import { getMedicationLabel, getMedicationName } from "../../../js/utils/medication.js";

const loadContent = (lang) =>
  JSON.parse(readFileSync(new URL(`../../../data/content.${lang}.json`, import.meta.url), "utf8"));

export const localizedContent = {
  pt: loadContent("pt"),
  en: loadContent("en"),
};

export const getLocalizedContent = (lang) => localizedContent[lang];

export const getLocalizedTranslations = (lang) => translations[lang];

export const getLocalizedVideo = (lang, videoId) =>
  getLocalizedContent(lang).videos.find((video) => video.id === videoId);

export { getMedicationLabel, getMedicationName };
