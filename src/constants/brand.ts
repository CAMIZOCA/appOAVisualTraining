/**
 * Óptica Andina corporate data, taken from https://opticaandina.com.ec (Sep 2026).
 * Keep in sync with the website; user-facing labels live in i18n.
 */
export const BRAND = {
  name: 'Óptica Andina',
  foundedYear: 1987,
  /**
   * Landline, E.164 without "+", exactly as published on the website. It looks one digit
   * short for a Quito number (+593 2 + 7 digits) — pending confirmation with the store.
   */
  phone: '5932379488',
  phoneDisplay: '+593 2379488',
  /** WhatsApp number used for appointments, E.164 without "+". */
  whatsapp: '593999028654',
  whatsappDisplay: '+593 99 902 8654',
  email: 'opticaandina.ec@gmail.com',
  mapsQuery: 'Óptica Andina, Ventura Mall, Tumbaco, Quito',
  coordinates: { latitude: -0.2116, longitude: -78.4263 },
  website: 'https://opticaandina.com.ec',
  blog: 'https://opticaandina.com.ec/blog',
  /** Must match the Privacy Policy URL declared in App Store Connect. */
  privacyUrl: 'https://claude.ai/artifact/GvGyRUjSfKHzVcAgKw5HoQ',
  instagram: 'https://instagram.com/opticaandina_ec',
  instagramHandle: '@opticaandina_ec',
  facebook: 'https://www.facebook.com/opticavistaandina',
} as const;
