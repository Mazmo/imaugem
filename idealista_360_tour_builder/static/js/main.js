/* ── Estado global ──────────────────────────────────────────── */
let rooms    = [];   // [{id, order, original_filename, exported_filename, title, floor, description, connections[]}]
let allFiles = [];   // raw list from /api/images
let editId   = null; // id da divisão a editar
let projectMeta = { project_name: '', source_folder: '', created_at: '' };

/* ── Utilitários ────────────────────────────────────────────── */
const $ = id => document.getElementById(id);

function showStatus(msg, type = '') {
  const bar = $('status-bar');
  bar.textContent = msg;
  bar.className   = `status-bar ${type}`;
  bar.classList.remove('hidden');
  if (type === 'ok') setTimeout(() => bar.classList.add('hidden'), 4000);
}

function showModal(id, title, content) {
  if (title)   document.getElementById(id === 'modal-result' ? 'result-title' : '').textContent = title;
  if (content) document.getElementById(id === 'modal-result' ? 'result-content' : 'report-content').textContent = content;
  $(id).classList.remove('hidden');
}

function toggleButtons(enabled) {
  $('btn-save').disabled    = !enabled;
  $('btn-xml').disabled     = !enabled;
  $('btn-package').disabled = !enabled;
}

function genId() {
  return 'r' + Math.random().toString(36).slice(2, 9);
}

function slug(title) {
  return title.toLowerCase()
    .normalize('NFD').replace(/[̀-ͯ]/g, '')
    .replace(/\s+/g, '_').replace(/[^a-z0-9_]/g, '');
}

function exportedName(order, title) {
  const s = slug(title || 'divisao');
  return `${String(order).padStart(3, '0')}_${s}.jpg`;
}

function fileInfo(filename) {
  return allFiles.find(f => f.filename === filename) || {};
}

/* ── Renderização do Grid ───────────────────────────────────── */
function renderGrid() {
  const grid  = $('grid');
  const empty = $('empty-state');
  const badge = $('count-badge');

  grid.innerHTML = '';
  badge.textContent = rooms.length;

  if (!rooms.length) {
    empty.classList.remove('hidden');
    return;
  }
  empty.classList.add('hidden');

  for (const room of rooms) {
    const info = fileInfo(room.original_filename);
    const card = document.createElement('div');
    card.className = 'card' + (editId === room.id ? ' active' : '');
    card.dataset.id = room.id;

    const thumb = room.original_filename
      ? `<img class="card-thumb" src="/api/thumbnail/${encodeURIComponent(room.original_filename.replace(/\.[^.]+$/, '_thumb.jpg'))}" alt="" loading="lazy" onerror="this.outerHTML='<div class=card-thumb-placeholder>🖼</div>'">`
      : '<div class="card-thumb-placeholder">🖼</div>';

    const warnBadge = info.is_equirectangular === false
      ? '<span class="card-warn">! não 2:1</span>' : '';

    const connChips = room.connections.map(c => {
      const t = rooms.find(r => r.id === c.target_room_id);
      return `<span class="conn-chip">→ ${t ? t.title || t.original_filename : c.target_room_id}</span>`;
    }).join('');

    card.innerHTML = `
      <span class="card-order">${room.order}</span>
      ${warnBadge}
      ${thumb}
      <div class="card-body">
        <div class="card-title">${room.title || room.original_filename}</div>
        <div class="card-sub">${room.floor ? `Piso: ${room.floor} · ` : ''}${room.original_filename}</div>
        ${connChips ? `<div class="card-conns">${connChips}</div>` : ''}
      </div>`;

    card.addEventListener('click', () => openPanel(room.id));
    grid.appendChild(card);
  }

  // Sortable drag-and-drop
  if (grid._sortable) grid._sortable.destroy();
  grid._sortable = Sortable.create(grid, {
    animation:  150,
    ghostClass: 'sortable-ghost',
    chosenClass:'sortable-chosen',
    onEnd(evt) {
      const id    = evt.item.dataset.id;
      const moved = rooms.find(r => r.id === id);
      rooms.splice(rooms.indexOf(moved), 1);
      rooms.splice(evt.newIndex, 0, moved);
      reorder();
    },
  });
}

function reorder() {
  rooms.forEach((r, i) => {
    r.order = i + 1;
    if (r.title) r.exported_filename = exportedName(r.order, r.title);
  });
  renderGrid();
}

/* ── Painel de Edição ───────────────────────────────────────── */
function openPanel(id) {
  const room  = rooms.find(r => r.id === id);
  if (!room) return;
  editId = id;

  const info  = fileInfo(room.original_filename);
  const panel = $('edit-panel');
  panel.classList.remove('hidden');

  $('panel-img').src         = room.original_filename
    ? `/api/source/${encodeURIComponent(room.original_filename)}` : '';
  $('panel-filename').textContent = room.original_filename;
  $('panel-dims').textContent = info.width
    ? `${info.width}×${info.height}px` : '';
  $('panel-eq').textContent   = info.is_equirectangular === false
    ? '⚠ Não equiretangular (não é 2:1)' : '✓ Equiretangular';

  $('f-title').value    = room.title       || '';
  $('f-floor').value    = room.floor       || '';
  $('f-desc').value     = room.description || '';
  $('f-exported').value = room.exported_filename || exportedName(room.order, room.title);

  renderConnections(room);
  renderGrid(); // refresh active state
}

function closePanel() {
  editId = null;
  $('edit-panel').classList.add('hidden');
  renderGrid();
}

function renderConnections(room) {
  const list = $('connections-list');
  list.innerHTML = '';
  room.connections.forEach((conn, idx) => {
    const row = document.createElement('div');
    row.className = 'conn-row';

    const targets = rooms.filter(r => r.id !== room.id);
    const opts    = targets.map(r =>
      `<option value="${r.id}" ${r.id === conn.target_room_id ? 'selected' : ''}>${r.title || r.original_filename}</option>`
    ).join('');

    row.innerHTML = `
      <select class="conn-target">${opts}</select>
      <input  class="conn-label" type="text" value="${conn.label || ''}" placeholder="Etiqueta (ex: cozinha)" />
      <button class="btn-icon conn-del" data-idx="${idx}" title="Remover">✕</button>`;

    row.querySelector('.conn-del').addEventListener('click', () => {
      room.connections.splice(idx, 1);
      renderConnections(room);
    });
    list.appendChild(row);
  });
}

function applyEdit() {
  const room = rooms.find(r => r.id === editId);
  if (!room) return;

  room.title       = $('f-title').value.trim();
  room.floor       = $('f-floor').value;
  room.description = $('f-desc').value.trim();
  room.exported_filename = $('f-exported').value.trim() || exportedName(room.order, room.title);

  // coleta conexões do DOM
  const rows = document.querySelectorAll('.conn-row');
  room.connections = Array.from(rows).map(r => ({
    target_room_id: r.querySelector('.conn-target').value,
    label:          r.querySelector('.conn-label').value.trim(),
    direction_hint: '',
  }));

  renderGrid();
  showStatus('Alterações aplicadas. Guarda o projeto para persistir.', 'ok');
}

/* ── Indexar Imagens ────────────────────────────────────────── */
async function indexImages() {
  showStatus('A indexar imagens…');
  $('btn-index').disabled = true;

  try {
    const res  = await fetch('/api/images');
    const data = await res.json();

    if (!res.ok) {
      showStatus(data.error || 'Erro ao indexar.', 'error');
      return;
    }

    allFiles = data.images;

    // Warnings
    const warnBox = $('warnings');
    const msgs = [];
    if (data.duplicates.length)
      msgs.push(`⚠ Duplicados ignorados: ${data.duplicates.join(', ')}`);
    if (data.non_equirectangular.length)
      msgs.push(`⚠ Não equiretangulares (não bloqueante): ${data.non_equirectangular.join(', ')}`);

    if (msgs.length) {
      warnBox.innerHTML = msgs.join('<br>');
      warnBox.classList.remove('hidden');
    } else {
      warnBox.classList.add('hidden');
    }

    // carrega projeto existente ou cria novo
    const projRes  = await fetch('/api/project');
    const projData = await projRes.json();

    if (projData.rooms && projData.rooms.length) {
      rooms = projData.rooms;
      projectMeta = {
        project_name:  projData.project_name  || '',
        source_folder: projData.source_folder || '',
        created_at:    projData.created_at    || new Date().toISOString(),
      };
      // adiciona ficheiros novos que não estejam no projeto
      const existing = new Set(rooms.map(r => r.original_filename));
      let order = rooms.length + 1;
      for (const f of allFiles) {
        if (!existing.has(f.filename)) {
          rooms.push(makeRoom(f, order++));
        }
      }
    } else {
      const config = await (await fetch('/api/config')).json();
      projectMeta = {
        project_name:  config.project_name,
        source_folder: config.source_folder,
        created_at:    new Date().toISOString(),
      };
      rooms = allFiles.map((f, i) => makeRoom(f, i + 1));
    }

    reorder();
    toggleButtons(true);
    showStatus(`${allFiles.length} imagens indexadas.`, 'ok');
    $('project-name').textContent = projectMeta.project_name;

  } catch (e) {
    showStatus('Erro de ligação: ' + e.message, 'error');
  } finally {
    $('btn-index').disabled = false;
  }
}

function makeRoom(f, order) {
  return {
    id:                genId(),
    order,
    original_filename: f.filename,
    exported_filename: exportedName(order, ''),
    title:             '',
    floor:             '',
    description:       '',
    connections:       [],
  };
}

/* ── Guardar Projeto ────────────────────────────────────────── */
async function saveProject() {
  showStatus('A guardar…');
  const payload = {
    ...projectMeta,
    updated_at: new Date().toISOString(),
    rooms,
  };
  const res  = await fetch('/api/project', { method: 'POST', headers: {'Content-Type':'application/json'}, body: JSON.stringify(payload) });
  const data = await res.json();
  showStatus(data.message || (res.ok ? 'Guardado.' : 'Erro.'), res.ok ? 'ok' : 'error');
}

/* ── Exportar XML ───────────────────────────────────────────── */
async function exportXML() {
  await saveProject();
  showStatus('A exportar XML…');
  const res  = await fetch('/api/export/xml', { method: 'POST' });
  const data = await res.json();
  if (res.ok) {
    showModal('modal-result', 'XML Exportado', `Ficheiro criado em:\n${data.path}`);
  } else {
    showStatus(data.error || 'Erro ao exportar XML.', 'error');
  }
}

/* ── Exportar Pacote Final ──────────────────────────────────── */
async function exportPackage() {
  await saveProject();
  showStatus('A exportar pacote final…');
  const res  = await fetch('/api/export/package', { method: 'POST' });
  const data = await res.json();
  const lines = [
    data.message, '',
    data.copied.length ? `Imagens exportadas:\n${data.copied.map(c => '  ' + c).join('\n')}` : '',
    data.errors.length ? `\nErros:\n${data.errors.map(e => '  ' + e).join('\n')}` : '',
  ].filter(Boolean).join('\n');
  showModal('modal-result', 'Pacote Final', lines);
  showStatus(data.message, res.ok ? 'ok' : 'error');
}

/* ── Relatório ──────────────────────────────────────────────── */
async function showReport() {
  const res  = await fetch('/api/report');
  const text = await res.text();
  $('report-content').textContent = text;
  $('modal-report').classList.remove('hidden');
}

/* ── Event Listeners ────────────────────────────────────────── */
$('btn-index').addEventListener('click', indexImages);
$('btn-save').addEventListener('click', saveProject);
$('btn-xml').addEventListener('click', exportXML);
$('btn-package').addEventListener('click', exportPackage);
$('btn-report').addEventListener('click', showReport);
$('panel-close').addEventListener('click', closePanel);
$('btn-cancel-edit').addEventListener('click', closePanel);
$('btn-apply').addEventListener('click', applyEdit);

$('btn-add-conn').addEventListener('click', () => {
  const room = rooms.find(r => r.id === editId);
  if (!room) return;
  room.connections.push({ target_room_id: '', label: '', direction_hint: '' });
  renderConnections(room);
});

document.querySelectorAll('.modal-close').forEach(btn => {
  btn.addEventListener('click', () => $(btn.dataset.target).classList.add('hidden'));
});

document.querySelectorAll('.modal').forEach(m => {
  m.addEventListener('click', e => { if (e.target === m) m.classList.add('hidden'); });
});

/* ── Init ───────────────────────────────────────────────────── */
(async () => {
  const config = await (await fetch('/api/config')).json();
  $('project-name').textContent = config.project_name || '—';
  renderGrid();
})();
