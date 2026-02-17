import { translations } from './data/translations.js';
import { checklistKey } from './constants.js';
import { loadJson, saveJson } from './utils/storage.js';

const WIZARD_KEY = 'cuf-prepara-wizard';

export class Wizard {
  constructor(onComplete) {
    this.onComplete = onComplete;
    this.currentStep = 0;
    this.data = {
      language: '',
      examDate: '',
      examTime: '08:30',
      medication: '',
      isConstipated: null,
    };
    this.elements = {};
  }

  init() {
    const saved = loadJson(WIZARD_KEY, null);
    if (saved && saved.completed) {
      this.onComplete(saved);
      return;
    }

    this.cacheElements();
    this.bindEvents();
    this.showSplash();
  }

  cacheElements() {
    this.elements.overlay = document.getElementById('wizardOverlay');
    this.elements.splash = document.getElementById('wizardSplash');
    this.elements.container = document.getElementById('wizardContainer');
    this.elements.steps = document.querySelectorAll('.wizard-step');
    this.elements.progress = document.querySelectorAll('.wizard-progress-dot');
  }

  bindEvents() {
    // Language selection
    document.querySelectorAll('[data-wizard-lang]').forEach((btn) => {
      btn.addEventListener('click', (e) => {
        e.preventDefault();
        e.stopPropagation();
        const option = e.target.closest('[data-wizard-lang]');
        this.selectOption('language', option.dataset.wizardLang, '[data-wizard-lang]');
        // Update all wizard texts when language changes
        this.updateWizardTexts();
      });
    });

    // Medication selection
    document.querySelectorAll('[data-wizard-medication]').forEach((btn) => {
      btn.addEventListener('click', (e) => {
        const option = e.target.closest('[data-wizard-medication]');
        this.selectOption('medication', option.dataset.wizardMedication, '[data-wizard-medication]');
      });
    });

    // Constipation selection
    document.querySelectorAll('[data-wizard-constipation]').forEach((btn) => {
      btn.addEventListener('click', (e) => {
        const option = e.target.closest('[data-wizard-constipation]');
        const value = option.dataset.wizardConstipation === 'true';
        this.selectOption('isConstipated', value, '[data-wizard-constipation]');
        
        // Show/hide constipation alert
        const alert = document.getElementById('constipationAlert');
        if (alert) {
          alert.style.display = value ? 'block' : 'none';
        }
      });
    });

    // Navigation buttons
    document.getElementById('wizardNext')?.addEventListener('click', () => this.next());
    document.getElementById('wizardBack')?.addEventListener('click', () => this.back());
    document.getElementById('wizardStart')?.addEventListener('click', () => this.start());

    // Input changes
    document.getElementById('wizardDate')?.addEventListener('change', (e) => {
      this.data.examDate = e.target.value;
      this.validateStep();
    });

    document.getElementById('wizardTime')?.addEventListener('change', (e) => {
      this.data.examTime = e.target.value;
    });

    // Make entire input wrapper clickable to open picker
    document.querySelectorAll('.wizard-input-wrapper').forEach((wrapper) => {
      const input = wrapper.querySelector('input[type="date"], input[type="time"]');
      if (input) {
        wrapper.addEventListener('click', (e) => {
          // Prevent default to stop event bubbling issues
          e.preventDefault();
          e.stopPropagation();
          
          // Always focus the input first
          input.focus();
          
          // Try to open the picker using showPicker() API
          if (typeof input.showPicker === 'function') {
            try {
              input.showPicker();
            } catch (err) {
              // If showPicker fails, fall back to click simulation
              const clickEvent = new MouseEvent('click', {
                view: window,
                bubbles: true,
                cancelable: true
              });
              input.dispatchEvent(clickEvent);
            }
          } else {
            // Fallback for browsers without showPicker support
            input.click();
          }
        });
      }
    });

    // Make labels trigger the picker too
    document.querySelectorAll('.wizard-input-field label').forEach((label) => {
      const inputId = label.getAttribute('for');
      const input = document.getElementById(inputId);
      if (input && (input.type === 'date' || input.type === 'time')) {
        label.addEventListener('click', (e) => {
          e.preventDefault();
          e.stopPropagation();
          
          input.focus();
          
          if (typeof input.showPicker === 'function') {
            try {
              input.showPicker();
            } catch (err) {
              input.click();
            }
          } else {
            input.click();
          }
        });
      }
    });
  }

  showSplash() {
    // Show overlay first, then splash
    this.elements.overlay.classList.remove('is-hidden');
    this.elements.splash.classList.remove('is-hidden');
    this.elements.container.classList.add('is-hidden');

    // Update splash text
    const splashTitle = this.elements.splash.querySelector('.wizard-splash-logo');
    if (splashTitle) {
      splashTitle.textContent = translations['pt']?.wizard?.splashTitle || 'CUF Prepara';
    }

    setTimeout(() => {
      this.elements.splash.classList.add('is-hidden');
      this.elements.container.classList.remove('is-hidden');
      this.showStep(0);
    }, 2000);
  }

  showStep(step) {
    this.currentStep = step;

    this.elements.steps.forEach((el, i) => {
      el.classList.toggle('is-active', i === step);
    });

    this.elements.progress.forEach((dot, i) => {
      dot.classList.toggle('is-active', i <= step);
    });

    this.updateButtons();
    // Update texts when showing step (in case language changed)
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
      nextBtn.textContent = this.currentStep === this.elements.steps.length - 1 ? this.t('finish') : this.t('next');
    }

    this.validateStep();
  }

  validateStep() {
    const nextBtn = document.getElementById('wizardNext');
    if (!nextBtn) return;

    let isValid = false;

    switch (this.currentStep) {
      case 0: // Language
        isValid = !!this.data.language;
        break;
      case 1: // Date/Time
        isValid = !!this.data.examDate;
        break;
      case 2: // Medication
        isValid = !!this.data.medication;
        break;
      case 3: // Constipation
        isValid = this.data.isConstipated !== null;
        break;
      default:
        isValid = true;
    }

    nextBtn.disabled = !isValid;
  }

  selectOption(field, value, selector) {
    this.data[field] = value;

    // Remove is-selected from all options with this selector
    document.querySelectorAll(selector).forEach((el) => {
      el.classList.remove('is-selected');
    });

    // Add is-selected to the clicked option
    // Map field names to data attribute names
    const dataAttrMap = {
      'language': 'lang',
      'medication': 'medication',
      'isConstipated': 'constipation'
    };
    const dataAttr = dataAttrMap[field] || field;
    const selected = document.querySelector(`${selector}[data-wizard-${dataAttr}="${value}"]`);
    if (selected) {
      selected.classList.add('is-selected');
    }

    this.validateStep();
  }

  updateWizardTexts() {
    const lang = this.data.language || 'pt';
    
    // Update date/time input lang attribute for localized picker
    const langAttr = lang === 'pt' ? 'pt-PT' : 'en-GB';
    const wizardDate = document.getElementById('wizardDate');
    const wizardTime = document.getElementById('wizardTime');
    if (wizardDate) {
      wizardDate.setAttribute('lang', langAttr);
    }
    if (wizardTime) {
      wizardTime.setAttribute('lang', langAttr);
    }
    
    // Also update lang on parent wrapper and container for better picker locale detection
    const wizardDateWrapper = document.querySelector('.wizard-input-wrapper');
    if (wizardDateWrapper) {
      wizardDateWrapper.setAttribute('lang', langAttr);
    }
    
    const wizardContainer = document.getElementById('wizardContainer');
    if (wizardContainer) {
      wizardContainer.setAttribute('lang', langAttr);
    }
    
    // Update document lang for broader locale support
    document.documentElement.lang = lang === 'pt' ? 'pt' : 'en';
    
    // Update step titles and subtitles
    const steps = [
      { title: 'step1Title', subtitle: 'step1Subtitle' },
      { title: 'step2Title', subtitle: 'step2Subtitle' },
      { title: 'step3Title', subtitle: 'step3Subtitle' },
      { title: 'step4Title', subtitle: 'step4Subtitle' }
    ];
    
    steps.forEach((step, index) => {
      const stepEl = document.querySelector(`.wizard-step[data-step="${index}"]`);
      if (stepEl) {
        const titleEl = stepEl.querySelector('.wizard-step-title');
        const subtitleEl = stepEl.querySelector('.wizard-step-subtitle');
        if (titleEl) titleEl.textContent = this.getWizardText(step.title);
        if (subtitleEl) subtitleEl.textContent = this.getWizardText(step.subtitle);
      }
    });
    
    // Update language options
    const languageOptions = {
      'pt': { title: 'pt', desc: 'ptDesc' },
      'en': { title: 'en', desc: 'enDesc' }
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
    
    // Update medication options
    const medicationOptions = {
      'plenvu': { title: 'plenvu', desc: 'plenvuDesc' },
      'moviprep': { title: 'moviprep', desc: 'moviprepDesc' },
      'citrafleet': { title: 'citrafleet', desc: 'citrafleetDesc' }
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
    
    // Update constipation options
    const constipationOptions = {
      'true': { title: 'yes', desc: 'yesDesc' },
      'false': { title: 'no', desc: 'noDesc' }
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
    
    // Update navigation buttons
    const nextBtn = document.getElementById('wizardNext');
    const backBtn = document.getElementById('wizardBack');
    
    if (nextBtn) {
      nextBtn.textContent = this.currentStep === this.elements.steps.length - 1 
        ? this.getWizardText('finish') 
        : this.getWizardText('next');
    }
    if (backBtn) {
      backBtn.textContent = this.getWizardText('back');
    }
    
    // Update labels
    const dateLabel = document.querySelector('label[for="wizardDate"]');
    const timeLabel = document.querySelector('label[for="wizardTime"]');
    if (dateLabel) dateLabel.textContent = this.getWizardText('dateLabel');
    if (timeLabel) timeLabel.textContent = this.getWizardText('timeLabel');
    
    // Update constipation alert
    const alertText = document.querySelector('#constipationAlert .wizard-alert-text');
    if (alertText) alertText.textContent = this.getWizardText('constipationAlert');
  }

  getWizardText(key) {
    const lang = this.data.language || 'pt';
    return translations[lang]?.wizard?.[key] || translations['pt']?.wizard?.[key] || key;
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
    return this.getWizardText(this.data.language || 'pt', key);
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
