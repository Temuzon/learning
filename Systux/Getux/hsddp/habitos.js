/**
 * habitos.js — Sección de gestión de hábitos, tareas e identidad
 */
/* global el, setText, show, hide, openModal, closeModal, Habits, Tasks, Logs, Identity, IdentityReport, todayStr, formatFrequency, getWeeklyIdentityReport */

const Habitos = (() => {
  let _pendingHabitData = null; // data waiting for identity connection
  let _nodeCurrentSel = [];
  let _nodeTargetSel = [];

  /* ============================================
     RENDER PRINCIPAL
     ============================================ */
  function render() {
    renderHabitsList();
    renderTasksList();
    renderIdentityPanel();
    bindButtons();
  }

  /* ============================================
     HABITS LIST
     ============================================ */
  function renderHabitsList() {
    const container = el('habits-list');
    if (!container) return;
    const habits = Habits.list();
    const identity = Identity.get();

    if (!habits.length) {
      container.innerHTML = '<p class="items-empty">No hay rutinas. Crea una con el botón de arriba.</p>';
      return;
    }

    container.innerHTML = habits.map(h => {
      const connections = getHabitConnections(h, identity);
      const connBadge = connections ? `<span class="habit-identity-badge">${connections}</span>` : '';
      return `
        <div class="item-row">
          <span class="priority-dot ${h.priority || 'medium'}"></span>
          <span class="item-row-name">${h.name}</span>
          ${connBadge}
          <span class="item-row-meta">${formatFrequency(h.frequency)}</span>
          <div class="item-row-actions">
            <button class="item-action-btn" data-action="edit-habit" data-id="${h.id}">Editar</button>
            <button class="item-action-btn delete" data-action="delete-habit" data-id="${h.id}">Eliminar</button>
          </div>
        </div>`;
    }).join('');

    container.querySelectorAll('[data-action]').forEach(btn => {
      btn.addEventListener('click', handleItemAction);
    });
  }

  function getHabitConnections(habit, identity) {
    const currentLabels = (habit.current_identity_ids || [])
      .map(id => identity.current.find(t => t.id === id)?.label)
      .filter(Boolean);
    const targetLabels = (habit.target_identity_ids || [])
      .map(id => identity.target.find(t => t.id === id)?.label)
      .filter(Boolean);
    if (!currentLabels.length && !targetLabels.length) return null;
    const parts = [];
    if (currentLabels.length) parts.push(`-${currentLabels.join(', ')}`);
    if (targetLabels.length) parts.push(`+${targetLabels.join(', ')}`);
    return parts.join(' → ');
  }

  /* ============================================
     TASKS LIST
     ============================================ */
  function renderTasksList() {
    const container = el('tasks-list');
    if (!container) return;
    const tasks = Tasks.list();

    if (!tasks.length) {
      container.innerHTML = '<p class="items-empty">No hay tareas. Crea una con el botón de arriba.</p>';
      return;
    }

    container.innerHTML = tasks.map(t => `
      <div class="item-row">
        <span class="priority-dot ${t.priority || 'medium'}"></span>
        <span class="item-row-name">${t.name}</span>
        <span class="item-row-meta">${t.due_date || '—'}</span>
        <span class="item-row-meta">${t.completed ? '✓ Completada' : ''}</span>
        <div class="item-row-actions">
          <button class="item-action-btn" data-action="edit-task" data-id="${t.id}">Editar</button>
          <button class="item-action-btn delete" data-action="delete-task" data-id="${t.id}">Eliminar</button>
        </div>
      </div>`).join('');

    container.querySelectorAll('[data-action]').forEach(btn => {
      btn.addEventListener('click', handleItemAction);
    });
  }

  /* ============================================
     IDENTITY PANEL
     ============================================ */
  function renderIdentityPanel() {
    const identity = Identity.get();
    renderCurrentTags(identity.current);
    renderTargetTags(identity.target);
    renderNodeVisualization(identity);
  }

  function renderCurrentTags(tags) {
    const container = el('current-identity-tags');
    if (!container) return;
    container.innerHTML = tags.map(t => `
      <span class="identity-tag current-tag">
        ${t.label}
        <button class="identity-tag-remove" data-tag-id="${t.id}" data-tag-type="current">✕</button>
      </span>`).join('');
    container.querySelectorAll('.identity-tag-remove').forEach(btn => {
      btn.addEventListener('click', () => {
        Identity.removeCurrent(btn.dataset.tagId);
        renderIdentityPanel();
      });
    });
  }

  function renderTargetTags(tags) {
    const container = el('target-identity-tags');
    if (!container) return;
    container.innerHTML = tags.map(t => `
      <span class="identity-tag target-tag">
        ${t.label}
        <button class="identity-tag-remove" data-tag-id="${t.id}" data-tag-type="target">✕</button>
      </span>`).join('');
    container.querySelectorAll('.identity-tag-remove').forEach(btn => {
      btn.addEventListener('click', () => {
        Identity.removeTarget(btn.dataset.tagId);
        renderIdentityPanel();
      });
    });
  }

  /* ============================================
     NODE VISUALIZATION (SVG)
     ============================================ */
  function renderNodeVisualization(identity) {
    const svg = el('identity-svg');
    if (!svg) return;

    const habits = Habits.list().filter(h =>
      (h.current_identity_ids && h.current_identity_ids.length) ||
      (h.target_identity_ids && h.target_identity_ids.length)
    );

    const W = svg.parentElement ? svg.parentElement.clientWidth || 180 : 180;
    const H = 220;
    svg.setAttribute('viewBox', `0 0 ${W} ${H}`);

    if (!identity.current.length && !identity.target.length) {
      svg.innerHTML = `<text x="${W/2}" y="${H/2}" text-anchor="middle" fill="#444" font-size="10" font-family="JetBrains Mono, monospace">Sin identidades</text>`;
      return;
    }

    let svgContent = '';

    // Positions
    const midX = W / 2;
    const currentY = 24;
    const habitY = H / 2;
    const targetY = H - 24;

    // Collect connected habits
    const connectedHabitIds = new Set();
    habits.forEach(h => connectedHabitIds.add(h.id));

    const habitList = habits.slice(0, 5);
    const habitCount = habitList.length;
    const habitXStep = habitCount > 1 ? (W - 40) / (habitCount - 1) : 0;

    // Draw connections
    habitList.forEach((h, i) => {
      const hx = habitCount === 1 ? midX : 20 + i * habitXStep;

      // Lines to current identity nodes
      (h.current_identity_ids || []).forEach(cid => {
        const ctag = identity.current.find(t => t.id === cid);
        if (!ctag) return;
        const cidx = identity.current.findIndex(t => t.id === cid);
        const cCount = identity.current.length;
        const cx = cCount === 1 ? midX : 20 + cidx * ((W - 40) / Math.max(cCount - 1, 1));
        svgContent += `<line x1="${cx}" y1="${currentY + 8}" x2="${hx}" y2="${habitY - 8}" stroke="#f87171" stroke-width="0.8" stroke-opacity="0.4" stroke-dasharray="3,3"/>`;
      });

      // Lines to target identity nodes
      (h.target_identity_ids || []).forEach(tid => {
        const ttag = identity.target.find(t => t.id === tid);
        if (!ttag) return;
        const tidx = identity.target.findIndex(t => t.id === tid);
        const tCount = identity.target.length;
        const tx = tCount === 1 ? midX : 20 + tidx * ((W - 40) / Math.max(tCount - 1, 1));
        svgContent += `<line x1="${hx}" y1="${habitY + 8}" x2="${tx}" y2="${targetY - 8}" stroke="#4ade80" stroke-width="0.8" stroke-opacity="0.4" stroke-dasharray="3,3"/>`;
      });
    });

    // Draw current identity nodes
    identity.current.forEach((t, i) => {
      const count = identity.current.length;
      const cx = count === 1 ? midX : 20 + i * ((W - 40) / Math.max(count - 1, 1));
      svgContent += `
        <circle cx="${cx}" cy="${currentY}" r="6" fill="#1a0000" stroke="#f87171" stroke-width="1.2"/>
        <text x="${cx}" y="${currentY - 10}" text-anchor="middle" fill="#f87171" font-size="8" font-family="Inter,sans-serif">${truncate(t.label, 10)}</text>`;
    });

    // Draw habit nodes
    habitList.forEach((h, i) => {
      const hx = habitCount === 1 ? midX : 20 + i * habitXStep;
      svgContent += `
        <circle cx="${hx}" cy="${habitY}" r="5" fill="#222" stroke="#555" stroke-width="1"/>
        <text x="${hx}" y="${habitY + 16}" text-anchor="middle" fill="#888" font-size="7.5" font-family="Inter,sans-serif">${truncate(h.name, 11)}</text>`;
    });

    // Draw target identity nodes
    identity.target.forEach((t, i) => {
      const count = identity.target.length;
      const tx = count === 1 ? midX : 20 + i * ((W - 40) / Math.max(count - 1, 1));
      svgContent += `
        <circle cx="${tx}" cy="${targetY}" r="6" fill="#001a00" stroke="#4ade80" stroke-width="1.2"/>
        <text x="${tx}" y="${targetY + 18}" text-anchor="middle" fill="#4ade80" font-size="8" font-family="Inter,sans-serif">${truncate(t.label, 10)}</text>`;
    });

    // Labels
    if (identity.current.length) {
      svgContent += `<text x="2" y="10" fill="#f87171" font-size="8" font-family="Inter,sans-serif" opacity="0.6">ACTUAL</text>`;
    }
    if (identity.target.length) {
      svgContent += `<text x="2" y="${H - 2}" fill="#4ade80" font-size="8" font-family="Inter,sans-serif" opacity="0.6">OBJETIVO</text>`;
    }

    svg.innerHTML = svgContent;
  }

  function truncate(str, max) {
    return str.length > max ? str.slice(0, max) + '…' : str;
  }

  /* ============================================
     HABIT FORM
     ============================================ */
  function openHabitForm(habit) {
    el('habit-edit-id').value = habit ? habit.id : '';
    el('habit-name').value = habit ? habit.name : '';
    el('habit-purpose').value = habit ? habit.purpose : '';
    el('habit-benefit').value = habit ? habit.benefit || '' : '';
    el('habit-frequency').value = habit ? habit.frequency : 'daily';
    el('habit-priority').value = habit ? habit.priority : 'medium';
    el('habit-difficulty').value = habit ? habit.difficulty : 'moderate';
    el('habit-time').value = habit ? habit.schedule_time || '' : '';

    // Custom days
    const selectedDays = habit ? (habit.custom_days || []) : [];
    qsa('.day-btn').forEach(btn => {
      btn.classList.toggle('active', selectedDays.includes(parseInt(btn.dataset.day)));
    });
    toggleCustomDays(el('habit-frequency').value);

    // Identity connect tags
    renderIdentityConnectTags(habit);

    // Error reset
    hide('habit-error');

    // Button label
    const isEdit = !!habit;
    setText('btn-save-habit', isEdit ? 'Guardar Cambios' : 'Crear Rutina');
    setText('btn-save-connect-habit', isEdit ? 'Guardar y Conectar' : 'Crear y Conectar');
    setText('modal-habit-title', isEdit ? 'Editar Rutina' : 'Nueva Rutina');

    if (isEdit) {
      hide('btn-save-connect-habit');
      show('btn-save-habit');
    } else {
      show('btn-save-connect-habit');
      show('btn-save-habit');
    }

    openModal('modal-habit');
  }

  function renderIdentityConnectTags(habit) {
    const container = el('identity-connect-tags');
    if (!container) return;
    const identity = Identity.get();
    const allTags = [
      ...identity.current.map(t => ({ ...t, type: 'current' })),
      ...identity.target.map(t => ({ ...t, type: 'target' })),
    ];

    if (!allTags.length) {
      container.innerHTML = '<span class="connect-empty">No hay identidades definidas aún.</span>';
      return;
    }

    const currentIds = habit ? (habit.current_identity_ids || []) : [];
    const targetIds = habit ? (habit.target_identity_ids || []) : [];

    container.innerHTML = allTags.map(t => {
      const isSelCurrent = t.type === 'current' && currentIds.includes(t.id);
      const isSelTarget = t.type === 'target' && targetIds.includes(t.id);
      const selCls = isSelCurrent ? 'selected-current' : isSelTarget ? 'selected-target' : '';
      return `<button type="button" class="connect-tag-btn ${selCls}" data-id="${t.id}" data-type="${t.type}">${t.label}</button>`;
    }).join('');

    container.querySelectorAll('.connect-tag-btn').forEach(btn => {
      btn.addEventListener('click', () => {
        btn.classList.toggle(btn.dataset.type === 'current' ? 'selected-current' : 'selected-target');
        // Unselect if was selected as other type
      });
    });
  }

  function getFormHabitData() {
    const name = el('habit-name').value.trim();
    const purpose = el('habit-purpose').value.trim();
    if (!name) { showHabitError('Nombre requerido.'); return null; }
    if (!purpose) { showHabitError('Propósito obligatorio.'); return null; }

    const identity = Identity.get();
    const selectedCurrentIds = [];
    const selectedTargetIds = [];

    qsa('.connect-tag-btn.selected-current').forEach(btn => selectedCurrentIds.push(btn.dataset.id));
    qsa('.connect-tag-btn.selected-target').forEach(btn => selectedTargetIds.push(btn.dataset.id));

    const frequency = el('habit-frequency').value;
    const custom_days = [];
    if (frequency === 'custom') {
      qsa('.day-btn.active').forEach(btn => custom_days.push(parseInt(btn.dataset.day)));
    }

    return {
      name,
      purpose,
      benefit: el('habit-benefit').value.trim(),
      frequency,
      custom_days,
      priority: el('habit-priority').value,
      difficulty: el('habit-difficulty').value,
      schedule_time: el('habit-time').value,
      active: true,
      current_identity_ids: selectedCurrentIds,
      target_identity_ids: selectedTargetIds,
    };
  }

  function showHabitError(msg) {
    const e = el('habit-error');
    if (e) { e.textContent = msg; e.classList.remove('hidden'); }
  }

  function toggleCustomDays(freq) {
    const g = el('custom-days-group');
    if (g) g.classList.toggle('hidden', freq !== 'custom');
  }

  /* ============================================
     TASK FORM
     ============================================ */
  function openTaskForm(task) {
    el('task-edit-id').value = task ? task.id : '';
    el('task-name').value = task ? task.name : '';
    el('task-purpose').value = task ? task.purpose : '';
    el('task-date').value = task ? (task.due_date || todayStr()) : todayStr();
    el('task-priority').value = task ? task.priority : 'medium';
    hide('task-error');
    setText('modal-task-title', task ? 'Editar Tarea' : 'Nueva Tarea');
    setText('btn-save-task', task ? 'Guardar Cambios' : 'Crear Tarea');
    openModal('modal-task');
  }

  /* ============================================
     NODE CONNECTION MODAL
     ============================================ */
  function openNodeModal(habitData) {
    _pendingHabitData = habitData;
    _nodeCurrentSel = habitData.current_identity_ids || [];
    _nodeTargetSel = habitData.target_identity_ids || [];

    setText('node-modal-habit-name', habitData.name);

    const identity = Identity.get();

    const currentList = el('node-current-list');
    const targetList = el('node-target-list');

    if (currentList) {
      currentList.innerHTML = identity.current.length
        ? identity.current.map(t => `
            <button class="node-tag-btn ${_nodeCurrentSel.includes(t.id) ? 'current-sel' : ''}" data-id="${t.id}" data-type="current">${t.label}</button>
          `).join('')
        : '<p class="items-empty text-sm">Sin identidades actuales.</p>';

      currentList.querySelectorAll('.node-tag-btn').forEach(btn => {
        btn.addEventListener('click', () => {
          const id = btn.dataset.id;
          if (_nodeCurrentSel.includes(id)) {
            _nodeCurrentSel = _nodeCurrentSel.filter(x => x !== id);
            btn.classList.remove('current-sel');
          } else {
            _nodeCurrentSel.push(id);
            btn.classList.add('current-sel');
          }
          renderNodePreview(identity);
        });
      });
    }

    if (targetList) {
      targetList.innerHTML = identity.target.length
        ? identity.target.map(t => `
            <button class="node-tag-btn ${_nodeTargetSel.includes(t.id) ? 'target-sel' : ''}" data-id="${t.id}" data-type="target">${t.label}</button>
          `).join('')
        : '<p class="items-empty text-sm">Sin identidades objetivo.</p>';

      targetList.querySelectorAll('.node-tag-btn').forEach(btn => {
        btn.addEventListener('click', () => {
          const id = btn.dataset.id;
          if (_nodeTargetSel.includes(id)) {
            _nodeTargetSel = _nodeTargetSel.filter(x => x !== id);
            btn.classList.remove('target-sel');
          } else {
            _nodeTargetSel.push(id);
            btn.classList.add('target-sel');
          }
          renderNodePreview(identity);
        });
      });
    }

    renderNodePreview(identity);
    closeModal('modal-habit');
    openModal('modal-identity-node');
  }

  function renderNodePreview(identity) {
    const svg = el('node-preview-svg');
    if (!svg) return;
    const W = svg.parentElement ? (svg.parentElement.clientWidth || 560) : 560;
    const H = 180;
    svg.setAttribute('viewBox', `0 0 ${W} ${H}`);

    const midX = W / 2;
    const habitY = H / 2;
    const currentY = 28;
    const targetY = H - 28;

    let content = '';

    // Current nodes
    _nodeCurrentSel.forEach((id, i) => {
      const tag = identity.current.find(t => t.id === id);
      if (!tag) return;
      const count = _nodeCurrentSel.length;
      const cx = count === 1 ? midX : 60 + i * ((W - 120) / Math.max(count - 1, 1));
      content += `<line x1="${cx}" y1="${currentY + 8}" x2="${midX}" y2="${habitY - 10}" stroke="#f87171" stroke-width="0.8" stroke-opacity="0.5" stroke-dasharray="3,2"/>`;
      content += `<circle cx="${cx}" cy="${currentY}" r="7" fill="#1a0000" stroke="#f87171" stroke-width="1.2"/>`;
      content += `<text x="${cx}" y="${currentY - 12}" text-anchor="middle" fill="#f87171" font-size="9" font-family="Inter,sans-serif">${tag.label}</text>`;
    });

    // Target nodes
    _nodeTargetSel.forEach((id, i) => {
      const tag = identity.target.find(t => t.id === id);
      if (!tag) return;
      const count = _nodeTargetSel.length;
      const tx = count === 1 ? midX : 60 + i * ((W - 120) / Math.max(count - 1, 1));
      content += `<line x1="${midX}" y1="${habitY + 10}" x2="${tx}" y2="${targetY - 8}" stroke="#4ade80" stroke-width="0.8" stroke-opacity="0.5" stroke-dasharray="3,2"/>`;
      content += `<circle cx="${tx}" cy="${targetY}" r="7" fill="#001a00" stroke="#4ade80" stroke-width="1.2"/>`;
      content += `<text x="${tx}" y="${targetY + 20}" text-anchor="middle" fill="#4ade80" font-size="9" font-family="Inter,sans-serif">${tag.label}</text>`;
    });

    // Habit node (center)
    const habitLabel = _pendingHabitData ? _pendingHabitData.name : '';
    content += `<circle cx="${midX}" cy="${habitY}" r="9" fill="#222" stroke="#666" stroke-width="1.5"/>`;
    content += `<text x="${midX}" y="${habitY + 4}" text-anchor="middle" fill="#ccc" font-size="8.5" font-family="Inter,sans-serif">${truncate(habitLabel, 14)}</text>`;

    if (!_nodeCurrentSel.length && !_nodeTargetSel.length) {
      content += `<text x="${midX}" y="${H - 10}" text-anchor="middle" fill="#444" font-size="9" font-family="Inter,sans-serif">Selecciona identidades para conectar</text>`;
    }

    svg.innerHTML = content;
  }

  /* ============================================
     ACTION HANDLERS
     ============================================ */
  function handleItemAction(e) {
    const btn = e.currentTarget;
    const action = btn.dataset.action;
    const id = btn.dataset.id;

    switch (action) {
      case 'edit-habit': openHabitForm(Habits.find(id)); break;
      case 'delete-habit': confirmDelete('¿Eliminar esta rutina y sus registros?', () => {
        Habits.remove(id); render();
      }); break;
      case 'edit-task': openTaskForm(Tasks.find(id)); break;
      case 'delete-task': confirmDelete('¿Eliminar esta tarea?', () => {
        Tasks.remove(id); render();
      }); break;
    }
  }

  let _pendingDeleteFn = null;
  function confirmDelete(msg, fn) {
    _pendingDeleteFn = fn;
    setText('confirm-text', msg);
    openModal('modal-confirm');
  }

  /* ============================================
     BIND BUTTONS
     ============================================ */
  function bindButtons() {
    // New Habit
    const btnHabit = el('btn-new-habit');
    if (btnHabit) btnHabit.onclick = () => openHabitForm(null);

    // New Task
    const btnTask = el('btn-new-task');
    if (btnTask) btnTask.onclick = () => openTaskForm(null);

    // Identity Panel Toggle
    const toggle = el('identity-panel-toggle');
    const content = el('identity-panel-content');
    const chevron = el('identity-chevron');
    if (toggle && content) {
      toggle.onclick = () => {
        content.classList.toggle('hidden');
        if (chevron) chevron.classList.toggle('open', !content.classList.contains('hidden'));
        if (!content.classList.contains('hidden')) renderIdentityPanel();
      };
    }

    // Add identity tags
    const btnAddCurrent = el('btn-add-current-tag');
    if (btnAddCurrent) {
      btnAddCurrent.onclick = () => {
        const input = el('new-current-tag');
        const val = input.value.trim();
        if (val) { Identity.addCurrent(val); input.value = ''; renderIdentityPanel(); }
      };
    }

    const btnAddTarget = el('btn-add-target-tag');
    if (btnAddTarget) {
      btnAddTarget.onclick = () => {
        const input = el('new-target-tag');
        const val = input.value.trim();
        if (val) { Identity.addTarget(val); input.value = ''; renderIdentityPanel(); }
      };
    }

    // Enter key for tag inputs
    ['new-current-tag', 'new-target-tag'].forEach(inputId => {
      const input = el(inputId);
      if (input) input.onkeydown = (e) => {
        if (e.key === 'Enter') {
          e.preventDefault();
          const isTarget = inputId.includes('target');
          if (isTarget) el('btn-add-target-tag').click();
          else el('btn-add-current-tag').click();
        }
      };
    });

    // Habit frequency change
    const freqSel = el('habit-frequency');
    if (freqSel) freqSel.onchange = () => toggleCustomDays(freqSel.value);

    // Save Habit (without connect)
    const btnSaveHabit = el('btn-save-habit');
    if (btnSaveHabit) {
      btnSaveHabit.onclick = () => {
        const data = getFormHabitData();
        if (!data) return;
        const editId = el('habit-edit-id').value;
        if (editId) Habits.update(editId, data);
        else Habits.create(data);
        closeModal('modal-habit');
        render();
      };
    }

    // Save Habit + Connect
    const btnSaveConnect = el('btn-save-connect-habit');
    if (btnSaveConnect) {
      btnSaveConnect.onclick = () => {
        const data = getFormHabitData();
        if (!data) return;
        openNodeModal(data);
      };
    }

    // Save Node Connection
    const btnSaveNode = el('btn-save-node');
    if (btnSaveNode) {
      btnSaveNode.onclick = () => {
        if (!_pendingHabitData) return;
        const finalData = {
          ..._pendingHabitData,
          current_identity_ids: _nodeCurrentSel,
          target_identity_ids: _nodeTargetSel,
        };
        const editId = el('habit-edit-id').value;
        if (editId) Habits.update(editId, finalData);
        else Habits.create(finalData);
        _pendingHabitData = null;
        closeModal('modal-identity-node');
        render();
      };
    }

    // Save Task
    const btnSaveTask = el('btn-save-task');
    if (btnSaveTask) {
      btnSaveTask.onclick = () => {
        const name = el('task-name').value.trim();
        const purpose = el('task-purpose').value.trim();
        if (!name) { showTaskError('Nombre requerido.'); return; }
        if (!purpose) { showTaskError('Propósito obligatorio.'); return; }
        const data = {
          name,
          purpose,
          due_date: el('task-date').value,
          priority: el('task-priority').value,
        };
        const editId = el('task-edit-id').value;
        if (editId) Tasks.update(editId, data);
        else Tasks.create(data);
        closeModal('modal-task');
        render();
      };
    }

    // Confirm delete
    const btnConfirm = el('btn-confirm-delete');
    if (btnConfirm) {
      btnConfirm.onclick = () => {
        if (_pendingDeleteFn) { _pendingDeleteFn(); _pendingDeleteFn = null; }
        closeModal('modal-confirm');
      };
    }
  }

  function showTaskError(msg) {
    const e = el('task-error');
    if (e) { e.textContent = msg; e.classList.remove('hidden'); }
  }

  return { render };
})();
