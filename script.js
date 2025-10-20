// ================================
// Data Entry Pro Suite - script.js
// ================================

// Selectors
const welcomeScreen = document.getElementById("welcome-screen");
const dashboardScreen = document.getElementById("dashboard-screen");
const enterAppBtn = document.getElementById("enterApp");
const businessNameInput = document.getElementById("businessName");
const greeting = document.getElementById("greeting");
const logoutBtn = document.getElementById("logoutBtn");
const cards = document.querySelectorAll(".card");
const moduleView = document.getElementById("module-view");

// ============ APP STARTUP ============

// Load saved business name from localStorage
window.addEventListener("DOMContentLoaded", () => {
  const savedName = localStorage.getItem("businessName");
  if (savedName) {
    showDashboard(savedName);
  } else {
    showWelcome();
  }
});

// ============ FUNCTIONS ============

// Show Welcome Screen
function showWelcome() {
  welcomeScreen.classList.add("active");
  dashboardScreen.classList.add("hidden");
  moduleView.classList.add("hidden");
}

// Show Dashboard
function showDashboard(name) {
  greeting.textContent = `👋 Welcome, ${name}!`;
  welcomeScreen.classList.remove("active");
  welcomeScreen.classList.add("hidden");
  dashboardScreen.classList.remove("hidden");
  moduleView.classList.add("hidden");
}

// ============ EVENT LISTENERS ============

// Enter Dashboard Button
enterAppBtn.addEventListener("click", () => {
  const name = businessNameInput.value.trim();
  if (name !== "") {
    localStorage.setItem("businessName", name);
    showDashboard(name);
  } else {
    alert("Please enter your name or business name first.");
  }
});

// Logout
logoutBtn.addEventListener("click", () => {
  localStorage.removeItem("businessName");
  showWelcome();
});

// Card Click → Load Module
cards.forEach((card) => {
  card.addEventListener("click", () => {
    const module = card.getAttribute("data-module");
    loadModule(module);
  });
});

// Load module file dynamically
function loadModule(filename) {
  fetch(`modules/${filename}`)
    .then((res) => res.text())
    .then((html) => {
      moduleView.innerHTML = html;
      moduleView.classList.remove("hidden");
      initModuleLogic(); // Enable save/export buttons after loading
    })
    .catch((err) => console.error("Error loading module:", err));
}

// ============ MODULE LOGIC ============

function initModuleLogic() {
  const saveBtn = document.getElementById("saveBtn");
  const exportCSVBtn = document.getElementById("exportCSV");
  const exportPDFBtn = document.getElementById("exportPDF");
  const table = document.querySelector("table");

  if (!table) return;

  // Save to LocalStorage
  if (saveBtn) {
    saveBtn.addEventListener("click", () => {
      const rows = Array.from(table.querySelectorAll("tr")).map((row) =>
        Array.from(row.querySelectorAll("td,th")).map((cell) => cell.innerText)
      );
      localStorage.setItem("data_" + table.id, JSON.stringify(rows));
      alert("Data saved successfully!");
    });
  }

  // Export as CSV
  if (exportCSVBtn) {
    exportCSVBtn.addEventListener("click", () => {
      const csv = tableToCSV(table);
      const blob = new Blob([csv], { type: "text/csv" });
      const url = URL.createObjectURL(blob);
      const a = document.createElement("a");
      a.href = url;
      a.download = `${table.id}.csv`;
      document.body.appendChild(a);
      a.click();
      document.body.removeChild(a);
    });
  }

  // Export as PDF (simple print)
  if (exportPDFBtn) {
    exportPDFBtn.addEventListener("click", () => {
      window.print();
    });
  }
}

// Helper: Convert Table → CSV
function tableToCSV(table) {
  const rows = Array.from(table.querySelectorAll("tr"));
  return rows
    .map((row) =>
      Array.from(row.querySelectorAll("td,th"))
        .map((cell) => `"${cell.innerText}"`)
        .join(",")
    )
    .join("\n");
}
