/**
 * Pomodoro Web Application
 * Minimal, aesthetic, and fully functional Pomodoro Study Timer.
 */

// ==========================================================================
// Default State & Configuration
// ==========================================================================
const DEFAULT_SETTINGS = {
  focusDuration: 25,       // in minutes
  shortBreakDuration: 5,   // in minutes
  longBreakDuration: 15,   // in minutes
  dailyGoal: 4,            // target focus sessions
  soundEnabled: true,      // sound preference
  autoStart: false,        // auto switch and start
  theme: 'system'          // 'system' | 'light' | 'dark'
};

const MODE_CONFIG = {
  focus: {
    name: 'Focus',
    message: "Stay focused. You've got this."
  },
  shortBreak: {
    name: 'Short Break',
    message: "Take a breath. You've earned it."
  },
  longBreak: {
    name: 'Long Break',
    message: "Relax and recharge."
  }
};

// SVG Progress Ring Circumference (2 * Math.PI * radius: 140)
const RING_CIRCUMFERENCE = 2 * Math.PI * 140;

// Application State
let appSettings = { ...DEFAULT_SETTINGS };

let timerState = {
  currentMode: 'focus',      // 'focus' | 'shortBreak' | 'longBreak'
  isRunning: false,
  totalSeconds: 25 * 60,
  remainingSeconds: 25 * 60,
  endTime: null,
  timerInterval: null,
  cycleCount: 0              // 0 to 4 within current cycle
};

let dailyProgress = {
  date: getTodayDateString(),
  completedSessions: 0,
  totalFocusSeconds: 0
};

// ==========================================================================
// DOM Elements
// ==========================================================================
const timeDisplay = document.getElementById('timeDisplay');
const timerStatus = document.getElementById('timerStatus');
const progressCircle = document.getElementById('progressCircle');
const modeMessage = document.getElementById('modeMessage');
const startPauseBtn = document.getElementById('startPauseBtn');
const startPauseLabel = document.getElementById('startPauseLabel');
const playIcon = document.getElementById('playIcon');
const pauseIcon = document.getElementById('pauseIcon');
const resetBtn = document.getElementById('resetBtn');
const skipBtn = document.getElementById('skipBtn');

const modeTabs = {
  focus: document.getElementById('modeFocus'),
  shortBreak: document.getElementById('modeShortBreak'),
  longBreak: document.getElementById('modeLongBreak')
};

// Progress & Goal Elements
const cycleDotsContainer = document.getElementById('cycleDots');
const cycleSummaryText = document.getElementById('cycleSummaryText');
const goalCountDisplay = document.getElementById('goalCountDisplay');
const goalProgressBar = document.getElementById('goalProgressBar');
const goalProgressBarContainer = document.getElementById('goalProgressBarContainer');
const goalMotivationalText = document.getElementById('goalMotivationalText');

// Statistics Elements
const statFocusTime = document.getElementById('statFocusTime');
const statSessionsCount = document.getElementById('statSessionsCount');
const statGoalProgress = document.getElementById('statGoalProgress');

// Header Controls
const themeToggleBtn = document.getElementById('themeToggleBtn');
const themeIconSun = document.getElementById('themeIconSun');
const themeIconMoon = document.getElementById('themeIconMoon');
const soundToggleBtn = document.getElementById('soundToggleBtn');
const soundIconOn = document.getElementById('soundIconOn');
const soundIconOff = document.getElementById('soundIconOff');
const settingsBtn = document.getElementById('settingsBtn');

// Modal Elements
const settingsModal = document.getElementById('settingsModal');
const closeSettingsBtn = document.getElementById('closeSettingsBtn');
const cancelSettingsBtn = document.getElementById('cancelSettingsBtn');
const settingsForm = document.getElementById('settingsForm');
const focusDurationInput = document.getElementById('focusDurationInput');
const shortBreakInput = document.getElementById('shortBreakInput');
const longBreakInput = document.getElementById('longBreakInput');
const dailyGoalInput = document.getElementById('dailyGoalInput');
const soundPrefCheckbox = document.getElementById('soundPrefCheckbox');
const autoSwitchPrefCheckbox = document.getElementById('autoSwitchPrefCheckbox');
const themeSelect = document.getElementById('themeSelect');

// Toast Notification Container
const toastContainer = document.getElementById('toastContainer');

// ==========================================================================
// Initialization
// ==========================================================================
document.addEventListener('DOMContentLoaded', () => {
  loadSettings();
  loadDailyProgress();
  initTheme();
  setupSVGProgressRing();
  resetTimer(false);
  updateStatistics();
  updateCycleProgressDisplay();
  attachEventListeners();
});

// Setup progress ring initial stroke-dasharray and offset
function setupSVGProgressRing() {
  if (progressCircle) {
    progressCircle.style.strokeDasharray = `${RING_CIRCUMFERENCE}`;
    progressCircle.style.strokeDashoffset = '0';
  }
}

// ==========================================================================
// Timer Core Functions
// ==========================================================================

/**
 * Starts or resumes the Pomodoro countdown.
 * Uses timestamp-based calculation for precision across background tabs.
 */
function startTimer() {
  if (timerState.isRunning) return;

  timerState.isRunning = true;
  // Calculate target end timestamp
  timerState.endTime = Date.now() + timerState.remainingSeconds * 1000;

  // Visual button state
  updateControlsState(true);
  timerStatus.textContent = 'Timer running';

  // Immediate update
  tick();

  // Clear any existing interval to prevent duplicates
  if (timerState.timerInterval) clearInterval(timerState.timerInterval);

  // Set recurring interval for ticking
  timerState.timerInterval = setInterval(() => {
    tick();
  }, 250);
}

/**
 * Pauses the active countdown.
 */
function pauseTimer() {
  if (!timerState.isRunning) return;

  timerState.isRunning = false;
  if (timerState.timerInterval) {
    clearInterval(timerState.timerInterval);
    timerState.timerInterval = null;
  }

  // Calculate remaining seconds from timestamp before pausing
  if (timerState.endTime) {
    const msRemaining = Math.max(0, timerState.endTime - Date.now());
    timerState.remainingSeconds = Math.ceil(msRemaining / 1000);
  }

  updateControlsState(false);
  timerStatus.textContent = 'Timer paused';
  updateTimerDisplay();
  updateProgressRing();
}

/**
 * Resets the current session timer to its starting duration.
 * @param {boolean} notify - Whether to show a toast message
 */
function resetTimer(notify = true) {
  pauseTimer();

  const durationMinutes = getDurationForMode(timerState.currentMode);
  timerState.totalSeconds = durationMinutes * 60;
  timerState.remainingSeconds = timerState.totalSeconds;
  timerState.endTime = null;

  updateTimerDisplay();
  updateProgressRing();

  if (notify) {
    showToast(`${MODE_CONFIG[timerState.currentMode].name} timer reset.`);
  }
}

/**
 * Skips the current session and advances to the next in cycle.
 */
function skipSession() {
  pauseTimer();
  const skippedMode = timerState.currentMode;
  showToast(`Skipped ${MODE_CONFIG[skippedMode].name} session.`);
  advanceCycle(false);
}

/**
 * Internal tick handler calculated via wall-clock timestamp.
 */
function tick() {
  if (!timerState.isRunning) return;

  const msRemaining = timerState.endTime - Date.now();
  const secondsLeft = Math.max(0, Math.ceil(msRemaining / 1000));

  timerState.remainingSeconds = secondsLeft;
  updateTimerDisplay();
  updateProgressRing();

  if (secondsLeft <= 0) {
    completeSession();
  }
}

/**
 * Triggered when a session countdown reaches zero.
 */
function completeSession() {
  pauseTimer();

  const finishedMode = timerState.currentMode;
  playNotificationSound();

  if (finishedMode === 'focus') {
    // Record focus stats
    dailyProgress.completedSessions += 1;
    dailyProgress.totalFocusSeconds += timerState.totalSeconds;
    timerState.cycleCount = (timerState.cycleCount + 1) % 4;

    saveDailyProgress();
    updateStatistics();
    updateCycleProgressDisplay();

    showToast('Focus session completed! Great work.');

    // Check if daily goal reached
    if (dailyProgress.completedSessions === appSettings.dailyGoal) {
      setTimeout(() => {
        showToast("🎉 Congratulations! You've reached today's focus goal.");
      }, 1000);
    }
  } else {
    showToast(`${MODE_CONFIG[finishedMode].name} finished. Ready to focus again?`);
  }

  // Advance to next session according to the Pomodoro cycle
  advanceCycle(true);
}

/**
 * Advances the Pomodoro technique sequence:
 * Focus (1) -> Short Break (1) -> Focus (2) -> Short Break (2) ->
 * Focus (3) -> Short Break (3) -> Focus (4) -> Long Break -> Repeat
 * @param {boolean} completedNaturally - Whether session finished naturally
 */
function advanceCycle(completedNaturally = false) {
  let nextMode = 'focus';

  if (timerState.currentMode === 'focus') {
    // If just finished the 4th focus session (cycleCount is 0 now because 4 % 4 = 0)
    if (timerState.cycleCount === 0 && completedNaturally) {
      nextMode = 'longBreak';
    } else {
      nextMode = 'shortBreak';
    }
  } else {
    // After either break, go back to Focus
    nextMode = 'focus';
  }

  switchMode(nextMode, false);

  // If auto-start is enabled and session completed naturally, start immediately
  if (appSettings.autoStart && completedNaturally) {
    startTimer();
  }
}

/**
 * Switches between Focus, Short Break, and Long Break modes.
 * @param {string} mode - 'focus' | 'shortBreak' | 'longBreak'
 * @param {boolean} userInitiated - true if user clicked mode tab
 */
function switchMode(mode, userInitiated = true) {
  if (!MODE_CONFIG[mode]) return;

  pauseTimer();
  timerState.currentMode = mode;

  // Update mode tabs active class
  Object.keys(modeTabs).forEach(key => {
    const tab = modeTabs[key];
    const isActive = key === mode;
    tab.classList.toggle('active', isActive);
    tab.setAttribute('aria-selected', isActive ? 'true' : 'false');
  });

  // Update theme accent attribute on body
  document.body.setAttribute('data-current-mode', mode);

  // Update message
  modeMessage.textContent = MODE_CONFIG[mode].message;

  // Set duration & reset countdown
  const duration = getDurationForMode(mode);
  timerState.totalSeconds = duration * 60;
  timerState.remainingSeconds = timerState.totalSeconds;
  timerState.endTime = null;

  updateTimerDisplay();
  updateProgressRing();

  if (userInitiated) {
    showToast(`Switched to ${MODE_CONFIG[mode].name} mode.`);
  }
}

function getDurationForMode(mode) {
  switch (mode) {
    case 'focus':
      return appSettings.focusDuration;
    case 'shortBreak':
      return appSettings.shortBreakDuration;
    case 'longBreak':
      return appSettings.longBreakDuration;
    default:
      return 25;
  }
}

// ==========================================================================
// Display & UI Updates
// ==========================================================================

/**
 * Updates the time numbers (MM:SS) and document title.
 */
function updateTimerDisplay() {
  const minutes = Math.floor(timerState.remainingSeconds / 60);
  const seconds = timerState.remainingSeconds % 60;
  const formatted = `${String(minutes).padStart(2, '0')}:${String(seconds).padStart(2, '0')}`;

  timeDisplay.textContent = formatted;
  document.title = `${formatted} — ${MODE_CONFIG[timerState.currentMode].name} | Pomodoro`;
}

/**
 * Updates the SVG circular progress bar.
 */
function updateProgressRing() {
  if (!progressCircle) return;

  const total = timerState.totalSeconds;
  const remaining = timerState.remainingSeconds;
  const fraction = total > 0 ? remaining / total : 0;
  const offset = RING_CIRCUMFERENCE * (1 - fraction);

  progressCircle.style.strokeDashoffset = `${offset}`;
}

/**
 * Updates Start/Pause button appearance and accessibility.
 */
function updateControlsState(isRunning) {
  if (isRunning) {
    playIcon.classList.add('hidden');
    pauseIcon.classList.remove('hidden');
    startPauseLabel.textContent = 'Pause';
    startPauseBtn.setAttribute('aria-label', 'Pause timer');
  } else {
    playIcon.classList.remove('hidden');
    pauseIcon.classList.add('hidden');
    startPauseLabel.textContent = 'Start';
    startPauseBtn.setAttribute('aria-label', 'Start timer');
  }
}

/**
 * Updates the session dots for the current 4-session cycle.
 */
function updateCycleProgressDisplay() {
  const dots = cycleDotsContainer.querySelectorAll('.dot');
  const count = timerState.cycleCount;

  dots.forEach((dot, index) => {
    dot.classList.toggle('completed', index < count);
  });

  cycleSummaryText.textContent = `${count} of 4 focus sessions completed.`;
}

/**
 * Updates statistics and daily goal cards.
 */
function updateStatistics() {
  // Check date rollover
  checkDateRollover();

  // 1. Total Focus Time formatted
  const totalSeconds = dailyProgress.totalFocusSeconds;
  const hours = Math.floor(totalSeconds / 3600);
  const mins = Math.floor((totalSeconds % 3600) / 60);

  let formattedTime = '0m';
  if (hours > 0 && mins > 0) {
    formattedTime = `${hours}h ${mins}m`;
  } else if (hours > 0) {
    formattedTime = `${hours}h`;
  } else {
    formattedTime = `${mins}m`;
  }
  statFocusTime.textContent = formattedTime;

  // 2. Completed Sessions Count
  const completed = dailyProgress.completedSessions;
  statSessionsCount.textContent = completed;

  // 3. Goal Progress %
  const target = Math.max(1, appSettings.dailyGoal);
  const percent = Math.min(100, Math.round((completed / target) * 100));
  statGoalProgress.textContent = `${percent}%`;

  // Goal Card UI
  goalCountDisplay.textContent = `${completed} / ${target} sessions`;
  goalProgressBar.style.width = `${percent}%`;
  goalProgressBarContainer.setAttribute('aria-valuenow', percent);

  if (completed >= target) {
    goalMotivationalText.textContent = "Congratulations! You've reached today's goal.";
  } else {
    const remaining = target - completed;
    goalMotivationalText.textContent = `${remaining} more session${remaining > 1 ? 's' : ''} to reach your goal.`;
  }
}

// ==========================================================================
// Settings Management
// ==========================================================================

function loadSettings() {
  try {
    const saved = localStorage.getItem('pomodoro_settings');
    if (saved) {
      appSettings = { ...DEFAULT_SETTINGS, ...JSON.parse(saved) };
    }
  } catch (e) {
    console.error('Error loading settings from localStorage', e);
  }
}

function saveSettings() {
  try {
    localStorage.setItem('pomodoro_settings', JSON.stringify(appSettings));
  } catch (e) {
    console.error('Error saving settings to localStorage', e);
  }
}

function openSettingsModal() {
  focusDurationInput.value = appSettings.focusDuration;
  shortBreakInput.value = appSettings.shortBreakDuration;
  longBreakInput.value = appSettings.longBreakDuration;
  dailyGoalInput.value = appSettings.dailyGoal;
  soundPrefCheckbox.checked = appSettings.soundEnabled;
  autoSwitchPrefCheckbox.checked = appSettings.autoStart;
  themeSelect.value = appSettings.theme;

  settingsModal.classList.remove('hidden');
  focusDurationInput.focus();
}

function closeSettingsModal() {
  settingsModal.classList.add('hidden');
}

function handleSaveSettings(event) {
  event.preventDefault();

  const newFocus = parseInt(focusDurationInput.value, 10);
  const newShort = parseInt(shortBreakInput.value, 10);
  const newLong = parseInt(longBreakInput.value, 10);
  const newGoal = parseInt(dailyGoalInput.value, 10);

  if (isNaN(newFocus) || newFocus < 1 || isNaN(newShort) || newShort < 1 ||
      isNaN(newLong) || newLong < 1 || isNaN(newGoal) || newGoal < 1) {
    showToast('Please enter valid positive numbers for all fields.');
    return;
  }

  appSettings.focusDuration = newFocus;
  appSettings.shortBreakDuration = newShort;
  appSettings.longBreakDuration = newLong;
  appSettings.dailyGoal = newGoal;
  appSettings.soundEnabled = soundPrefCheckbox.checked;
  appSettings.autoStart = autoSwitchPrefCheckbox.checked;
  appSettings.theme = themeSelect.value;

  saveSettings();
  applyTheme(appSettings.theme);
  updateSoundIconUI();

  // If timer is not currently running, apply new duration immediately
  if (!timerState.isRunning) {
    const currentDuration = getDurationForMode(timerState.currentMode);
    timerState.totalSeconds = currentDuration * 60;
    timerState.remainingSeconds = timerState.totalSeconds;
    updateTimerDisplay();
    updateProgressRing();
  }

  updateStatistics();
  closeSettingsModal();
  showToast('Settings saved successfully.');
}

// ==========================================================================
// Daily Progress & LocalStorage
// ==========================================================================

function getTodayDateString() {
  const now = new Date();
  const year = now.getFullYear();
  const month = String(now.getMonth() + 1).padStart(2, '0');
  const day = String(now.getDate()).padStart(2, '0');
  return `${year}-${month}-${day}`;
}

function checkDateRollover() {
  const today = getTodayDateString();
  if (dailyProgress.date !== today) {
    dailyProgress.date = today;
    dailyProgress.completedSessions = 0;
    dailyProgress.totalFocusSeconds = 0;
    saveDailyProgress();
  }
}

function loadDailyProgress() {
  try {
    const saved = localStorage.getItem('pomodoro_daily_progress');
    if (saved) {
      dailyProgress = JSON.parse(saved);
    }
    checkDateRollover();
  } catch (e) {
    console.error('Error loading daily progress', e);
  }
}

function saveDailyProgress() {
  try {
    localStorage.setItem('pomodoro_daily_progress', JSON.stringify(dailyProgress));
  } catch (e) {
    console.error('Error saving daily progress', e);
  }
}

// ==========================================================================
// Theme Management
// ==========================================================================

function initTheme() {
  applyTheme(appSettings.theme);

  // Listen to system theme changes if set to system
  if (window.matchMedia) {
    window.matchMedia('(prefers-color-scheme: dark)').addEventListener('change', () => {
      if (appSettings.theme === 'system') {
        applyTheme('system');
      }
    });
  }
}

function applyTheme(themeChoice) {
  let isDark = false;
  if (themeChoice === 'dark') {
    isDark = true;
  } else if (themeChoice === 'light') {
    isDark = false;
  } else {
    // system preference
    isDark = window.matchMedia && window.matchMedia('(prefers-color-scheme: dark)').matches;
  }

  if (isDark) {
    document.documentElement.setAttribute('data-theme', 'dark');
    themeIconMoon.classList.add('hidden');
    themeIconSun.classList.remove('hidden');
    themeToggleBtn.setAttribute('data-tooltip', 'Switch to light mode');
  } else {
    document.documentElement.removeAttribute('data-theme');
    themeIconMoon.classList.remove('hidden');
    themeIconSun.classList.add('hidden');
    themeToggleBtn.setAttribute('data-tooltip', 'Switch to dark mode');
  }
}

function toggleTheme() {
  const currentDark = document.documentElement.getAttribute('data-theme') === 'dark';
  const newTheme = currentDark ? 'light' : 'dark';
  appSettings.theme = newTheme;
  saveSettings();
  applyTheme(newTheme);
  showToast(`Theme changed to ${newTheme} mode.`);
}

// ==========================================================================
// Sound & Notifications (Web Audio API)
// ==========================================================================

/**
 * Plays a calm, gentle harmonic bell chime synthesized via Web Audio API.
 * 100% self-contained, zero external audio files needed, works offline.
 */
function playNotificationSound() {
  if (!appSettings.soundEnabled) return;

  try {
    const AudioContextClass = window.AudioContext || window.webkitAudioContext;
    if (!AudioContextClass) return;

    const ctx = new AudioContextClass();

    // Gentle chord frequencies: C5, E5, G5
    const frequencies = [523.25, 659.25, 783.99];

    frequencies.forEach((freq, index) => {
      const osc = ctx.createOscillator();
      const gain = ctx.createGain();

      osc.type = 'sine';
      osc.frequency.setValueAtTime(freq, ctx.currentTime);

      // Stagger notes slightly for a gentle marimba/bell roll
      const startTime = ctx.currentTime + index * 0.08;
      const duration = 1.4;

      gain.gain.setValueAtTime(0, startTime);
      gain.gain.linearRampToValueAtTime(0.18, startTime + 0.03);
      gain.gain.exponentialRampToValueAtTime(0.0001, startTime + duration);

      osc.connect(gain);
      gain.connect(ctx.destination);

      osc.start(startTime);
      osc.stop(startTime + duration);
    });
  } catch (e) {
    console.warn('Audio playback error:', e);
  }
}

function toggleSound() {
  appSettings.soundEnabled = !appSettings.soundEnabled;
  saveSettings();
  updateSoundIconUI();
  showToast(`Notification sound ${appSettings.soundEnabled ? 'enabled' : 'muted'}.`);
  if (appSettings.soundEnabled) {
    playNotificationSound();
  }
}

function updateSoundIconUI() {
  if (appSettings.soundEnabled) {
    soundIconOn.classList.remove('hidden');
    soundIconOff.classList.add('hidden');
    soundToggleBtn.setAttribute('data-tooltip', 'Sound: On');
  } else {
    soundIconOn.classList.add('hidden');
    soundIconOff.classList.remove('hidden');
    soundToggleBtn.setAttribute('data-tooltip', 'Sound: Off');
  }
}

// ==========================================================================
// Toast Notifications
// ==========================================================================

function showToast(message, duration = 4000) {
  if (!toastContainer) return;

  const toast = document.createElement('div');
  toast.className = 'toast';
  toast.setAttribute('role', 'alert');

  toast.innerHTML = `
    <span class="toast-message">${escapeHTML(message)}</span>
    <button class="toast-close-btn" aria-label="Dismiss notification">
      <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
        <line x1="18" y1="6" x2="6" y2="18"></line>
        <line x1="6" y1="6" x2="18" y2="18"></line>
      </svg>
    </button>
  `;

  const dismiss = () => {
    toast.classList.add('toast-exit');
    setTimeout(() => {
      if (toast.parentNode) toast.parentNode.removeChild(toast);
    }, 220);
  };

  toast.querySelector('.toast-close-btn').addEventListener('click', dismiss);

  toastContainer.appendChild(toast);

  // Auto remove after duration
  setTimeout(dismiss, duration);
}

function escapeHTML(str) {
  return str.replace(/[&<>'"]/g, tag => ({
    '&': '&amp;',
    '<': '&lt;',
    '>': '&gt;',
    "'": '&#39;',
    '"': '&quot;'
  }[tag] || tag));
}

// ==========================================================================
// Event Listeners & Keyboard Accessibility
// ==========================================================================

function attachEventListeners() {
  // Start / Pause
  startPauseBtn.addEventListener('click', () => {
    if (timerState.isRunning) {
      pauseTimer();
    } else {
      startTimer();
    }
  });

  // Reset
  resetBtn.addEventListener('click', () => resetTimer(true));

  // Skip
  skipBtn.addEventListener('click', skipSession);

  // Mode Tabs
  modeTabs.focus.addEventListener('click', () => switchMode('focus', true));
  modeTabs.shortBreak.addEventListener('click', () => switchMode('shortBreak', true));
  modeTabs.longBreak.addEventListener('click', () => switchMode('longBreak', true));

  // Header Buttons
  themeToggleBtn.addEventListener('click', toggleTheme);
  soundToggleBtn.addEventListener('click', toggleSound);
  settingsBtn.addEventListener('click', openSettingsModal);

  // Modal Controls
  closeSettingsBtn.addEventListener('click', closeSettingsModal);
  cancelSettingsBtn.addEventListener('click', closeSettingsModal);
  settingsForm.addEventListener('submit', handleSaveSettings);

  // Close modal when clicking outside of modal-card
  settingsModal.addEventListener('click', (e) => {
    if (e.target === settingsModal) {
      closeSettingsModal();
    }
  });

  // Keyboard navigation
  document.addEventListener('keydown', (e) => {
    // If modal is open, Escape closes it
    if (e.key === 'Escape' && !settingsModal.classList.contains('hidden')) {
      closeSettingsModal();
      return;
    }

    // Spacebar starts/pauses when not typing in form inputs
    if (e.code === 'Space' && !['INPUT', 'SELECT', 'TEXTAREA'].includes(document.activeElement.tagName)) {
      e.preventDefault();
      if (timerState.isRunning) {
        pauseTimer();
      } else {
        startTimer();
      }
    }
  });

  // Tab visibility change handler (sync timer immediately when user switches back)
  document.addEventListener('visibilitychange', () => {
    if (!document.hidden && timerState.isRunning) {
      tick();
    }
  });
}

