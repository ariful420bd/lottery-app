const STORAGE_KEY = 'lottery-names-v2'; // v2 করা হলো যাতে আগের সেভ করা নাম না আসে
const DEFAULT_NAMES = ['আরিফ', 'শুভ', 'হিরন', 'সারোয়ার', 'আশিক', 'রোমান'];

const displayEl = document.getElementById('display');
const pickBtn   = document.getElementById('pickBtn');
const editBtn   = document.getElementById('editBtn');
const resetBtn  = document.getElementById('resetBtn');
const editorEl  = document.getElementById('editor');
const inputsEl  = document.getElementById('inputs');
const addInputBtn = document.getElementById('addInputBtn');
const saveBtn   = document.getElementById('saveBtn');

let names = loadNames();
let rolling = false;

/* ---------- Storage ---------- */
function loadNames() {
  try {
    const saved = JSON.parse(localStorage.getItem(STORAGE_KEY));
    // এখন যেকোনো সংখ্যক নাম গ্রহণ করবে (অন্তত ১টি থাকতে হবে)
    if (Array.isArray(saved) && saved.length > 0 && saved.every(n => typeof n === 'string')) {
      return saved;
    }
  } catch (e) { /* ignore */ }
  return [...DEFAULT_NAMES];
}

function saveNames(list) {
  try { localStorage.setItem(STORAGE_KEY, JSON.stringify(list)); } catch (e) {}
}

/* ---------- Lottery ---------- */
function randomIndex() {
  return Math.floor(Math.random() * names.length);
}

function pickWinner() {
  if (rolling) return;

  const validNames = names.map(n => n.trim()).filter(Boolean);
  if (validNames.length === 0) {
    displayEl.textContent = 'কোনো নাম নেই!';
    return;
  }

  rolling = true;
  pickBtn.disabled = true;
  displayEl.classList.remove('winner');

  const DURATION = 2600;
  const startTime = Date.now();

  function tick() {
    const elapsed = Date.now() - startTime;
    const progress = Math.min(elapsed / DURATION, 1);

    displayEl.textContent = validNames[randomIndex()];

    if (progress < 1) {
      const delay = 45 + Math.pow(progress, 3) * 380;
      setTimeout(tick, delay);
    } else {
      finish(validNames);
    }
  }

  function finish(list) {
    const winner = list[randomIndex()];
    displayEl.textContent = winner;
    displayEl.classList.add('winner');
    pickBtn.disabled = false;
    rolling = false;
  }

  tick();
}

function resetDisplay() {
  if (rolling) return;
  displayEl.classList.remove('winner');
  displayEl.textContent = 'প্রস্তুত?';
}

/* ---------- Editor (Dynamic) ---------- */
function createInputRow(value = '') {
  const row = document.createElement('div');
  row.className = 'input-row';

  const input = document.createElement('input');
  input.type = 'text';
  input.value = value;
  input.placeholder = 'নাম লিখুন';
  input.maxLength = 30;

  const removeBtn = document.createElement('button');
  removeBtn.type = 'button';
  removeBtn.className = 'remove-btn';
  removeBtn.textContent = '✕';
  removeBtn.title = 'এই নামটি মুছে ফেলুন';
  removeBtn.addEventListener('click', () => {
    row.remove();
  });

  row.appendChild(input);
  row.appendChild(removeBtn);
  inputsEl.appendChild(row);
}

function buildEditor() {
  inputsEl.innerHTML = '';
  names.forEach(name => createInputRow(name));
  // ফোকাস শেষ ইনপুটে দাও
  const lastInput = inputsEl.querySelector('.input-row:last-child input');
  if (lastInput) lastInput.focus();
}

function toggleEditor() {
  if (editorEl.classList.contains('hidden')) {
    buildEditor();
    editorEl.classList.remove('hidden');
    editBtn.textContent = 'বাতিল';
  } else {
    editorEl.classList.add('hidden');
    editBtn.textContent = 'নাম এডিট';
  }
}

function applyEditor() {
  const rows = inputsEl.querySelectorAll('.input-row');
  const newNames = [];
  rows.forEach(row => {
    const val = row.querySelector('input').value.trim();
    if (val) newNames.push(val);
  });

  if (newNames.length < 2) {
    alert('কমপক্ষে ২টি নাম থাকতে হবে!');
    return;
  }

  names = newNames;
  saveNames(names);
  editorEl.classList.add('hidden');
  editBtn.textContent = 'নাম এডিট';
  resetDisplay();
}

/* ---------- Events ---------- */
pickBtn.addEventListener('click', pickWinner);
resetBtn.addEventListener('click', resetDisplay);
editBtn.addEventListener('click', toggleEditor);
addInputBtn.addEventListener('click', () => {
  createInputRow();
  const allInputs = inputsEl.querySelectorAll('.input-row input');
  if (allInputs.length > 0) {
    allInputs[allInputs.length - 1].focus();
  }
});
saveBtn.addEventListener('click', applyEditor);
