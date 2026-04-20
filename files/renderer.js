// renderer.js — Renderizado DOM (S: solo UI, D: recibe datos, no los busca)
// Funciones puras de renderizado — no tienen estado propio

import { DAY_COLORS, DAYS } from '../core/types.js';

/**
 * Renderiza la tabla semanal de asignaciones.
 * @param {Object} params
 * @param {HTMLElement} params.container
 * @param {import('../core/types.js').Assignment[]} params.weekAssignments
 * @param {import('../core/types.js').Member[]} params.members
 * @param {Function} params.onReplace  — callback(day, memberId)
 */
export const renderWeekTable = ({ container, weekAssignments, members, onReplace }) => {
  container.innerHTML = '';

  const table = document.createElement('div');
  table.className = 'week-grid';

  DAYS.forEach(day => {
    const assignment = weekAssignments.find(a => a.day === day);
    const member = assignment
      ? members.find(m => m.id === assignment.memberId)
      : null;

    const color = DAY_COLORS[day];
    const card = document.createElement('div');
    card.className = 'day-card';
    card.style.setProperty('--day-color', color.bg);

    card.innerHTML = `
      <div class="day-header">
        <span class="day-name">${day.charAt(0).toUpperCase() + day.slice(1)}</span>
        <span class="day-badge" style="background:${color.bg}">${color.label}</span>
      </div>
      <div class="day-member">
        ${member
          ? `<span class="member-name">${member.name}</span>`
          : `<span class="member-empty">Sin asignar</span>`
        }
      </div>
      ${member ? `
        <button class="btn-replace" data-day="${day}" data-member-id="${member.id}">
          ↺ Reportar ausencia
        </button>
      ` : ''}
    `;

    if (member) {
      card.querySelector('.btn-replace').addEventListener('click', (e) => {
        onReplace(e.target.dataset.day, e.target.dataset.memberId);
      });
    }

    table.appendChild(card);
  });

  container.appendChild(table);
};

/**
 * Renderiza la lista de miembros del grupo.
 */
export const renderMemberList = ({ container, members, onToggle, onRemove }) => {
  container.innerHTML = '';

  if (members.length === 0) {
    container.innerHTML = '<p class="empty-state">No hay integrantes registrados.</p>';
    return;
  }

  members.forEach(member => {
    const item = document.createElement('div');
    item.className = `member-item ${member.active ? 'active' : 'inactive'}`;
    item.innerHTML = `
      <div class="member-info">
        <span class="member-status-dot"></span>
        <span class="member-item-name">${member.name}</span>
      </div>
      <div class="member-actions">
        <button class="btn-toggle" data-id="${member.id}">
          ${member.active ? 'Desactivar' : 'Activar'}
        </button>
        <button class="btn-remove" data-id="${member.id}" title="Eliminar">✕</button>
      </div>
    `;

    item.querySelector('.btn-toggle').addEventListener('click', () => onToggle(member.id));
    item.querySelector('.btn-remove').addEventListener('click', () => onRemove(member.id));
    container.appendChild(item);
  });
};

/**
 * Muestra una notificación temporal.
 */
export const showToast = (message, type = 'info') => {
  const existing = document.querySelector('.toast');
  if (existing) existing.remove();

  const toast = document.createElement('div');
  toast.className = `toast toast-${type}`;
  toast.textContent = message;
  document.body.appendChild(toast);

  requestAnimationFrame(() => toast.classList.add('visible'));
  setTimeout(() => {
    toast.classList.remove('visible');
    setTimeout(() => toast.remove(), 300);
  }, 3000);
};
