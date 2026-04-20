// assignment.js — Lógica de asignación diaria (S: solo asignaciones)
// Paradigma funcional puro — sin efectos secundarios

import { DAYS, createAssignment } from '../core/types.js';

/**
 * Distribuye miembros activos en los días de la semana.
 * Algoritmo round-robin: si hay más días que miembros, se repite.
 * @param {import('../core/types.js').Member[]} members
 * @param {string} weekStartDate — ISO date del lunes de la semana
 * @returns {import('../core/types.js').Assignment[]}
 */
export const generateWeekAssignments = (members, weekStartDate) => {
  const active = members.filter(m => m.active);
  if (active.length === 0) return [];

  return DAYS.map((day, index) => {
    const member = active[index % active.length];
    return createAssignment(member.id, day, weekStartDate);
  });
};

/**
 * Obtiene las asignaciones de la semana actual.
 * @param {import('../core/types.js').Assignment[]} assignments
 * @param {string} weekStartDate
 * @returns {import('../core/types.js').Assignment[]}
 */
export const getAssignmentsForWeek = (assignments, weekStartDate) =>
  assignments.filter(a => a.date === weekStartDate);

/**
 * Obtiene el ISO date del lunes de la semana actual.
 * @returns {string}
 */
export const getCurrentWeekMonday = () => {
  const today = new Date();
  const day = today.getDay(); // 0=dom, 1=lun...
  const diff = today.getDate() - day + (day === 0 ? -6 : 1);
  const monday = new Date(today.setDate(diff));
  return monday.toISOString().split('T')[0];
};

/**
 * Obtiene el miembro asignado a un día específico.
 * @param {import('../core/types.js').Assignment[]} weekAssignments
 * @param {import('../core/types.js').Member[]} members
 * @param {string} day
 * @returns {import('../core/types.js').Member | null}
 */
export const getMemberForDay = (weekAssignments, members, day) => {
  const assignment = weekAssignments.find(a => a.day === day);
  if (!assignment) return null;
  return members.find(m => m.id === assignment.memberId) ?? null;
};
