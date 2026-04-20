// events.js — Event bus (D: inversión de dependencias via eventos)
// Patrón Observer puro con arrow functions (Paradigma Funcional)

const createEventBus = () => {
  const listeners = {};

  const on = (event, callback) => {
    if (!listeners[event]) listeners[event] = [];
    listeners[event].push(callback);
    // Retorna función para desuscribirse (I: no fuerza interfaz innecesaria)
    return () => off(event, callback);
  };

  const off = (event, callback) => {
    if (!listeners[event]) return;
    listeners[event] = listeners[event].filter(cb => cb !== callback);
  };

  const emit = (event, payload) => {
    if (!listeners[event]) return;
    listeners[event].forEach(cb => cb(payload));
  };

  return { on, off, emit };
};

// Singleton del bus de eventos de la app
export const eventBus = createEventBus();

// Catálogo de eventos disponibles (I: contratos explícitos)
export const EVENTS = {
  MEMBERS_UPDATED:     'members:updated',
  ASSIGNMENTS_UPDATED: 'assignments:updated',
  MEMBER_REPLACED:     'member:replaced',
  STATE_LOADED:        'state:loaded',
};
