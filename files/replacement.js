// replacement.js — Algoritmo de reemplazo (S: solo reemplazo, O: estrategia inyectable)

/**
 * Selecciona un reemplazante aleatorio del grupo activo,
 * excluyendo al miembro original.
 * @param {import('../core/types.js').Member[]} members
 * @param {string} excludeMemberId
 * @returns {import('../core/types.js').Member | null}
 */
export const selectRandomReplacement = (members, excludeMemberId) => {
  const candidates = members.filter(m => m.active && m.id !== excludeMemberId);
  if (candidates.length === 0) return null;

  const randomIndex = Math.floor(Math.random() * candidates.length);
  return candidates[randomIndex];
};

/**
 * Aplica el reemplazo en la lista de asignaciones.
 * Retorna un NUEVO array (inmutabilidad — paradigma funcional).
 * @param {import('../core/types.js').Assignment[]} assignments
 * @param {string} day
 * @param {string} newMemberId
 * @param {string} weekDate
 * @returns {import('../core/types.js').Assignment[]}
 */
export const applyReplacement = (assignments, day, newMemberId, weekDate) =>
  assignments.map(a =>
    (a.day === day && a.date === weekDate)
      ? { ...a, memberId: newMemberId }
      : a
  );

/**
 * Composición: selecciona y aplica reemplazo en un solo paso.
 * @param {import('../core/types.js').Assignment[]} assignments
 * @param {import('../core/types.js').Member[]} members
 * @param {string} day
 * @param {string} originalMemberId
 * @param {string} weekDate
 * @returns {{ updatedAssignments: Assignment[], replacement: Member | null }}
 */
export const handleAbsence = (assignments, members, day, originalMemberId, weekDate) => {
  const replacement = selectRandomReplacement(members, originalMemberId);
  if (!replacement) return { updatedAssignments: assignments, replacement: null };

  const updatedAssignments = applyReplacement(assignments, day, replacement.id, weekDate);
  return { updatedAssignments, replacement };
};
