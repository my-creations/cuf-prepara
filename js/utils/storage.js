export const loadJson = (key, fallback = {}) => {
  try {
    return JSON.parse(localStorage.getItem(key)) || fallback;
  } catch (error) {
    return fallback;
  }
};

export const saveJson = (key, value) => {
  localStorage.setItem(key, JSON.stringify(value));
};
