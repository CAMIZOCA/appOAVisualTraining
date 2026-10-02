import { BRAND } from '@/constants/brand';

import { contactUrls } from './contact';

describe('contactUrls', () => {
  it('builds dialer, mail and maps links from brand data', () => {
    expect(contactUrls.phone()).toBe('tel:+5932379488');
    expect(contactUrls.email()).toBe('mailto:opticaandina.ec@gmail.com');
    expect(contactUrls.maps()).toMatch(/^https:\/\/www\.google\.com\/maps\/search\/\?api=1&query=/);
  });

  it('encodes the prefilled WhatsApp message', () => {
    expect(contactUrls.whatsapp()).toBe('https://wa.me/593999028654');
    expect(contactUrls.whatsapp('Hola, ¿cita?')).toBe(
      'https://wa.me/593999028654?text=Hola%2C%20%C2%BFcita%3F',
    );
  });

  it('keeps phone numbers in E.164 digits without "+"', () => {
    expect(BRAND.phone).toMatch(/^593\d{7,9}$/);
    expect(BRAND.whatsapp).toMatch(/^593\d{9}$/);
  });
});
