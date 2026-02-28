import { translations } from './data/translations.js';
import { loadJson, saveJson } from './utils/storage.js';

const WIZARD_KEY = 'cuf-prepara-wizard';
const DEFAULT_EXAM_TIME = '08:30';
const TIME_STEP_MINUTES = 15;
const TIME_MIN_HOUR = 8;
const TIME_MAX_HOUR = 20;

const toDateValue = (date) => {
  const year = date.getFullYear();
  const month = String(date.getMonth() + 1).padStart(2, '0');
  const day = String(date.getDate()).padStart(2, '0');
  return `${year}-${month}-${day}`;
};

const parseDateValue = (value) => {
  if (!/^\d{4}-\d{2}-\d{2}$/.test(value)) {
    return null;
  }

  const [year, month, day] = value.split('-').map((part) => Number.parseInt(part, 10));
  const date = new Date(year, month - 1, day);
  if (
    date.getFullYear() !== year ||
    date.getMonth() !== month - 1 ||
    date.getDate() !== day
  ) {
    return null;
  }

  return date;
};

const isValidTimeValue = (value) => /^([01]\d|2[0-3]):([0-5]\d)$/.test(value);

const isTimeWithinRange = (value) => {
  if (!isValidTimeValue(value)) {
    return false;
  }

  const [hours, minutes] = value.split(':').map((part) => Number.parseInt(part, 10));
  const totalMinutes = hours * 60 + minutes;
  const minMinutes = TIME_MIN_HOUR * 60;
  const maxMinutes = TIME_MAX_HOUR * 60;
  return totalMinutes >= minMinutes && totalMinutes <= maxMinutes;
};

const buildTimeOptions = (stepMinutes, minHour, maxHour) => {
  const options = [];

  for (let hour = minHour; hour <= maxHour; hour += 1) {
    for (let minute = 0; minute < 60; minute += stepMinutes) {
      if (hour === maxHour && minute > 0) {
        break;
      }
      options.push(`${String(hour).padStart(2, '0')}:${String(minute).padStart(2, '0')}`);
    }
  }

  return options;
};

const capitalizeLabel = (value, locale) => {
  if (!value) {
    return value;
  }

  return value.charAt(0).toLocaleUpperCase(locale) + value.slice(1);
};

export class Wizard {
  constructor(onComplete) {
    this.onComplete = onComplete;
    this.isCoarsePointer = window.matchMedia('(pointer: coarse)').matches;
    this.prefersReducedMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
    this.currentStep = 0;
    this.data = {
      language: '',
      examDate: '',
      examTime: DEFAULT_EXAM_TIME,
      medication: '',
      isConstipated: null,
      takesAnticoagulation: null,
      takesIronMedication: null,
    };
    this.elements = {};
    this.calendarViewDate = new Date();
    this.timeOptions = buildTimeOptions(TIME_STEP_MINUTES, TIME_MIN_HOUR, TIME_MAX_HOUR);
    this.activePicker = null;
    this.boundHandleDocumentClick = this.handleDocumentClick.bind(this);
    this.boundHandleKeyDown = this.handleKeyDown.bind(this);
  }

  init() {
    const saved = loadJson(WIZARD_KEY, null);
    if (saved && saved.completed) {
      this.onComplete(saved);
      return;
    }

    this.cacheElements();
    this.bindEvents();
    const hasDeepLinkHash = Boolean(window.location.hash);
    if (hasDeepLinkHash || this.prefersReducedMotion) {
      this.showWizardWithoutSplash();
      return;
    }
    this.showSplash();
  }

  cacheElements() {
    this.elements.overlay = document.getElementById('wizardOverlay');
    this.elements.splash = document.getElementById('wizardSplash');
    this.elements.container = document.getElementById('wizardContainer');
    this.elements.steps = document.querySelectorAll('.wizard-step');
    this.elements.progress = document.querySelectorAll('.wizard-progress-dot');
    this.elements.stepCounter = document.getElementById('wizardStepCounter');
    this.elements.dateInput = document.getElementById('wizardDate');
    this.elements.timeInput = document.getElementById('wizardTime');
    this.elements.dateTrigger = document.getElementById('wizardDateTrigger');
    this.elements.timeTrigger = document.getElementById('wizardTimeTrigger');
    this.elements.dateText = document.getElementById('wizardDateText');
    this.elements.timeText = document.getElementById('wizardTimeText');
    this.elements.datePanel = document.getElementById('wizardDatePanel');
    this.elements.timePanel = document.getElementById('wizardTimePanel');
    this.elements.datePrev = document.getElementById('wizardDatePrev');
    this.elements.dateNext = document.getElementById('wizardDateNext');
    this.elements.dateToday = document.getElementById('wizardDateToday');
    this.elements.calendarMonthLabel = document.getElementById('wizardCalendarMonthLabel');
    this.elements.calendarWeekdays = document.getElementById('wizardCalendarWeekdays');
    this.elements.calendarGrid = document.getElementById('wizardCalendarGrid');
  }

  bindEvents() {
    document.querySelectorAll('.wizard-option').forEach((option) => {
      option.setAttribute('aria-pressed', option.classList.contains('is-selected') ? 'true' : 'false');
    });

    document.querySelectorAll('[data-wizard-lang]').forEach((btn) => {
      btn.addEventListener('click', (e) => {
        e.preventDefault();
        e.stopPropagation();
        const option = e.target.closest('[data-wizard-lang]');
        this.selectOption('language', option.dataset.wizardLang, '[data-wizard-lang]');
        this.updateWizardTexts();
      });
    });

    document.querySelectorAll('[data-wizard-medication]').forEach((btn) => {
      btn.addEventListener('click', (e) => {
        const option = e.target.closest('[data-wizard-medication]');
        this.selectOption('medication', option.dataset.wizardMedication, '[data-wizard-medication]');
      });
    });

    document.querySelectorAll('[data-wizard-constipation]').forEach((btn) => {
      btn.addEventListener('click', (e) => {
        const option = e.target.closest('[data-wizard-constipation]');
        const value = option.dataset.wizardConstipation === 'true';
        this.selectOption('isConstipated', value, '[data-wizard-constipation]');

        const alert = document.getElementById('constipationAlert');
        if (alert) {
          alert.style.display = value ? 'block' : 'none';
        }
      });
    });

    document.querySelectorAll('[data-wizard-anticoagulation]').forEach((btn) => {
      btn.addEventListener('click', (e) => {
        const option = e.target.closest('[data-wizard-anticoagulation]');
        const value = option.dataset.wizardAnticoagulation === 'true';
        this.selectOption('takesAnticoagulation', value, '[data-wizard-anticoagulation]');
      });
    });

    document.querySelectorAll('[data-wizard-iron]').forEach((btn) => {
      btn.addEventListener('click', (e) => {
        const option = e.target.closest('[data-wizard-iron]');
        const value = option.dataset.wizardIron === 'true';
        this.selectOption('takesIronMedication', value, '[data-wizard-iron]');
      });
    });

    document.getElementById('wizardNext')?.addEventListener('click', () => this.next());
    document.getElementById('wizardBack')?.addEventListener('click', () => this.back());
    document.getElementById('wizardStart')?.addEventListener('click', () => this.start());

    this.bindCustomDateTimePickers();
  }

  bindCustomDateTimePickers() {
    this.data.examTime = this.normalizeTimeValue(this.data.examTime);

    if (this.elements.dateInput) {
      this.elements.dateInput.value = this.data.examDate;
      this.elements.dateInput.addEventListener('change', (event) => {
        this.selectDateValue(event.target.value);
      });
    }

    if (this.elements.timeInput) {
      this.elements.timeInput.value = this.data.examTime;
      this.elements.timeInput.addEventListener('change', (event) => {
        this.selectTimeValue(event.target.value);
      });
    }

    if (!this.elements.dateTrigger || !this.elements.timeTrigger) {
      return;
    }

    this.elements.dateTrigger.addEventListener('click', (event) => {
      event.preventDefault();
      this.togglePicker('date');
    });

    this.elements.timeTrigger.addEventListener('click', (event) => {
      event.preventDefault();
      this.togglePicker('time');
    });

    this.elements.datePrev?.addEventListener('click', () => {
      this.shiftCalendarMonth(-1);
    });

    this.elements.dateNext?.addEventListener('click', () => {
      this.shiftCalendarMonth(1);
    });

    this.elements.dateToday?.addEventListener('click', () => {
      this.selectDateValue(toDateValue(new Date()));
    });

    this.elements.calendarGrid?.addEventListener('click', (event) => {
      const button = event.target.closest('button[data-calendar-date]');
      if (!button) {
        return;
      }

      this.selectDateValue(button.dataset.calendarDate);
    });

    this.elements.timePanel?.addEventListener('click', (event) => {
      const button = event.target.closest('button[data-time-value]');
      if (!button) {
        return;
      }

      this.selectTimeValue(button.dataset.timeValue);
    });

    document.addEventListener('click', this.boundHandleDocumentClick);
    document.addEventListener('keydown', this.boundHandleKeyDown);
    this.syncPickerViewDate();
    this.refreshDateTimePickers();
  }

  getLocale() {
    return (this.data.language || 'pt') === 'pt' ? 'pt-PT' : 'en-GB';
  }

  normalizeTimeValue(value) {
    return isTimeWithinRange(value) ? value : DEFAULT_EXAM_TIME;
  }

  syncPickerViewDate() {
    const selectedDate = parseDateValue(this.data.examDate);
    const baseDate = selectedDate || new Date();
    this.calendarViewDate = new Date(baseDate.getFullYear(), baseDate.getMonth(), 1);
  }

  formatDateDisplay(date) {
    const locale = this.getLocale();
    const formatter = new Intl.DateTimeFormat(locale, {
      weekday: 'long',
      day: '2-digit',
      month: 'long',
      year: 'numeric',
    });
    return capitalizeLabel(formatter.format(date), locale);
  }

  formatTimeDisplay(value) {
    if (!isValidTimeValue(value)) {
      return value;
    }

    const [hours, minutes] = value.split(':').map((part) => Number.parseInt(part, 10));
    const preview = new Date(2026, 0, 1, hours, minutes, 0, 0);
    return new Intl.DateTimeFormat(this.getLocale(), {
      hour: '2-digit',
      minute: '2-digit',
      hour12: false,
    }).format(preview);
  }

  refreshDateTimePickers() {
    if (this.elements.dateInput) {
      this.elements.dateInput.value = this.data.examDate;
    }

    if (this.elements.timeInput) {
      this.elements.timeInput.value = this.normalizeTimeValue(this.data.examTime);
    }

    this.updateDateTriggerText();
    this.updateTimeTriggerText();
    this.renderCalendarWeekdays();
    this.renderCalendar();
    this.renderTimeOptions();
  }

  updateDateTriggerText() {
    if (!this.elements.dateText || !this.elements.dateTrigger) {
      return;
    }

    const selectedDate = parseDateValue(this.data.examDate);
    if (!selectedDate) {
      this.elements.dateText.textContent = this.getWizardText('datePlaceholder');
      this.elements.dateTrigger.classList.add('is-placeholder');
      return;
    }

    this.elements.dateText.textContent = this.formatDateDisplay(selectedDate);
    this.elements.dateTrigger.classList.remove('is-placeholder');
  }

  updateTimeTriggerText() {
    if (!this.elements.timeText) {
      return;
    }

    this.data.examTime = this.normalizeTimeValue(this.data.examTime);
    this.elements.timeText.textContent = this.formatTimeDisplay(this.data.examTime);
  }

  renderCalendarWeekdays() {
    if (!this.elements.calendarWeekdays) {
      return;
    }

    const locale = this.getLocale();
    const formatter = new Intl.DateTimeFormat(locale, { weekday: 'short' });
    const mondayReference = new Date(2024, 0, 1);
    this.elements.calendarWeekdays.innerHTML = '';

    for (let index = 0; index < 7; index += 1) {
      const day = new Date(mondayReference);
      day.setDate(mondayReference.getDate() + index);
      const label = document.createElement('span');
      label.textContent = formatter.format(day).replace('.', '');
      this.elements.calendarWeekdays.appendChild(label);
    }
  }

  renderCalendar() {
    if (!this.elements.calendarGrid || !this.elements.calendarMonthLabel) {
      return;
    }

    const locale = this.getLocale();
    const selectedValue = this.data.examDate;
    const todayValue = toDateValue(new Date());
    const currentMonth = new Date(
      this.calendarViewDate.getFullYear(),
      this.calendarViewDate.getMonth(),
      1
    );

    this.elements.calendarMonthLabel.textContent = capitalizeLabel(
      new Intl.DateTimeFormat(locale, { month: 'long', year: 'numeric' }).format(currentMonth),
      locale
    );

    const monthStart = new Date(currentMonth.getFullYear(), currentMonth.getMonth(), 1);
    const gridStart = new Date(monthStart);
    const firstWeekday = (monthStart.getDay() + 6) % 7;
    gridStart.setDate(monthStart.getDate() - firstWeekday);

    this.elements.calendarGrid.innerHTML = '';

    for (let index = 0; index < 42; index += 1) {
      const day = new Date(gridStart);
      day.setDate(gridStart.getDate() + index);

      const dayValue = toDateValue(day);
      const isOutsideMonth = day.getMonth() !== currentMonth.getMonth();
      const isSelected = dayValue === selectedValue;
      const isToday = dayValue === todayValue;

      const button = document.createElement('button');
      button.type = 'button';
      button.className = 'wizard-calendar-day';
      button.textContent = String(day.getDate());
      button.dataset.calendarDate = dayValue;
      button.setAttribute('aria-label', this.formatDateDisplay(day));
      button.setAttribute('aria-pressed', isSelected ? 'true' : 'false');

      if (isOutsideMonth) {
        button.classList.add('is-outside');
      }
      if (isSelected) {
        button.classList.add('is-selected');
      }
      if (isToday) {
        button.classList.add('is-today');
      }

      this.elements.calendarGrid.appendChild(button);
    }
  }

  renderTimeOptions() {
    if (!this.elements.timePanel) {
      return;
    }

    const selectedValue = this.normalizeTimeValue(this.data.examTime);
    const fragment = document.createDocumentFragment();

    this.timeOptions.forEach((value) => {
      const button = document.createElement('button');
      button.type = 'button';
      button.className = 'wizard-time-option';
      button.dataset.timeValue = value;
      button.textContent = this.formatTimeDisplay(value);
      button.setAttribute('aria-selected', value === selectedValue ? 'true' : 'false');
      if (value === selectedValue) {
        button.classList.add('is-selected');
      }
      fragment.appendChild(button);
    });

    this.elements.timePanel.innerHTML = '';
    this.elements.timePanel.appendChild(fragment);
  }

  togglePicker(type) {
    if (this.activePicker === type) {
      this.closePicker(type);
      return;
    }

    this.openPicker(type);
  }

  openPicker(type) {
    this.closeAllPickers();

    if (type === 'date' && this.elements.datePanel && this.elements.dateTrigger) {
      this.elements.datePanel.classList.remove('is-hidden');
      this.elements.dateTrigger.setAttribute('aria-expanded', 'true');
      this.activePicker = 'date';
      this.renderCalendar();
      return;
    }

    if (type === 'time' && this.elements.timePanel && this.elements.timeTrigger) {
      this.elements.timePanel.classList.remove('is-hidden');
      this.elements.timeTrigger.setAttribute('aria-expanded', 'true');
      this.activePicker = 'time';

      const selected = this.elements.timePanel.querySelector('.wizard-time-option.is-selected');
      selected?.scrollIntoView({ block: 'nearest' });
    }
  }

  closePicker(type) {
    if (type === 'date' && this.elements.datePanel && this.elements.dateTrigger) {
      this.elements.datePanel.classList.add('is-hidden');
      this.elements.dateTrigger.setAttribute('aria-expanded', 'false');
    }

    if (type === 'time' && this.elements.timePanel && this.elements.timeTrigger) {
      this.elements.timePanel.classList.add('is-hidden');
      this.elements.timeTrigger.setAttribute('aria-expanded', 'false');
    }

    if (this.activePicker === type) {
      this.activePicker = null;
    }
  }

  closeAllPickers() {
    this.closePicker('date');
    this.closePicker('time');
  }

  handleDocumentClick(event) {
    if (!this.activePicker) {
      return;
    }

    if (event.target.closest('.wizard-picker')) {
      return;
    }

    this.closeAllPickers();
  }

  handleKeyDown(event) {
    if (event.key === 'Escape') {
      this.closeAllPickers();
    }
  }

  shiftCalendarMonth(direction) {
    this.calendarViewDate = new Date(
      this.calendarViewDate.getFullYear(),
      this.calendarViewDate.getMonth() + direction,
      1
    );
    this.renderCalendar();
  }

  selectDateValue(value) {
    const selectedDate = parseDateValue(value);
    if (!selectedDate) {
      return;
    }

    this.data.examDate = value;
    this.calendarViewDate = new Date(selectedDate.getFullYear(), selectedDate.getMonth(), 1);
    this.refreshDateTimePickers();
    this.closePicker('date');
    this.validateStep();
  }

  selectTimeValue(value) {
    this.data.examTime = this.normalizeTimeValue(value);
    this.refreshDateTimePickers();
    this.closePicker('time');
  }

  showSplash() {
    this.elements.overlay.classList.remove('is-hidden');
    this.elements.splash.classList.remove('is-hidden');
    this.elements.container.classList.add('is-hidden');

    const splashTitle = this.elements.splash.querySelector('.wizard-splash-logo');
    if (splashTitle) {
      splashTitle.textContent = translations.pt?.wizard?.splashTitle || 'CUF Prepara';
    }

    const splashDuration = this.isCoarsePointer ? 900 : 2000;
    setTimeout(() => {
      this.elements.splash.classList.add('is-hidden');
      this.elements.container.classList.remove('is-hidden');
      this.showStep(0);
    }, splashDuration);
  }

  showWizardWithoutSplash() {
    this.elements.overlay.classList.remove('is-hidden');
    this.elements.splash.classList.add('is-hidden');
    this.elements.container.classList.remove('is-hidden');
    this.showStep(0);
  }

  showStep(step) {
    this.currentStep = step;
    if (step !== 1) {
      this.closeAllPickers();
    }

    this.elements.steps.forEach((el, index) => {
      el.classList.toggle('is-active', index === step);
    });

    this.elements.progress.forEach((dot, index) => {
      dot.classList.toggle('is-active', index <= step);
    });

    if (this.elements.stepCounter) {
      this.elements.stepCounter.textContent = `${step + 1}/${this.elements.steps.length}`;
    }

    this.updateButtons();
    this.updateWizardTexts();
  }

  updateButtons() {
    const backBtn = document.getElementById('wizardBack');
    const nextBtn = document.getElementById('wizardNext');

    if (backBtn) {
      backBtn.style.display = this.currentStep === 0 ? 'none' : 'block';
      backBtn.textContent = this.t('back');
    }

    if (nextBtn) {
      nextBtn.textContent =
        this.currentStep === this.elements.steps.length - 1 ? this.t('finish') : this.t('next');
    }

    this.validateStep();
  }

  validateStep() {
    const nextBtn = document.getElementById('wizardNext');
    if (!nextBtn) return;

    let isValid = false;

    switch (this.currentStep) {
      case 0:
        isValid = !!this.data.language;
        break;
      case 1:
        isValid = !!this.data.examDate;
        break;
      case 2:
        isValid = !!this.data.medication;
        break;
      case 3:
        isValid = this.data.isConstipated !== null;
        break;
      case 4:
        isValid = this.data.takesAnticoagulation !== null;
        break;
      case 5:
        isValid = this.data.takesIronMedication !== null;
        break;
      default:
        isValid = true;
    }

    nextBtn.disabled = !isValid;
  }

  selectOption(field, value, selector) {
    this.data[field] = value;

    document.querySelectorAll(selector).forEach((el) => {
      el.classList.remove('is-selected');
      el.setAttribute('aria-pressed', 'false');
    });

    const dataAttrMap = {
      language: 'lang',
      medication: 'medication',
      isConstipated: 'constipation',
      takesAnticoagulation: 'anticoagulation',
      takesIronMedication: 'iron',
    };
    const dataAttr = dataAttrMap[field] || field;
    const selected = document.querySelector(`${selector}[data-wizard-${dataAttr}="${value}"]`);
    if (selected) {
      selected.classList.add('is-selected');
      selected.setAttribute('aria-pressed', 'true');
    }

    this.validateStep();
  }

  updateWizardTexts() {
    const lang = this.data.language || 'pt';
    const wizardContainer = document.getElementById('wizardContainer');
    if (wizardContainer) {
      wizardContainer.setAttribute('lang', lang === 'pt' ? 'pt-PT' : 'en-GB');
    }
    document.documentElement.lang = lang === 'pt' ? 'pt' : 'en';

    const steps = [
      { title: 'step1Title', subtitle: 'step1Subtitle' },
      { title: 'step2Title', subtitle: 'step2Subtitle' },
      { title: 'step3Title', subtitle: 'step3Subtitle' },
      { title: 'step4Title', subtitle: 'step4Subtitle' },
      { title: 'step5Title', subtitle: 'step5Subtitle', subtitleHtml: 'step5SubtitleHtml' },
      { title: 'step6Title', subtitle: 'step6Subtitle' },
    ];

    steps.forEach((step, index) => {
      const stepEl = document.querySelector(`.wizard-step[data-step="${index}"]`);
      if (stepEl) {
        const titleEl = stepEl.querySelector('.wizard-step-title');
        const subtitleEl = stepEl.querySelector('.wizard-step-subtitle');
        if (titleEl) titleEl.textContent = this.getWizardText(step.title);
        if (subtitleEl) {
          if (step.subtitleHtml) {
            const subtitleHtml = this.getWizardText(step.subtitleHtml);
            subtitleEl.innerHTML = subtitleHtml || this.getWizardText(step.subtitle);
          } else {
            subtitleEl.textContent = this.getWizardText(step.subtitle);
          }
        }
      }
    });

    const languageOptions = {
      pt: { title: 'pt', desc: 'ptDesc' },
      en: { title: 'en', desc: 'enDesc' },
    };

    Object.entries(languageOptions).forEach(([key, texts]) => {
      const option = document.querySelector(`[data-wizard-lang="${key}"]`);
      if (option) {
        const titleEl = option.querySelector('.wizard-option-title');
        const descEl = option.querySelector('.wizard-option-description');
        if (titleEl) titleEl.textContent = this.getWizardText(texts.title);
        if (descEl) descEl.textContent = this.getWizardText(texts.desc);
      }
    });

    const medicationOptions = {
      plenvu: { title: 'plenvu', desc: 'plenvuDesc' },
      moviprep: { title: 'moviprep', desc: 'moviprepDesc' },
      citrafleet: { title: 'citrafleet', desc: 'citrafleetDesc' },
    };

    Object.entries(medicationOptions).forEach(([key, texts]) => {
      const option = document.querySelector(`[data-wizard-medication="${key}"]`);
      if (option) {
        const titleEl = option.querySelector('.wizard-option-title');
        const descEl = option.querySelector('.wizard-option-description');
        if (titleEl) titleEl.textContent = this.getWizardText(texts.title);
        if (descEl) descEl.textContent = this.getWizardText(texts.desc);
      }
    });

    const constipationOptions = {
      true: { title: 'yes', desc: 'yesDesc' },
      false: { title: 'no', desc: 'noDesc' },
    };

    Object.entries(constipationOptions).forEach(([key, texts]) => {
      const option = document.querySelector(`[data-wizard-constipation="${key}"]`);
      if (option) {
        const titleEl = option.querySelector('.wizard-option-title');
        const descEl = option.querySelector('.wizard-option-description');
        if (titleEl) titleEl.textContent = this.getWizardText(texts.title);
        if (descEl) descEl.textContent = this.getWizardText(texts.desc);
      }
    });

    const anticoagulationOptions = {
      true: { title: 'yes', desc: 'anticoagulationYesDesc' },
      false: { title: 'no', desc: 'anticoagulationNoDesc' },
    };

    Object.entries(anticoagulationOptions).forEach(([key, texts]) => {
      const option = document.querySelector(`[data-wizard-anticoagulation="${key}"]`);
      if (option) {
        const titleEl = option.querySelector('.wizard-option-title');
        const descEl = option.querySelector('.wizard-option-description');
        if (titleEl) titleEl.textContent = this.getWizardText(texts.title);
        if (descEl) descEl.textContent = this.getWizardText(texts.desc);
      }
    });

    const ironOptions = {
      true: { title: 'yes', desc: 'ironYesDesc' },
      false: { title: 'no', desc: 'ironNoDesc' },
    };

    Object.entries(ironOptions).forEach(([key, texts]) => {
      const option = document.querySelector(`[data-wizard-iron="${key}"]`);
      if (option) {
        const titleEl = option.querySelector('.wizard-option-title');
        const descEl = option.querySelector('.wizard-option-description');
        if (titleEl) titleEl.textContent = this.getWizardText(texts.title);
        if (descEl) descEl.textContent = this.getWizardText(texts.desc);
      }
    });

    const nextBtn = document.getElementById('wizardNext');
    const backBtn = document.getElementById('wizardBack');

    if (nextBtn) {
      nextBtn.textContent =
        this.currentStep === this.elements.steps.length - 1
          ? this.getWizardText('finish')
          : this.getWizardText('next');
    }
    if (backBtn) {
      backBtn.textContent = this.getWizardText('back');
    }

    const dateLabel = document.querySelector('label[for="wizardDateTrigger"]');
    const timeLabel = document.querySelector('label[for="wizardTimeTrigger"]');
    if (dateLabel) dateLabel.textContent = this.getWizardText('dateLabel');
    if (timeLabel) timeLabel.textContent = this.getWizardText('timeLabel');
    if (this.elements.dateToday) this.elements.dateToday.textContent = this.getWizardText('today');
    if (this.elements.datePrev) {
      this.elements.datePrev.setAttribute('aria-label', this.getWizardText('previousMonth'));
    }
    if (this.elements.dateNext) {
      this.elements.dateNext.setAttribute('aria-label', this.getWizardText('nextMonth'));
    }

    const alertText = document.querySelector('#constipationAlert .wizard-alert-text');
    if (alertText) alertText.textContent = this.getWizardText('constipationAlert');

    this.refreshDateTimePickers();
  }

  getWizardText(key) {
    const lang = this.data.language || 'pt';
    const langValue = translations[lang]?.wizard?.[key];
    if (langValue !== undefined) {
      return langValue;
    }

    const fallbackValue = translations.pt?.wizard?.[key];
    if (fallbackValue !== undefined) {
      return fallbackValue;
    }

    return key;
  }

  next() {
    if (this.currentStep < this.elements.steps.length - 1) {
      this.showStep(this.currentStep + 1);
    } else {
      this.finish();
    }
  }

  back() {
    if (this.currentStep > 0) {
      this.showStep(this.currentStep - 1);
    }
  }

  start() {
    this.elements.splash.classList.add('is-hidden');
    this.showStep(0);
  }

  finish() {
    const finalData = {
      ...this.data,
      completed: true,
      timestamp: Date.now(),
    };

    saveJson(WIZARD_KEY, finalData);
    this.elements.overlay.classList.add('is-hidden');
    this.onComplete(finalData);
  }

  t(key) {
    return this.getWizardText(key);
  }

  static reset() {
    localStorage.removeItem(WIZARD_KEY);
    window.location.reload();
  }
}

export const hasCompletedWizard = () => {
  const data = loadJson(WIZARD_KEY, null);
  return data && data.completed;
};

export const getWizardData = () => {
  return loadJson(WIZARD_KEY, null);
};
