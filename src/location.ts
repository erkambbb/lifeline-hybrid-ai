export interface Coordinates {
  latitude: number;
  longitude: number;
}

/**
 * Cihaz konumunu alır. Alamazsa null döner, uygulama elle adres ister.
 * NEDEN bu ayarlar: timeout varsayılanı sonsuzdur, yani çevrimdışı cihaz sonsuza
 * kadar bekleyebilir. maximumAge ise son bilinen konumu da kabul ettirir.
 */
export function getLocation(): Promise<Coordinates | null> {
  return new Promise((resolve) => {
    if (!("geolocation" in navigator)) {
      resolve(null);
      return;
    }
    navigator.geolocation.getCurrentPosition(
      ({ coords }) => resolve({ latitude: coords.latitude, longitude: coords.longitude }),
      () => resolve(null),
      { enableHighAccuracy: true, timeout: 20_000, maximumAge: 300_000 },
    );
  });
}
