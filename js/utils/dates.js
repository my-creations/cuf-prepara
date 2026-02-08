import { localeMap } from "../constants.js";

export const formatDate = (date, lang, options = {}) => {
  const locale = localeMap[lang] || "pt-PT";
  return new Intl.DateTimeFormat(locale, {
    weekday: "short",
    day: "2-digit",
    month: "short",
    year: "numeric",
    ...options,
  }).format(date);
};

export const formatTime = (date, lang) =>
  new Intl.DateTimeFormat(localeMap[lang] || "pt-PT", {
    hour: "2-digit",
    minute: "2-digit",
  }).format(date);

export const formatDateInput = (date) => {
  const year = date.getFullYear();
  const month = String(date.getMonth() + 1).padStart(2, "0");
  const day = String(date.getDate()).padStart(2, "0");
  return `${year}-${month}-${day}`;
};

export const formatCalendarDate = (date) => {
  const year = date.getFullYear();
  const month = String(date.getMonth() + 1).padStart(2, "0");
  const day = String(date.getDate()).padStart(2, "0");
  return `${year}${month}${day}`;
};

export const formatUtcStamp = (date) => {
  const pad = (value) => String(value).padStart(2, "0");
  return (
    `${date.getUTCFullYear()}${pad(date.getUTCMonth() + 1)}${pad(date.getUTCDate())}` +
    `T${pad(date.getUTCHours())}${pad(date.getUTCMinutes())}${pad(date.getUTCSeconds())}Z`
  );
};
