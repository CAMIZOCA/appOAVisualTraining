import { Linking } from 'react-native';

import { BRAND } from '@/constants/brand';

export const contactUrls = {
  phone: () => `tel:+${BRAND.phone}`,
  whatsapp: (message?: string) =>
    `https://wa.me/${BRAND.whatsapp}${message ? `?text=${encodeURIComponent(message)}` : ''}`,
  email: () => `mailto:${BRAND.email}`,
  maps: () =>
    `https://www.google.com/maps/search/?api=1&query=${encodeURIComponent(BRAND.mapsQuery)}`,
};

/** Opens an external link; failures (e.g. no dialer on web/tablet) are ignored. */
export function openLink(url: string): void {
  Linking.openURL(url).catch(() => {});
}
