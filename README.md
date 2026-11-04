<p align="center">
  <img src="docs/assets/banner.svg" alt="Lifeline: help that keeps working when the network does not" width="100%">
</p>

<p align="center">
  <img alt="Status: skeleton" src="https://img.shields.io/badge/status-skeleton-FBD9E2?style=flat-square&labelColor=FFF4F0">
  <img alt="Firebase AI Logic" src="https://img.shields.io/badge/Firebase-AI%20Logic-FFE3D1?style=flat-square&labelColor=FFF8F2">
  <img alt="PWA: offline first" src="https://img.shields.io/badge/PWA-offline%20first-D3F0E2?style=flat-square&labelColor=F3FBF7">
  <img alt="Language: Turkish" src="https://img.shields.io/badge/app%20language-Turkish-E6DCF8?style=flat-square&labelColor=F7F3FD">
  <img alt="License: MIT" src="https://img.shields.io/badge/license-MIT-D5EDF7?style=flat-square&labelColor=F2FAFD">
</p>

<p align="center">
  An offline-first hybrid AI disaster assistant, built for the
  <a href="https://firebasehybridaihackathon.devpost.com/">Firebase #BuildHybridAI 2026</a>
  hackathon.
</p>

In the first hours after a major earthquake, mobile networks often fail. That is
when people most need calm, trustworthy guidance, and when cloud AI stops
working. Lifeline is a Progressive Web App that keeps answering when the network
does not. The app is entirely in Turkish, for people in Türkiye. Read the full
idea in [docs/IDEA.md](docs/IDEA.md).

> [!NOTE]
> This repository is an infrastructure skeleton. It holds research, setup, and one
> hybrid test page. Core features start on 9 November 2026, as planned in
> [docs/ROADMAP.md](docs/ROADMAP.md). The app gives no emergency guidance yet. In
> an emergency, call 112.

<img src="docs/assets/divider.svg" alt="" width="100%">

## Three layers, one promise

Help works on every device, and AI works at the best level that the device allows.

<p align="center">
  <img src="docs/assets/layers.svg" alt="Three layers. Cloud: Gemini Flash on any device with a connection. On-device: Gemini Nano on desktop Chrome with no network. Offline library: local search on any device with no model." width="100%">
</p>

Every question goes to the best layer that is available, and the app always tells
the user which layer answered.

```mermaid
%%{init: {'theme':'base','themeVariables':{'lineColor':'#A79BC9','textColor':'#46405C','primaryTextColor':'#46405C','edgeLabelBackground':'#FBF7F2','fontFamily':'system-ui, sans-serif'}}}%%
flowchart TD
    U[User describes the situation] --> R{Firebase AI Logic<br/>hybrid inference}
    R -->|On-device model ready| N[Gemini Nano<br/>Chrome Prompt API]
    R -->|Online| C[Gemini Flash<br/>cloud]
    R -->|No model, no network| L[Offline library<br/>local keyword search]
    N --> K[(Verified knowledge cards<br/>shipped inside the app)]
    C --> K
    L --> K
    K --> A[Calm steps, source, Call 112]
    SW[Service worker] -. precaches app and cards .-> K
    AC[App Check] -. protects .-> C

    classDef peach fill:#FFE3D1,stroke:#F2B99A,color:#46405C
    classDef blush fill:#FBD9E2,stroke:#EDB0C2,color:#46405C
    classDef lavender fill:#E6DCF8,stroke:#C3B2E8,color:#46405C
    classDef sky fill:#D5EDF7,stroke:#A5D2E6,color:#46405C
    classDef mint fill:#D3F0E2,stroke:#A3DBBF,color:#46405C
    classDef butter fill:#FFF0C9,stroke:#EFD48F,color:#46405C

    class U,A peach
    class R blush
    class N lavender
    class C sky
    class L mint
    class K,SW,AC butter
```

The model selects a card and does not write medical instructions. This design
keeps guidance grounded on every layer.

### Where each layer runs

Facts checked on 4 November 2026. Sources are in
[docs/RESEARCH.md](docs/RESEARCH.md).

| Device | Online | Offline |
| --- | --- | --- |
| Desktop Chrome, capable hardware | Cloud or on-device | On-device |
| Phone (Android or iOS) | Cloud | Offline library |
| Any other browser | Cloud | Offline library |

Chrome does not support Gemini Nano on Android or iOS yet, and the Prompt API does
not accept Turkish yet. The research document explains how the design handles both
limits.

<img src="docs/assets/divider.svg" alt="" width="100%">

## Planned features

<p align="center">
  <img src="docs/assets/features.svg" alt="Planned features: emergency guide, help message builder, source indicator, and preparedness mode." width="100%">
</p>

<img src="docs/assets/divider.svg" alt="" width="100%">

## Getting started

You need Node.js 22 or later.

```bash
git clone https://github.com/erkambbb/lifeline-hybrid-ai.git
cd lifeline-hybrid-ai
npm install
npm run dev
```

Open <http://localhost:5173>. The on-device path works without a Firebase project.
To enable the cloud path, follow [docs/FIREBASE_SETUP.md](docs/FIREBASE_SETUP.md).

To test offline behavior, use a production build. The service worker is off in dev
mode.

```bash
npm run build
npm run preview
```

### On-device requirements

Chrome on Windows, macOS, Linux, or a Chromebook Plus, with at least 22 GB of free
disk space. It also needs a GPU with more than 4 GB of VRAM, or 16 GB of RAM and 4
CPU cores. See the
[Chrome documentation](https://developer.chrome.com/docs/ai/get-started).

The GPU also needs enough free memory when the model loads. Close heavy GPU apps if
you see `InvalidStateError: The device is unable to create a session`.

<img src="docs/assets/divider.svg" alt="" width="100%">

## Tech stack

- [Vite](https://vite.dev/) and TypeScript, with no UI framework
- [vite-plugin-pwa](https://vite-pwa-org.netlify.app/) for the service worker
- [Firebase AI Logic](https://firebase.google.com/docs/ai-logic) for hybrid inference
- [Firebase App Check](https://firebase.google.com/docs/app-check) with reCAPTCHA Enterprise
- [Firebase Hosting](https://firebase.google.com/docs/hosting)

## Project structure

```text
src/firebase.ts    Firebase and App Check setup
src/hybrid.ts      Hybrid model, on-device status, source detection
src/main.ts        Test page and service worker registration
vite.config.ts     PWA manifest and precache rules
firebase.json      Hosting configuration
docs/              Idea, research, setup, roadmap, learning plan
```

## Security

No secret belongs in this repository. Real values go in `.env.local`, which git
ignores. [docs/FIREBASE_SETUP.md](docs/FIREBASE_SETUP.md) explains why the Firebase
web config can be public and why App Check is still required.

## License

The code is released under the [MIT License](LICENSE).

The MIT License will not cover the emergency content that is added later. That
content will carry its own attribution and terms, because some of its sources permit
non-commercial use only.
