# CUF Prepara - Colonoscopy Preparation Guide

A web-based interactive guide to help patients prepare for colonoscopy procedures at CUF healthcare.

## Overview

CUF Prepara is an educational tool that guides patients through the colonoscopy preparation process, including:
- Low-residue diet guidelines (3-2 days before)
- Clear liquid diet instructions (day before)
- PLENVU bowel preparation medication instructions
- Exam day information and checklist

## Features

- **Multi-language support** - Portuguese (PT) and English (EN)
- **Interactive wizard** - Step-by-step preparation guide
- **Shopping lists** - Phase-appropriate food lists
- **Medication reminders** - Dulcolax timing
- **Calendar integration** - Visual timeline of preparation phases
- **Responsive design** - Works on desktop and mobile devices

## Project Structure

```
cuf-prepara/
├── index.html          # Main HTML entry point
├── css/                # Stylesheets
│   ├── reset.css
│   ├── variables.css
│   ├── layout.css
│   ├── components.css
│   ├── sections.css
│   └── wizard.css
├── js/                 # JavaScript modules
│   ├── main.js
│   ├── state.js
│   ├── i18n.js
│   ├── constants.js
│   ├── wizard.js
│   ├── data/
│   │   ├── content.js
│   │   └── translations.js
│   ├── modules/
│   │   ├── modal.js
│   │   ├── calendar.js
│   │   └── renderers.js
│   └── utils/
│       ├── storage.js
│       ├── medication.js
│       └── dates.js
└── data/               # Content files
    ├── content.pt.json
    └── content.en.json
```

## Usage

Simply open `index.html` in a web browser. No build step or server required.

## Technologies

- Vanilla JavaScript (no frameworks)
- CSS custom properties
- HTML5
- JSON for content management
