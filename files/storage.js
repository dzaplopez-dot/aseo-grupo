// storage.js — Capa de persistencia (S: solo persistencia, D: recibe config)

/**
 * Fábrica de almacenamiento — inyecta config para evitar acoplamiento
 * @param {Object} keys — { members, assignments }
 */
export const createStorage = (keys) => {

  const save = (key, data) => {
    try {
      localStorage.setItem(key, JSON.stringify(data));
      return true;
    } catch (e) {
      console.error(`[Storage] Error guardando "${key}":`, e);
      return false;
    }
  };

  const load = (key, fallback = null) => {
    try {
      const raw = localStorage.getItem(key);
      return raw ? JSON.parse(raw) : fallback;
    } catch (e) {
      console.error(`[Storage] Error cargando "${key}":`, e);
      return fallback;
    }
  };

  const remove = (key) => {
    try {
      localStorage.removeItem(key);
      return true;
    } catch (e) {
      return false;
    }
  };

  // API pública — solo expone lo necesario (I: Interface Segregation)
  return {
    saveMembers:      (members)     => save(keys.members, members),
    loadMembers:      ()            => load(keys.members, []),
    saveAssignments:  (assignments) => save(keys.assignments, assignments),
    loadAssignments:  ()            => load(keys.assignments, []),
    clearAll:         ()            => {
      remove(keys.members);
      remove(keys.assignments);
    },
  };
};
