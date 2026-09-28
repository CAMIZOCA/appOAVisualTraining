import { en } from './en';
import { es } from './es';
import { interpolate, pick, translate } from './index';

describe('i18n', () => {
  it('has the same keys in every language', () => {
    expect(Object.keys(en).sort()).toEqual(Object.keys(es).sort());
  });

  it('has no empty strings', () => {
    for (const dict of [es, en]) {
      for (const [key, value] of Object.entries(dict)) {
        expect(`${key}:${value.trim().length > 0}`).toBe(`${key}:true`);
      }
    }
  });

  it('interpolates variables and keeps unknown placeholders', () => {
    expect(interpolate('{n} min · {x}', { n: 5 })).toBe('5 min · {x}');
    expect(translate('es', 'common.minutes', { n: 3 })).toBe('3 min');
    expect(translate('en', 'about.version', { v: '1.0' })).toBe('Version 1.0');
  });

  it('picks a localized variant', () => {
    expect(pick({ es: 'Hola', en: 'Hello' }, 'en')).toBe('Hello');
  });
});
