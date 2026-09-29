const STORAGE_KEY = 'lottery-names-v1';
const DEFAULT_NAMES = ['আরিফ', 'শুভ', 'হিরন', 'সারোয়ার', 'আশিক', 'রোমান'];

const displayEl = document.getElementById('display');
const pickBtn   = document.getElementById('pickBtn');
const editBtn   = document.getElementById('editBtn');
const resetBtn  = document.getElementById('resetBtn');
const editorEl  = document.getElementById('editor');
const inputsEl  = document.getElementById('inputs');
const saveBtn   = document.getElementById('saveBtn');

let names = loadNames();
let rolling = false;

/* ---------- Storage ---------- */
function loadNames() {
  try {
    const saved = JSON.parse(localStorage.getItem(STORAGE_KEY));
    if (Array.isArray(saved) && saved.length === 6 && saved.every(n => typeof n === 'string')) {
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

  const DURATION = 2600;          // মোট স্পিন সময় (ms)
  const startTime = Date.now();

  function tick() {
    const elapsed = Date.now() - startTime;
    const progress = Math.min(elapsed / DURATION, 1);

    // র্যান্ডম নাম দেখাও
    displayEl.textContent = validNames[randomIndex()];

    if (progress < 1) {
      // শুরুতে দ্রুত, শেষে ধীরে ধীরে থামবে
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

/* ---------- Editor ---------- */
function buildEditor() {
  inputsEl.innerHTML = '';
  names.forEach((name, i) => {
    const input = document.createElement('input');
    input.type = 'text';
    input.value = name;
    input.placeholder = `নাম ${i + 1}`;
    input.maxLength = 30;
    inputsEl.appendChild(input);
  });
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
  const values = [...inputsEl.querySelectorAll('input')].map(inp => inp.value.trim());
  names = values.map((v, i) => v || `নাম ${i + 1}`);
  saveNames(names);
  editorEl.classList.add('hidden');
  editBtn.textContent = 'নাম এডিট';
  resetDisplay();
}

/* ---------- Events ---------- */
pickBtn.addEventListener('click', pickWinner);
resetBtn.addEventListener('click', resetDisplay);
editBtn.addEventListener('click', toggleEditor);
saveBtn.addEventListener('click', applyEditor);