// main.js — Raíz de composición (D: inyecta todas las dependencias)
// Este es el único lugar donde los módulos se "conocen" entre sí

import { CONFIG } from './core/config.js';
import { eventBus, EVENTS } from './core/events.js';
import { createMember } from './core/types.js';
import { createStorage } from './data/storage.js';
import {
  generateWeekAssignments,
  getAssignmentsForWeek,
  getCurrentWeekMonday,
} from './logic/assignment.js';
import { handleAbsence } from './logic/replacement.js';
import { renderWeekTable, renderMemberList, showToast } from './ui/renderer.js';

// ─── Bootstrap ───────────────────────────────────────────────────────────────

const init = () => {
  // 1. Instanciar dependencias
  const storage = createStorage(CONFIG.storageKeys);

  // 2. Cargar estado inicial
  let state = {
    members: storage.loadMembers(),
    assignments: storage.loadAssignments(),
    currentWeek: getCurrentWeekMonday(),
  };

  // 3. Referencias DOM
  const weekContainer    = document.getElementById('week-container');
  const memberContainer  = document.getElementById('member-list');
  const addMemberForm    = document.getElementById('add-member-form');
  const memberNameInput  = document.getElementById('member-name-input');
  const generateBtn      = document.getElementById('btn-generate');
  const clearBtn         = document.getElementById('btn-clear');
  const weekLabel        = document.getElementById('week-label');

  // ─── Helpers de actualización de estado ──────────────────────────────────

  const updateState = (patch) => {
    state = { ...state, ...patch };
  };

  const saveAndEmitMembers = () => {
    storage.saveMembers(state.members);
    eventBus.emit(EVENTS.MEMBERS_UPDATED, state.members);
  };

  const saveAndEmitAssignments = () => {
    storage.saveAssignments(state.assignments);
    eventBus.emit(EVENTS.ASSIGNMENTS_UPDATED, state.assignments);
  };

  // ─── Lógica de UI ────────────────────────────────────────────────────────

  const refreshWeekView = () => {
    const weekAssignments = getAssignmentsForWeek(state.assignments, state.currentWeek);
    renderWeekTable({
      container: weekContainer,
      weekAssignments,
      members: state.members,
      onReplace: handleReplaceRequest,
    });
  };

  const refreshMemberView = () => {
    renderMemberList({
      container: memberContainer,
      members: state.members,
      onToggle: handleToggleMember,
      onRemove: handleRemoveMember,
    });
  };

  // ─── Handlers ────────────────────────────────────────────────────────────

  const handleReplaceRequest = (day, originalMemberId) => {
    const { updatedAssignments, replacement } = handleAbsence(
      state.assignments,
      state.members,
      day,
      originalMemberId,
      state.currentWeek,
    );

    if (!replacement) {
      showToast('No hay integrantes disponibles para reemplazar.', 'error');
      return;
    }

    updateState({ assignments: updatedAssignments });
    saveAndEmitAssignments();
    showToast(`${replacement.name} reemplazará en ${day}.`, 'success');
    eventBus.emit(EVENTS.MEMBER_REPLACED, { day, replacement });
  };

  const handleAddMember = (e) => {
    e.preventDefault();
    const name = memberNameInput.value.trim();
    if (!name) return;

    const id = `member_${Date.now()}`;
    const newMember = createMember(id, name);
    updateState({ members: [...state.members, newMember] });
    saveAndEmitMembers();
    memberNameInput.value = '';
    showToast(`${name} agregado al grupo.`, 'success');
  };

  const handleToggleMember = (memberId) => {
    const updated = state.members.map(m =>
      m.id === memberId ? { ...m, active: !m.active } : m
    );
    updateState({ members: updated });
    saveAndEmitMembers();
  };

  const handleRemoveMember = (memberId) => {
    const member = state.members.find(m => m.id === memberId);
    if (!confirm(`¿Eliminar a ${member?.name}?`)) return;
    const updated = state.members.filter(m => m.id !== memberId);
    updateState({ members: updated });
    saveAndEmitMembers();
    showToast(`${member?.name} eliminado.`, 'info');
  };

  const handleGenerateWeek = () => {
    if (state.members.filter(m => m.active).length === 0) {
      showToast('Agrega integrantes activos primero.', 'error');
      return;
    }
    const newAssignments = generateWeekAssignments(state.members, state.currentWeek);
    // Reemplaza solo las asignaciones de la semana actual
    const otherWeeks = state.assignments.filter(a => a.date !== state.currentWeek);
    updateState({ assignments: [...otherWeeks, ...newAssignments] });
    saveAndEmitAssignments();
    showToast('¡Semana generada exitosamente!', 'success');
  };

  const handleClear = () => {
    if (!confirm('¿Limpiar todos los datos?')) return;
    storage.clearAll();
    updateState({ members: [], assignments: [] });
    eventBus.emit(EVENTS.MEMBERS_UPDATED, []);
    eventBus.emit(EVENTS.ASSIGNMENTS_UPDATED, []);
    showToast('Datos eliminados.', 'info');
  };

  // ─── Suscripciones al Event Bus ──────────────────────────────────────────

  eventBus.on(EVENTS.MEMBERS_UPDATED, () => {
    refreshMemberView();
    refreshWeekView();
  });

  eventBus.on(EVENTS.ASSIGNMENTS_UPDATED, () => {
    refreshWeekView();
  });

  // ─── Event Listeners del DOM ─────────────────────────────────────────────

  addMemberForm.addEventListener('submit', handleAddMember);
  generateBtn.addEventListener('click', handleGenerateWeek);
  clearBtn.addEventListener('click', handleClear);

  // ─── Render inicial ──────────────────────────────────────────────────────

  const formatWeekLabel = (isoDate) => {
    const d = new Date(isoDate + 'T12:00:00');
    return `Semana del ${d.toLocaleDateString('es-CO', { day: 'numeric', month: 'long', year: 'numeric' })}`;
  };

  weekLabel.textContent = formatWeekLabel(state.currentWeek);
  refreshMemberView();
  refreshWeekView();
  eventBus.emit(EVENTS.STATE_LOADED, state);
};

// Punto de entrada
document.addEventListener('DOMContentLoaded', init);
