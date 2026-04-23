// ═══════════════════════════════════════════════════
//  app.js — Cronograma de Aseo · ADSO SENA 2026
//  Fase 6: Refactorización — Patrones de Diseño
//
//  Patrones implementados:
//  [FACTORY]   — crearTarjetaDia() fabrica elementos DOM
//  [STRATEGY]  — elegirAlAzar() es una estrategia intercambiable
//  [MODULE]    — cada bloque es un módulo con responsabilidad propia
//  [OBSERVER]  — addEventListener desacopla eventos de acciones
// ═══════════════════════════════════════════════════


// ───────────────────────────────────────────────────
//  [MODULE] CONFIGURACIÓN
//  Módulo de datos estáticos de la aplicación.
//  Centraliza toda la configuración en un solo lugar.
// ───────────────────────────────────────────────────

const DIAS_SEMANA = ['lunes', 'martes', 'miércoles', 'jueves', 'viernes'];

const COLOR_POR_DIA = {
  lunes:     '#4A6FA5',
  martes:    '#6B9E78',
  miércoles: '#9B6B9E',
  jueves:    '#8C8C8C',
  viernes:   '#C4A84F',
};

const INTEGRANTES_POR_DIA = {
  lunes: [
    'Alisson Paola Jaramillo Echeverry',
    'Carlos Andrés Zuluaga Atehortua',
    'Daniela Zapata López',
    'David Antonio Pescador Durán',
  ],
  martes: [
    'David Buendia Ruiz',
    'Eric Daniel Barreto Chavez',
    'Jhoan Steven Murillo García',
    'Jhon Alejandro Patiño Agudelo',
  ],
  miércoles: [
    'Juan Camilo Valencia Rey',
    'Juan Carlos Combita Sandoval',
    'Juan David Ferrer Castillo',
    'Juan José Santamaria Muñoz',
  ],
  jueves: [
    'Julián David Flórez Vera',
    'Maria Fernanda Huertas Montes',
    'Nelson Fabián Gallego Sánchez',
    'Santiago Moreno Piedrahita',
    'Santiago Palacio Tovar',
  ],
  viernes: [
    'Santiago Tovar Zambrano',
    'Sebastian Ortega Barrero',
    'Stiven Andrés Robles Galán',
    'Valeria Arcila Hernández',
    'Valeria Becerra Giraldo',
  ],
};

const CLAVE_STORAGE  = 'aseo_reemplazos';
const DURACION_TOAST = 3000;


// ───────────────────────────────────────────────────
//  [MODULE] PERSISTENCIA
//  Módulo encargado exclusivamente de guardar
//  y recuperar datos del navegador.
// ───────────────────────────────────────────────────

/**
 * Guarda reemplazos en localStorage.
 * @param {Object} reemplazos
 */
const guardarReemplazos = (reemplazos) =>
  localStorage.setItem(CLAVE_STORAGE, JSON.stringify(reemplazos));

/**
 * Carga reemplazos desde localStorage.
 * @returns {Object}
 */
const cargarReemplazos = () => {
  const datos = localStorage.getItem(CLAVE_STORAGE);
  return datos ? JSON.parse(datos) : {};
};

/**
 * Elimina los reemplazos guardados.
 */
const borrarReemplazos = () =>
  localStorage.removeItem(CLAVE_STORAGE);


// ───────────────────────────────────────────────────
//  [MODULE] FECHAS
//  Módulo de utilidades para cálculo de fechas.
// ───────────────────────────────────────────────────

/**
 * Retorna la fecha ISO del lunes de la semana actual.
 * @returns {string}
 */
const obtenerLunesActual = () => {
  const hoy        = new Date();
  const diaSemana  = hoy.getDay();
  const diasHastaLunes = diaSemana === 0 ? -6 : 1 - diaSemana;
  const lunes      = new Date(hoy);
  lunes.setDate(hoy.getDate() + diasHastaLunes);
  return lunes.toISOString().split('T')[0];
};

/**
 * Formatea una fecha ISO como etiqueta legible en español.
 * @param {string} fechaISO
 * @returns {string}
 */
const formatearEtiquetaSemana = (fechaISO) => {
  const fecha = new Date(fechaISO + 'T12:00:00');
  return 'Semana del ' + fecha.toLocaleDateString('es-CO', {
    day: 'numeric', month: 'long', year: 'numeric',
  });
};


// ───────────────────────────────────────────────────
//  [STRATEGY] ESTRATEGIA DE SELECCIÓN
//
//  El patrón Strategy permite tener varias formas
//  de seleccionar un reemplazo sin cambiar el resto
//  del sistema. Hoy usamos selección aleatoria, pero
//  podría cambiarse por "el que menos ha reemplazado"
//  o "el primero disponible" sin tocar ninguna otra
//  función — solo se intercambia la estrategia.
// ───────────────────────────────────────────────────

/**
 * [STRATEGY] Estrategia aleatoria de selección.
 * Elige un elemento al azar de un arreglo.
 * Para cambiar la estrategia, reemplaza esta función
 * por otra con la misma firma: (string[]) => string | null
 * @param {string[]} candidatos
 * @returns {string | null}
 */
const elegirAlAzar = (candidatos) => {
  if (candidatos.length === 0) return null;
  return candidatos[Math.floor(Math.random() * candidatos.length)];
};

/**
 * Obtiene los candidatos a reemplazo (integrantes de otros días).
 * @param {string} diaExcluido
 * @returns {string[]}
 */
const obtenerCandidatosReemplazo = (diaExcluido) =>
  DIAS_SEMANA
    .filter(dia => dia !== diaExcluido)
    .flatMap(dia => INTEGRANTES_POR_DIA[dia]);

/**
 * Orquesta el registro de una ausencia usando la estrategia activa.
 * @param {string} dia
 * @param {string} nombreAusente
 */
const registrarAusencia = (dia, nombreAusente) => {
  const candidatos = obtenerCandidatosReemplazo(dia);
  const reemplazo  = elegirAlAzar(candidatos); // ← estrategia intercambiable

  if (!reemplazo) {
    mostrarNotificacion('No hay candidatos disponibles.', 'error');
    return;
  }

  const reemplazos = cargarReemplazos();
  if (!reemplazos[dia]) reemplazos[dia] = {};
  reemplazos[dia][nombreAusente] = reemplazo;

  guardarReemplazos(reemplazos);
  pintarGrilla(reemplazos);
  mostrarNotificacion(
    `${reemplazo} reemplazará a ${nombreAusente.split(' ')[0]} el ${dia}.`,
    'exito'
  );
};


// ───────────────────────────────────────────────────
//  [MODULE] PLANTILLAS HTML
//  Módulo de construcción de fragmentos de UI.
//  Cada función genera un único fragmento HTML.
// ───────────────────────────────────────────────────

/** @param {string} nombre @param {string} reemplazo @returns {string} */
const htmlIntegranteAusente = (nombre, reemplazo) => `
  <div class="integrante-dia ausente">
    <span class="nombre-tachado">${nombre}</span>
    <span class="nombre-reemplazo">↪ ${reemplazo}</span>
  </div>
`;

/** @param {string} nombre @param {string} dia @returns {string} */
const htmlIntegranteActivo = (nombre, dia) => `
  <div class="integrante-dia">
    <div class="integrante-info">
      <span class="punto-dia"></span>
      <span class="nombre-integrante">${nombre}</span>
    </div>
    <button class="btn-ausencia-mini" data-dia="${dia}" data-nombre="${nombre}">✕</button>
  </div>
`;

/** @param {string} dia @returns {string} */
const htmlCabeceraTarjeta = (dia) => `
  <div class="tarjeta-cabecera">
    <div class="dia-nombre">${dia.charAt(0).toUpperCase() + dia.slice(1)}</div>
  </div>
`;

/**
 * Normaliza el nombre del día para usarlo como clase CSS.
 * @param {string} dia @returns {string}
 */
const diaAClaseCSS = (dia) =>
  dia.normalize('NFD').replace(/[\u0300-\u036f]/g, '');


// ───────────────────────────────────────────────────
//  [FACTORY] FÁBRICA DE TARJETAS
//
//  El patrón Factory centraliza la creación de objetos
//  complejos. crearTarjetaDia() es una fábrica:
//  recibe datos simples (nombre del día, reemplazos)
//  y devuelve un elemento DOM completamente armado,
//  con su HTML, clases y eventos conectados.
//
//  Ventaja: el resto del código no sabe cómo se
//  construye una tarjeta — solo la solicita.
// ───────────────────────────────────────────────────

/**
 * [FACTORY] Fabrica un elemento DOM de tarjeta de día.
 * Encapsula toda la lógica de construcción:
 * HTML, clases CSS y eventos del botón de ausencia.
 * @param {string} dia
 * @param {Object} reemplazosDelDia - { [nombre]: nombreReemplazo }
 * @returns {HTMLElement}
 */
const crearTarjetaDia = (dia, reemplazosDelDia) => {
  const listaHTML = INTEGRANTES_POR_DIA[dia].map(nombre => {
    const reemplazo = reemplazosDelDia[nombre];
    return reemplazo
      ? htmlIntegranteAusente(nombre, reemplazo)
      : htmlIntegranteActivo(nombre, dia);
  }).join('');

  const tarjeta = document.createElement('div');
  tarjeta.className = `tarjeta-dia ${diaAClaseCSS(dia)}`;
  tarjeta.innerHTML = `
    ${htmlCabeceraTarjeta(dia)}
    <div class="tarjeta-cuerpo">${listaHTML}</div>
  `;

  // [OBSERVER] Cada botón observa el evento 'click'
  // sin acoplarse directamente a registrarAusencia.
  tarjeta.querySelectorAll('.btn-ausencia-mini').forEach(btn => {
    btn.addEventListener('click', (e) => {
      registrarAusencia(e.target.dataset.dia, e.target.dataset.nombre);
    });
  });

  return tarjeta; // ← entrega el producto terminado
};


// ───────────────────────────────────────────────────
//  [MODULE] RENDERIZADO
//  Módulo que maneja la actualización del DOM.
// ───────────────────────────────────────────────────

/**
 * Renderiza la grilla completa usando la fábrica de tarjetas.
 * @param {Object} reemplazos
 */
const pintarGrilla = (reemplazos) => {
  const contenedor = document.getElementById('grilla-dias');
  contenedor.innerHTML = '';

  // Usa la FACTORY para crear cada tarjeta
  DIAS_SEMANA.forEach(dia => {
    const tarjeta = crearTarjetaDia(dia, reemplazos[dia] || {});
    contenedor.appendChild(tarjeta);
  });
};

/**
 * Muestra una notificación temporal en pantalla.
 * @param {string} mensaje
 * @param {'info'|'exito'|'error'} tipo
 */
const mostrarNotificacion = (mensaje, tipo = 'info') => {
  const existente = document.querySelector('.toast');
  if (existente) existente.remove();

  const toast = document.createElement('div');
  toast.className = `toast ${tipo}`;
  toast.textContent = mensaje;
  document.body.appendChild(toast);

  setTimeout(() => toast.classList.add('visible'), 10);
  setTimeout(() => {
    toast.classList.remove('visible');
    setTimeout(() => toast.remove(), 300);
  }, DURACION_TOAST);
};


// ───────────────────────────────────────────────────
//  [OBSERVER] ACCIONES DEL USUARIO
//
//  El patrón Observer desacopla los eventos del DOM
//  de la lógica de la aplicación. El botón no llama
//  directamente a las funciones — emite un evento
//  que es escuchado por un observer (addEventListener).
// ───────────────────────────────────────────────────

/**
 * [OBSERVER] Observa el click en "Reiniciar reemplazos".
 */
const reiniciarReemplazos = () => {
  if (!confirm('¿Limpiar todos los reemplazos de esta semana?')) return;
  borrarReemplazos();
  pintarGrilla({});
  mostrarNotificacion('Reemplazos eliminados.', 'info');
};


// ───────────────────────────────────────────────────
//  [OBSERVER] INICIO DE LA APLICACIÓN
//
//  DOMContentLoaded es el observer principal:
//  espera a que el DOM esté listo antes de iniciar.
// ───────────────────────────────────────────────────

/**
 * Punto de entrada — inicializa y conecta todos los módulos.
 */
const iniciarApp = () => {
  const lunes = obtenerLunesActual();
  document.getElementById('semana-label').textContent = formatearEtiquetaSemana(lunes);

  pintarGrilla(cargarReemplazos());

  // [OBSERVER] Conecta el botón al observer de reinicio
  document.getElementById('btn-limpiar').addEventListener('click', reiniciarReemplazos);
};

// [OBSERVER] Observer del ciclo de vida del documento
document.addEventListener('DOMContentLoaded', iniciarApp);