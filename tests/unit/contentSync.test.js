import { readFileSync } from 'node:fs';

import { translations } from '../../js/data/translations.js';

const loadJsonFixture = (relativePath) =>
  JSON.parse(readFileSync(new URL(relativePath, import.meta.url), 'utf8'));

describe('localized content sync', () => {
  const ptContent = loadJsonFixture('../../data/content.pt.json');
  const enContent = loadJsonFixture('../../data/content.en.json');

  it('keeps accordion medication content aligned in PT and EN', () => {
    expect(Object.keys(ptContent.accordion).sort()).toEqual(Object.keys(enContent.accordion).sort());

    [
      'plenvuText',
      'plenvuMedicationNote',
      'medicationStartAlert',
      'medicationFastingAlert',
      'plenvuTips',
    ].forEach((key) => {
      expect(ptContent.accordion[key]).toBeTruthy();
      expect(enContent.accordion[key]).toBeTruthy();
    });

    expect(ptContent.accordion.plenvuTips).toHaveLength(5);
    expect(enContent.accordion.plenvuTips).toHaveLength(ptContent.accordion.plenvuTips.length);
  });

  it('keeps FAQ entries synchronized and includes the new guidance', () => {
    expect(ptContent.faqs).toHaveLength(7);
    expect(enContent.faqs).toHaveLength(ptContent.faqs.length);

    expect(ptContent.faqs.map(({ question }) => question)).toEqual([
      'Posso tomar a minha medicação habitual?',
      'E se não conseguir terminar a solução?',
      'Quanto tempo demora o preparado a fazer efeito?',
      'Posso escovar os dentes no dia do exame?',
      'Posso fumar antes do exame?',
      'Posso conduzir depois do exame?',
      'Como sei se a preparação foi eficaz?',
    ]);

    expect(enContent.faqs.map(({ question }) => question)).toEqual([
      'Can I take my usual medication?',
      'What if I cannot finish the solution?',
      'How long does the preparation take to work?',
      'Can I brush my teeth on the exam day?',
      'Can I smoke before the exam?',
      'Can I drive after the exam?',
      'How do I know the prep was effective?',
    ]);

    expect(ptContent.faqs.some(({ question }) => question === 'Posso beber água no dia do exame?')).toBe(false);
    expect(enContent.faqs.some(({ question }) => question === 'Can I drink water on the exam day?')).toBe(false);
  });

  it('keeps translation entries available for the updated wizard and medication UI', () => {
    expect(translations.pt.accordion.blocks.plenvuTipsTitle).toBe('Dicas para facilitar a toma do Plenvu');
    expect(translations.en.accordion.blocks.plenvuTipsTitle).toBe('Tips to make taking Plenvu easier');

    expect(translations.pt.wizard.step4Subtitle).toBe(
      'Evacua menos de três vezes por semana ou tem dificuldade em evacuar?'
    );
    expect(translations.en.wizard.step4Subtitle).toBe(
      'Do you have fewer than three bowel movements per week or difficulty passing stool?'
    );
  });
});
