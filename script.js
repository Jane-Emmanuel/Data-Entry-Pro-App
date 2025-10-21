// ===============================
// DATA ENTRY PRO SUITE SCRIPT.JS
// ===============================

// Elements
const welcome = document.getElementById("welcome");
const dashboard = document.getElementById("dashboard");
const demoBtn = document.getElementById("demoBtn");
const enterBtn = document.getElementById("enterBtn");
const businessName = document.getElementById("businessName");
const greeting = document.getElementById("greeting");
const logout = document.getElementById("logout");
const unlockBtn = document.getElementById("unlockBtn");
const paywall = document.getElementById("paywall");
const verifyPassword = document.getElementById("verifyPassword");
const accessPassword = document.getElementById("accessPassword");
const passwordMessage = document.getElementById("passwordMessage");
const deviceIdDisplay = document.getElementById("deviceId");
const closePaywall = document.getElementById("closePaywall");
const demoDisplay = document.getElementById("demoDisplay");

const clickSound = document.getElementById("clickSound");
const chimeSound = document.getElementById("chimeSound");

// ===============================
// HELPER FUNCTIONS
// ===============================

// Play short click or chime
function playSound(type = "click") {
  const audio = type === "chime" ? chimeSound : clickSound;
  if (audio) {
    audio.currentTime = 0;
    audio.play().catch(() => {});
  }
}

// Show or hide elements
function show(el) {
  el.classList.remove("hidden");
}
function hide(el) {
  el.classList.add("hidden");
}

// Generate or load device ID
function getDeviceId() {
  let id = localStorage.getItem("deviceId");
  if (!id) {
    id = Math.random().toString(36).substring(2, 10).toUpperCase();
    localStorage.setItem("deviceId", id);
  }
  return id;
}

// Load current password
async function fetchCurrentPassword() {
  try {
    const res = await fetch("current_password.txt");
    return (await res.text()).trim();
  } catch {
    return "demo123"; // fallback
  }
}

// ===============================
// LOGIN / LOGOUT
// ===============================
enterBtn.addEventListener("click", () => {
  const name = businessName.value.trim();
  if (!name) {
    alert("Please enter your name or business name.");
    return;
  }
  localStorage.setItem("businessName", name);
  greeting.textContent = `👋 Welcome, ${name}!`;
  playSound("click");
  hide(welcome);
  show(dashboard);
});

logout.addEventListener("click", () => {
  playSound("click");
  localStorage.clear();
  show(welcome);
  hide(dashboard);
});

// Restore session
const savedName = localStorage.getItem("businessName");
if (savedName) {
  greeting.textContent = `👋 Welcome, ${savedName}!`;
  hide(welcome);
  show(dashboard);
}

// ===============================
// DEMO SWITCHER
// ===============================
const modules = [
  { id: "dataentry", title: "🗂️ Data Entry Tracker" },
  { id: "expenses", title: "💰 Expense Tracker" },
  { id: "inventory", title: "📦 Inventory Manager" },
  { id: "invoice", title: "🧾 Invoice Generator" },
  { id: "crm", title: "👥 Customer CRM" },
  { id: "kpi", title: "📈 KPI Dashboard" },
];

let demoRunning = false;
let demoTimer = null;

demoBtn.addEventListener("click", async () => {
  if (demoRunning) return;
  demoRunning = true;
  playSound("chime");
  show(demoDisplay);
  demoDisplay.innerHTML = `<p class="muted">🎬 Starting demo...</p>`;

  for (let i = 0; i < modules.length; i++) {
    const mod = modules[i];
    playSound("click");
    demoDisplay.innerHTML = `
      <div class="demo-card">
        <h3>${mod.title}</h3>
        <p class="muted small">Loading ${mod.id}.html...</p>
      </div>
    `;
    try {
      const html = await fetch(`modules/${mod.id}.html`).then((r) => r.text());
      demoDisplay.innerHTML = `<div class="demo-card">${html}</div>`;
      playSound("chime");
    } catch (e) {
      demoDisplay.innerHTML = `<div class="demo-card"><p>⚠️ Unable to load ${mod.id}.html</p></div>`;
    }
    await new Promise((r) => setTimeout(r, 45000)); // 45 seconds per module
  }

  demoDisplay.innerHTML = `
    <div class="demo-card center">
      <h3>✨ Demo Complete!</h3>
      <p class="muted">Ready to unlock full access?</p>
      <button id="demoUnlock" class="btn primary">Unlock Now</button>
    </div>
  `;
  playSound("chime");
  demoRunning = false;

  // Add listener for unlock button after demo
  document.getElementById("demoUnlock").addEventListener("click", () => {
    openPaywall();
  });
});

// ===============================
// PAYWALL & PASSWORD CHECK
// ===============================
function openPaywall() {
  playSound("click");
  show(paywall);
  deviceIdDisplay.textContent = getDeviceId();
}

function closePaywallBox() {
  playSound("click");
  hide(paywall);
}

unlockBtn.addEventListener("click", openPaywall);
closePaywall.addEventListener("click", closePaywallBox);

verifyPassword.addEventListener("click", async () => {
  const entered = accessPassword.value.trim();
  const real = await fetchCurrentPassword();
  if (entered === real) {
    localStorage.setItem("unlocked", "true");
    passwordMessage.textContent = "✅ Verified! Full access granted.";
    passwordMessage.style.color = "green";
    playSound("chime");
    setTimeout(() => {
      hide(paywall);
    }, 1200);
  } else {
    passwordMessage.textContent = "❌ Invalid password. Please check again.";
    passwordMessage.style.color = "red";
    playSound("click");
  }
});

// Auto-unlock if previously verified
if (localStorage.getItem("unlocked") === "true") {
  unlockBtn.textContent = "Unlocked ✅";
  unlockBtn.disabled = true;
}
