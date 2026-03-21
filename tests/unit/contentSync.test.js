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
    expect(ptContent.accordion.examArrivalAlert).toBeTruthy();
    expect(enContent.accordion.examArrivalAlert).toBeTruthy();
  });

  it('keeps FAQ entries synchronized and includes the new guidance', () => {
    expect(ptContent.faqs).toHaveLength(8);
    expect(enContent.faqs).toHaveLength(ptContent.faqs.length);

    expect(ptContent.faqs.map(({ question }) => question)).toEqual([
      'Posso tomar a minha medicação habitual?',
      'E se não conseguir terminar a solução?',
      'Quanto tempo demora o preparado a fazer efeito?',
      'Posso escovar os dentes no dia do exame?',
      'Posso fazer o exame se estiver menstruada?',
      'Posso fumar antes do exame?',
      'Posso conduzir depois do exame?',
      'Como sei se a preparação foi eficaz?',
    ]);

    expect(enContent.faqs.map(({ question }) => question)).toEqual([
      'Can I take my usual medication?',
      'What if I cannot finish the solution?',
      'How long does the preparation take to work?',
      'Can I brush my teeth on the exam day?',
      'Can I have the exam if I am menstruating?',
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
    expect(translations.pt.wizard.step4Title).toBe(
      'Tem tendência para obstipação ou a preparação no último exame foi ineficaz?'
    );
    expect(translations.pt.wizard.yesDesc).toBe(
      'Tenho tendência para obstipação / A preparação foi ineficaz'
    );
    expect(translations.pt.wizard.noDesc).toBe(
      'Não tenho problemas de obstipação / A preparação foi eficaz'
    );
    expect(translations.pt.wizard.step6Subtitle).toBe(
      'Exemplos: Ozempic/Wegovy (semaglutido), Mounjaro (tirzepatida) ou Trulicity (dulaglutida)'
    );
    expect(translations.pt.accordion.expandHint).toBe('Clique aqui');
    expect(translations.pt.accordion.collapseHint).toBe('Fechar');
    expect(translations.pt.hero.anticoagPlanWarning).toContain('médico prescritor');
    expect(translations.en.wizard.step4Subtitle).toBe(
      'Do you have fewer than three bowel movements per week or difficulty passing stool?'
    );
    expect(translations.en.wizard.step4Title).toBe(
      'Do you tend to be constipated or was the preparation ineffective in your last exam?'
    );
    expect(translations.en.wizard.yesDesc).toBe(
      'I tend to be constipated / The preparation was ineffective'
    );
    expect(translations.en.wizard.noDesc).toBe(
      "I don't have constipation problems / The preparation was effective"
    );
    expect(translations.en.wizard.step6Subtitle).toBe(
      'Examples: Ozempic/Wegovy (semaglutide), Mounjaro (tirzepatide) or Trulicity (dulaglutide)'
    );
    expect(translations.en.accordion.expandHint).toBe('Click here');
    expect(translations.en.accordion.collapseHint).toBe('Hide');
    expect(translations.en.hero.anticoagPlanWarning).toContain('prescribing doctor');
  });
});
