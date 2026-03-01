import { applyTranslations, getText } from '../../js/i18n.js';
import { translations } from '../../js/data/translations.js';
import { state } from '../../js/state.js';

describe('i18n module', () => {
  const originalLang = state.lang;

  afterEach(() => {
    state.lang = originalLang;
    document.body.innerHTML = '';
    document.head.innerHTML = '';
  });

  it('returns nested translated values and falls back to key', () => {
    state.lang = 'en';
    expect(getText('alerts.cta')).toBe('Contact the team');
    expect(getText('missing.path.key')).toBe('missing.path.key');
    expect(getText('meta.nonexistent')).toBe('meta.nonexistent');
  });

  it('applies translated text, aria labels and document metadata', () => {
    state.lang = 'en';
    document.head.innerHTML = '<meta name="description" content="">';
    document.body.innerHTML = `
      <button id="cta" data-i18n="alerts.cta">placeholder</button>
      <button id="svgCta" data-i18n="media.play"><svg><circle></circle></svg>old</button>
      <button id="ariaOnly" data-i18n-aria="alerts.cta"></button>
    `;

    applyTranslations();

    expect(document.getElementById('cta').textContent).toBe('Contact the team');

    const svgCta = document.getElementById('svgCta');
    expect(svgCta.innerHTML).toContain('<svg>');
    expect(svgCta.innerHTML).toContain('Watch video');

    expect(document.getElementById('ariaOnly').getAttribute('aria-label')).toBe('Contact the team');
    expect(document.title).toBe('Colonoscopy Preparation Guide | CUF Prepara');
    expect(document.querySelector('meta[name="description"]').getAttribute('content')).toBe(
      'Preparation guide for colonoscopy: phased diet, medication, calendar and checklist'
    );
  });

  it('skips non-string translation nodes and metadata branches', () => {
    state.lang = 'en';
    const originalTitle = translations.en.meta.title;
    const originalDescription = translations.en.meta.description;

    translations.en.meta.title = { text: 'object-title' };
    translations.en.meta.description = { text: 'object-description' };

    document.title = 'Original title';
    document.head.innerHTML = '';
    document.body.innerHTML = `
      <div id="objectNode" data-i18n="meta">old</div>
      <div id="svgBroken" data-i18n="alerts.cta"><svg>broken</div>
      <div id="ariaObject" data-i18n-aria="meta"></div>
    `;

    try {
      applyTranslations();

      expect(document.getElementById('objectNode').textContent).toBe('old');
      expect(document.getElementById('svgBroken').textContent).toContain('Contact the team');
      expect(document.getElementById('ariaObject').hasAttribute('aria-label')).toBe(false);
      expect(document.title).toBe('');
      expect(document.querySelector('meta[name="description"]')).toBeNull();
    } finally {
      translations.en.meta.title = originalTitle;
      translations.en.meta.description = originalDescription;
    }
  });
});
