/**
 * Pomodoro Web Application
 * Minimal, aesthetic, and fully functional Pomodoro & Deep Work Study Timer.
 */

// ==========================================================================
// Default State & Configuration
// ==========================================================================
const DEFAULT_SETTINGS = {
  focusDuration: 25,       // in minutes
  shortBreakDuration: 5,   // in minutes
  longBreakDuration: 15,   // in minutes
  dailyGoal: 4,            // target focus sessions
  soundEnabled: true,      // chime sound preference
  autoStart: false,        // auto switch and start
  theme: 'system',         // 'system' | 'light' | 'dark'
  ambientSound: 'off',     // 'off' | 'rain' | 'waves' | 'breeze' | 'white'
  ambientVolume: 45        // 0 to 100
};

const MODE_CONFIG = {
  focus: {
    name: 'Focus',
    message: "Stay focused. You've got this.",
    presets: [15, 25, 45, 50, 60, 90]
  },
  shortBreak: {
    name: 'Short Break',
    message: "Take a breath. You've earned it.",
    presets: [3, 5, 10, 15]
  },
  longBreak: {
    name: 'Long Break',
    message: "Relax and recharge.",
    presets: [15, 20, 25, 30]
  }
};

const RING_CIRCUMFERENCE = 2 * Math.PI * 140;

// Application State
let appSettings = { ...DEFAULT_SETTINGS };

let timerState = {
  currentMode: 'focus',
  isRunning: false,
  totalSeconds: 25 * 60,
  remainingSeconds: 25 * 60,
  endTime: null,
  timerInterval: null,
  cycleCount: 0
};

let dailyProgress = {
  date: getTodayDateString(),
  completedSessions: 0,
  totalFocusSeconds: 0,
  completedTasksCount: 0
};

// Web Audio API Ambient Sound Context
let ambientAudio = {
  ctx: null,
  gainNode: null,
  sourceNode: null,
  filterNode: null,
  lfoNode: null,
  currentType: 'off'
};

// ==========================================================================
// DOM Elements
// ==========================================================================
const countdownWrapper = document.getElementById('countdownWrapper');
const timeDisplay = document.getElementById('timeDisplay');
const timerStatus = document.getElementById('timerStatus');
const progressCircle = document.getElementById('progressCircle');
const modeMessage = document.getElementById('modeMessage');
const presetChipsGroup = document.getElementById('presetChipsGroup');
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

// Task Focus Elements
const taskInput = document.getElementById('taskInput');
const taskDoneBtn = document.getElementById('taskDoneBtn');
const taskCountBadge = document.getElementById('taskCountBadge');

// Progress & Goal Elements
const cycleDotsContainer = document.getElementById('cycleDots');
const cycleSummaryText = document.getElementById('cycleSummaryText');
const resetCycleBtn = document.getElementById('resetCycleBtn');
const goalCountDisplay = document.getElementById('goalCountDisplay');
const goalProgressBar = document.getElementById('goalProgressBar');
const goalProgressBarContainer = document.getElementById('goalProgressBarContainer');
const goalMotivationalText = document.getElementById('goalMotivationalText');
const manualIncrementSessionBtn = document.getElementById('manualIncrementSessionBtn');
const manualDecrementSessionBtn = document.getElementById('manualDecrementSessionBtn');

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
const zenToggleBtn = document.getElementById('zenToggleBtn');
const zenIconExpand = document.getElementById('zenIconExpand');
const zenIconCompress = document.getElementById('zenIconCompress');
const shortcutsBtn = document.getElementById('shortcutsBtn');
const settingsBtn = document.getElementById('settingsBtn');

// Ambient Popover Elements
const ambientToggleBtn = document.getElementById('ambientToggleBtn');
const ambientPopover = document.getElementById('ambientPopover');
const ambientStatusText = document.getElementById('ambientStatusText');
const ambientVolumeSlider = document.getElementById('ambientVolumeSlider');
const ambientOptBtns = document.querySelectorAll('.ambient-opt-btn');

// Modals
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
const testSoundBtn = document.getElementById('testSoundBtn');
const techniquePresetBtns = document.querySelectorAll('.technique-preset-btn');

const shortcutsModal = document.getElementById('shortcutsModal');
const closeShortcutsBtn = document.getElementById('closeShortcutsBtn');

// Toast & Confetti
const toastContainer = document.getElementById('toastContainer');
const confettiCanvas = document.getElementById('confettiCanvas');

// ==========================================================================
// Initialization
// ==========================================================================
document.addEventListener('DOMContentLoaded', () => {
  loadSettings();
  loadDailyProgress();
  loadTask();
  initTheme();
  setupSVGProgressRing();
  renderPresetChips();
  resetTimer(false);
  updateStatistics();
  updateCycleProgressDisplay();
  initAmbientUI();
  attachEventListeners();
});

function setupSVGProgressRing() {
  if (progressCircle) {
    progressCircle.style.strokeDasharray = `${RING_CIRCUMFERENCE}`;
    progressCircle.style.strokeDashoffset = '0';
  }
}

// ==========================================================================
// Timer Core Functions
// ==========================================================================

function startTimer() {
  if (timerState.isRunning) return;

  timerState.isRunning = true;
  timerState.endTime = Date.now() + timerState.remainingSeconds * 1000;

  updateControlsState(true);
  timerStatus.textContent = 'Timer running';
  if (countdownWrapper) countdownWrapper.classList.add('is-running');

  tick();

  if (timerState.timerInterval) clearInterval(timerState.timerInterval);

  timerState.timerInterval = setInterval(() => {
    tick();
  }, 250);
}

function pauseTimer() {
  if (!timerState.isRunning) return;

  timerState.isRunning = false;
  if (timerState.timerInterval) {
    clearInterval(timerState.timerInterval);
    timerState.timerInterval = null;
  }

  if (timerState.endTime) {
    const msRemaining = Math.max(0, timerState.endTime - Date.now());
    timerState.remainingSeconds = Math.ceil(msRemaining / 1000);
  }

  updateControlsState(false);
  timerStatus.textContent = 'Timer paused';
  if (countdownWrapper) countdownWrapper.classList.remove('is-running');

  updateTimerDisplay();
  updateProgressRing();
}

function resetTimer(notify = true) {
  pauseTimer();

  const durationMinutes = getDurationForMode(timerState.currentMode);
  timerState.totalSeconds = durationMinutes * 60;
  timerState.remainingSeconds = timerState.totalSeconds;
  timerState.endTime = null;

  updateTimerDisplay();
  updateProgressRing();
  highlightActivePresetChip();

  if (notify) {
    showToast(`${MODE_CONFIG[timerState.currentMode].name} timer reset to ${durationMinutes}m.`);
  }
}

function skipSession() {
  pauseTimer();
  const skippedMode = timerState.currentMode;
  showToast(`Skipped ${MODE_CONFIG[skippedMode].name} session.`);
  advanceCycle(false);
}

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

function completeSession() {
  pauseTimer();

  const finishedMode = timerState.currentMode;
  playNotificationSound();

  if (finishedMode === 'focus') {
    dailyProgress.completedSessions += 1;
    dailyProgress.totalFocusSeconds += timerState.totalSeconds;
    timerState.cycleCount = (timerState.cycleCount + 1) % 4;

    saveDailyProgress();
    updateStatistics();
    updateCycleProgressDisplay();

    // Trigger celebration confetti
    triggerConfetti();

    showToast('Focus session completed! Great work.');

    if (dailyProgress.completedSessions === appSettings.dailyGoal) {
      setTimeout(() => {
        triggerConfetti(90);
        showToast("🎉 Congratulations! You've reached today's focus goal.");
      }, 1000);
    }
  } else {
    showToast(`${MODE_CONFIG[finishedMode].name} finished. Ready to focus again?`);
  }

  advanceCycle(true);
}

function advanceCycle(completedNaturally = false) {
  let nextMode = 'focus';

  if (timerState.currentMode === 'focus') {
    if (timerState.cycleCount === 0 && completedNaturally) {
      nextMode = 'longBreak';
    } else {
      nextMode = 'shortBreak';
    }
  } else {
    nextMode = 'focus';
  }

  switchMode(nextMode, false);

  if (appSettings.autoStart && completedNaturally) {
    startTimer();
  }
}

function switchMode(mode, userInitiated = true) {
  if (!MODE_CONFIG[mode]) return;

  pauseTimer();
  timerState.currentMode = mode;

  Object.keys(modeTabs).forEach(key => {
    const tab = modeTabs[key];
    const isActive = key === mode;
    tab.classList.toggle('active', isActive);
    tab.setAttribute('aria-selected', isActive ? 'true' : 'false');
  });

  document.body.setAttribute('data-current-mode', mode);
  modeMessage.textContent = MODE_CONFIG[mode].message;

  renderPresetChips();

  const duration = getDurationForMode(mode);
  timerState.totalSeconds = duration * 60;
  timerState.remainingSeconds = timerState.totalSeconds;
  timerState.endTime = null;

  updateTimerDisplay();
  updateProgressRing();

  if (userInitiated) {
    showToast(`Switched to ${MODE_CONFIG[mode].name} mode (${duration}m).`);
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

function setDurationForMode(mode, minutes) {
  switch (mode) {
    case 'focus':
      appSettings.focusDuration = minutes;
      break;
    case 'shortBreak':
      appSettings.shortBreakDuration = minutes;
      break;
    case 'longBreak':
      appSettings.longBreakDuration = minutes;
      break;
  }
  saveSettings();
}

// ==========================================================================
// Preset Chips Management
// ==========================================================================

function renderPresetChips() {
  if (!presetChipsGroup) return;

  presetChipsGroup.innerHTML = '';
  const currentMode = timerState.currentMode;
  const presets = MODE_CONFIG[currentMode].presets || [25];
  const activeDuration = getDurationForMode(currentMode);

  presets.forEach(mins => {
    const chip = document.createElement('button');
    chip.type = 'button';
    chip.className = `preset-chip ${mins === activeDuration ? 'active' : ''}`;
    chip.setAttribute('data-minutes', mins);
    chip.textContent = `${mins}m`;
    chip.setAttribute('title', `Set ${MODE_CONFIG[currentMode].name} duration to ${mins} minutes`);

    chip.addEventListener('click', () => {
      selectDurationPreset(mins);
    });

    presetChipsGroup.appendChild(chip);
  });
}

function selectDurationPreset(minutes) {
  setDurationForMode(timerState.currentMode, minutes);
  highlightActivePresetChip();

  pauseTimer();
  timerState.totalSeconds = minutes * 60;
  timerState.remainingSeconds = timerState.totalSeconds;
  timerState.endTime = null;

  updateTimerDisplay();
  updateProgressRing();

  showToast(`Timer set to ${minutes} min for ${MODE_CONFIG[timerState.currentMode].name}.`);
}

function highlightActivePresetChip() {
  if (!presetChipsGroup) return;
  const activeDuration = getDurationForMode(timerState.currentMode);
  const chips = presetChipsGroup.querySelectorAll('.preset-chip');

  chips.forEach(chip => {
    const mins = parseInt(chip.getAttribute('data-minutes'), 10);
    chip.classList.toggle('active', mins === activeDuration);
  });
}

// ==========================================================================
// Focus Task Management
// ==========================================================================

function loadTask() {
  const savedTask = localStorage.getItem('pomodoro_current_task');
  if (savedTask && taskInput) {
    taskInput.value = savedTask;
  }
  updateTaskBadge();
}

function updateTaskBadge() {
  if (!taskCountBadge) return;
  const count = dailyProgress.completedTasksCount || 0;
  if (count > 0) {
    taskCountBadge.textContent = `${count} completed`;
    taskCountBadge.classList.remove('hidden');
  } else {
    taskCountBadge.classList.add('hidden');
  }
}

function completeActiveTask() {
  const currentText = taskInput.value.trim();
  if (!currentText) {
    showToast('Enter a task name first!');
    taskInput.focus();
    return;
  }

  dailyProgress.completedTasksCount = (dailyProgress.completedTasksCount || 0) + 1;
  saveDailyProgress();
  updateTaskBadge();

  // Celebration
  triggerConfetti(45);
  showToast(`Completed task: "${currentText}" 🎉`);

  taskInput.value = '';
  localStorage.removeItem('pomodoro_current_task');
  taskInput.placeholder = 'Great job! What will you focus on next?';
}

// ==========================================================================
// Ambient Audio Generator (Web Audio API)
// ==========================================================================

function initAmbientUI() {
  ambientVolumeSlider.value = appSettings.ambientVolume;

  ambientOptBtns.forEach(btn => {
    const type = btn.getAttribute('data-sound');
    btn.classList.toggle('active', type === appSettings.ambientSound);
    btn.addEventListener('click', () => {
      setAmbientSound(type);
    });
  });

  ambientVolumeSlider.addEventListener('input', (e) => {
    appSettings.ambientVolume = parseInt(e.target.value, 10);
    saveSettings();
    if (ambientAudio.gainNode && ambientAudio.ctx) {
      ambientAudio.gainNode.gain.setValueAtTime(appSettings.ambientVolume / 100, ambientAudio.ctx.currentTime);
    }
  });

  ambientToggleBtn.addEventListener('click', (e) => {
    e.stopPropagation();
    ambientPopover.classList.toggle('hidden');
  });

  document.addEventListener('click', (e) => {
    if (!ambientPopover.contains(e.target) && e.target !== ambientToggleBtn) {
      ambientPopover.classList.add('hidden');
    }
  });
}

function setAmbientSound(type) {
  appSettings.ambientSound = type;
  saveSettings();

  ambientOptBtns.forEach(btn => {
    btn.classList.toggle('active', btn.getAttribute('data-sound') === type);
  });

  ambientStatusText.textContent = type === 'off' ? 'Off' : type.charAt(0).toUpperCase() + type.slice(1);

  stopAmbientSound();

  if (type === 'off') {
    showToast('Ambient sound turned off.');
    return;
  }

  startAmbientSound(type);
  showToast(`Playing ambient ${type} sound 🎧`);
}

function startAmbientSound(type) {
  try {
    const AudioContextClass = window.AudioContext || window.webkitAudioContext;
    if (!AudioContextClass) return;

    if (!ambientAudio.ctx) {
      ambientAudio.ctx = new AudioContextClass();
    }
    const ctx = ambientAudio.ctx;
    if (ctx.state === 'suspended') {
      ctx.resume();
    }

    // Master volume gain
    ambientAudio.gainNode = ctx.createGain();
    ambientAudio.gainNode.gain.setValueAtTime(appSettings.ambientVolume / 100, ctx.currentTime);
    ambientAudio.gainNode.connect(ctx.destination);

    // Generate 5-second noise buffer
    const bufferSize = ctx.sampleRate * 5;
    const noiseBuffer = ctx.createBuffer(1, bufferSize, ctx.sampleRate);
    const output = noiseBuffer.getChannelData(0);

    let lastOut = 0.0;
    for (let i = 0; i < bufferSize; i++) {
      const white = Math.random() * 2 - 1;
      if (type === 'waves' || type === 'breeze') {
        // Brown noise
        output[i] = (lastOut + (0.02 * white)) / 1.02;
        lastOut = output[i];
        output[i] *= 3.5;
      } else {
        // Pinkish / rain noise
        output[i] = (lastOut * 0.95) + (white * 0.05);
        lastOut = output[i];
        output[i] *= 2.5;
      }
    }

    const whiteNoise = ctx.createBufferSource();
    whiteNoise.buffer = noiseBuffer;
    whiteNoise.loop = true;

    // Filter
    ambientAudio.filterNode = ctx.createBiquadFilter();

    if (type === 'rain') {
      ambientAudio.filterNode.type = 'lowpass';
      ambientAudio.filterNode.frequency.setValueAtTime(800, ctx.currentTime);
    } else if (type === 'waves') {
      ambientAudio.filterNode.type = 'lowpass';
      ambientAudio.filterNode.frequency.setValueAtTime(500, ctx.currentTime);

      // Periodic swell (LFO)
      const lfo = ctx.createOscillator();
      const lfoGain = ctx.createGain();
      lfo.frequency.setValueAtTime(0.12, ctx.currentTime);
      lfoGain.gain.setValueAtTime(0.4, ctx.currentTime);
      lfo.connect(lfoGain);
      lfoGain.connect(ambientAudio.gainNode.gain);
      lfo.start();
      ambientAudio.lfoNode = lfo;
    } else if (type === 'breeze') {
      ambientAudio.filterNode.type = 'bandpass';
      ambientAudio.filterNode.frequency.setValueAtTime(900, ctx.currentTime);
      ambientAudio.filterNode.Q.setValueAtTime(1.2, ctx.currentTime);
    } else {
      ambientAudio.filterNode.type = 'lowpass';
      ambientAudio.filterNode.frequency.setValueAtTime(1200, ctx.currentTime);
    }

    whiteNoise.connect(ambientAudio.filterNode);
    ambientAudio.filterNode.connect(ambientAudio.gainNode);
    whiteNoise.start();

    ambientAudio.sourceNode = whiteNoise;
    ambientAudio.currentType = type;
  } catch (e) {
    console.warn('Ambient sound error:', e);
  }
}

function stopAmbientSound() {
  if (ambientAudio.sourceNode) {
    try {
      ambientAudio.sourceNode.stop();
      ambientAudio.sourceNode.disconnect();
    } catch (e) {}
    ambientAudio.sourceNode = null;
  }
  if (ambientAudio.lfoNode) {
    try {
      ambientAudio.lfoNode.stop();
      ambientAudio.lfoNode.disconnect();
    } catch (e) {}
    ambientAudio.lfoNode = null;
  }
}

// ==========================================================================
// Zen Focus Mode
// ==========================================================================

function toggleZenMode() {
  const isZen = document.body.classList.toggle('zen-mode');
  if (isZen) {
    zenIconExpand.classList.add('hidden');
    zenIconCompress.classList.remove('hidden');
    showToast('Zen mode enabled. Press F or Esc to exit.');
  } else {
    zenIconExpand.classList.remove('hidden');
    zenIconCompress.classList.add('hidden');
    showToast('Exited Zen mode.');
  }
}

// ==========================================================================
// Confetti Animation Engine
// ==========================================================================

function triggerConfetti(count = 60) {
  if (!confettiCanvas) return;

  const ctx = confettiCanvas.getContext('2d');
  const width = (confettiCanvas.width = window.innerWidth);
  const height = (confettiCanvas.height = window.innerHeight);

  const colors = ['#E76F51', '#2A9D8F', '#E9C46A', '#F4A261', '#4EA8DE', '#8338EC'];
  const particles = [];

  for (let i = 0; i < count; i++) {
    particles.push({
      x: width * 0.5 + (Math.random() * 200 - 100),
      y: height * 0.45,
      size: Math.random() * 7 + 4,
      color: colors[Math.floor(Math.random() * colors.length)],
      vx: (Math.random() - 0.5) * 12,
      vy: Math.random() * -10 - 4,
      gravity: 0.35,
      rotation: Math.random() * 360,
      vRotation: (Math.random() - 0.5) * 8,
      opacity: 1
    });
  }

  let animationFrameId;

  function render() {
    ctx.clearRect(0, 0, width, height);

    let activeParticles = 0;

    particles.forEach(p => {
      p.x += p.vx;
      p.y += p.vy;
      p.vy += p.gravity;
      p.rotation += p.vRotation;
      p.opacity -= 0.012;

      if (p.opacity > 0) {
        activeParticles++;
        ctx.save();
        ctx.translate(p.x, p.y);
        ctx.rotate((p.rotation * Math.PI) / 180);
        ctx.globalAlpha = Math.max(0, p.opacity);
        ctx.fillStyle = p.color;
        ctx.fillRect(-p.size / 2, -p.size / 2, p.size, p.size * 0.6);
        ctx.restore();
      }
    });

    if (activeParticles > 0) {
      animationFrameId = requestAnimationFrame(render);
    } else {
      ctx.clearRect(0, 0, width, height);
      cancelAnimationFrame(animationFrameId);
    }
  }

  render();
}

// ==========================================================================
// Display & UI Updates
// ==========================================================================

function updateTimerDisplay() {
  const minutes = Math.floor(timerState.remainingSeconds / 60);
  const seconds = timerState.remainingSeconds % 60;
  const formatted = `${String(minutes).padStart(2, '0')}:${String(seconds).padStart(2, '0')}`;

  timeDisplay.textContent = formatted;
  document.title = `${formatted} — ${MODE_CONFIG[timerState.currentMode].name} | Pomodoro`;
}

function updateProgressRing() {
  if (!progressCircle) return;

  const total = timerState.totalSeconds;
  const remaining = timerState.remainingSeconds;
  const fraction = total > 0 ? remaining / total : 0;
  const offset = RING_CIRCUMFERENCE * (1 - fraction);

  progressCircle.style.strokeDashoffset = `${offset}`;
}

function updateControlsState(isRunning) {
  if (isRunning) {
    playIcon.classList.add('hidden');
    pauseIcon.classList.remove('hidden');
    startPauseLabel.textContent = 'Pause';
    startPauseBtn.setAttribute('aria-label', 'Pause timer (Space)');
  } else {
    playIcon.classList.remove('hidden');
    pauseIcon.classList.add('hidden');
    startPauseLabel.textContent = 'Start';
    startPauseBtn.setAttribute('aria-label', 'Start timer (Space)');
  }
}

function updateCycleProgressDisplay() {
  const dots = cycleDotsContainer.querySelectorAll('.dot');
  const count = timerState.cycleCount;

  dots.forEach((dot, index) => {
    dot.classList.toggle('completed', index < count);
  });

  cycleSummaryText.textContent = `${count} of 4 focus sessions completed.`;
}

function updateStatistics() {
  checkDateRollover();

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

  const completed = dailyProgress.completedSessions;
  statSessionsCount.textContent = completed;

  const target = Math.max(1, appSettings.dailyGoal);
  const percent = Math.min(100, Math.round((completed / target) * 100));
  statGoalProgress.textContent = `${percent}%`;

  goalCountDisplay.textContent = `${completed} / ${target} sessions`;
  goalProgressBar.style.width = `${percent}%`;
  goalProgressBarContainer.setAttribute('aria-valuenow', percent);

  if (completed >= target) {
    goalMotivationalText.textContent = "Congratulations! You've reached today's goal.";
  } else {
    const remaining = target - completed;
    goalMotivationalText.textContent = `${remaining} more session${remaining > 1 ? 's' : ''} to reach your goal.`;
  }

  updateTaskBadge();
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
    console.error('Error loading settings', e);
  }
}

function saveSettings() {
  try {
    localStorage.setItem('pomodoro_settings', JSON.stringify(appSettings));
  } catch (e) {
    console.error('Error saving settings', e);
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
  renderPresetChips();

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
    dailyProgress.completedTasksCount = 0;
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
// Notification Chime Sound (Web Audio API)
// ==========================================================================

function playNotificationSound() {
  if (!appSettings.soundEnabled) return;

  try {
    const AudioContextClass = window.AudioContext || window.webkitAudioContext;
    if (!AudioContextClass) return;

    const ctx = new AudioContextClass();
    const frequencies = [523.25, 659.25, 783.99];

    frequencies.forEach((freq, index) => {
      const osc = ctx.createOscillator();
      const gain = ctx.createGain();

      osc.type = 'sine';
      osc.frequency.setValueAtTime(freq, ctx.currentTime);

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
    console.warn('Audio chime error:', e);
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

function showToast(message, duration = 3800) {
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

  // Focus Task input & completion
  if (taskInput) {
    taskInput.addEventListener('input', (e) => {
      localStorage.setItem('pomodoro_current_task', e.target.value);
    });
    taskInput.addEventListener('keydown', (e) => {
      if (e.key === 'Enter') {
        completeActiveTask();
      }
    });
  }

  if (taskDoneBtn) {
    taskDoneBtn.addEventListener('click', completeActiveTask);
  }

  // Cycle Dots
  const dots = cycleDotsContainer.querySelectorAll('.dot');
  dots.forEach(dot => {
    dot.addEventListener('click', () => {
      const index = parseInt(dot.getAttribute('data-index'), 10);
      timerState.cycleCount = (timerState.cycleCount === index + 1) ? index : index + 1;
      updateCycleProgressDisplay();
      showToast(`Cycle progress set to ${timerState.cycleCount} of 4.`);
    });
  });

  // Reset Cycle Button
  if (resetCycleBtn) {
    resetCycleBtn.addEventListener('click', () => {
      timerState.cycleCount = 0;
      updateCycleProgressDisplay();
      showToast('Cycle reset to 0 of 4.');
    });
  }

  // Daily Goal manual increment / decrement
  if (manualIncrementSessionBtn) {
    manualIncrementSessionBtn.addEventListener('click', () => {
      dailyProgress.completedSessions += 1;
      dailyProgress.totalFocusSeconds += (appSettings.focusDuration * 60);
      saveDailyProgress();
      updateStatistics();
      showToast('+1 focus session logged.');
    });
  }

  if (manualDecrementSessionBtn) {
    manualDecrementSessionBtn.addEventListener('click', () => {
      if (dailyProgress.completedSessions > 0) {
        dailyProgress.completedSessions -= 1;
        dailyProgress.totalFocusSeconds = Math.max(0, dailyProgress.totalFocusSeconds - (appSettings.focusDuration * 60));
        saveDailyProgress();
        updateStatistics();
        showToast('-1 focus session removed.');
      }
    });
  }

  // Header Buttons
  themeToggleBtn.addEventListener('click', toggleTheme);
  soundToggleBtn.addEventListener('click', toggleSound);
  zenToggleBtn.addEventListener('click', toggleZenMode);
  settingsBtn.addEventListener('click', openSettingsModal);

  // Shortcuts Guide
  shortcutsBtn.addEventListener('click', () => {
    shortcutsModal.classList.remove('hidden');
  });
  closeShortcutsBtn.addEventListener('click', () => {
    shortcutsModal.classList.add('hidden');
  });
  shortcutsModal.addEventListener('click', (e) => {
    if (e.target === shortcutsModal) {
      shortcutsModal.classList.add('hidden');
    }
  });

  // Settings Presets buttons
  techniquePresetBtns.forEach(btn => {
    btn.addEventListener('click', () => {
      const focus = btn.getAttribute('data-focus');
      const short = btn.getAttribute('data-short');
      const long = btn.getAttribute('data-long');

      focusDurationInput.value = focus;
      shortBreakInput.value = short;
      longBreakInput.value = long;

      showToast(`Preset loaded: ${focus}m Focus, ${short}m Short Break, ${long}m Long Break`);
    });
  });

  // Test Sound Button in Settings
  if (testSoundBtn) {
    testSoundBtn.addEventListener('click', () => {
      playNotificationSound();
      showToast('Playing preview notification chime 🔔');
    });
  }

  // Modal Controls
  closeSettingsBtn.addEventListener('click', closeSettingsModal);
  cancelSettingsBtn.addEventListener('click', closeSettingsModal);
  settingsForm.addEventListener('submit', handleSaveSettings);

  settingsModal.addEventListener('click', (e) => {
    if (e.target === settingsModal) {
      closeSettingsModal();
    }
  });

  // Keyboard navigation
  document.addEventListener('keydown', (e) => {
    // If modal is open, Escape closes it
    if (e.key === 'Escape') {
      if (!settingsModal.classList.contains('hidden')) {
        closeSettingsModal();
        return;
      }
      if (!shortcutsModal.classList.contains('hidden')) {
        shortcutsModal.classList.add('hidden');
        return;
      }
      if (document.body.classList.contains('zen-mode')) {
        toggleZenMode();
        return;
      }
    }

    // Ignore single key shortcuts when typing in inputs
    if (['INPUT', 'SELECT', 'TEXTAREA'].includes(document.activeElement.tagName)) {
      return;
    }

    if (e.code === 'Space') {
      e.preventDefault();
      if (timerState.isRunning) {
        pauseTimer();
      } else {
        startTimer();
      }
    } else if (e.key.toLowerCase() === 'r') {
      resetTimer(true);
    } else if (e.key.toLowerCase() === 's') {
      skipSession();
    } else if (e.key.toLowerCase() === 'f') {
      toggleZenMode();
    } else if (e.key.toLowerCase() === 'm') {
      toggleSound();
    } else if (e.key === '?') {
      shortcutsModal.classList.toggle('hidden');
    }
  });

  // Visibility change sync
  document.addEventListener('visibilitychange', () => {
    if (!document.hidden && timerState.isRunning) {
      tick();
    }
  });
}
