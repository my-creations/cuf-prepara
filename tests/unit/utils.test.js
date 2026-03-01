import {
  formatCalendarDate,
  formatDate,
  formatDateInput,
  formatTime,
  formatUtcStamp,
} from '../../js/utils/dates.js';
import {
  getMedicationLabel,
  getMedicationName,
  getMedicationScheduleLabel,
} from '../../js/utils/medication.js';
import { loadJson, saveJson } from '../../js/utils/storage.js';

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

describe('utils/medication', () => {
  it('formats medication names and labels in both languages', () => {
    expect(getMedicationName()).toBe('');
    expect(getMedicationName('plenvu')).toBe('Plenvu');
    expect(getMedicationName('')).toBe('');

    expect(getMedicationLabel('pt', 'plenvu')).toBe('Toma do Plenvu');
    expect(getMedicationLabel('en', 'plenvu')).toBe('Taking Plenvu');
    expect(getMedicationLabel('pt', '')).toBe('Medicação');
    expect(getMedicationLabel('en', '')).toBe('Medication');

    expect(getMedicationScheduleLabel('pt', 'moviprep', 10)).toBe('Toma do Moviprep 10h antes');
    expect(getMedicationScheduleLabel('en', 'moviprep', 16)).toBe('Taking Moviprep 16h before');
  });
});

describe('utils/storage', () => {
  beforeEach(() => {
    vi.stubGlobal('localStorage', createStorageMock());
  });

  afterEach(() => {
    vi.unstubAllGlobals();
  });

  it('loads and saves JSON values', () => {
    saveJson('checklist', { a: true, b: false });
    expect(loadJson('checklist', {})).toEqual({ a: true, b: false });
  });

  it('returns fallback for invalid or missing JSON payloads', () => {
    const fallback = { fallback: true };
    expect(loadJson('missing-default')).toEqual({});
    expect(loadJson('missing-key', fallback)).toEqual(fallback);

    localStorage.setItem('broken', '{ this is not valid json');
    expect(loadJson('broken', fallback)).toBe(fallback);
  });
});

describe('utils/dates', () => {
  it('formats date and time helpers', () => {
    const date = new Date(2026, 1, 14, 8, 30, 5);

    expect(formatDateInput(date)).toBe('2026-02-14');
    expect(formatCalendarDate(date)).toBe('20260214');
    expect(formatDate(date, 'xx')).toBe(formatDate(date, 'pt'));

    const formattedTime = formatTime(date, 'en');
    expect(formattedTime).toMatch(/8:30|08:30/);
    expect(formatTime(date)).toMatch(/8:30|08:30/);
  });

  it('formats UTC ICS stamp with zero-padded values', () => {
    const utcDate = new Date(Date.UTC(2026, 0, 2, 3, 4, 5));
    expect(formatUtcStamp(utcDate)).toBe('20260102T030405Z');
  });
});
