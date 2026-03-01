import {
  applyWizardDataToState,
  initStateFromUrlParams,
  preloadLocalizedContent,
} from '../../js/modules/appBootstrap.js';

describe('appBootstrap', () => {
  it('does nothing when wizard data is not available', () => {
    const appState = {
      lang: 'pt',
      examDate: '2026-01-01',
      examTime: '08:30',
      medication: '',
      isConstipated: false,
    };

    applyWizardDataToState({
      appState,
      wizardData: null,
      defaultExamTime: '08:30',
    });

    expect(appState).toMatchObject({
      lang: 'pt',
      examDate: '2026-01-01',
      examTime: '08:30',
    });
  });

  it('applies wizard data into app state with default exam time fallback', () => {
    const appState = {
      lang: 'pt',
      examDate: '',
      examTime: '',
      medication: '',
      isConstipated: false,
    };

    applyWizardDataToState({
      appState,
      wizardData: {
        language: 'en',
        examDate: '2026-03-10',
        examTime: '',
        medication: 'plenvu',
        isConstipated: true,
      },
      defaultExamTime: '08:30',
    });

    expect(appState).toMatchObject({
      lang: 'en',
      examDate: '2026-03-10',
      examTime: '08:30',
      medication: 'plenvu',
      isConstipated: true,
    });
  });

  it('preloads localized content into cache', async () => {
    const contentCache = new Map();
    const loadContent = vi.fn(async (lang) => ({ lang, ok: true }));

    await preloadLocalizedContent({
      contentCache,
      loadContent,
      languages: ['pt', 'en'],
    });

    expect(loadContent).toHaveBeenCalledTimes(2);
    expect(contentCache.get('pt')).toEqual({ lang: 'pt', ok: true });
    expect(contentCache.get('en')).toEqual({ lang: 'en', ok: true });
  });

  it('preloads default language set when no override is provided', async () => {
    const contentCache = new Map();
    const loadContent = vi.fn(async (lang) => ({ lang }));

    await preloadLocalizedContent({
      contentCache,
      loadContent,
    });

    expect(loadContent).toHaveBeenCalledWith('pt');
    expect(loadContent).toHaveBeenCalledWith('en');
  });

  it('initializes state from URL params and falls back to defaults', () => {
    const appState = {
      lang: 'pt',
      examDate: '',
      examTime: '',
    };

    initStateFromUrlParams({
      appState,
      search: '?lang=en&exame=2026-03-12&hora=09:45',
      translations: { pt: {}, en: {} },
      defaultExamTime: '08:30',
      getDefaultExamDate: () => '2026-03-01',
    });

    expect(appState).toMatchObject({
      lang: 'en',
      examDate: '2026-03-12',
      examTime: '09:45',
    });
  });

  it('uses defaults when URL params are missing or invalid', () => {
    const appState = {
      lang: 'pt',
      examDate: '',
      examTime: '',
    };

    initStateFromUrlParams({
      appState,
      search: '?lang=de',
      translations: { pt: {}, en: {} },
      defaultExamTime: '08:30',
      getDefaultExamDate: () => '2026-04-01',
    });

    expect(appState).toMatchObject({
      lang: 'pt',
      examDate: '2026-04-01',
      examTime: '08:30',
    });
  });

  it('reads search from window location when search argument is omitted', () => {
    const appState = {
      lang: 'pt',
      examDate: '',
      examTime: '',
    };

    const originalPath = `${window.location.pathname}${window.location.search}${window.location.hash}`;
    window.history.replaceState({}, '', '/?lang=en&exame=2026-05-14&hora=07:20');

    try {
      initStateFromUrlParams({
        appState,
        translations: { pt: {}, en: {} },
        defaultExamTime: '08:30',
        getDefaultExamDate: () => '2026-04-01',
      });

      expect(appState).toMatchObject({
        lang: 'en',
        examDate: '2026-05-14',
        examTime: '07:20',
      });
    } finally {
      window.history.replaceState({}, '', originalPath || '/');
    }
  });
});
