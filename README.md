# 🍅 Pomodoro — Make Time Count

A calm, aesthetic, and fully functional Pomodoro Study Timer web application built with vanilla HTML5, CSS3, and JavaScript. Designed with minimal editorial typography, generous whitespace, subtle micro-interactions, and a warm color palette.

![Pomodoro Web Application](https://images.unsplash.com/photo-1434030216411-0b793f4b4173?auto=format&fit=crop&w=1200&q=80)

---

## ✨ Features

- **Classic Pomodoro Technique**:
  - 4 Focus sessions (25 min) interspersed with Short Breaks (5 min).
  - 4th Focus session triggers a restful Long Break (15 min).
  - Cycle progress tracker (`● ● ● ○`) indicating current session in the cycle.
- **Accurate Background Timer**:
  - Built with timestamp-based calculations (`Date.now()`), remaining 100% accurate even when browser tabs are inactive or minimized.
- **Smooth Circular Progress Ring**:
  - Pure SVG countdown ring that smoothly transitions as time elapses.
  - Live document title updates (`24:50 — Focus | Pomodoro`).
- **Warm & Comfortable Themes**:
  - Calming light theme (`#F8F7F4` warm off-white, `#E76F51` coral focus accent).
  - Deep charcoal dark theme (`#171717`).
  - System preference detection and manual toggle saved in `localStorage`.
- **Gentle Sound Notifications**:
  - Synthesized harmonic chime powered by the **Web Audio API** — 100% offline, zero external audio dependencies.
  - Sound toggle in header and settings.
- **Daily Goals & Statistics**:
  - Daily focus goal progress bar with dynamic motivational text.
  - Total Focus Time (`1h 15m`), Completed Focus Sessions, and Goal Progress (`%`).
  - Date-aware storage: daily stats automatically rollover on a new day without losing your custom settings.
- **Customizable Settings Modal**:
  - Custom durations for Focus, Short Break, and Long Break.
  - Custom daily session target.
  - Auto-start session option and theme selection.
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
├── script.js        # Timer engine, localStorage, audio, and UI logic
├── LICENSE          # MIT License
└── README.md        # Documentation
```

---

## 📄 License

This project is licensed under the MIT License - see the [LICENSE](LICENSE) file for details.
