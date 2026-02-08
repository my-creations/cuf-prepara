const cache = new Map();

const buildPath = (lang) => `./data/content.${lang}.json`;

export const loadContent = async (lang) => {
  if (cache.has(lang)) {
    return cache.get(lang);
  }

  const response = await fetch(buildPath(lang));
  if (!response.ok) {
    throw new Error(`Failed to load content for ${lang}`);
  }

  const data = await response.json();
  cache.set(lang, data);
  return data;
};
