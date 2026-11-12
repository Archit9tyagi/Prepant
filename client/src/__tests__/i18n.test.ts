import { describe, expect, it } from 'vitest';
import i18n from '../app/i18n.js';

describe('locale support', () => {
  it('loads Hindi public navigation copy and can return to English', async () => {
    await i18n.changeLanguage('hi');
    expect(i18n.t('nav.findMentor')).toBe('मेंटोर खोजें');

    await i18n.changeLanguage('en');
    expect(i18n.t('nav.findMentor')).toBe('Find a mentor');
  });

  it('supports Indian regional locales across shared home copy', async () => {
    for (const locale of ['ta', 'te', 'mr', 'kn', 'pa']) {
      await i18n.changeLanguage(locale);
      expect(i18n.t('home.platform')).not.toBe('home.platform');
      expect(i18n.t('nav.language')).not.toBe('nav.language');
    }
    await i18n.changeLanguage('en');
  });
});
