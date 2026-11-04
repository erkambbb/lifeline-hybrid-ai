# Devpost submission draft

This is a draft in English for the Devpost page. Update it after the features exist.
Only claim what the demo shows. The official submission requirements appear on 9
November 2026, so check this structure against them.

## Basics

- **Name:** Lifeline
- **Tagline:** Help that keeps working when the network does not.
- **Repository:** <https://github.com/erkambbb/lifeline-hybrid-ai>
- **Live demo:** `https://PROJECT-ID.web.app/?lang=en` (the English link for judges)
- **Built with:** Firebase AI Logic, Gemini Nano, Gemini Flash, Chrome Prompt API,
  Chrome Translator API, Firebase App Check, Firebase Hosting, TypeScript, Vite

## Inspiration

On 6 February 2023, two major earthquakes struck southern Türkiye. Turkcell reported
that about half of its 3,300 base stations in the region went out of service. A field
study found that communication stayed down for one to several days, depending on the
location. In those hours, frightened people needed clear answers and cloud services
could not reach them.

## What it does

Lifeline is a Progressive Web App that people install before a disaster. A person
describes the situation in their own words, and the app shows calm, step-by-step
guidance from trusted sources, with its source and a Call 112 reminder.

It answers through three layers, and it always shows which one answered:

- **On-device:** Gemini Nano, with no network.
- **Cloud:** Gemini Flash, on any connected device.
- **Offline library:** a local search, with no model and no network.

It also turns a messy description and a location into a short help SMS, and it offers
a preparedness mode with an earthquake bag checklist and a family plan.

The released app is in Turkish for people in Türkiye. An English mode serves everyone
else, including the judges.

## How we built it

- **Hybrid inference:** Firebase AI Logic with `PREFER_ON_DEVICE` routes each request,
  and `response.inferenceSource` drives the visible source badge.
- **Grounding by design:** the model never writes medical instructions. It selects one
  card from a fixed list through enum-constrained output, on both the on-device and
  cloud paths.
- **Turkish on a model without Turkish:** Chrome's on-device Translator API bridges
  Turkish input to English. The user still reads human-written Turkish cards.
- **Offline first:** the service worker precaches the app and the knowledge base.
- **Security:** App Check with reCAPTCHA Enterprise protects the cloud path.

## Challenges

TO FILL IN WITH REAL EVENTS. Candidates from research:

- Gemini Nano does not run in mobile browsers yet, so the design needed a layer that
  works without any model.
- The Prompt API does not accept Turkish.
- A congested network is harder than a dead one. `PREFER_IN_CLOUD` does not fall back
  on a timeout, and the default timeout is 180 seconds.
- `availability()` can report `available` while the session still fails for lack of
  free GPU memory, so the app needs its own fallback chain.

## Accomplishments

TO FILL IN. Add measured results, such as card selection accuracy across the test
scenarios.

## What we learned

TO FILL IN.

## What's next

- On-device AI on phones through Firebase AI Logic hybrid inference for Android and iOS.
- A review of every card by emergency medicine professionals.
- More languages and more hazard types.

## Demo video script (target 2:45, English)

Record with `?lang=en`. Add Turkish on screen only where it shows the real product.

| Time | On screen | Narration |
| --- | --- | --- |
| 0:00 | Earthquake data | "February 2023. Half of one operator's towers in the region went dark. People needed help, and the network was gone." |
| 0:25 | App online, cloud badge | "This is Lifeline. Online, it uses Gemini Flash through Firebase AI Logic." |
| 0:50 | **Turn Wi-Fi off on camera**, same question, on-device badge | "Now I cut the internet. Same question. It still answers, now on the device, with Gemini Nano." |
| 1:25 | Show the card and its source | "The model only picks a card. People wrote these steps, so it cannot invent medical advice." |
| 1:50 | Phone in airplane mode, offline library badge | "Phones cannot run the model in the browser yet. They still get help from a local search." |
| 2:15 | Help message, ready SMS | "One tap prepares a help message, ready when any signal returns." |
| 2:35 | Architecture, closing line | "Help on every device. AI at the best level that device allows." |

## Before you submit

- [ ] Every claim above matches what the demo shows
- [ ] The video is under 3 minutes and public
- [ ] The repository is public and has a license
- [ ] The live demo works in a fresh browser with `?lang=en`
- [ ] The Devpost page answers all four judging criteria
