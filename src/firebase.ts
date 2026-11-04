import { initializeApp } from "firebase/app";
import { initializeAppCheck, ReCaptchaEnterpriseProvider } from "firebase/app-check";

// Vite yalnızca VITE_ ile başlayan değişkenleri tarayıcı koduna verir.
// DİKKAT: Hep tam `import.meta.env.X` yazıyoruz, `const env = import.meta.env`
// gibi bir kısaltma kullanmıyoruz. NEDEN: Kısaltma, tüm VITE_ değerlerini tek
// nesne olarak yayın paketine gömer. Debug token da bunların içindedir.

/** .env.local dolu mu? Firebase konsol adımları bitmeden uygulama yine açılabilmeli. */
export const isFirebaseConfigured = Boolean(
  import.meta.env.VITE_FIREBASE_API_KEY &&
    import.meta.env.VITE_FIREBASE_PROJECT_ID &&
    import.meta.env.VITE_FIREBASE_APP_ID,
);

// Yapılandırma yoksa yer tutucu değerler kullanırız.
// NEDEN: SDK bu alanların dolu olmasını ister ama cihazdaki model ağa hiç
// çıkmaz. Böylece Firebase projesi kurulmadan önce de on-device test edilebilir.
export const firebaseApp = initializeApp({
  apiKey: import.meta.env.VITE_FIREBASE_API_KEY || "not-configured",
  authDomain: import.meta.env.VITE_FIREBASE_AUTH_DOMAIN,
  projectId: import.meta.env.VITE_FIREBASE_PROJECT_ID || "not-configured",
  appId: import.meta.env.VITE_FIREBASE_APP_ID || "not-configured",
});

declare global {
  // App Check SDK'sı bu global değişkeni okur.
  var FIREBASE_APPCHECK_DEBUG_TOKEN: boolean | string | undefined;
}

function setUpAppCheck(): void {
  if (!isFirebaseConfigured) return;

  // Debug token yalnızca `npm run dev` içinde etkin.
  // NEDEN: import.meta.env.DEV, production derlemesinde false olur ve bu blok
  // pakete hiç girmez. Debug token yayına çıkarsa App Check korumasını deler.
  if (import.meta.env.DEV) {
    globalThis.FIREBASE_APPCHECK_DEBUG_TOKEN = import.meta.env.VITE_APPCHECK_DEBUG_TOKEN || true;
  }

  const siteKey = import.meta.env.VITE_RECAPTCHA_ENTERPRISE_SITE_KEY;
  if (!siteKey && !import.meta.env.DEV) {
    console.warn("App Check site key is missing, so cloud requests will be rejected.");
    return;
  }

  // App Check, istekle birlikte "bu istek gerçekten benim uygulamamdan geliyor"
  // kanıtı gönderir. Web config herkese açık olduğu için asıl koruma budur.
  // Debug modunda sağlayıcı kullanılmaz, bu yüzden site anahtarı boş kalabilir.
  initializeAppCheck(firebaseApp, {
    provider: new ReCaptchaEnterpriseProvider(siteKey || "debug-mode"),
    isTokenAutoRefreshEnabled: true,
  });
}

setUpAppCheck();
