// script.js — Data Entry Pro Suite (combined logic)

// ----------------- CONFIG -----------------
const PASSWORD_TXT_URL = "https://thetechthriller.buzz/dataentry/current_password.txt"; // put your file here
const SELAR_CHECKOUT = "https://selar.com/showlove/jane-emmanuel";
const WHATSAPP_LINK = "https://wa.me/2348108179570";

// ----------------- DOM -----------------
const welcome = document.getElementById('welcome');
const dashboard = document.getElementById('dashboard');
const enterBtn = document.getElementById('enterBtn');
const demoBtn = document.getElementById('demoBtn');
const logoutBtn = document.getElementById('logout');
const unlockBtn = document.getElementById('unlockBtn');
const toolArea = document.getElementById('toolArea');
const paywall = document.getElementById('paywall');
const deviceIdEl = document.getElementById('deviceId');
const verifyPasswordBtn = document.getElementById('verifyPassword');
const closePaywallBtn = document.getElementById('closePaywall');
const accessPasswordInput = document.getElementById('accessPassword');
const passwordMessage = document.getElementById('passwordMessage');
const selarBtn = document.getElementById('selarBtn');

// preload tiny audio (optional — you can put actual mp3s in /sounds/)
const audioClick = document.getElementById('audioClick');
const audioChime = document.getElementById('audioChime');

// small safe audio placeholders (if real files absent, they do nothing)
audioClick.src = "sounds/click.mp3";
audioChime.src = "sounds/chime.mp3";

// ----------------- Device ID + state -----------------
let deviceId = localStorage.getItem('dep_deviceId');
if(!deviceId){
  deviceId = (crypto && crypto.randomUUID) ? crypto.randomUUID().split('-')[0].toUpperCase() : ('XXXXXX' + Math.floor(Math.random()*9000));
  localStorage.setItem('dep_deviceId', deviceId);
}
if(deviceIdEl) deviceIdEl.innerText = deviceId;

const isUnlocked = localStorage.getItem('dep_accessGranted') === 'true';

// ----------------- Welcome / Dashboard -----------------
enterBtn && enterBtn.addEventListener('click', ()=>{
  const name = (document.getElementById('businessName')||{}).value || 'User';
  localStorage.setItem('dep_businessName', name);
  openDashboard(name);
});

demoBtn && demoBtn.addEventListener('click', ()=> startDemo());
logoutBtn && logoutBtn.addEventListener('click', ()=>{
  localStorage.removeItem('dep_businessName');
  // keep access state so paying users don't get locked out
  location.reload();
});
unlockBtn && unlockBtn.addEventListener('click', ()=> showPaywall());
closePaywallBtn && closePaywallBtn.addEventListener('click', ()=> paywall.classList.add('hidden'));
if(selarBtn) selarBtn.href = SELAR_CHECKOUT;

// on load: show dashboard or welcome
window.addEventListener('DOMContentLoaded', ()=>{
  const name = localStorage.getItem('dep_businessName');
  if(name) openDashboard(name);
  else showWelcome();

  // auto demo once for new visitors if not unlocked and not demoWatched
  if (!isUnlocked && !localStorage.getItem('dep_demoWatched')) {
    // we will not auto start; user clicks "Watch Demo" to run — but you can change to auto-start:
    // startDemo(); localStorage.setItem('dep_demoWatched','true');
  }
});

function showWelcome(){
  welcome.classList.remove('hidden');
  dashboard.classList.add('hidden');
}
function openDashboard(name){
  welcome.classList.add('hidden');
  dashboard.classList.remove('hidden');
  const greeting = document.getElementById('greeting');
  greeting && (greeting.textContent = `👋 Welcome, ${name}!`);
  toolArea.innerHTML = '<p class="muted">Click a card to open its tool. Use export buttons inside each module.</p>';
  // wire up cards
  document.querySelectorAll('.card.tool').forEach(el=>{
    el.onclick = ()=> loadModule(el.getAttribute('data-mod'));
  });
}

// ----------------- Module loader -----------------
async function loadModule(modFile){
  try{
    const res = await fetch(`modules/${modFile}`);
    const html = await res.text();
    toolArea.innerHTML = html;
    // call module init if defined inside module HTML (modules may define init functions)
    const fnName = 'init_' + modFile.replace(/\W/g,'_').replace('.html','');
    if(window[fnName] && typeof window[fnName] === 'function') {
      try{ window[fnName](); } catch(e){ console.warn('module init error', e); }
    }
  } catch(e){
    console.error('loadModule error', e);
    toolArea.innerHTML = '<p class="muted">Failed to load module.</p>';
  }
}

async function startDemo() {
  const demoModules = [
    { name: "Expense Tracker", file: "expense.html" },
    { name: "Inventory Manager", file: "inventory.html" },
    { name: "Invoice Generator", file: "invoice.html" },
    { name: "Customer CRM", file: "crm.html" },
    { name: "Business KPI", file: "kpi.html" },
    { name: "Data Entry Tracker", file: "dataentry.html" }
  ];

  let currentIndex = 0;
  const display = document.getElementById("demoDisplay");
  display.innerText = "Starting Demo...";

  for (const step of demoModules) {
    try {
      const res = await fetch(`modules/${step.file}`);
      if (!res.ok) throw new Error(`HTTP ${res.status}`);
      const html = await res.text();
      display.innerHTML = html;
      console.log("Loaded:", step.file);
    } catch (err) {
      console.error("Error loading:", step.file, err);
      display.innerText = `Error loading ${step.name}. Check console for details.`;
      break;
    }

    await new Promise(r => setTimeout(r, 7000)); // 7s per module ~45s total
  }

  display.innerText = "Demo complete!";
}

// small helper
function sleep(ms){ return new Promise(res=>setTimeout(res,ms)); }

// demo fill routines — try to find fields we created in modules and trigger their add buttons
function runDemoFill(file){
  try{
    if(file.includes('expenses')){
      const desc = document.getElementById('ex_desc');
      const amt = document.getElementById('ex_amount');
      const typ = document.getElementById('ex_type');
      const btn = document.getElementById('addExp');
      if(desc && amt && typ && btn){ desc.value='Market sales'; amt.value='2500'; typ.value='Income'; btn.click(); setTimeout(()=>{ desc.value='Transport'; amt.value='300'; typ.value='Expense'; btn.click(); },700); }
    } else if(file.includes('inventory')){
      const n = document.getElementById('inv_name');
      const q = document.getElementById('inv_qty');
      const p = document.getElementById('inv_price');
      const b = document.getElementById('addInv');
      if(n && q && p && b){ n.value='Soap'; q.value='30'; p.value='150'; b.click(); setTimeout(()=>{ n.value='Sachet rice'; q.value='18'; p.value='120'; b.click(); },700); }
    } else if(file.includes('invoice')){
      const client = document.getElementById('invClient');
      const iname = document.getElementById('item_name');
      const iqty = document.getElementById('item_qty');
      const iprice = document.getElementById('item_price');
      const b = document.getElementById('addItem');
      if(client && iname && iqty && iprice && b){ client.value="Mary's Boutique"; iname.value='Canvas Bag'; iqty.value='2'; iprice.value='1200'; b.click(); setTimeout(()=>{ iname.value='Gift wrap'; iqty.value='1'; iprice.value='100'; b.click(); },700); }
    } else if(file.includes('crm')){
      const n = document.getElementById('c_name');
      const ph = document.getElementById('c_phone');
      const st = document.getElementById('c_status');
      const note = document.getElementById('c_note');
      const b = document.getElementById('addClient');
      if(n && ph && st && note && b){ n.value='Ola Ventures'; ph.value='08012345678'; st.value='Contacted'; note.value='Bulk buyer'; b.click(); setTimeout(()=>{ n.value='Aisha Foods'; ph.value='08087654321'; b.click(); },700); }
    } else if(file.includes('kpi')){
      const d = document.getElementById('kpi_date');
      const s = document.getElementById('kpi_sales');
      const p = document.getElementById('kpi_profit');
      const nw = document.getElementById('kpi_new');
      const b = document.getElementById('addKPI');
      if(d && s && p && nw && b){ d.value=new Date().toISOString().slice(0,10); s.value='50000'; p.value='12000'; nw.value='12'; b.click(); setTimeout(()=>{ s.value='30000'; p.value='8000'; b.click(); },700); }
    } else if(file.includes('dataentry')){
      const d = document.getElementById('deProject');
      const r = document.getElementById('deRecords');
      const e = document.getElementById('deErrors');
      const b = document.getElementById('addDE');
      if(d && r && e && b){ d.value='Daily sales log'; r.value='45'; e.value='2'; b.click(); }
    }
  }catch(e){ console.warn('demo fill error', e); }
}

// ----------------- PAYWALL + remote password check -----------------
function showPaywall(){
  paywall.classList.remove('hidden');
  deviceIdEl && (deviceIdEl.innerText = deviceId);
}

verifyPasswordBtn && verifyPasswordBtn.addEventListener('click', async ()=>{
  const code = (accessPasswordInput.value || '').trim();
  if(!code){ passwordMessage.innerText = 'Enter the password you received after payment.'; return; }
  passwordMessage.innerText = 'Verifying...';
  try{
    // fetch remote password text (no cache)
    const res = await fetch(PASSWORD_TXT_URL + '?t=' + Date.now());
    if(!res.ok) throw new Error('Could not fetch password file');
    const remote = (await res.text()).trim();
    if(remote === code){
      localStorage.setItem('dep_accessGranted','true');
      passwordMessage.innerText = '✅ Access granted! Opening dashboard...';
      passwordMessage.style.color = 'green';
      setTimeout(()=>{ paywall.classList.add('hidden'); openDashboard(localStorage.getItem('dep_businessName')||'User'); }, 1000);
    } else {
      passwordMessage.innerText = '❌ Invalid or expired password. Please contact support on WhatsApp.';
      passwordMessage.style.color = 'red';
    }
  }catch(e){
    passwordMessage.innerText = '⚠️ Could not verify — check your connection.';
    passwordMessage.style.color = 'orange';
    console.error('verify error', e);
  }
});

// auto-skip paywall if already verified
window.addEventListener('load', ()=> {
  if(localStorage.getItem('dep_accessGranted') === 'true') {
    const pw = document.getElementById('paywall');
    if(pw) pw.classList.add('hidden');
  }
});
