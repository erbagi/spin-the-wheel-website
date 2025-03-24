let soundEnabled = true;
const spinSound = new Audio();
const winSound = new Audio();
const clickSound = new Audio();

// Preload sounds
function preloadSounds() {
  spinSound.src = "https://assets.mixkit.co/active_storage/sfx/212/212-preview.mp3";
  winSound.src = "https://assets.mixkit.co/active_storage/sfx/270/270-preview.mp3";
  clickSound.src = "https://assets.mixkit.co/active_storage/sfx/270/270-preview.mp3";
  
  // Lower volume
  spinSound.volume = 0.5;
  winSound.volume = 0.7;
  clickSound.volume = 0.3;
}

function toggleSound() {
  soundEnabled = !soundEnabled;
  document.getElementById('soundIcon').textContent = soundEnabled ? '🔊' : '🔇';
  
  // Update ARIA label for accessibility
  document.getElementById('soundControl').setAttribute('aria-label', 
    soundEnabled ? 'Disable audio' : 'Enable audio');
}

function playSound(sound) {
  if (soundEnabled) {
    sound.currentTime = 0;
    sound.play().catch(e => console.log("Audio play failed:", e));
  }
}

// Helper functions
function randomColor() {
  // Generate more visually pleasing colors with better contrast
  const hue = Math.floor(Math.random() * 360);
  const saturation = Math.floor(Math.random() * 30) + 70; // 70-100%
  const lightness = Math.floor(Math.random() * 20) + 50; // 50-70%
  
  // Convert HSL to RGB
  function hslToRgb(h, s, l) {
    h /= 360;
    s /= 100;
    l /= 100;
    let r, g, b;
    
    if (s === 0) {
      r = g = b = l; // achromatic
    } else {
      const hue2rgb = (p, q, t) => {
        if (t < 0) t += 1;
        if (t > 1) t -= 1;
        if (t < 1/6) return p + (q - p) * 6 * t;
        if (t < 1/2) return q;
        if (t < 2/3) return p + (q - p) * (2/3 - t) * 6;
        return p;
      };
      
      const q = l < 0.5 ? l * (1 + s) : l + s - l * s;
      const p = 2 * l - q;
      r = hue2rgb(p, q, h + 1/3);
      g = hue2rgb(p, q, h);
      b = hue2rgb(p, q, h - 1/3);
    }
    
    return {
      r: Math.round(r * 255),
      g: Math.round(g * 255),
      b: Math.round(b * 255)
    };
  }
  
  return hslToRgb(hue, saturation, lightness);
}

function toRad(deg) {
  return deg * (Math.PI / 180);
}

function randomRange(min, max) {
  return Math.floor(Math.random() * (max - min + 1)) + min;
}

// Easing functions
function easeOutCubic(t) {
  return 1 - Math.pow(1 - t, 3);
}

function easeInOutQuad(t) {
  return t < 0.5 ? 2 * t * t : -1 + (4 - 2 * t) * t;
}

// Canvas and drawing variables
const canvas = document.getElementById("canvas");
const ctx = canvas.getContext("2d");
const width = canvas.width;
const height = canvas.height;
const centerX = width / 2;
const centerY = height / 2;
const radius = width / 2;

let items = document.getElementById("namesInput").value.split("\n").filter(item => item.trim() !== "");
let currentDeg = 0;
let step = 360 / items.length;
let colors = [];
let itemDegs = {};

// Generate initial colors
for (let i = 0; i < items.length; i++) {
  colors.push(randomColor());
}

// Update item count display
function updateItemCount() {
  const count = document.getElementById("namesInput").value.split("\n").filter(item => item.trim() !== "").length;
  document.getElementById("namesCount").textContent = count + (count === 1 ? " item" : " items");
}

// Create wheel from textarea input
function createWheel() {
  items = document.getElementById("namesInput").value.split("\n").filter(item => item.trim() !== "");
  
  step = items.length > 0 ? 360 / items.length : 360;
  
  if (colors.length !== items.length) {
    colors = [];
    for (let i = 0; i < items.length; i++) {
      colors.push(randomColor());
    }
  }
  
  updateItemCount();
  draw();
}

// Draw the wheel
function draw() {
  ctx.clearRect(0, 0, width, height);
  
  // Draw wheel background
  ctx.beginPath();
  ctx.arc(centerX, centerY, radius, 0, Math.PI * 2);
  ctx.fillStyle = "#333";
  ctx.fill();
  
  // Draw segments
  let startDeg = currentDeg;
  itemDegs = {};
  
  for (let i = 0; i < items.length; i++, startDeg += step) {
    let endDeg = startDeg + step;
    let color = colors[i];
    
    // Draw outer segment (darker)
    ctx.beginPath();
    ctx.moveTo(centerX, centerY);
    ctx.arc(centerX, centerY, radius - 2, toRad(startDeg), toRad(endDeg));
    ctx.closePath();
    ctx.fillStyle = `rgb(${Math.max(color.r - 30, 0)}, ${Math.max(color.g - 30, 0)}, ${Math.max(color.b - 30, 0)})`;
    ctx.fill();
    
    // Draw inner segment (brighter)
    ctx.beginPath();
    ctx.moveTo(centerX, centerY);
    ctx.arc(centerX, centerY, radius - 30, toRad(startDeg), toRad(endDeg));
    ctx.closePath();
    ctx.fillStyle = `rgb(${color.r}, ${color.g}, ${color.b})`;
    ctx.fill();
    
    // Draw text
    ctx.save();
    ctx.translate(centerX, centerY);
    ctx.rotate(toRad((startDeg + endDeg) / 2));
    ctx.textAlign = "center";
    ctx.fillStyle = (color.r + color.g + color.b > 550) ? "#000" : "#fff";
    ctx.font = 'bold 24px Montserrat';
    
    // Adjust text size based on length
    let textLength = items[i].length;
    if (textLength > 10) {
      ctx.font = 'bold 20px Montserrat';
    }
    if (textLength > 15) {
      ctx.font = 'bold 16px Montserrat';
    }
    
    ctx.fillText(items[i], 130, 10);
    ctx.restore();
    
    // Store segment degrees for winner detection
    itemDegs[items[i]] = { startDeg: startDeg, endDeg: endDeg };
  }
}

// Determine winner based on pointer position
function updateWinner() {
  // Fixed pointer angle at 0° (right side)
  const pointerAngle = 0;
  let winner = null;
  
  for (let i = 0; i < items.length; i++) {
    let startDeg = (itemDegs[items[i]].startDeg % 360 + 360) % 360;
    let endDeg = (itemDegs[items[i]].endDeg % 360 + 360) % 360;
    
    if (startDeg > endDeg) {
      if (pointerAngle >= startDeg || pointerAngle < endDeg) {
        winner = items[i];
        break;
      }
    } else {
      if (pointerAngle >= startDeg && pointerAngle < endDeg) {
        winner = items[i];
        break;
      }
    }
  }
  
  return winner;
}

// Show result popup
function showResultPopup(result) {
  const popup = document.getElementById("resultPopup");
  const resultText = document.getElementById("resultText");
  
  // Clear any existing confetti
  const existingConfetti = document.querySelectorAll('.confetti');
  existingConfetti.forEach(c => c.remove());
  
  // Set result text
  resultText.textContent = result ? `Winner: ${result}` : "No winner!";
  
  // Show popup with animation
  popup.classList.add("show");
  
  // Create confetti effect
  if (result) {
    createConfetti();
  }
  
  // Hide popup after delay
  setTimeout(() => {
    popup.classList.remove("show");
    
    // Remove confetti after additional delay
    setTimeout(() => { 
      const confetti = document.querySelectorAll('.confetti');
      confetti.forEach(c => c.remove());
    }, 2000);
  }, 3000);
}

// Create confetti effect
function createConfetti() {
  const container = document.querySelector('.result-container');
  const colors = ['#f44336', '#e91e63', '#9c27b0', '#673ab7', '#3f51b5', '#2196f3', '#03a9f4', '#00bcd4', '#009688', '#4CAF50', '#8BC34A', '#CDDC39', '#FFEB3B', '#FFC107', '#FF9800', '#FF5722'];
  
  for (let i = 0; i < 100; i++) {
    const confetti = document.createElement('div');
    confetti.className = 'confetti';
    
    const color = colors[Math.floor(Math.random() * colors.length)];
    const size = Math.random() * 10 + 5;
    const left = Math.random() * 100;
    
    confetti.style.cssText = `
      position: absolute;
      width: ${size}px;
      height: ${size}px;
      background-color: ${color};
      top: -20px;
      left: ${left}%;
      opacity: 1;
      border-radius: ${Math.random() > 0.5 ? '50%' : '0'};
      animation: confetti-fall ${Math.random() * 3 + 2}s linear forwards;
      animation-delay: ${Math.random() * 2}s;
    `;
    
    container.appendChild(confetti);
  }
}

// Spin variables
let speed = 0;
let maxRotation = 0;
let startTime = 0;
let duration = 6000;
let spinning = false;
let selectedDuration = 'medium';

// Select spin duration
function selectDuration(durationType) {
  document.querySelectorAll('.option-button').forEach(button => {
    button.classList.remove('active');
    button.setAttribute('aria-pressed', 'false');
  });
  
  let button = document.querySelector(`button[onclick="selectDuration('${durationType}')"]`);
  if (button) {
    button.classList.add('active');
    button.setAttribute('aria-pressed', 'true');
  }
  
  selectedDuration = durationType;
  
  switch (durationType) {
    case 'slow': duration = 10000; break;
    case 'medium': duration = 6000; break;
    case 'fast': duration = 3000; break;
  }
}

// Animation function
function animate(timestamp) {
  if (!spinning) return;
  
  if (!startTime) startTime = timestamp;
  let progress = (timestamp - startTime) / duration;
  
  if (progress >= 1) {
    progress = 1;
    spinning = false;
    speed = 0;
    
    // Determine winner
    let winner = updateWinner();
    
    // Play win sound
    playSound(winSound);
    
    // Show result
    showResultPopup(winner);
    
    // Check if elimination mode is enabled
    if (document.getElementById("eliminateWinner").checked && winner) {
      eliminateWinner(winner);
    }
  }
  
  // Apply easing function for more realistic deceleration
  let currentEasing = easeOutCubic;
  let easedProgress = currentEasing(progress);
  currentDeg = startDeg + easedProgress * maxRotation;
  
  draw();
  
  if (spinning) {
    window.requestAnimationFrame(animate);
  }
}

// Variables to track eliminated items
let eliminatedItems = [];
let originalItems = [];
let originalColors = [];

// Eliminate winner function
function eliminateWinner(winner) {
  let index = items.indexOf(winner);
  
  if (index !== -1) {
    // Store the original items and colors if this is the first elimination
    if (eliminatedItems.length === 0) {
      originalItems = [...items];
      originalColors = [...colors];
    }
    
    // Add the winner to eliminated items
    eliminatedItems.push(winner);
    
    // Remove the winner from items and colors arrays (only from wheel, not from textarea)
    items.splice(index, 1);
    colors.splice(index, 1);
    
    // Do NOT update textarea - keep the names in the list
    // document.getElementById("namesInput").value = items.join('\n');
    updateItemCount();
    
    // Show reset button when items are eliminated
    toggleResetButton(true);
    
    // Recalculate step
    step = items.length > 0 ? 360 / items.length : 360;
    
    // Update wheel with animation
    let startDeg = currentDeg;
    itemDegs = {};
    
    for (let i = 0; i < items.length; i++) {
      let segmentStart = startDeg + i * step;
      itemDegs[items[i]] = { startDeg: segmentStart, endDeg: segmentStart + step };
    }
    
    // Animate the wheel update
    let updateStart = 0;
    function updateWheel(timestamp) {
      if (!updateStart) updateStart = timestamp;
      let progress = (timestamp - updateStart) / 800;
      
      if (progress >= 1) { 
        draw(); 
        return; 
      }
      
      draw();
      window.requestAnimationFrame(updateWheel);
    }
    
    window.requestAnimationFrame(updateWheel);
  }
}

// Reset eliminated items function
function resetEliminatedItems() {
  if (eliminatedItems.length > 0) {
    // Restore original items and colors
    items = [...originalItems];
    colors = [...originalColors];
    
    // Clear eliminated items
    eliminatedItems = [];
    
    // Recalculate step
    step = items.length > 0 ? 360 / items.length : 360;
    
    // Update wheel
    draw();
    
    // Hide reset button
    toggleResetButton(false);
    
    // Show success message
    showResultPopup("Names restored!");
  }
}

// Show notification function
function showNotification(message) {
  showResultPopup(message);
}

// Toggle elimination mode
function toggleEliminationMode(enabled) {
  // Show reset button only if there are eliminated items
  if (enabled) {
    // Show reset button if there are eliminated items
    toggleResetButton(eliminatedItems.length > 0);
  } else {
    // Hide reset button when elimination mode is disabled
    toggleResetButton(false);
    
    // If there are eliminated items and elimination mode is turned off, ask if user wants to reset
    if (eliminatedItems.length > 0) {
      if (confirm("Do you want to restore all eliminated names to the wheel?")) {
        resetEliminatedItems();
      }
    }
  }
}

// Toggle reset button visibility
function toggleResetButton(show) {
  const resetButton = document.getElementById("resetButton");
  if (resetButton) {
    resetButton.style.display = show ? "inline-block" : "none";
  }
}

// Spin function
let startDeg = 0;
function spin() {
  if (spinning || items.length === 0) return;
  
  // Play click sound
  playSound(clickSound);
  
  // Set starting position
  startDeg = currentDeg;
  
  // Calculate target position
  let targetIndex = Math.floor(Math.random() * items.length);
  let targetStartDeg = itemDegs[items[targetIndex]].startDeg % 360;
  
  // Calculate number of rotations based on duration
  let additionalRotations = randomRange(3, 6);
  if (selectedDuration === 'slow') additionalRotations = randomRange(5, 8);
  if (selectedDuration === 'fast') additionalRotations = randomRange(1, 3);
  
  // Calculate total rotation
  maxRotation = (additionalRotations * 360) + (360 - targetStartDeg) + randomRange(-step / 2, step / 2);
  
  // Start spinning
  spinning = true;
  startTime = 0;
  
  // Play spin sound
  playSound(spinSound);
  
  // Start animation
  window.requestAnimationFrame(animate);
}

// Toggle FAQ items
function toggleFAQ(item) {
  item.classList.toggle('active');
}

// Keyboard accessibility
document.addEventListener('keydown', (e) => {
  if (e.key === 'Enter' || e.key === ' ') {
    if (document.activeElement === document.querySelector('.center-circle') || 
        document.activeElement === document.querySelector('.sound-control')) {
      e.preventDefault();
      document.activeElement.click();
    }
  }
});

// Initialize
document.addEventListener('DOMContentLoaded', () => {
  preloadSounds();
  selectDuration('medium');
  createWheel();
  updateItemCount();
});
