import { defineConfig } from "vite";
import { VitePWA } from "vite-plugin-pwa";

export default defineConfig({
  plugins: [
    VitePWA({
      // Yeni sürüm yayınlanınca service worker kendini sessizce günceller.
      // NEDEN: Panik anındaki birine "güncelleme var" penceresi göstermek istemeyiz.
      registerType: "autoUpdate",

      manifest: {
        name: "Lifeline",
        short_name: "Lifeline",
        description: "Offline-first hybrid AI disaster assistant",
        lang: "tr",
        start_url: "/",
        display: "standalone",
        background_color: "#14161a",
        theme_color: "#14161a",
        icons: [
          { src: "icons/icon-192.png", sizes: "192x192", type: "image/png" },
          { src: "icons/icon-512.png", sizes: "512x512", type: "image/png" },
          {
            src: "icons/icon-maskable-512.png",
            sizes: "512x512",
            type: "image/png",
            purpose: "maskable",
          },
        ],
      },

      workbox: {
        // Precache: bu dosyaların hepsi kurulum anında önbelleğe indirilir.
        // NEDEN: İnternet kesildikten sonra indirme şansımız olmaz. Uygulama
        // ve (ileride) bilgi tabanı, kriz başlamadan telefonda olmalıdır.
        globPatterns: ["**/*.{js,css,html,svg,png,webmanifest}"],
      },
    }),
  ],
});
