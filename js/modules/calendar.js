import { defaultExamTime } from "../constants.js";
import { getText } from "../i18n.js";
import {
  formatCalendarDate,
  formatDate,
  formatDateInput,
  formatTime,
  formatUtcStamp,
} from "../utils/dates.js";
import { buildShareUrl } from "../utils/urls.js";

export const buildSchedule = (examDateTime, lang, isConstipated = false) => {
  if (!examDateTime) {
    return [];
  }

  const dietStart = new Date(examDateTime);
  dietStart.setDate(dietStart.getDate() - 3);
  dietStart.setHours(0, 0, 0, 0);

  const med16 = new Date(examDateTime);
  med16.setHours(med16.getHours() - 16);

  const med10 = new Date(examDateTime);
  med10.setHours(med10.getHours() - 10);

  const events = [
    {
      id: "diet",
      title: getText("timeline.dietStart"),
      dateTime: dietStart,
      showTime: false,
      highlight: false,
    },
    {
      id: "med16",
      title: getText("timeline.med16"),
      dateTime: med16,
      showTime: true,
      highlight: false,
    },
    {
      id: "med10",
      title: getText("timeline.med10"),
      dateTime: med10,
      showTime: true,
      highlight: false,
    },
    {
      id: "exam",
      title: getText("timeline.exam"),
      dateTime: examDateTime,
      showTime: true,
      highlight: true,
    },
  ];

  if (isConstipated) {
    const dulcolax48 = new Date(examDateTime);
    dulcolax48.setDate(dulcolax48.getDate() - 2);
    dulcolax48.setHours(20, 0, 0, 0);

    const dulcolax24 = new Date(examDateTime);
    dulcolax24.setDate(dulcolax24.getDate() - 1);
    dulcolax24.setHours(20, 0, 0, 0);

    events.push(
      {
        id: "dulcolax48",
        title: "Dulcolax (2 comprimidos)",
        dateTime: dulcolax48,
        showTime: true,
        highlight: false,
      },
      {
        id: "dulcolax24",
        title: "Dulcolax (2 comprimidos)",
        dateTime: dulcolax24,
        showTime: true,
        highlight: false,
      }
    );
  }

  return events.sort((a, b) => a.dateTime - b.dateTime);
};

const buildEventDetails = (event, lang) => {
  const lines = [getText("calendarInfo.meds"), getText("calendarInfo.note")];
  if (event.showTime) {
    lines.unshift(`${getText("timeline.withTime")}: ${formatTime(event.dateTime, lang)}`);
  }
  return lines.join("\n");
};

export const renderHeroSummary = (elements, schedule, lang) => {
  const examEvent = schedule.find((item) => item.id === "exam");
  const dietEvent = schedule.find((item) => item.id === "diet");
  const medEvent = schedule.find((item) => item.id === "med16");

  if (!examEvent) {
    elements.heroExamDate.textContent = "--";
    elements.heroDietDate.textContent = "--";
    elements.heroMedsDate.textContent = "--";
    return;
  }

  elements.heroExamDate.textContent = `${formatDate(examEvent.dateTime, lang)} · ${formatTime(
    examEvent.dateTime,
    lang
  )}`;
  if (dietEvent) {
    elements.heroDietDate.textContent = `${formatDate(dietEvent.dateTime, lang)}`;
  }
  if (medEvent) {
    elements.heroMedsDate.textContent = `${formatDate(medEvent.dateTime, lang)} · ${formatTime(
      medEvent.dateTime,
      lang
    )}`;
  }
};

export const renderTimeline = (elements, schedule, lang) => {
  elements.timeline.innerHTML = "";
  if (!schedule.length) {
    const empty = document.createElement("div");
    empty.className = "timeline-item";
    empty.textContent = getText("calendar.noDate");
    elements.timeline.appendChild(empty);
    return;
  }
  schedule.forEach((item) => {
    const card = document.createElement("div");
    card.className = "timeline-item";
    if (item.highlight) {
      card.classList.add("highlight");
    }
    const meta = item.showTime
      ? `${formatDate(item.dateTime, lang)} · ${formatTime(item.dateTime, lang)}`
      : `${formatDate(item.dateTime, lang)}`;
    card.innerHTML = `
      <div class="timeline-title">${item.title}</div>
      <div class="timeline-meta">${meta}</div>
    `;
    elements.timeline.appendChild(card);
  });
};

export const renderCalendarInfo = (elements, schedule) => {
  elements.calendarInfo.innerHTML = "";
  if (!schedule.length) {
    elements.calendarInfo.textContent = getText("calendar.noDate");
    return;
  }

  const list = document.createElement("ul");
  const items = [
    getText("calendarInfo.timezone"),
    getText("calendarInfo.location"),
    getText("calendarInfo.meds"),
    getText("calendarInfo.note"),
  ];
  items.forEach((item) => {
    const li = document.createElement("li");
    li.textContent = item;
    list.appendChild(li);
  });

  const title = document.createElement("strong");
  title.textContent = getText("calendarInfo.title");
  elements.calendarInfo.appendChild(title);
  elements.calendarInfo.appendChild(list);
};

export const renderGoogleLinks = (elements, schedule, lang) => {
  elements.googleEvents.innerHTML = "";
  if (!schedule.length) {
    return;
  }
  schedule.forEach((event) => {
    const eventDate = new Date(event.dateTime);
    const startDate = new Date(
      eventDate.getFullYear(),
      eventDate.getMonth(),
      eventDate.getDate()
    );
    const endDate = new Date(startDate);
    endDate.setDate(endDate.getDate() + 1);
    const dates = `${formatCalendarDate(startDate)}/${formatCalendarDate(endDate)}`;
    const text = event.title;
    const details = buildEventDetails(event, lang);
    const location = event.id === "exam" ? getText("calendarInfo.locationValue") : "";
    const url = new URL("https://calendar.google.com/calendar/render");
    url.searchParams.set("action", "TEMPLATE");
    url.searchParams.set("text", text);
    url.searchParams.set("dates", dates);
    url.searchParams.set("details", details);
    if (location) {
      url.searchParams.set("location", location);
    }
    url.searchParams.set("ctz", "Europe/Lisbon");

    const wrapper = document.createElement("div");
    wrapper.className = "google-link";
    const label = document.createElement("span");
    label.textContent = text;
    const anchor = document.createElement("a");
    anchor.href = url.toString();
    anchor.target = "_blank";
    anchor.rel = "noopener";
    anchor.textContent = getText("calendar.googleOpen");
    wrapper.appendChild(label);
    wrapper.appendChild(anchor);
    elements.googleEvents.appendChild(wrapper);
  });
};

export const updateShareLink = (elements, state) => {
  elements.shareLink.value = buildShareUrl(state.examDate, state.examTime, state.lang);
};

export const downloadIcs = (schedule, lang) => {
  if (!schedule.length) {
    return;
  }

  const dtStamp = formatUtcStamp(new Date());
  const lines = [
    "BEGIN:VCALENDAR",
    "VERSION:2.0",
    "CALSCALE:GREGORIAN",
    "PRODID:-//CUF Prepara//Colonoscopy Prep//PT",
  ];

  schedule.forEach((event) => {
    const eventDate = new Date(event.dateTime);
    const startDate = new Date(
      eventDate.getFullYear(),
      eventDate.getMonth(),
      eventDate.getDate()
    );
    const endDate = new Date(startDate);
    endDate.setDate(endDate.getDate() + 1);
    const uid = `${event.id}-${formatCalendarDate(startDate)}-${Date.now()}@cuf-prepara`;
    lines.push("BEGIN:VEVENT");
    lines.push(`UID:${uid}`);
    lines.push(`DTSTAMP:${dtStamp}`);
    lines.push(`SUMMARY:${event.title}`);
    lines.push(`DTSTART;VALUE=DATE:${formatCalendarDate(startDate)}`);
    lines.push(`DTEND;VALUE=DATE:${formatCalendarDate(endDate)}`);
    const details = buildEventDetails(event, lang);
    lines.push(`DESCRIPTION:${details.replace(/\n/g, "\\n")}`);
    if (event.id === "exam") {
      lines.push(`LOCATION:${getText("calendarInfo.locationValue")}`);
    }
    lines.push("END:VEVENT");
  });

  lines.push("END:VCALENDAR");

  const blob = new Blob([lines.join("\n")], { type: "text/calendar" });
  const link = document.createElement("a");
  link.href = URL.createObjectURL(blob);
  link.download = getText("ics.filename");
  document.body.appendChild(link);
  link.click();
  document.body.removeChild(link);
  URL.revokeObjectURL(link.href);
};

export const buildExamDateTime = (examDate, examTime) => {
  if (!examDate) {
    return null;
  }
  const [year, month, day] = examDate.split("-").map(Number);
  const [hour, minute] = (examTime || defaultExamTime).split(":").map(Number);
  return new Date(year, month - 1, day, hour, minute || 0, 0, 0);
};

export const getDefaultExamDate = () => {
  const defaultDate = new Date();
  defaultDate.setDate(defaultDate.getDate() + 7);
  return formatDateInput(defaultDate);
};
