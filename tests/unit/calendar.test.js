import {
  buildExamDateTime,
  buildSchedule,
  downloadIcs,
  getDefaultExamDate,
  renderCalendarInfo,
  renderHeroSummary,
  renderTimeline,
} from "../../js/modules/calendar.js";
import { state } from "../../js/state.js";

const createHeroElements = () => {
  document.body.innerHTML = `
    <div id="heroAnticoagWarningRow"></div>
    <div id="heroIronRow"></div>
    <span id="heroIronValue"></span>
    <div id="heroSubcutaneousRow"></div>
    <span id="heroSubcutaneousValue"></span>
    <span id="heroDietDate"></span>
    <div id="heroDulcolaxRow48"></div>
    <div id="heroDulcolaxRow24"></div>
    <span id="heroDulcolaxLabel48"></span>
    <span id="heroDulcolaxLabel24"></span>
    <span id="heroDulcolaxValue48"></span>
    <span id="heroDulcolaxValue24"></span>
    <span id="heroMedsDate"></span>
    <span id="heroMedsLabel"></span>
    <span id="heroExamDate"></span>
  `;

  return {
    heroAnticoagWarningRow: document.getElementById("heroAnticoagWarningRow"),
    heroIronRow: document.getElementById("heroIronRow"),
    heroIronValue: document.getElementById("heroIronValue"),
    heroSubcutaneousRow: document.getElementById("heroSubcutaneousRow"),
    heroSubcutaneousValue: document.getElementById("heroSubcutaneousValue"),
    heroDietDate: document.getElementById("heroDietDate"),
    heroDulcolaxRow48: document.getElementById("heroDulcolaxRow48"),
    heroDulcolaxRow24: document.getElementById("heroDulcolaxRow24"),
    heroDulcolaxLabel48: document.getElementById("heroDulcolaxLabel48"),
    heroDulcolaxLabel24: document.getElementById("heroDulcolaxLabel24"),
    heroDulcolaxValue48: document.getElementById("heroDulcolaxValue48"),
    heroDulcolaxValue24: document.getElementById("heroDulcolaxValue24"),
    heroMedsDate: document.getElementById("heroMedsDate"),
    heroMedsLabel: document.getElementById("heroMedsLabel"),
    heroExamDate: document.getElementById("heroExamDate"),
  };
};

describe("calendar module", () => {
  const originalLang = state.lang;

  beforeEach(() => {
    state.lang = "en";
    document.body.innerHTML = "";
  });

  afterEach(() => {
    state.lang = originalLang;
    document.body.innerHTML = "";
    vi.useRealTimers();
    vi.restoreAllMocks();
    vi.unstubAllGlobals();
  });

  it("builds schedules with conditional medication and warning events", () => {
    const examDate = new Date(2026, 1, 22, 8, 30);

    expect(buildSchedule(null, "en")).toEqual([]);

    const plenvuSchedule = buildSchedule(examDate, "en", false, "plenvu", false, false, false);
    const plenvuIds = plenvuSchedule.map((event) => event.id);
    expect(plenvuIds).toEqual(expect.arrayContaining(["diet", "med10", "exam"]));
    expect(plenvuIds).not.toContain("med16");
    expect(plenvuIds).not.toContain("subcutaneousStop");

    const fullSchedule = buildSchedule(examDate, "en", true, "citrafleet", true, true, true);
    const fullIds = fullSchedule.map((event) => event.id);
    expect(fullIds).toEqual(
      expect.arrayContaining([
        "diet",
        "anticoagConsult",
        "ironStop",
        "subcutaneousStop",
        "med16",
        "med10",
        "dulcolax48",
        "dulcolax24",
        "exam",
      ])
    );
    expect(fullSchedule.find((event) => event.id === "med16")?.title).toBe(
      "Taking Citrafleet 16h before"
    );
    expect(fullSchedule.find((event) => event.id === "med10")?.title).toBe(
      "Taking Citrafleet 10h before"
    );

    for (let index = 1; index < fullSchedule.length; index += 1) {
      expect(fullSchedule[index - 1].dateTime.getTime()).toBeLessThanOrEqual(
        fullSchedule[index].dateTime.getTime()
      );
    }
  });

  it("renders hero placeholders when exam event is missing", () => {
    const elements = createHeroElements();

    renderHeroSummary(elements, [], "en", {
      medication: "",
      isConstipated: false,
      takesAnticoagulation: true,
      takesSubcutaneousMedication: true,
      takesIronMedication: false,
    });

    expect(elements.heroExamDate.textContent).toBe("--");
    expect(elements.heroDietDate.textContent).toBe("--");
    expect(elements.heroMedsDate.textContent).toBe("--");
    expect(elements.heroIronValue.textContent).toBe("--");
    expect(elements.heroSubcutaneousValue.textContent).toBe("--");
    expect(elements.heroAnticoagWarningRow.classList.contains("is-visible")).toBe(true);
    expect(elements.heroIronRow.classList.contains("is-visible")).toBe(false);
    expect(elements.heroSubcutaneousRow.classList.contains("is-visible")).toBe(false);
    expect(elements.heroDulcolaxRow48.classList.contains("is-visible")).toBe(false);
    expect(elements.heroDulcolaxRow24.classList.contains("is-visible")).toBe(false);
  });

  it("renders hero summary with iron, subcutaneous, anticoag and dulcolax rows", () => {
    const elements = createHeroElements();
    const examDate = new Date(2026, 1, 22, 8, 30);
    const schedule = buildSchedule(examDate, "en", true, "citrafleet", true, true, true);

    renderHeroSummary(elements, schedule, "en", {
      medication: "citrafleet",
      isConstipated: true,
      takesAnticoagulation: true,
      takesSubcutaneousMedication: true,
      takesIronMedication: true,
    });

    expect(elements.heroExamDate.textContent).not.toBe("--");
    expect(elements.heroDietDate.textContent).not.toBe("--");
    expect(elements.heroMedsDate.textContent).not.toBe("--");
    expect(elements.heroMedsLabel.textContent).toBe("Taking Citrafleet");

    expect(elements.heroAnticoagWarningRow.classList.contains("is-visible")).toBe(true);
    expect(elements.heroIronRow.classList.contains("is-visible")).toBe(true);
    expect(elements.heroIronValue.textContent).not.toBe("--");
    expect(elements.heroSubcutaneousRow.classList.contains("is-visible")).toBe(true);
    expect(elements.heroSubcutaneousValue.textContent).not.toBe("--");
    expect(elements.heroDulcolaxRow48.classList.contains("is-visible")).toBe(true);
    expect(elements.heroDulcolaxRow24.classList.contains("is-visible")).toBe(true);
    expect(elements.heroDulcolaxLabel48.textContent).toBe("1st Dose of Dulcolax");
    expect(elements.heroDulcolaxLabel24.textContent).toBe("2nd Dose of Dulcolax");
  });

  it("renders timeline cards and empty state message", () => {
    const timeline = document.createElement("div");
    renderTimeline({ timeline }, [], "en");
    expect(timeline.textContent).toContain("Select a date to see the schedule");

    const schedule = buildSchedule(
      new Date(2026, 1, 22, 8, 30),
      "en",
      false,
      "moviprep",
      false,
      false,
      false
    );
    renderTimeline({ timeline }, schedule, "en");

    const cards = timeline.querySelectorAll(".timeline-item");
    expect(cards.length).toBe(schedule.length);
    expect(timeline.querySelector(".timeline-item.highlight")).not.toBeNull();
    expect(cards[0].querySelector(".timeline-day-label").textContent).not.toBe("");
  });

  it("renders calendar notes with personalized medication label", () => {
    const calendarInfo = document.createElement("div");

    renderCalendarInfo(
      { calendarInfo },
      buildSchedule(new Date(2026, 1, 22, 8, 30), "en", true, "plenvu", false, false, false),
      "en",
      {
        medication: "plenvu",
        isConstipated: true,
      }
    );

    expect(calendarInfo.textContent).toContain("Quick notes");
    expect(calendarInfo.textContent).toContain("Taking Plenvu + Dulcolax");

    renderCalendarInfo({ calendarInfo }, [], "en", { medication: "", isConstipated: false });
    expect(calendarInfo.textContent).toContain("Select a date to see the schedule");
  });

  it("downloads ICS file with timed reminders and exam location", () => {
    const createObjectUrlSpy = vi.fn(() => "blob:calendar-url");
    const revokeObjectUrlSpy = vi.fn();
    const originalCreateObjectURL = URL.createObjectURL;
    const originalRevokeObjectURL = URL.revokeObjectURL;
    URL.createObjectURL = createObjectUrlSpy;
    URL.revokeObjectURL = revokeObjectUrlSpy;

    function BlobMock(parts, options) {
      this.parts = parts;
      this.options = options;
    }

    vi.stubGlobal("Blob", BlobMock);
    const clickSpy = vi.spyOn(HTMLAnchorElement.prototype, "click").mockImplementation(() => {});

    const schedule = [
      {
        id: "diet",
        title: "Start diet",
        dateTime: new Date(2026, 1, 19, 0, 0),
        showTime: false,
        highlight: false,
      },
      {
        id: "exam",
        title: "Exam event",
        dateTime: new Date(2026, 1, 22, 8, 30),
        showTime: true,
        highlight: true,
      },
    ];

    try {
      downloadIcs(schedule, "en");

      expect(createObjectUrlSpy).toHaveBeenCalledTimes(1);
      expect(clickSpy).toHaveBeenCalledTimes(1);
      expect(revokeObjectUrlSpy).toHaveBeenCalledWith("blob:calendar-url");

      const [blob] = createObjectUrlSpy.mock.calls[0];
      const icsText = blob.parts.join("");
      expect(icsText).toContain("BEGIN:VCALENDAR");
      expect(icsText).toContain("BEGIN:VEVENT");
      expect(icsText).toContain("SUMMARY:Exam event");
      expect(icsText).toContain("BEGIN:VALARM");
      expect(icsText).toContain("LOCATION:Hospital CUF Descobertas");
      expect(icsText).toContain("DTSTART;VALUE=DATE:20260219");
    } finally {
      URL.createObjectURL = originalCreateObjectURL;
      URL.revokeObjectURL = originalRevokeObjectURL;
    }
  });

  it("exports the subcutaneous medication stop as an all-day ICS event", async () => {
    const createObjectUrlSpy = vi.fn(() => "blob:test-calendar");
    const revokeObjectUrlSpy = vi.fn();
    const originalCreateObjectURL = URL.createObjectURL;
    const originalRevokeObjectURL = URL.revokeObjectURL;
    URL.createObjectURL = createObjectUrlSpy;
    URL.revokeObjectURL = revokeObjectUrlSpy;

    class BlobMock {
      constructor(parts, options = {}) {
        this.parts = parts;
        this.type = options.type;
      }

      async text() {
        return this.parts.join("");
      }
    }

    vi.stubGlobal("Blob", BlobMock);
    const clickSpy = vi.spyOn(HTMLAnchorElement.prototype, "click").mockImplementation(() => {});

    try {
      const schedule = buildSchedule(
        new Date("2026-03-22T08:30:00"),
        "en",
        false,
        "plenvu",
        false,
        true,
        false
      );

      downloadIcs(schedule, "en");

      expect(createObjectUrlSpy).toHaveBeenCalledTimes(1);
      expect(clickSpy).toHaveBeenCalledTimes(1);
      expect(revokeObjectUrlSpy).toHaveBeenCalledWith("blob:test-calendar");

      const [blob] = createObjectUrlSpy.mock.calls[0];
      const icsText = await blob.text();

      expect(icsText).toContain("SUMMARY:Stop subcutaneous medication");
      expect(icsText).toContain("DTSTART;VALUE=DATE:20260315");
      expect(icsText).toContain("DTEND;VALUE=DATE:20260316");
      expect(icsText).toContain("DESCRIPTION:Stop one week before the exam");
    } finally {
      URL.createObjectURL = originalCreateObjectURL;
      URL.revokeObjectURL = originalRevokeObjectURL;
    }
  });

  it("builds exam datetime and computes default exam date", () => {
    expect(buildExamDateTime("", "08:30")).toBeNull();

    const exam = buildExamDateTime("2026-03-11", "09:45");
    expect(exam.getFullYear()).toBe(2026);
    expect(exam.getMonth()).toBe(2);
    expect(exam.getDate()).toBe(11);
    expect(exam.getHours()).toBe(9);
    expect(exam.getMinutes()).toBe(45);

    const defaultTimeExam = buildExamDateTime("2026-03-11", "");
    expect(defaultTimeExam.getHours()).toBe(8);
    expect(defaultTimeExam.getMinutes()).toBe(30);

    vi.useFakeTimers();
    vi.setSystemTime(new Date(2026, 0, 10, 12, 0, 0));
    expect(getDefaultExamDate()).toBe("2026-01-17");
  });
});
