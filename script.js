// script.js - Data Entry Pro Suite (all modules)
// Keys used in localStorage
const K_DE = 'de_data';
const K_EXP = 'de_expenses';
const K_INV = 'de_inventory';
const K_INVOICE = 'de_invoice_items';
const K_CLIENTS = 'de_clients';
const K_KPI = 'de_kpi';

// --- Utilities ---
function formatNum(n){ return Number(n||0); }
function downloadFile(filename, content, type='text/csv'){
  const blob = new Blob([content], {type});
  const a = document.createElement('a');
  a.href = URL.createObjectURL(blob);
  a.download = filename;
  document.body.appendChild(a);
  a.click();
  a.remove();
}
function toCSV(rows){
  return rows.map(r => r.map(c => `"${String(c).replace(/"/g,'""')}"`).join(',')).join('\n');
}

// --- TABS UI init ---
document.querySelectorAll('.tab-btn').forEach(btn=>{
  btn.addEventListener('click', ()=> {
    document.querySelectorAll('.tab-btn').forEach(b=>b.classList.remove('active'));
    btn.classList.add('active');
    const tab = btn.dataset.tab;
    document.querySelectorAll('.tabPanel').forEach(p => p.classList.add('hidden'));
    document.getElementById(tab).classList.remove('hidden');
  });
});
// default first tab active
const firstBtn = document.querySelector('.tab-btn');
if(firstBtn){ firstBtn.click(); }

// Refresh button clears caches (simple)
document.getElementById('refreshCache').addEventListener('click', ()=> location.reload(true));

// -----------------------
// Module 1: DATA ENTRY
// -----------------------
let de = JSON.parse(localStorage.getItem(K_DE)) || [];
const deBody = document.getElementById('deBody');
const deChartCtx = document.getElementById('deChart').getContext('2d');
let deChart;

function renderDE(){
  deBody.innerHTML = '';
  let totalRecords = 0, totalErrors=0;
  const grouped = {};
  de.forEach((r,i)=>{
    const acc = r.records>0 ? (((r.records - r.errors)/r.records)*100).toFixed(1) : '0.0';
    totalRecords += r.records; totalErrors += r.errors;
    grouped[r.date] = (grouped[r.date]||0) + r.records;
    const tr = document.createElement('tr');
    tr.innerHTML = `<td>${r.date}</td><td>${r.project}</td><td>${r.records}</td><td>${r.errors}</td><td>${acc}</td><td><button onclick="deleteDE(${i})" class="text-red-600">❌</button></td>`;
    deBody.appendChild(tr);
  });
  document.getElementById('deTotalRecords').textContent = totalRecords;
  document.getElementById('deTotalErrors').textContent = totalErrors;
  const avgAcc = de.length ? (de.reduce((s,x)=> s+((x.records>0?((x.records-x.errors)/x.records*100):0)),0)/de.length).toFixed(1) : 0;
  document.getElementById('deAvgAccuracy').textContent = `${avgAcc}%`;
  document.getElementById('deDays').textContent = de.length;

  // chart
  const labels = Object.keys(grouped).sort();
  const data = labels.map(l => grouped[l]);
  if(deChart) deChart.destroy();
  deChart = new Chart(deChartCtx, { type:'line', data:{labels,datasets:[{label:'Records',data,borderColor:'#2563eb',backgroundColor:'rgba(37,99,235,0.12)',fill:true}]} , options:{responsive:true,maintainAspectRatio:false} });
}
window.deleteDE = (i) => { de.splice(i,1); localStorage.setItem(K_DE,JSON.stringify(de)); renderDE(); };

document.getElementById('addDE').addEventListener('click', ()=>{
  const date = document.getElementById('deDate').value || new Date().toISOString().slice(0,10);
  const project = document.getElementById('deProject').value.trim();
  const records = parseInt(document.getElementById('deRecords').value) || 0;
  const errors = parseInt(document.getElementById('deErrors').value) || 0;
  if(!project || records<=0){ return alert('Provide project and records > 0'); }
  de.push({date,project,records,errors});
  localStorage.setItem(K_DE,JSON.stringify(de));
  renderDE();
  document.getElementById('deProject').value=''; document.getElementById('deRecords').value=''; document.getElementById('deErrors').value='';
});

document.getElementById('exportDE').addEventListener('click', ()=>{
  if(!de.length) return alert('No records');
  const rows = [['Date','Project','Records','Errors','Accuracy']];
  de.forEach(r => rows.push([r.date,r.project,r.records,r.errors, r.records>0?(((r.records-r.errors)/r.records*100).toFixed(1)+'%'):'0%']));
  downloadFile('dataentry.csv', toCSV(rows));
});
document.getElementById('resetDE').addEventListener('click', ()=>{
  if(confirm('Clear Data Entry records?')){ de=[]; localStorage.removeItem(K_DE); renderDE(); }
});
renderDE();

// -----------------------
// Module 2: EXPENSES
// -----------------------
let ex = JSON.parse(localStorage.getItem(K_EXP)) || [];
const expBody = document.getElementById('expBody');

function renderExp(){
  expBody.innerHTML=''; let inc=0,out=0;
  ex.forEach((e,i)=>{
    expBody.insertAdjacentHTML('beforeend', `<tr><td>${e.date}</td><td>${e.desc}</td><td>${e.type}</td><td>${e.amount}</td><td><button onclick="delExp(${i})" class="text-red-600">❌</button></td></tr>`);
    if(e.type==='Income') inc+=e.amount; else out+=e.amount;
  });
  document.getElementById('totalIncome').textContent = inc;
  document.getElementById('totalExpenses').textContent = out;
  document.getElementById('netProfit').textContent = inc - out;
}
window.delExp = i => { ex.splice(i,1); localStorage.setItem(K_EXP,JSON.stringify(ex)); renderExp(); };

document.getElementById('addExp').addEventListener('click', ()=>{
  const date = document.getElementById('expDate').value || new Date().toISOString().slice(0,10);
  const desc = document.getElementById('expDesc').value.trim();
  const type = document.getElementById('expType').value;
  const amount = parseFloat(document.getElementById('expAmount').value);
  if(!desc || isNaN(amount)) return alert('Fill description and amount');
  ex.push({date,desc,type,amount});
  localStorage.setItem(K_EXP,JSON.stringify(ex));
  renderExp();
  document.getElementById('expDesc').value=''; document.getElementById('expAmount').value='';
});
document.getElementById('exportExp').addEventListener('click', ()=>{
  if(!ex.length) return alert('No expense data');
  const rows=[['Date','Description','Type','Amount']]; ex.forEach(e=>rows.push([e.date,e.desc,e.type,e.amount]));
  downloadFile('expenses.csv', toCSV(rows));
});
document.getElementById('resetExp').addEventListener('click', ()=>{ if(confirm('Clear expenses?')){ ex=[]; localStorage.removeItem(K_EXP); renderExp(); }});
renderExp();

// -----------------------
// Module 3: INVENTORY
// -----------------------
let inv = JSON.parse(localStorage.getItem(K_INV)) || [];
const invBody = document.getElementById('invBody');

function renderInv(){
  invBody.innerHTML=''; let total=0;
  inv.forEach((p,i)=>{
    const val = (p.qty||0)*(p.price||0);
    invBody.insertAdjacentHTML('beforeend', `<tr><td>${p.name}</td><td>${p.qty}</td><td>${p.price}</td><td>${p.low||''}</td><td>${val.toFixed(2)}</td><td><button onclick="delInv(${i})" class="text-red-600">❌</button></td></tr>`);
    total += val;
    // low alert style (simple)
    if(p.low && p.qty <= p.low){
      // could highlight row or notify — for now console
      console.warn('Low stock:', p.name);
    }
  });
  document.getElementById('invTotalValue').textContent = total.toFixed(2);
}
window.delInv = i => { inv.splice(i,1); localStorage.setItem(K_INV,JSON.stringify(inv)); renderInv(); };

document.getElementById('addInv').addEventListener('click', ()=>{
  const name = document.getElementById('invName').value.trim();
  const qty = parseInt(document.getElementById('invQty').value) || 0;
  const price = parseFloat(document.getElementById('invPrice').value) || 0;
  const low = parseInt(document.getElementById('invLow').value) || 0;
  if(!name || qty<0 || price<=0) return alert('Fill product, qty and price');
  inv.push({name,qty,price,low});
  localStorage.setItem(K_INV,JSON.stringify(inv));
  renderInv();
  document.getElementById('invName').value=''; document.getElementById('invQty').value=''; document.getElementById('invPrice').value=''; document.getElementById('invLow').value='';
});
document.getElementById('exportInv').addEventListener('click', ()=>{
  if(!inv.length) return alert('No inventory');
  const rows=[['Name','Qty','Price','Low','Value']]; inv.forEach(p=>rows.push([p.name,p.qty,p.price,p.low,(p.qty*p.price).toFixed(2)]));
  downloadFile('inventory.csv', toCSV(rows));
});
document.getElementById('resetInv').addEventListener('click', ()=>{ if(confirm('Clear inventory?')){ inv=[]; localStorage.removeItem(K_INV); renderInv(); }});
renderInv();

// -----------------------
// Module 4: INVOICES
// -----------------------
let invoiceItems = JSON.parse(localStorage.getItem(K_INVOICE)) || [];
const invoiceBody = document.getElementById('invoiceBody');

function renderInvoiceItems(){
  invoiceBody.innerHTML=''; let total=0;
  invoiceItems.forEach((it,i)=>{
    const val = (it.qty||0)*(it.price||0);
    invoiceBody.insertAdjacentHTML('beforeend', `<tr><td>${it.name}</td><td>${it.qty}</td><td>${it.price}</td><td>${val.toFixed(2)}</td><td><button onclick="delInvoiceItem(${i})" class="text-red-600">❌</button></td></tr>`);
    total += val;
  });
  document.getElementById('invoiceTotal').textContent = total.toFixed(2);
}
window.delInvoiceItem = i => { invoiceItems.splice(i,1); localStorage.setItem(K_INVOICE,JSON.stringify(invoiceItems)); renderInvoiceItems(); };

document.getElementById('addItem').addEventListener('click', ()=>{
  const name = document.getElementById('itemName').value.trim();
  const qty = parseInt(document.getElementById('itemQty').value) || 0;
  const price = parseFloat(document.getElementById('itemPrice').value) || 0;
  if(!name || qty<=0 || price<=0) return alert('Fill item, qty and price');
  invoiceItems.push({name,qty,price});
  localStorage.setItem(K_INVOICE,JSON.stringify(invoiceItems));
  renderInvoiceItems();
  document.getElementById('itemName').value=''; document.getElementById('itemQty').value=''; document.getElementById('itemPrice').value='';
});

document.getElementById('exportInvoiceCSV').addEventListener('click', ()=>{
  if(!invoiceItems.length) return alert('No invoice items');
  const rows=[['Item','Qty','Price','Total']]; invoiceItems.forEach(it=>rows.push([it.name,it.qty,it.price,(it.qty*it.price).toFixed(2)]));
  downloadFile('invoice_items.csv', toCSV(rows));
});
document.getElementById('resetInvoice').addEventListener('click', ()=>{ if(confirm('Clear invoice items?')){ invoiceItems=[]; localStorage.removeItem(K_INVOICE); renderInvoiceItems(); }});

// PDF download using jsPDF
document.getElementById('downloadPDF').addEventListener('click', async ()=>{
  if(!invoiceItems.length) return alert('No items');
  const client = document.getElementById('invClient').value || 'Client';
  const { jsPDF } = window.jspdf;
  const doc = new jsPDF();
  doc.setFontSize(14);
  doc.text('Invoice', 14, 18);
  doc.setFontSize(11);
  doc.text(`Client: ${client}`, 14, 28);
  let y = 40;
  invoiceItems.forEach(it => {
    doc.text(`${it.name} — ${it.qty} x ${it.price} = ${(it.qty*it.price).toFixed(2)}`, 14, y);
    y += 8;
  });
  doc.text(`Total: ${document.getElementById('invoiceTotal').textContent}`, 14, y + 6);
  doc.save(`invoice_${Date.now()}.pdf`);
});
renderInvoiceItems();

// -----------------------
// Module 5: MINI CRM
// -----------------------
let clients = JSON.parse(localStorage.getItem(K_CLIENTS)) || [];
const clientsBody = document.getElementById('clientsBody');

function renderClients(filterText=''){
  clientsBody.innerHTML='';
  clients.forEach((c,i)=>{
    if(filterText && !`${c.name} ${c.phone} ${c.note}`.toLowerCase().includes(filterText.toLowerCase())) return;
    clientsBody.insertAdjacentHTML('beforeend', `<tr><td>${c.name}</td><td>${c.phone}</td><td>${c.status}</td><td>${c.note}</td><td><button onclick="delClient(${i})" class="text-red-600">❌</button></td></tr>`);
  });
}
window.delClient = i => { clients.splice(i,1); localStorage.setItem(K_CLIENTS,JSON.stringify(clients)); renderClients(document.getElementById('clientSearch').value); };

document.getElementById('addClient').addEventListener('click', ()=>{
  const name = document.getElementById('crmName').value.trim();
  const phone = document.getElementById('crmPhone').value.trim();
  const status = document.getElementById('crmStatus').value;
  const note = document.getElementById('crmNote').value.trim();
  if(!name) return alert('Client name required');
  clients.push({name,phone,status,note});
  localStorage.setItem(K_CLIENTS,JSON.stringify(clients));
  renderClients();
  document.getElementById('crmName').value=''; document.getElementById('crmPhone').value=''; document.getElementById('crmNote').value='';
});
document.getElementById('exportClients').addEventListener('click', ()=>{
  if(!clients.length) return alert('No clients');
  const rows=[['Name','Phone','Status','Note']]; clients.forEach(c=>rows.push([c.name,c.phone,c.status,c.note]));
  downloadFile('clients.csv', toCSV(rows));
});
document.getElementById('resetClients').addEventListener('click', ()=>{ if(confirm('Clear clients?')){ clients=[]; localStorage.removeItem(K_CLIENTS); renderClients(); }});
document.getElementById('clientSearch').addEventListener('input', (e)=> renderClients(e.target.value));
renderClients();

// -----------------------
// Module 6: KPI Dashboard
// -----------------------
let kpis = JSON.parse(localStorage.getItem(K_KPI)) || [];
const kpiCtx = document.getElementById('kpiChart').getContext('2d');
let kpiChart;

function renderKPI(){
  const labels = kpis.map(k=>k.date);
  const sales = kpis.map(k=>k.sales);
  const profit = kpis.map(k=>k.profit);
  const newc = kpis.map(k=>k.newc);
  if(kpiChart) kpiChart.destroy();
  kpiChart = new Chart(kpiCtx, { type:'bar', data:{ labels, datasets:[ {label:'Sales', data:sales, backgroundColor:'#10b981'}, {label:'Profit', data:profit, backgroundColor:'#f59e0b'} ] }, options:{ responsive:true, maintainAspectRatio:false } });
}

document.getElementById('addKPI').addEventListener('click', ()=>{
  const date = document.getElementById('kpiDate').value || new Date().toISOString().slice(0,10);
  const sales = parseFloat(document.getElementById('kpiSales').value) || 0;
  const profit = parseFloat(document.getElementById('kpiProfit').value) || 0;
  const newc = parseInt(document.getElementById('kpiNew').value) || 0;
  kpis.push({date,sales,profit,newc});
  localStorage.setItem(K_KPI,JSON.stringify(kpis));
  renderKPI();
  document.getElementById('kpiSales').value=''; document.getElementById('kpiProfit').value=''; document.getElementById('kpiNew').value='';
});
document.getElementById('exportKPI').addEventListener('click', ()=>{
  if(!kpis.length) return alert('No KPI data');
  const rows=[['Date','Sales','Profit','NewCustomers']]; kpis.forEach(k=>rows.push([k.date,k.sales,k.profit,k.newc]));
  downloadFile('kpi.csv', toCSV(rows));
});
renderKPI();

// -----------------------
// End of script
// -----------------------
