# 🍅 Pomodoro — Make Time Count

A calm, aesthetic, and fully functional Pomodoro & Deep Work Study Timer web application built with vanilla HTML5, CSS3, and JavaScript. Designed with minimal editorial typography, generous whitespace, subtle micro-interactions, customizable presets (15m, 25m, 45m, 50m, 60m, 90m), and a warm color palette.

![Pomodoro Web Application](https://images.unsplash.com/photo-1434030216411-0b793f4b4173?auto=format&fit=crop&w=1200&q=80)

---

## ✨ Features

- **Timer Variations & Quick Presets**:
  - **15m** — Quick Sprint (for fast momentum)
  - **25m** — Classic Pomodoro Technique (25m Focus / 5m Break / 15m Long Break)
  - **45m** — Standard Academic Period (45m Focus / 15m Break)
  - **50m** — The 50/10 Rule (50m Focus / 10m Break)
  - **60m** — Power Hour (60m Deep Work)
  - **90m** — Ultradian Flow State (90m peak cognitive performance)
  - **Custom** — Input any custom duration from 1 to 180 minutes in Settings.
- **Accurate Background Timer**:
  - Built with timestamp-based countdown calculations (`Date.now()`), remaining 100% accurate even when browser tabs are inactive or minimized.
- **Smooth Circular Progress Ring**:
  - Pure SVG countdown ring that smoothly transitions as time elapses.
  - Live document title updates (`24:50 — Focus | Pomodoro`).
- **Warm & Comfortable Themes**:
  - Calming light theme (`#F8F7F4` warm off-white, `#E76F51` coral focus accent).
  - Deep charcoal dark theme (`#171717`).
  - System preference detection and manual toggle saved in `localStorage`.
- **Gentle Sound Notifications**:
  - Synthesized harmonic chime powered by the **Web Audio API** — 100% offline, zero external audio dependencies.
  - Sound preview / test button in Settings.
- **Daily Goals & Interactive Statistics**:
  - Daily focus goal progress bar with dynamic motivational text.
  - Quick `+` and `-` manual logging buttons on the goal card.
  - Interactive cycle progress dots (`● ● ● ○`) with cycle reset.
  - Total Focus Time (`1h 15m`), Completed Focus Sessions, and Goal Progress (`%`).
  - Date-aware storage: daily stats automatically rollover on a new day without losing your custom settings.
- **Every Button Fully Functional**:
  - Header: Sound toggle, Theme toggle, Settings modal.
  - Modes: Focus, Short Break, Long Break.
  - Preset Chips: Direct 1-click duration switches.
  - Controls: Start, Pause, Reset, Skip.
  - Cycle: Clickable dots and "Reset cycle" link.
  - Settings: Technique template loader, custom durations, test chime, save/cancel.
- **Accessible & Mobile Responsive**:
  - Fully responsive from mobile devices (<380px) to wide 4K screens.
  - Touch-friendly controls (≥ 44px hit areas).
  - Full keyboard control (`Spacebar` to start/pause, `Esc` to close modal).
  - Respects `prefers-reduced-motion`.
  - Non-intrusive toast notification system.

---

## 🛠️ Tech Stack

- **HTML5**: Semantic markup, accessible roles (`aria-live`, `aria-selected`, `progressbar`).
- **CSS3**: CSS Custom Properties (variables), Flexbox, CSS Grid, SVG animation, clean modern reset.
- **JavaScript (ES6+)**: Modular vanilla JS with zero external dependencies, libraries, or build steps.

---

## 🚀 Quick Start

No installation or node modules required!

1. Clone this repository:
   ```bash
   git clone https://github.com/YOUR_USERNAME/pomodoro-web.git
   cd pomodoro-web
   ```
2. Open `index.html` in your web browser:
   - Double click `index.html`, or
   - Use VS Code Live Server extension.

---

## ⌨️ Keyboard Shortcuts

| Key | Action |
| --- | --- |
| `Space` | Start / Pause timer |
| `Esc` | Close Settings modal |

---

## 📁 Project Structure

```text
pomodoro-web/
├── index.html       # Semantic HTML structure & SVG icons
├── style.css        # Responsive styling & light/dark design system
├── script.js        # Timer engine, presets, audio, and UI logic
├── LICENSE          # MIT License
└── README.md        # Documentation
```

---

## 📄 License

This project is licensed under the MIT License - see the [LICENSE](LICENSE) file for details.
