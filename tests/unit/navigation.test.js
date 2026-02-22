import { createNavigationController } from '../../js/modules/navigation.js';

const createMediaQueryStub = (matches = false) => ({
  matches,
  addEventListener: vi.fn(),
});

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
});
