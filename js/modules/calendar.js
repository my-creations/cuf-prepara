import { defaultExamTime } from "../constants.js";
import { getText } from "../i18n.js";
import { getMedicationScheduleLabel, getMedicationName } from "../utils/medication.js";
import {
  formatCalendarDate,
  formatDateInput,
  formatTime,
  formatUtcStamp,
} from "../utils/dates.js";

const getDayLabel = (eventDate, examDateTime, lang) => {
  const diffTime = examDateTime.getTime() - eventDate.getTime();
  const diffDays = Math.floor(diffTime / (1000 * 60 * 60 * 24));
  
  const weekdays = lang === "pt" 
    ? ["Domingo", "Segunda", "Terça", "Quarta", "Quinta", "Sexta", "Sábado"]
    : ["Sunday", "Monday", "Tuesday", "Wednesday", "Thursday", "Friday", "Saturday"];
  
  const dayName = weekdays[eventDate.getDay()];
  const dateStr = eventDate.toLocaleDateString(lang === "pt" ? "pt-PT" : "en-US", {
    day: "2-digit",
    month: "2-digit",
    year: "numeric"
  });
  
  if (diffDays === 0) {
    return lang === "pt" 
      ? `Dia do Exame (${dayName}, ${dateStr})`
      : `Exam Day (${dayName}, ${dateStr})`;
  } else if (diffDays === 1) {
    return lang === "pt"
      ? `Dia 1 antes do exame (${dayName}, ${dateStr})`
      : `1 Day before exam (${dayName}, ${dateStr})`;
  } else if (diffDays === 2) {
    return lang === "pt"
      ? `Dia 2 antes do exame (${dayName}, ${dateStr})`
      : `2 Days before exam (${dayName}, ${dateStr})`;
  } else if (diffDays === 3) {
    return lang === "pt"
      ? `Dia 3 antes do exame (${dayName}, ${dateStr})`
      : `3 Days before exam (${dayName}, ${dateStr})`;
  }
  
  return `${dayName}, ${dateStr}`;
};

export const buildSchedule = (
  examDateTime,
  lang,
  isConstipated = false,
  medication = "",
  takesAnticoagulation = false,
  takesSubcutaneousMedication = false,
  takesIronMedication = false
) => {
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

  const sevenDaysBefore = new Date(examDateTime);
  sevenDaysBefore.setDate(sevenDaysBefore.getDate() - 7);
  sevenDaysBefore.setHours(0, 0, 0, 0);

  const events = [
    {
      id: "diet",
      title: getText("timeline.dietStart"),
      dateTime: dietStart,
      showTime: false,
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

  const hasMedication = Boolean(medication);
  const hasMed16 = medication === "citrafleet" || !hasMedication;

  if (takesAnticoagulation) {
    events.push({
      id: "anticoagConsult",
      title: getText("timeline.anticoagConsult"),
      dateTime: new Date(sevenDaysBefore),
      showTime: false,
      highlight: false,
    });
  }

  if (takesIronMedication) {
    events.push({
      id: "ironStop",
      title: getText("timeline.ironStop"),
      dateTime: new Date(sevenDaysBefore),
      showTime: false,
      highlight: false,
    });
  }

  if (takesSubcutaneousMedication) {
    events.push({
      id: "subcutaneousStop",
      title: getText("timeline.subcutaneousStop"),
      dateTime: new Date(sevenDaysBefore),
      showTime: false,
      highlight: false,
    });
  }

  if (hasMed16) {
    events.push({
      id: "med16",
      title: getMedicationScheduleLabel(lang, medication, 16),
      dateTime: med16,
      showTime: true,
      highlight: false,
      medication,
    });
  }

  events.push({
    id: "med10",
    title: getMedicationScheduleLabel(lang, medication, 10),
    dateTime: med10,
    showTime: true,
    highlight: false,
    medication,
  });

  if (isConstipated) {
    const dulcolax48 = new Date(examDateTime);
    dulcolax48.setHours(dulcolax48.getHours() - 48);

    const dulcolax24 = new Date(examDateTime);
    dulcolax24.setHours(dulcolax24.getHours() - 24);

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
  if (event.id === "anticoagConsult") {
    return getText("hero.anticoagWarning");
  }

  if (event.id === "ironStop") {
    return getText("hero.ironSuppAction");
  }

  if (event.id === "subcutaneousStop") {
    return getText("hero.subcutaneousAction");
  }

  const lines = [getText("calendarInfo.meds"), getText("calendarInfo.note")];
  if (event.showTime) {
    lines.unshift(`${getText("timeline.withTime")}: ${formatTime(event.dateTime, lang)}`);
  }
  return lines.join("\n");
};

const formatHeroPlanDate = (date, lang) => {
  if (!(date instanceof Date) || Number.isNaN(date.getTime())) {
    return "--";
  }
  const locale = lang === "pt" ? "pt-PT" : "en-GB";
  const weekdayRaw = new Intl.DateTimeFormat(locale, { weekday: "long" }).format(date);
  const weekday = weekdayRaw
    ? weekdayRaw.charAt(0).toLocaleUpperCase(locale) + weekdayRaw.slice(1)
    : weekdayRaw;
  const day = String(date.getDate()).padStart(2, "0");
  const month = String(date.getMonth() + 1).padStart(2, "0");
  const year = date.getFullYear();
  return `${weekday}, ${day}/${month}/${year}`;
};

const formatHeroPlanDateTime = (date, lang) => {
  if (!(date instanceof Date) || Number.isNaN(date.getTime())) {
    return "--";
  }
  const hours = String(date.getHours()).padStart(2, "0");
  const minutes = String(date.getMinutes()).padStart(2, "0");
  return `${formatHeroPlanDate(date, lang)} · ${hours}:${minutes}`;
};

export const renderHeroSummary = (elements, schedule, lang, state) => {
  const examEvent = schedule.find((item) => item.id === "exam");
  const dietEvent = schedule.find((item) => item.id === "diet");
  const medEvent =
    schedule.find((item) => item.id === "med16") ||
    schedule.find((item) => item.id === "med10");
  const medicationName = getMedicationName(state.medication);

  if (!examEvent) {
    elements.heroExamDate.textContent = "--";
    elements.heroDietDate.textContent = "--";
    elements.heroMedsDate.textContent = "--";
    if (elements.heroAnticoagWarningRow) {
      if (state.takesAnticoagulation) {
        elements.heroAnticoagWarningRow.classList.add("is-visible");
      } else {
        elements.heroAnticoagWarningRow.classList.remove("is-visible");
      }
    }
    if (elements.heroIronValue) {
      elements.heroIronValue.textContent = "--";
    }
    if (elements.heroIronRow) {
      elements.heroIronRow.classList.remove("is-visible");
    }
    if (elements.heroSubcutaneousValue) {
      elements.heroSubcutaneousValue.textContent = "--";
    }
    if (elements.heroSubcutaneousRow) {
      elements.heroSubcutaneousRow.classList.remove("is-visible");
    }
    if (elements.heroDulcolaxRow48) {
      elements.heroDulcolaxRow48.classList.remove("is-visible");
    }
    if (elements.heroDulcolaxRow24) {
      elements.heroDulcolaxRow24.classList.remove("is-visible");
    }
    return;
  }

  if (dietEvent) {
    elements.heroDietDate.textContent = formatHeroPlanDate(dietEvent.dateTime, lang);
  }
  if (medEvent) {
    elements.heroMedsDate.textContent = formatHeroPlanDateTime(medEvent.dateTime, lang);
  }
  if (elements.heroMedsLabel) {
    elements.heroMedsLabel.textContent = medicationName
      ? lang === "pt"
        ? `Toma do ${medicationName}`
        : `Taking ${medicationName}`
      : lang === "pt"
      ? "Toma do"
      : "Taking";
  }
  if (elements.heroAnticoagWarningRow) {
    if (state.takesAnticoagulation) {
      elements.heroAnticoagWarningRow.classList.add("is-visible");
    } else {
      elements.heroAnticoagWarningRow.classList.remove("is-visible");
    }
  }
  if (elements.heroIronRow) {
    if (state.takesIronMedication) {
      const ironStopEvent = schedule.find((item) => item.id === "ironStop");
      if (elements.heroIronValue) {
        elements.heroIronValue.textContent = ironStopEvent
          ? formatHeroPlanDate(ironStopEvent.dateTime, lang)
          : "--";
      }
      elements.heroIronRow.classList.add("is-visible");
    } else {
      if (elements.heroIronValue) {
        elements.heroIronValue.textContent = "--";
      }
      elements.heroIronRow.classList.remove("is-visible");
    }
  }
  if (elements.heroSubcutaneousRow) {
    if (state.takesSubcutaneousMedication) {
      const subcutaneousStopEvent = schedule.find((item) => item.id === "subcutaneousStop");
      if (elements.heroSubcutaneousValue) {
        elements.heroSubcutaneousValue.textContent = subcutaneousStopEvent
          ? formatHeroPlanDate(subcutaneousStopEvent.dateTime, lang)
          : "--";
      }
      elements.heroSubcutaneousRow.classList.add("is-visible");
    } else {
      if (elements.heroSubcutaneousValue) {
        elements.heroSubcutaneousValue.textContent = "--";
      }
      elements.heroSubcutaneousRow.classList.remove("is-visible");
    }
  }
  if (elements.heroDulcolaxRow48 && elements.heroDulcolaxRow24) {
    const dulcolax48 = schedule.find((item) => item.id === "dulcolax48");
    const dulcolax24 = schedule.find((item) => item.id === "dulcolax24");
    if (state.isConstipated) {
      elements.heroDulcolaxRow48.classList.add("is-visible");
      elements.heroDulcolaxRow24.classList.add("is-visible");
      if (elements.heroDulcolaxLabel48) {
        elements.heroDulcolaxLabel48.textContent =
          lang === "pt"
            ? "1ª Dose de Dulcolax"
            : "1st Dose of Dulcolax";
      }
      if (elements.heroDulcolaxLabel24) {
        elements.heroDulcolaxLabel24.textContent =
          lang === "pt"
            ? "2ª Dose de Dulcolax"
            : "2nd Dose of Dulcolax";
      }
      if (elements.heroDulcolaxValue48) {
        elements.heroDulcolaxValue48.textContent = dulcolax48
          ? formatHeroPlanDateTime(dulcolax48.dateTime, lang)
          : "--";
      }
      if (elements.heroDulcolaxValue24) {
        elements.heroDulcolaxValue24.textContent = dulcolax24
          ? formatHeroPlanDateTime(dulcolax24.dateTime, lang)
          : "--";
      }
    } else {
      elements.heroDulcolaxRow48.classList.remove("is-visible");
      elements.heroDulcolaxRow24.classList.remove("is-visible");
    }
  }
  elements.heroExamDate.textContent = formatHeroPlanDateTime(examEvent.dateTime, lang);
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
  
  const examEvent = schedule.find((item) => item.id === "exam");
  const examDateTime = examEvent ? examEvent.dateTime : null;
  
  schedule.forEach((item) => {
    const card = document.createElement("div");
    card.className = "timeline-item";
    if (item.highlight) {
      card.classList.add("highlight");
    }
    
    const dayLabel = examDateTime ? getDayLabel(item.dateTime, examDateTime, lang) : "";
    const meta = item.showTime
      ? `${formatTime(item.dateTime, lang)}`
      : getText("timeline.allDay");
    
    card.innerHTML = `
      <div class="timeline-day-label">${dayLabel}</div>
      <div class="timeline-title">${item.title}</div>
      <div class="timeline-meta">${meta}</div>
    `;
    elements.timeline.appendChild(card);
  });
};

export const renderCalendarInfo = (elements, schedule, lang, state) => {
  elements.calendarInfo.innerHTML = "";
  if (!schedule.length) {
    elements.calendarInfo.textContent = getText("calendar.noDate");
    return;
  }

  const list = document.createElement("ul");
  
  // Build medication text based on user selection
  let medicationText;
  if (state.medication) {
    const medicationName = getMedicationName(state.medication);
    if (state.isConstipated) {
      medicationText = lang === "pt"
        ? `Toma do ${medicationName} + Dulcolax`
        : `Taking ${medicationName} + Dulcolax`;
    } else {
      medicationText = lang === "pt"
        ? `Toma do ${medicationName}`
        : `Taking ${medicationName}`;
    }
  } else {
    medicationText = getText("calendarInfo.meds");
  }
  
  const items = [
    getText("calendarInfo.location"),
    medicationText,
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
    if (event.showTime) {
      // Export timed events with their real local time (serialized in UTC) so reminders fire correctly.
      const timedStart = new Date(eventDate);
      const timedEnd = new Date(eventDate);
      timedEnd.setMinutes(timedEnd.getMinutes() + (event.id === "exam" ? 60 : 30));
      lines.push(`DTSTART:${formatUtcStamp(timedStart)}`);
      lines.push(`DTEND:${formatUtcStamp(timedEnd)}`);
    } else {
      lines.push(`DTSTART;VALUE=DATE:${formatCalendarDate(startDate)}`);
      lines.push(`DTEND;VALUE=DATE:${formatCalendarDate(endDate)}`);
    }
    const details = buildEventDetails(event, lang);
    lines.push(`DESCRIPTION:${details.replace(/\n/g, "\\n")}`);
    if (event.id === "exam") {
      lines.push(`LOCATION:${getText("calendarInfo.locationValue")}`);
    }
    if (event.showTime) {
      const reminderText =
        lang === "pt"
          ? `Lembrete: ${event.title}`
          : `Reminder: ${event.title}`;
      lines.push("BEGIN:VALARM");
      lines.push("ACTION:DISPLAY");
      lines.push("TRIGGER:-PT30M");
      lines.push(`DESCRIPTION:${reminderText.replace(/\n/g, "\\n")}`);
      lines.push("END:VALARM");
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
