# CUF Prepara - Colonoscopy Preparation Guide

Interactive multilingual web guide to help patients prepare for colonoscopy procedures (diet, bowel prep, reminders, and exam day instructions).

## Overview

CUF Prepara guides patients through the preparation process with:
- low-residue diet guidance (3rd and 2nd day before exam)
- clear liquid diet guidance (day before exam)
- preparation medication instructions (Plenvu / Moviprep / Citrafleet)
- exam day checklist and practical guidance
- a personalized plan based on the wizard answers

## Current Features

- **PT / EN support**
- **Wizard onboarding (6 steps)** with:
  - language
  - exam date/time
  - prep medication
  - constipation tendency
  - anticoagulant/antiplatelet medication
  - iron supplements / iron-containing medication
- **Personalized hero plan** with conditional rows/warnings:
  - Dulcolax (if constipation)
  - iron supplements stop date (7 days before)
  - anticoagulant/antiplatelet warning
- **Calendar export (.ics)** via a single button (`Adicionar ao Calendário / Add to Calendar`)
  - timed events exported with real time
  - automatic reminders (`VALARM`) for timed events
- **Preparation accordion** (diet phases, prep medication, exam day, FAQ)
- **Plenvu visual preparation guide** (responsive HTML/CSS component)
- **Shopping lists by category**
- **Food cards with local SVG illustrations**
- **Contact clinical team modal** (opens prefilled email draft via `mailto:`)
- **Responsive UI** (desktop/mobile)

## Architecture (Current)

The app is now organized as a small modular vanilla JS application:

- `js/main.js` - app coordinator/bootstrap
- `js/wizard.js` - onboarding wizard flow and persistence
- `js/modules/appBootstrap.js` - state hydration / preload helpers
- `js/modules/appView.js` - UI rendering orchestration
- `js/modules/calendar.js` - schedule generation, hero summary, `.ics` export
- `js/modules/navigation.js` - nav + accordion behavior
- `js/modules/contactTeam.js` - contact modal flow
- `js/modules/modal.js` - reusable modal shell
- `js/modules/renderers.js` - content renderers (lists/cards/videos/FAQ)

Content is data-driven from:
- `data/content.pt.json`
- `data/content.en.json`
- `js/data/translations.js`

## Project Structure

```text
cuf-prepara/
├── index.html
├── assets/
│   ├── favicon.svg
│   └── food/                 # Local SVG illustrations for food cards
├── css/
│   ├── reset.css
│   ├── variables.css
│   ├── layout.css
│   ├── components.css
│   ├── sections.css
│   ├── wizard.css
│   └── app.min.css           # Generated bundle used by the page
├── data/
│   ├── content.pt.json
│   └── content.en.json
├── js/
│   ├── main.js
│   ├── state.js
│   ├── i18n.js
│   ├── constants.js
│   ├── wizard.js
│   ├── data/
│   │   ├── content.js
│   │   └── translations.js
│   ├── modules/
│   │   ├── appBootstrap.js
│   │   ├── appView.js
│   │   ├── calendar.js
│   │   ├── contactTeam.js
│   │   ├── modal.js
│   │   ├── navigation.js
│   │   └── renderers.js
│   └── utils/
│       ├── dates.js
│       ├── medication.js
│       └── storage.js
├── scripts/
│   └── build-css.mjs         # Builds css/app.min.css
├── tests/
│   ├── e2e/
│   │   └── wizard-contact.spec.js
│   └── unit/
│       ├── appBootstrap.test.js
│       ├── contactTeam.test.js
│       └── navigation.test.js
├── package.json
├── vitest.config.js
└── playwright.config.js
```

## Running Locally

You can open `index.html` directly, but using a local server is recommended (JSON fetches/content loading).

Examples:

```bash
python3 -m http.server 5500
```

Then open:

```text
http://127.0.0.1:5500
```

## CSS Build

The app uses `css/app.min.css` (generated bundle).

After changing CSS files, rebuild:

```bash
npm run build:css
```

## Tests

Install dependencies first:

```bash
npm install
```

Run unit tests (Vitest):

```bash
npm run test:unit
```

Run e2e tests (Playwright):

```bash
npx playwright install
npm run test:e2e
```

## Notes

- Calendar export is now `.ics` only (single CTA), compatible with Apple Calendar, Google Calendar (import/open), and Outlook.
- Timed ICS events include reminders.
- The contact button currently uses a `mailto:` flow (no backend email sending).

## Technologies

- Vanilla JavaScript (ES modules)
- HTML5
- CSS (custom properties + responsive layouts)
- JSON content files (PT/EN)
- Vitest (unit tests)
- Playwright (e2e tests)
