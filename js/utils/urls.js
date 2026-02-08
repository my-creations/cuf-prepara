export const buildShareUrl = (examDate, examTime, lang) => {
  const origin = window.location.origin === "null" ? "" : window.location.origin;
  const baseUrl = origin
    ? `${origin}${window.location.pathname}`
    : window.location.href.split("?")[0];
  const params = new URLSearchParams();
  if (examDate) {
    params.set("exame", examDate);
  }
  if (examTime) {
    params.set("hora", examTime);
  }
  params.set("lang", lang);
  const query = params.toString();
  return query ? `${baseUrl}?${query}` : baseUrl;
};
