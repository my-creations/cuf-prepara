describe('data/content loader', () => {
  afterEach(() => {
    vi.restoreAllMocks();
    vi.unstubAllGlobals();
  });

  it('caches successful responses per language', async () => {
    vi.resetModules();
    const responsePayload = { sections: ['a', 'b'] };
    const fetchMock = vi.fn(async () => ({
      ok: true,
      json: async () => responsePayload,
    }));
    vi.stubGlobal('fetch', fetchMock);

    const { loadContent } = await import('../../js/data/content.js');

    const first = await loadContent('pt');
    const second = await loadContent('pt');

    expect(first).toBe(responsePayload);
    expect(second).toBe(responsePayload);
    expect(fetchMock).toHaveBeenCalledTimes(1);
    expect(fetchMock).toHaveBeenCalledWith('./data/content.pt.json');
  });

  it('throws when remote content request fails', async () => {
    vi.resetModules();
    const fetchMock = vi.fn(async () => ({ ok: false }));
    vi.stubGlobal('fetch', fetchMock);

    const { loadContent } = await import('../../js/data/content.js');

    await expect(loadContent('en')).rejects.toThrow('Failed to load content for en');
  });
});
