// Simple screen switcher
const enterBtn = document.getElementById("enterBtn");
const logout = document.getElementById("logout");
const unlockBtn = document.getElementById("unlockBtn");
const paywall = document.getElementById("paywall");
const verifyBtn = document.getElementById("verifyPassword");
const closePaywall = document.getElementById("closePaywall");
const passwordMessage = document.getElementById("passwordMessage");
const toolArea = document.getElementById("toolArea");
const businessName = document.getElementById("businessName");
const greeting = document.getElementById("greeting");
let unlocked = false;

// Enter dashboard
enterBtn.addEventListener("click", () => {
  document.getElementById("welcome").classList.add("hidden");
  document.getElementById("dashboard").classList.remove("hidden");
  greeting.textContent = `👋 Welcome, ${businessName.value || "User"}!`;
});

// Logout
logout.addEventListener("click", () => location.reload());

// Unlock popup
unlockBtn.addEventListener("click", () => {
  document.getElementById("deviceId").textContent = generateDeviceId();
  paywall.classList.remove("hidden");
});
closePaywall.addEventListener("click", () => paywall.classList.add("hidden"));

// Verify code
verifyBtn.addEventListener("click", () => {
  const code = document.getElementById("accessPassword").value.trim();
  if (code === "DATA1000") {
    unlocked = true;
    paywall.classList.add("hidden");
    alert("✅ Access granted — enjoy Pro mode!");
  } else {
    passwordMessage.textContent = "❌ Invalid code, please try again.";
  }
});

// Generate simple device ID
function generateDeviceId() {
  return Math.random().toString(36).substring(2, 8).toUpperCase();
}

// Tool switching
document.querySelectorAll(".tool").forEach(btn => {
  btn.addEventListener("click", async () => {
    const mod = btn.dataset.mod;
    const res = await fetch(`modules/${mod}.html`);
    const html = await res.text();
    toolArea.innerHTML = html;

    // Intercept export/download actions
    interceptExportButtons(toolArea);
  });
});

function interceptExportButtons(area) {
  const exportBtns = area.querySelectorAll("button, a");
  exportBtns.forEach(b => {
    if (b.textContent.match(/download|export|pdf|invoice|report/i)) {
      b.addEventListener("click", e => {
        if (!unlocked) {
          e.preventDefault();
          paywall.classList.remove("hidden");
        }
      });
    }
  });
}
