import { createNavigationController } from '../../js/modules/navigation.js';

const createMediaQueryStub = (matches = false, useLegacyListener = false) => {
  if (useLegacyListener) {
    return {
      matches,
      addListener: vi.fn(),
    };
  }

  return {
    matches,
    addEventListener: vi.fn(),
  };
};

describe('navigation module', () => {
  beforeEach(() => {
    document.body.innerHTML = `
      <button id="mobileNavToggle" aria-expanded="false"></button>
      <div id="mobileNavBackdrop"></div>
      <nav class="site-nav">
        <a href="#residue">Residue</a>
        <a href="#faq">FAQ</a>
      </nav>
      <div id="prepAccordion">
        <details class="accordion-item" id="residue"><summary>Residue</summary></details>
        <details class="accordion-item" id="faq"><summary>FAQ</summary></details>
      </div>
    `;

    globalThis.requestAnimationFrame = (cb) => cb();
    Element.prototype.scrollIntoView = vi.fn();
    window.location.hash = '';
  });

  it('toggles mobile navigation and closes from backdrop click', () => {
    const elements = {
      mobileNavToggle: document.getElementById('mobileNavToggle'),
      mobileNavBackdrop: document.getElementById('mobileNavBackdrop'),
    };

    const navigation = createNavigationController({
      elements,
      mobileMediaQuery: createMediaQueryStub(false),
    });

    navigation.setupMobileNav();

    elements.mobileNavToggle.click();
    expect(document.body.classList.contains('nav-open')).toBe(true);
    expect(elements.mobileNavToggle.getAttribute('aria-expanded')).toBe('true');

    elements.mobileNavToggle.click();
    expect(document.body.classList.contains('nav-open')).toBe(false);
    expect(elements.mobileNavToggle.getAttribute('aria-expanded')).toBe('false');

    elements.mobileNavToggle.click();
    expect(document.body.classList.contains('nav-open')).toBe(true);

    elements.mobileNavBackdrop.click();
    expect(document.body.classList.contains('nav-open')).toBe(false);
    expect(elements.mobileNavToggle.getAttribute('aria-expanded')).toBe('false');
  });

  it('opens accordion item from hash and marks current nav link', () => {
    const elements = {
      mobileNavToggle: document.getElementById('mobileNavToggle'),
      mobileNavBackdrop: document.getElementById('mobileNavBackdrop'),
    };

    const navigation = createNavigationController({
      elements,
      mobileMediaQuery: createMediaQueryStub(false),
    });

    window.location.hash = '#faq';
    navigation.openAccordionFromHash();

    const faqDetails = document.getElementById('faq');
    const faqLink = document.querySelector('.site-nav a[href="#faq"]');
    const residueLink = document.querySelector('.site-nav a[href="#residue"]');

    expect(faqDetails.open).toBe(true);
    expect(faqLink.classList.contains('is-current')).toBe(true);
    expect(residueLink.classList.contains('is-current')).toBe(false);
  });

  it('handles escape, media query changes and empty/invalid hashes', () => {
    const elements = {
      mobileNavToggle: document.getElementById('mobileNavToggle'),
      mobileNavBackdrop: document.getElementById('mobileNavBackdrop'),
    };
    const mediaQuery = createMediaQueryStub(true, true);

    const navigation = createNavigationController({
      elements,
      mobileMediaQuery: mediaQuery,
    });

    navigation.setupMobileNav();

    elements.mobileNavToggle.click();
    expect(document.body.classList.contains('nav-open')).toBe(true);

    document.dispatchEvent(new KeyboardEvent('keydown', { key: 'Escape' }));
    expect(document.body.classList.contains('nav-open')).toBe(false);

    const mediaChangeHandler = mediaQuery.addListener.mock.calls[0][0];
    elements.mobileNavToggle.click();
    mediaChangeHandler({ matches: false });
    expect(document.body.classList.contains('nav-open')).toBe(false);

    window.location.hash = '#unknown';
    navigation.openAccordionFromHash();
    expect(document.getElementById('faq').open).toBe(false);
    expect(document.getElementById('residue').open).toBe(false);

    window.location.hash = '';
    navigation.openAccordionFromHash();
    expect(document.querySelector('.site-nav a.is-current')).toBeNull();
  });

  it('enforces one-open-item accordion behavior and syncs nav state', () => {
    const elements = {
      mobileNavToggle: document.getElementById('mobileNavToggle'),
      mobileNavBackdrop: document.getElementById('mobileNavBackdrop'),
    };

    const navigation = createNavigationController({
      elements,
      mobileMediaQuery: createMediaQueryStub(true),
    });

    navigation.setupAccordionBehavior();

    const residue = document.getElementById('residue');
    const faq = document.getElementById('faq');
    const residueLink = document.querySelector('.site-nav a[href="#residue"]');
    const faqLink = document.querySelector('.site-nav a[href="#faq"]');

    residue.open = true;
    residue.dispatchEvent(new Event('toggle'));
    expect(residueLink.classList.contains('is-current')).toBe(true);

    faq.open = true;
    faq.dispatchEvent(new Event('toggle'));
    expect(residue.open).toBe(false);
    expect(faqLink.classList.contains('is-current')).toBe(true);

    faq.open = false;
    faq.dispatchEvent(new Event('toggle'));
    expect(document.querySelector('.site-nav a.is-current')).toBeNull();
    expect(Element.prototype.scrollIntoView).toHaveBeenCalled();
  });

  it('handles non-escape keys and matched media changes without closing nav', () => {
    const elements = {
      mobileNavToggle: document.getElementById('mobileNavToggle'),
      mobileNavBackdrop: document.getElementById('mobileNavBackdrop'),
    };
    const mediaQuery = createMediaQueryStub(false);

    const navigation = createNavigationController({
      elements,
      mobileMediaQuery: mediaQuery,
    });

    navigation.setupMobileNav();
    elements.mobileNavToggle.click();
    expect(document.body.classList.contains('nav-open')).toBe(true);

    document.dispatchEvent(new KeyboardEvent('keydown', { key: 'Enter' }));
    expect(document.body.classList.contains('nav-open')).toBe(true);

    const mediaChangeHandler = mediaQuery.addEventListener.mock.calls[0][1];
    mediaChangeHandler({ matches: true });
    expect(document.body.classList.contains('nav-open')).toBe(true);

    elements.mobileNavToggle.click();
    expect(document.body.classList.contains('nav-open')).toBe(false);
  });

  it('supports missing nav toggle and missing accordion container safely', () => {
    document.body.innerHTML = `
      <nav class="site-nav">
        <a href="#residue">Residue</a>
      </nav>
    `;

    const mediaQuery = createMediaQueryStub(false);
    const navigation = createNavigationController({
      elements: {
        mobileNavToggle: null,
        mobileNavBackdrop: null,
      },
      mobileMediaQuery: mediaQuery,
    });

    expect(() => navigation.setupMobileNav()).not.toThrow();
    expect(() => navigation.openAccordionFromHash()).not.toThrow();
    expect(() => navigation.setupAccordionBehavior()).not.toThrow();
    navigation.setCurrentNavItem();

    expect(mediaQuery.addEventListener).not.toHaveBeenCalled();
    expect(document.querySelector('.site-nav a.is-current')).toBeNull();
  });

  it('scrolls opened accordion items into view on hash navigation and desktop toggle', () => {
    const mobileNavigation = createNavigationController({
      elements: {
        mobileNavToggle: document.getElementById('mobileNavToggle'),
        mobileNavBackdrop: document.getElementById('mobileNavBackdrop'),
      },
      mobileMediaQuery: createMediaQueryStub(true),
    });

    window.location.hash = '#faq';
    mobileNavigation.openAccordionFromHash();
    expect(Element.prototype.scrollIntoView).toHaveBeenCalled();

    Element.prototype.scrollIntoView.mockClear();

    const desktopNavigation = createNavigationController({
      elements: {
        mobileNavToggle: document.getElementById('mobileNavToggle'),
        mobileNavBackdrop: document.getElementById('mobileNavBackdrop'),
      },
      mobileMediaQuery: createMediaQueryStub(false),
    });

    desktopNavigation.setupAccordionBehavior();
    const residue = document.getElementById('residue');
    residue.open = true;
    residue.dispatchEvent(new Event('toggle'));

    expect(Element.prototype.scrollIntoView).toHaveBeenCalled();
  });
});
