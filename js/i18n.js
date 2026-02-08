import { translations } from "./data/translations.js";
import { state } from "./state.js";

export const getText = (key) => {
  const parts = key.split(".");
  let current = translations[state.lang];
  for (const part of parts) {
    if (!current || typeof current !== "object") {
      return key;
    }
    current = current[part];
  }
  return current ?? key;
};

export const applyTranslations = () => {
  document.querySelectorAll("[data-i18n]").forEach((node) => {
    const key = node.dataset.i18n;
    const value = getText(key);
    if (typeof value === "string") {
      node.textContent = value;
    }
  });

  document.querySelectorAll("[data-i18n-aria]").forEach((node) => {
    const key = node.dataset.i18nAria;
    const value = getText(key);
    if (typeof value === "string") {
      node.setAttribute("aria-label", value);
    }
  });

  const title = getText("meta.title");
  const description = getText("meta.description");
  if (typeof title === "string") {
    document.title = title;
  }
  const metaDescription = document.querySelector('meta[name="description"]');
  if (metaDescription && typeof description === "string") {
    metaDescription.setAttribute("content", description);
  }
};
