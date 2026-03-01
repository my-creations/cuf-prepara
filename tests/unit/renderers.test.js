import {
  renderFaq,
  renderFocusList,
  renderFoodGrid,
  renderInfoCard,
  renderRecipes,
  renderShoppingList,
  renderVideos,
} from '../../js/modules/renderers.js';
import { state } from '../../js/state.js';

const createStorageMock = (initialState = {}) => {
  const state = { ...initialState };
  return {
    getItem: (key) => (Object.prototype.hasOwnProperty.call(state, key) ? state[key] : null),
    setItem: (key, value) => {
      state[key] = String(value);
    },
    removeItem: (key) => {
      delete state[key];
    },
    clear: () => {
      Object.keys(state).forEach((key) => delete state[key]);
    },
  };
};

describe('renderers module', () => {
  const originalLang = state.lang;

  beforeEach(() => {
    vi.stubGlobal('localStorage', createStorageMock());
    document.body.innerHTML = '';
    state.lang = 'en';
  });

  afterEach(() => {
    state.lang = originalLang;
    vi.unstubAllGlobals();
  });

  it('renders shopping list by category and persists checklist state', () => {
    const listElement = document.createElement('div');
    document.body.appendChild(listElement);
    localStorage.setItem('shopping-check', JSON.stringify({ protein: true }));

    renderShoppingList(
      listElement,
      {
        shoppingList: [
          { id: 'rice', text: 'Rice' },
          { id: 'protein', text: 'Chicken' },
          { id: 'dairy', text: 'Yogurt' },
          { id: 'olive-oil', text: 'Olive oil', category: 'other' },
          { id: 'custom-item', text: 'Custom category item', category: 'custom' },
          { id: 'unknown-item', text: 'Unknown item' },
          { id: 'rice', text: 'Rice (backup)', category: 'other' },
        ],
      },
      'shopping-check',
      'en',
      'plenvu',
      false
    );

    const categoryTitles = Array.from(listElement.querySelectorAll('.checklist-category')).map(
      (node) => node.textContent
    );
    expect(categoryTitles).toEqual(expect.arrayContaining(['Grains and Carbs', 'Proteins', 'Other']));

    const proteinCheckbox = listElement.querySelector('input[data-check-id="protein"]');
    expect(proteinCheckbox.checked).toBe(true);

    const riceCheckboxes = listElement.querySelectorAll('input[data-check-id="rice"]');
    expect(riceCheckboxes).toHaveLength(2);
    riceCheckboxes[0].checked = true;
    riceCheckboxes[0].dispatchEvent(new Event('change', { bubbles: true }));

    expect(riceCheckboxes[1].checked).toBe(true);
    expect(JSON.parse(localStorage.getItem('shopping-check'))).toMatchObject({ rice: true });
  });

  it('renders recipes, videos and food cards', () => {
    const recipesList = document.createElement('div');
    renderRecipes(
      recipesList,
      [
        { title: 'Soup', description: 'Light soup', phase: 'liquid' },
        { title: 'Rice', description: 'Simple rice', phase: 'residue' },
      ],
      { phase: 'liquid' }
    );
    expect(recipesList.querySelectorAll('.card')).toHaveLength(1);
    expect(recipesList.textContent).toContain('Soup');

    renderRecipes(recipesList, [{ title: 'No filter', description: 'All phases' }]);
    expect(recipesList.querySelectorAll('.card')).toHaveLength(1);
    expect(recipesList.textContent).toContain('No filter');

    const videosList = document.createElement('div');
    renderVideos(videosList, [{ id: 'v1', title: 'How to prep', description: 'Guide', duration: '3:00' }]);
    expect(videosList.querySelector('[data-video-id="v1"]')).not.toBeNull();
    expect(videosList.textContent).toContain('Watch video');

    const foodList = document.createElement('div');
    renderFoodGrid(foodList, [
      { title: 'Apple', detail: 'Allowed', icon: 'check', image: '/img/apple.svg', imageAlt: 'Apple' },
      { title: 'Fried food', icon: 'cross' },
      { image: '/img/unknown.svg' },
    ]);
    expect(foodList.querySelectorAll('.food-card')).toHaveLength(3);
    expect(foodList.innerHTML).toContain('<svg');
    expect(foodList.querySelector('.recipe-meta.is-empty')).not.toBeNull();
    expect(foodList.textContent).toContain('No photo');
  });

  it('renders info blocks, focus chips and FAQ list', () => {
    const infoCard = document.createElement('div');
    renderInfoCard(infoCard, ['One', 'Two']);
    expect(infoCard.querySelectorAll('li')).toHaveLength(2);

    renderInfoCard(infoCard, 'Single content');
    expect(infoCard.textContent).toBe('Single content');

    renderInfoCard(infoCard, null);
    expect(infoCard.innerHTML).toBe('');

    const focus = document.createElement('div');
    renderFocusList(focus, 'Focus title', ['Hydration', 'Rest']);
    expect(focus.querySelector('.phase-focus-title').textContent).toBe('Focus title');
    expect(focus.querySelectorAll('.phase-chip')).toHaveLength(2);

    renderFocusList(focus, 'Unused', []);
    expect(focus.innerHTML).toBe('');

    const faqList = document.createElement('div');
    renderFaq(
      { faqList },
      {
        faqs: [
          { question: 'Can I drink water?', answer: 'Yes, clear liquids are allowed.' },
          { question: 'Can I drive?', answer: 'Arrange transport after sedation.' },
        ],
      }
    );

    expect(faqList.querySelectorAll('details.faq-item')).toHaveLength(2);
    expect(faqList.textContent).toContain('Can I drink water?');
  });

  it('safely handles missing target elements', () => {
    expect(() => renderShoppingList(null, { shoppingList: [] }, 'x', 'pt')).not.toThrow();
    expect(() => renderRecipes(null, [])).not.toThrow();
    expect(() => renderVideos(null, [])).not.toThrow();
    expect(() => renderFoodGrid(null, [])).not.toThrow();
    expect(() => renderInfoCard(null, 'x')).not.toThrow();
    expect(() => renderFocusList(null, 'x', ['y'])).not.toThrow();
    expect(() => renderFaq({}, { faqs: [] })).not.toThrow();
  });

  it('falls back to PT category labels for unknown languages', () => {
    const listElement = document.createElement('div');
    document.body.appendChild(listElement);

    renderShoppingList(
      listElement,
      {
        shoppingList: [{ id: 'rice', text: 'Arroz' }],
      },
      'shopping-check',
      'fr'
    );

    expect(listElement.textContent).toContain('Cereais e Hidratos');
  });
});
