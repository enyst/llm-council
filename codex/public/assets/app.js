const state = {
  models: [],
  selected: new Set(),
  history: [],
};

async function fetchModels() {
  try {
    const res = await fetch('/api/models');
    if (!res.ok) throw new Error(`GET /api/models ${res.status}`);
    state.models = await res.json();
  } catch (e) {
    console.error('Failed to fetch models', e);
    state.models = [];
    alert('Failed to load models. Please retry.');
  }
  renderShelf();
  renderSeats();
  renderRegistry();
}

function renderShelf() {
  const ul = document.getElementById('model-shelf');
  ul.innerHTML = '';
  state.models.forEach(m => {
    const li = document.createElement('li');
    li.className = 'model-tome' + (state.selected.has(m.id) ? ' selected' : '');
    li.dataset.modelId = m.id;

    const color = document.createElement('span');
    color.className = 'spine-color';
    color.style.background = m.color || '#bfa36f';

    const label = document.createElement('span');
    label.className = 'spine-label';
    label.textContent = m.name;

    li.appendChild(color);
    li.appendChild(label);

    li.addEventListener('click', () => {
      if (state.selected.has(m.id)) state.selected.delete(m.id); else state.selected.add(m.id);
      renderShelf();
      renderSeats();
    });

    ul.appendChild(li);
  });
}

function renderSeats() {
  const cont = document.getElementById('table-graphic');
  cont.innerHTML = '';
  const selectedModels = state.models.filter(m => state.selected.has(m.id));
  const n = selectedModels.length;
  const cx = cont.clientWidth / 2; const cy = cont.clientHeight / 2; const r = Math.min(cx, cy) - 60;
  selectedModels.forEach((m, i) => {
    const angle = (i / n) * Math.PI * 2 - Math.PI / 2;
    const x = cx + r * Math.cos(angle);
    const y = cy + r * Math.sin(angle);

    const seat = document.createElement('div');
    seat.className = 'council-seat';
    seat.style.left = x + 'px';
    seat.style.top = y + 'px';

    const avatar = document.createElement('div');
    avatar.className = 'tome-avatar';
    avatar.style.borderColor = m.color || '#bfa36f';
    avatar.style.boxShadow = `0 0 18px ${hexToRgba(m.color||'#bfa36f', 0.45)}`;

    const label = document.createElement('div');
    label.className = 'seat-label';
    label.textContent = m.name;

    seat.appendChild(avatar);
    seat.appendChild(label);

    seat.addEventListener('click', () => {
      state.selected.delete(m.id);
      renderShelf();
      renderSeats();
    });

    cont.appendChild(seat);
  });
}

function hexToRgba(hex, a=1) {
  const h = hex.replace('#','');
  const bigint = parseInt(h, 16);
  const r = (bigint >> 16) & 255; const g = (bigint >> 8) & 255; const b = bigint & 255;
  return `rgba(${r},${g},${b},${a})`;
}

async function askCouncil() {
  const q = document.getElementById('question-input').value.trim();
  const modelIds = Array.from(state.selected);
  if (!q || modelIds.length === 0) {
    alert('Choose at least one tome and enter a question.');
    return;
  }

  document.getElementById('question-display').textContent = 'The tomes are consulting…';
  document.getElementById('answers-grid').innerHTML = '';

  try {
    const res = await fetch('/api/ask', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ question: q, modelIds })
    });
    if (!res.ok) throw new Error(`POST /api/ask ${res.status}`);
    const data = await res.json();
    state.history.unshift({ question: q, ...data, timestamp: Date.now() });
    renderAnswers(data);
  } catch (e) {
    console.error('Ask failed', e);
    document.getElementById('question-display').textContent = 'The council is silent. Please try again.';
  }
}

function renderAnswers(data) {
  const qd = document.getElementById('question-display');
  qd.textContent = data.question;
  const grid = document.getElementById('answers-grid');
  grid.innerHTML = '';

  data.answers.forEach(ans => {
    const card = document.createElement('article');
    card.className = 'answer-card';

    const header = document.createElement('header');
    header.className = 'answer-header';
    const h3 = document.createElement('h3'); h3.textContent = ans.model.name;
    const tag = document.createElement('span'); tag.textContent = ans.model.id;
    header.appendChild(h3); header.appendChild(tag);

    const body = document.createElement('div');
    body.className = 'answer-body';
    body.textContent = ans.text;

    const footer = document.createElement('footer');
    footer.className = 'answer-footer';

    const pop = document.createElement('div');
    pop.className = 'margin-pop';
    pop.hidden = true;
    pop.textContent = buildNotesForAnswer(ans, data.reviews);

    const notesBtn = document.createElement('button');
    notesBtn.textContent = 'Council Notes';
    notesBtn.addEventListener('click', () => {
      pop.hidden = !pop.hidden;
    });

    const strips = document.createElement('div');
    strips.className = 'margin-strips';

    footer.appendChild(notesBtn);

    card.appendChild(header);
    card.appendChild(body);
    card.appendChild(strips);
    card.appendChild(pop);
    card.appendChild(footer);

    // Build color strips for each other reviewer
    Object.entries(data.reviews).forEach(([modelId, text]) => {
      if (modelId === ans.model.id) return;
      const m = state.models.find(mm => mm.id === modelId);
      const s = document.createElement('div');
      s.className = 'margin-strip';
      s.style.background = m?.color || '#999';
      s.title = `${m?.name || modelId} notes`;
      s.addEventListener('click', () => {
        pop.hidden = false;
        pop.textContent = `${m?.name || modelId} notes:\n\n${text}`;
      });
      strips.appendChild(s);
    });

    grid.appendChild(card);
  });
}

function buildNotesForAnswer(ans, reviews) {
  // Very simple summary that lists all reviewers except the answer owner
  const other = Object.entries(reviews).filter(([id]) => id !== ans.model.id);
  if (other.length === 0) return 'No council notes (solo mode).';
  return other.map(([id, text]) => {
    const m = state.models.find(mm => mm.id === id);
    return `${m?.name || id}:\n${text}`;
  }).join('\n\n---\n\n');
}

function renderRegistry() {
  const ul = document.getElementById('registry-list');
  if (!ul) return;
  ul.innerHTML = '';
  state.models.forEach(m => {
    const li = document.createElement('li');
    li.textContent = `${m.name} (${m.id}) – ${m.provider || 'n/a'}:${m.model || ''}`;
    li.style.borderLeft = `8px solid ${m.color || '#bfa36f'}`;
    li.style.padding = '6px 8px';
    li.style.margin = '6px 0';
    ul.appendChild(li);
  });
}

async function saveModel(e) {
  e.preventDefault();
  const fd = new FormData(e.currentTarget);
  const payload = Object.fromEntries(fd.entries());
  try {
    const res = await fetch('/api/models', { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify(payload) });
    if (!res.ok) throw new Error(`POST /api/models ${res.status}`);
    const data = await res.json();
    state.models = data.models;
    renderShelf();
    renderSeats();
    renderRegistry();
  } catch (e) {
    console.error('Save model failed', e);
    alert('Could not save tome. Check fields and try again.');
  }
}

function wireNav() {
  const btns = document.querySelectorAll('.nav-btn');
  const consultElems = document.querySelectorAll('.consultation-view');
  const archiv = document.getElementById('archivist');
  btns.forEach(btn => btn.addEventListener('click', () => {
    btns.forEach(b => b.classList.remove('active'));
    btn.classList.add('active');
    const view = btn.dataset.view;
    if (view === 'consultation') {
      archiv.hidden = true;
      consultElems.forEach(el => el.hidden = false);
    } else {
      archiv.hidden = false;
      consultElems.forEach(el => el.hidden = true);
    }
  }));
}

function wireForm() {
  const form = document.getElementById('model-form');
  if (form) form.addEventListener('submit', saveModel);
}

function wireAsk() {
  document.getElementById('ask-btn').addEventListener('click', askCouncil);
}

window.addEventListener('resize', renderSeats);

// Init
wireNav();
wireForm();
wireAsk();
fetchModels();
