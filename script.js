let records = JSON.parse(localStorage.getItem("dataEntryRecords")) || [];

function addRecord() {
  const date = document.getElementById("date").value;
  const project = document.getElementById("project").value.trim();
  const recordsEntered = parseInt(document.getElementById("records").value);
  const errors = parseInt(document.getElementById("errors").value);

  if (!date || !project || isNaN(recordsEntered) || isNaN(errors)) {
    alert("Please fill all fields!");
    return;
  }

  const accuracy = ((recordsEntered - errors) / recordsEntered * 100).toFixed(1);
  const newRecord = { date, project, recordsEntered, errors, accuracy };

  records.push(newRecord);
  localStorage.setItem("dataEntryRecords", JSON.stringify(records));

  renderTable();
  updateSummary();
  updateChart();

  document.querySelectorAll("input").forEach(i => i.value = "");
}

function renderTable() {
  const tableBody = document.getElementById("tableBody");
  tableBody.innerHTML = "";

  records.forEach((r, i) => {
    tableBody.innerHTML += `
      <tr class="border-t">
        <td class="p-2">${r.date}</td>
        <td>${r.project}</td>
        <td>${r.recordsEntered}</td>
        <td>${r.errors}</td>
        <td>${r.accuracy}%</td>
        <td><button onclick="deleteRecord(${i})" class="text-red-600 hover:underline">Delete</button></td>
      </tr>`;
  });
}

function deleteRecord(index) {
  if (confirm("Delete this record?")) {
    records.splice(index, 1);
    localStorage.setItem("dataEntryRecords", JSON.stringify(records));
    renderTable();
    updateSummary();
    updateChart();
  }
}

function updateSummary() {
  const totalRecords = records.reduce((sum, r) => sum + r.recordsEntered, 0);
  const totalErrors = records.reduce((sum, r) => sum + r.errors, 0);
  const avgAccuracy = records.length
    ? (records.reduce((sum, r) => sum + parseFloat(r.accuracy), 0) / records.length).toFixed(1)
    : 0;

  document.getElementById("totalRecords").innerText = totalRecords;
  document.getElementById("totalErrors").innerText = totalErrors;
  document.getElementById("avgAccuracy").innerText = avgAccuracy + "%";
  document.getElementById("totalDays").innerText = records.length;
}

function exportCSV() {
  if (records.length === 0) return alert("No data to export!");
  const header = "Date,Project,Records Entered,Errors,Accuracy (%)\n";
  const csv = header + records.map(r => `${r.date},${r.project},${r.recordsEntered},${r.errors},${r.accuracy}`).join("\n");

  const blob = new Blob([csv], { type: "text/csv" });
  const link = document.createElement("a");
  link.href = URL.createObjectURL(blob);
  link.download = "data_entry_records.csv";
  link.click();
}

function resetData() {
  if (confirm("This will erase all data. Continue?")) {
    records = [];
    localStorage.removeItem("dataEntryRecords");
    renderTable();
    updateSummary();
    updateChart();
  }
}

let chart;
function updateChart() {
  const ctx = document.getElementById("accuracyChart");
  const labels = records.map(r => r.date);
  const data = records.map(r => r.accuracy);

  if (chart) chart.destroy();
  chart = new Chart(ctx, {
    type: "line",
    data: {
      labels: labels,
      datasets: [{
        label: "Accuracy (%)",
        data: data,
        borderColor: "#2563eb",
        backgroundColor: "#93c5fd",
        tension: 0.3,
        fill: true
      }]
    },
    options: { scales: { y: { beginAtZero: true, max: 100 } } }
  });
}

renderTable();
updateSummary();
updateChart();
