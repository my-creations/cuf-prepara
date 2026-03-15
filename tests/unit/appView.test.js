import { createAppViewController } from '../../js/modules/appView.js';
import { state } from '../../js/state.js';

const createElements = () => {
  document.body.innerHTML = `
    <div id="shoppingListResidue"></div>
    <div id="shoppingListLiquid"></div>
    <div id="recipeCardsResidue"></div>
    <div id="recipeCardsLiquid"></div>
    <div id="residueForbidden"></div>
    <div id="residueAllowed"></div>
    <div id="liquidForbidden"></div>
    <div id="liquidAllowed"></div>
    <div id="residueDulcolaxReminder" class="is-hidden"></div>
    <div id="liquidDulcolaxReminder" class="is-hidden"></div>
    <div id="residueShoppingNote"></div>
    <div id="liquidShoppingNote"></div>
    <div id="residueFocus"></div>
    <div id="liquidFocus"></div>
    <div id="residueIntro"></div>
    <div id="liquidIntro"></div>
    <div id="plenvuText"></div>
    <div id="medicationFastingAlertBlock" hidden><div id="medicationFastingAlert"></div></div>
    <div id="plenvuTipsBlock" hidden><div id="plenvuTips"></div></div>
    <div id="plenvuVideoGrid"></div>
    <div id="examLocation"></div>
    <div id="examChecklist"></div>
    <div id="accordionMetaResidue"></div>
    <div id="accordionMetaLiquid"></div>
    <div id="accordionMetaPlenvu"></div>
    <div id="accordionMetaExam"></div>
    <div id="faqList"></div>
  `;

  return {
    shoppingListResidue: document.getElementById('shoppingListResidue'),
    shoppingListLiquid: document.getElementById('shoppingListLiquid'),
    recipeCardsResidue: document.getElementById('recipeCardsResidue'),
    recipeCardsLiquid: document.getElementById('recipeCardsLiquid'),
    residueForbidden: document.getElementById('residueForbidden'),
    residueAllowed: document.getElementById('residueAllowed'),
    liquidForbidden: document.getElementById('liquidForbidden'),
    liquidAllowed: document.getElementById('liquidAllowed'),
    residueDulcolaxReminder: document.getElementById('residueDulcolaxReminder'),
    liquidDulcolaxReminder: document.getElementById('liquidDulcolaxReminder'),
    residueShoppingNote: document.getElementById('residueShoppingNote'),
    liquidShoppingNote: document.getElementById('liquidShoppingNote'),
    residueFocus: document.getElementById('residueFocus'),
    liquidFocus: document.getElementById('liquidFocus'),
    residueIntro: document.getElementById('residueIntro'),
    liquidIntro: document.getElementById('liquidIntro'),
    plenvuText: document.getElementById('plenvuText'),
    medicationFastingAlertBlock: document.getElementById('medicationFastingAlertBlock'),
    medicationFastingAlert: document.getElementById('medicationFastingAlert'),
    plenvuTipsBlock: document.getElementById('plenvuTipsBlock'),
    plenvuTips: document.getElementById('plenvuTips'),
    plenvuVideoGrid: document.getElementById('plenvuVideoGrid'),
    examLocation: document.getElementById('examLocation'),
    examChecklist: document.getElementById('examChecklist'),
    accordionMetaResidue: document.getElementById('accordionMetaResidue'),
    accordionMetaLiquid: document.getElementById('accordionMetaLiquid'),
    accordionMetaPlenvu: document.getElementById('accordionMetaPlenvu'),
    accordionMetaExam: document.getElementById('accordionMetaExam'),
    faqList: document.getElementById('faqList'),
    navPlenvuLink: document.createElement('a'),
    accordionPlenvuTitle: document.createElement('span'),
  };
};

const createContent = () => ({
  accordion: {
    residuePhase: '3 to 2 days before',
    liquidPhase: 'Day before',
    residueIntro: 'Residue intro',
    liquidIntro: 'Liquid intro',
    residueShoppingNote: 'Residue note',
    liquidShoppingNote: 'Liquid note',
    residueFocusTitle: 'Focus',
    residueFocus: ['Rice'],
    liquidFocusTitle: 'Liquids',
    liquidFocus: ['Water'],
    residueForbidden: [{ title: 'Fruit', icon: 'cross', detail: '', imageAlt: 'Fruit' }],
    residueAllowed: [{ title: 'Tea', icon: 'check', detail: 'Allowed', imageAlt: 'Tea' }],
    liquidForbidden: [{ title: 'Milk', icon: 'cross', detail: '', imageAlt: 'Milk' }],
    liquidAllowed: [{ title: 'Water', icon: 'check', detail: 'Allowed', imageAlt: 'Water' }],
    dulcolaxReminder: 'Take Dulcolax',
    plenvuText: 'Base instruction.',
    plenvuMedicationNote: 'Buy $medicamento.',
    medicationStartAlert: 'Fast at least 3 hours before starting the preparation.',
    medicationFastingAlert: 'Fast for 6 hours.\n\nTake medication with little water.',
    plenvuTips: ['Tip 1', 'Tip 2'],
    plenvuVideoId: 'video-meds',
    examLocation: 'Building 1',
    examChecklist: ['ID document'],
  },
  shoppingList: [
    { id: 'white-bread', text: 'White bread', category: 'carbs' },
    { id: 'water', text: 'Water', category: 'other' },
  ],
  recipes: [
    { title: 'Meal A', description: 'Desc A', phase: '3 to 2 days before' },
    { title: 'Meal B', description: 'Desc B', phase: 'Day before' },
  ],
  videos: [
    {
      id: 'video-meds',
      title: 'How to take the medication',
      description: 'Timing and hydration guidance.',
      duration: '03:10',
    },
  ],
  faqs: [{ question: 'Question', answer: 'Answer' }],
});

describe('appView module', () => {
  beforeEach(() => {
    localStorage.clear();
    Object.assign(state, {
      lang: 'en',
      examDate: '2026-03-22',
      examTime: '08:30',
      wizardCompleted: false,
      medication: 'plenvu',
      isConstipated: false,
      takesAnticoagulation: false,
      takesSubcutaneousMedication: false,
      takesIronMedication: false,
    });
  });

  afterEach(() => {
    localStorage.clear();
  });

  it('renders medication labels, prep guide, and video content for Plenvu', () => {
    const elements = createElements();
    const content = createContent();
    const appView = createAppViewController({
      elements,
      state,
      getContent: () => content,
    });

    appView.renderMedicationSectionLabels();
    appView.renderAccordionContent(content);

    expect(elements.navPlenvuLink.textContent).toBe('Taking Plenvu');
    expect(elements.accordionPlenvuTitle.textContent).toBe('Taking Plenvu');
    expect(elements.plenvuText.textContent).toContain('Base instruction.');
    expect(elements.plenvuText.textContent).toContain('Buy Plenvu.');
    expect(elements.plenvuText.querySelector('[data-testid="medication-start-alert"]')?.textContent).toContain('Fast at least 3 hours');
    expect(elements.plenvuText.querySelector('.prep-guide')).not.toBeNull();
    expect(elements.plenvuText.querySelector('.prep-guide source')?.getAttribute('srcset')).toBe('assets/plenvu-preparation-vertical-en.svg');
    expect(elements.plenvuText.querySelector('.prep-guide img')?.getAttribute('src')).toBe('assets/plenvu-preparation-horizontal-en.svg');
    expect(elements.medicationFastingAlertBlock.hidden).toBe(false);
    expect(elements.medicationFastingAlert.textContent).toContain('Fast for 6 hours.');
    expect(elements.plenvuTipsBlock.hidden).toBe(false);
    expect(elements.plenvuTips.querySelectorAll('ol li')).toHaveLength(2);
    expect(elements.plenvuVideoGrid.querySelector('[data-testid="video-trigger-video-meds"]')).not.toBeNull();
    expect(elements.recipeCardsResidue.children.length).toBe(1);
    expect(elements.recipeCardsLiquid.children.length).toBe(1);
  });

  it('uses Portuguese Plenvu preparation illustrations when the app is in Portuguese', () => {
    const elements = createElements();
    const content = createContent();
    Object.assign(state, {
      lang: 'pt',
      medication: 'plenvu',
    });

    const appView = createAppViewController({
      elements,
      state,
      getContent: () => content,
    });

    appView.renderAccordionContent(content);

    expect(elements.plenvuText.querySelector('.prep-guide source')?.getAttribute('srcset')).toBe('assets/plenvu-preparation-vertical-pt.svg');
    expect(elements.plenvuText.querySelector('.prep-guide img')?.getAttribute('src')).toBe('assets/plenvu-preparation-horizontal-pt.svg');
    expect(elements.plenvuText.querySelector('.prep-guide img')?.getAttribute('alt')).toContain('preparação com Plenvu');
  });

  it('shows Dulcolax reminders and skips the Plenvu guide for other medications', () => {
    const elements = createElements();
    const content = createContent();
    Object.assign(state, {
      medication: 'moviprep',
      isConstipated: true,
    });
    const appView = createAppViewController({
      elements,
      state,
      getContent: () => content,
    });

    appView.renderMedicationSectionLabels();
    appView.renderAccordionContent(content);

    expect(elements.navPlenvuLink.textContent).toBe('Taking Moviprep');
    expect(elements.accordionPlenvuTitle.textContent).toBe('Taking Moviprep');
    expect(elements.plenvuText.querySelector('.prep-guide')).toBeNull();
    expect(elements.plenvuText.querySelector('[data-testid="medication-start-alert"]')?.textContent).toContain('Fast at least 3 hours');
    expect(elements.medicationFastingAlertBlock.hidden).toBe(false);
    expect(elements.plenvuTipsBlock.hidden).toBe(true);
    expect(elements.plenvuText.textContent).toContain('Buy Moviprep.');
    expect(elements.residueDulcolaxReminder.classList.contains('is-hidden')).toBe(false);
    expect(elements.liquidDulcolaxReminder.classList.contains('is-hidden')).toBe(false);
    expect(elements.residueDulcolaxReminder.textContent).toContain('Take Dulcolax');
  });

  it('renders accordion meta placeholders and computed schedule times', () => {
    const elements = createElements();
    const appView = createAppViewController({
      elements,
      state,
      getContent: () => null,
    });

    state.examDate = '';
    appView.renderAccordionMeta();

    expect(elements.accordionMetaResidue.textContent).toBe('--');
    expect(elements.accordionMetaLiquid.textContent).toBe('--');
    expect(elements.accordionMetaPlenvu.textContent).toBe('--');
    expect(elements.accordionMetaExam.textContent).toBe('--');

    state.examDate = '2026-03-22';
    state.examTime = '08:30';
    appView.renderAccordionMeta();

    expect(elements.accordionMetaResidue.textContent).toContain('and');
    expect(elements.accordionMetaPlenvu.textContent).toContain('22:30');
    expect(elements.accordionMetaExam.textContent).toContain('08:30');
  });
});
