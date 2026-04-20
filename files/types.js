// types.js — Contratos del dominio (S: define entidades, no comportamiento)

/**
 * @typedef {Object} Member
 * @property {string} id
 * @property {string} name
 * @property {boolean} active
 */

/**
 * @typedef {Object} Assignment
 * @property {string} memberId
 * @property {string} day        // 'lunes' | 'martes' | ...
 * @property {string} date       // ISO string
 */

/**
 * @typedef {Object} AppState
 * @property {Member[]} members
 * @property {Assignment[]} assignments
 */

export const DAYS = ['lunes', 'martes', 'miércoles', 'jueves', 'viernes'];

export const DAY_COLORS = {
  lunes:      { bg: '#4A6FA5', label: 'Azul' },
  martes:     { bg: '#6B9E78', label: 'Verde' },
  miércoles:  { bg: '#9B6B9E', label: 'Violeta' },
  jueves:     { bg: '#8C8C8C', label: 'Gris' },
  viernes:    { bg: '#C4A84F', label: 'Amarillo' },
};

/** Crea un nuevo miembro con valores por defecto */
export const createMember = (id, name) => ({
  id,
  name,
  active: true,
});

/** Crea una asignación */
export const createAssignment = (memberId, day, date) => ({
  memberId,
  day,
  date,
});
