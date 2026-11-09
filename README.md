# 🍅 Pomodoro — Make Time Count

A calm, aesthetic, and fully functional Pomodoro & Deep Work Study Timer web application built with vanilla HTML5, CSS3, and JavaScript. Designed with minimal editorial typography, ambient study audio, task tracking, celebration confetti, generous whitespace, customizable presets (15m, 25m, 45m, 50m, 60m, 90m), and a warm color palette.

![Pomodoro Web Application](https://images.unsplash.com/photo-1434030216411-0b793f4b4173?auto=format&fit=crop&w=1200&q=80)

---

## ✨ Features

- **Timer Variations & Quick Presets**:
  - **15m** — Quick Sprint (for overcoming procrastination)
  - **25m** — Classic Pomodoro Technique (25m Focus / 5m Break / 15m Long Break)
  - **45m** — Standard Academic Period (45m Focus / 15m Break)
  - **50m** — The 50/10 Rule (50m Focus / 10m Break)
  - **60m** — Power Hour (60m Deep Work)
  - **90m** — Ultradian Flow State (90m peak cognitive performance)
  - **Custom** — Input any custom duration from 1 to 180 minutes in Settings.
- **🎧 Synthesized Ambient Audio (100% Offline)**:
  - Built-in sound generator powered by Web Audio API — zero external files or bandwidth needed!
  - Soundscapes: **Rain 🌧️**, **Ocean Waves 🌊**, **Forest Breeze 🍃**, and **Pink Noise 💨** with a volume slider.
- **🎯 Inline Focus Task Tracker**:
  - "What are you focusing on?" active task bar right above the timer.
  - Complete your task with a single click or `Enter` key to trigger a celebratory confetti burst and increment your completed tasks count!
- **🧘 Zen Full-Screen Mode**:
  - Distraction-free focus view (press `F` or click the Zen button in the header) that strips away all secondary cards and presents a clean timer & task view.
- **🎉 Confetti Celebrations**:
  - Lightweight canvas confetti bursts when you complete a focus session, finish a task, or reach your daily goal.
- **Accurate Background Timer**:
  - Built with timestamp calculations (`Date.now()`), remaining 100% accurate even when browser tabs are inactive or minimized.
- **Breathing Glow Ring**:
  - Calming, organic glowing pulse around the countdown ring while the timer is running.
- **Warm & Comfortable Themes**:
  - Calming light theme (`#F8F7F4` warm off-white, `#E76F51` coral focus accent).
  - Deep charcoal dark theme (`#171717`).
  - System preference detection and manual toggle saved in `localStorage`.
- **Daily Goals & Interactive Statistics**:
  - Daily focus goal progress bar with dynamic motivational text.
  - Quick `+` and `-` manual logging buttons on the goal card.
  - Interactive cycle progress dots (`● ● ● ○`) with cycle reset.
  - Total Focus Time (`1h 15m`), Completed Focus Sessions, and Goal Progress (`%`).
  - Date-aware storage: daily stats automatically rollover on a new day without losing your custom settings.
- **Accessible & Mobile Responsive**:
  - Fully responsive from mobile devices (<380px) to wide 4K screens.
  - Single-view desktop sightline: fits on screen without vertical scrolling.
  - Touch-friendly controls (≥ 44px hit areas).
  - Full keyboard shortcuts (`Space`, `R`, `S`, `F`, `M`, `?`, `Esc`).

---

## 🛠️ Tech Stack

- **HTML5**: Semantic markup, accessible roles (`aria-live`, `aria-selected`, `progressbar`, `dialog`).
- **CSS3**: CSS Custom Properties (variables), Flexbox, CSS Grid, SVG animation, clean modern reset.
- **JavaScript (ES6+)**: Modular vanilla JS, Web Audio API synthesis, HTML5 Canvas animation, zero external dependencies or build steps.

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
| `R` | Reset current session |
| `S` | Skip to next session |
| `F` | Toggle Zen focus mode |
| `M` | Toggle notification chime sound |
| `?` | Show Keyboard shortcuts modal |
| `Esc` | Close any open modal or exit Zen mode |

---

## 📁 Project Structure

```text
pomodoro-web/
├── index.html       # Semantic HTML structure, audio popover & SVG icons
├── style.css        # Responsive styling, Zen mode, animations & themes
├── script.js        # Timer engine, Web Audio synthesis, canvas confetti & task tracker
├── LICENSE          # MIT License
└── README.md        # Documentation
```

---

## 📄 License

This project is licensed under the MIT License - see the [LICENSE](LICENSE) file for details.
