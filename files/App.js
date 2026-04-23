// ═══════════════════════════════════════════════════
//  app.js — Cronograma de Aseo · ADSO SENA 2026
//  Fase 4: Clean Code
// ═══════════════════════════════════════════════════


// ───────────────────────────────────────────────────
//  CONFIGURACIÓN
// ───────────────────────────────────────────────────

/** Orden de los días de la semana laboral */
const DIAS_SEMANA = ['lunes', 'martes', 'miércoles', 'jueves', 'viernes'];

/** Color de acento por día */
const COLOR_POR_DIA = {
  lunes:     '#4A6FA5',
  martes:    '#6B9E78',
  miércoles: '#9B6B9E',
  jueves:    '#8C8C8C',
  viernes:   '#C4A84F',
};

/** Grupos fijos de integrantes por día */
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

/** Clave usada para guardar reemplazos en localStorage */
const CLAVE_STORAGE = 'aseo_reemplazos';

/** Duración en ms que se muestra la notificación toast */
const DURACION_TOAST = 3000;


// ───────────────────────────────────────────────────
//  PERSISTENCIA
// ───────────────────────────────────────────────────

/**
 * Guarda el mapa de reemplazos en localStorage.
 * @param {Object} reemplazos - { [dia]: { [nombre]: nombreReemplazo } }
 */
const guardarReemplazos = (reemplazos) => {
  localStorage.setItem(CLAVE_STORAGE, JSON.stringify(reemplazos));
};

/**
 * Carga el mapa de reemplazos desde localStorage.
 * Retorna un objeto vacío si no hay datos guardados.
 * @returns {Object}
 */
const cargarReemplazos = () => {
  const datos = localStorage.getItem(CLAVE_STORAGE);
  return datos ? JSON.parse(datos) : {};
};

/**
 * Elimina todos los reemplazos guardados.
 */
const borrarReemplazos = () => {
  localStorage.removeItem(CLAVE_STORAGE);
};


// ───────────────────────────────────────────────────
//  FECHAS
// ───────────────────────────────────────────────────

/**
 * Retorna la fecha ISO (YYYY-MM-DD) del lunes de la semana actual.
 * @returns {string}
 */
const obtenerLunesActual = () => {
  const hoy = new Date();
  const diaSemana = hoy.getDay(); // 0 = domingo, 1 = lunes...
  const diasHastaLunes = diaSemana === 0 ? -6 : 1 - diaSemana;
  const lunes = new Date(hoy);
  lunes.setDate(hoy.getDate() + diasHastaLunes);
  return lunes.toISOString().split('T')[0];
};

/**
 * Convierte una fecha ISO a texto legible en español.
 * Ejemplo: "2026-04-20" → "Semana del 20 de abril de 2026"
 * @param {string} fechaISO
 * @returns {string}
 */
const formatearEtiquetaSemana = (fechaISO) => {
  const fecha = new Date(fechaISO + 'T12:00:00');
  const fechaFormateada = fecha.toLocaleDateString('es-CO', {
    day: 'numeric',
    month: 'long',
    year: 'numeric',
  });
  return `Semana del ${fechaFormateada}`;
};


// ───────────────────────────────────────────────────
//  REEMPLAZO
// ───────────────────────────────────────────────────

/**
 * Obtiene todos los integrantes que NO son del día indicado.
 * @param {string} diaExcluido
 * @returns {string[]}
 */
const obtenerCandidatosReemplazo = (diaExcluido) =>
  DIAS_SEMANA
    .filter(dia => dia !== diaExcluido)
    .flatMap(dia => INTEGRANTES_POR_DIA[dia]);

/**
 * Selecciona un integrante al azar de la lista de candidatos.
 * Retorna null si no hay candidatos disponibles.
 * @param {string[]} candidatos
 * @returns {string | null}
 */
const elegirAlAzar = (candidatos) => {
  if (candidatos.length === 0) return null;
  const indice = Math.floor(Math.random() * candidatos.length);
  return candidatos[indice];
};

/**
 * Registra la ausencia de un integrante y asigna su reemplazo.
 * @param {string} dia
 * @param {string} nombreAusente
 */
const registrarAusencia = (dia, nombreAusente) => {
  const candidatos = obtenerCandidatosReemplazo(dia);
  const reemplazo = elegirAlAzar(candidatos);

  if (!reemplazo) {
    mostrarNotificacion('No hay candidatos disponibles.', 'error');
    return;
  }

  const reemplazos = cargarReemplazos();
  if (!reemplazos[dia]) reemplazos[dia] = {};
  reemplazos[dia][nombreAusente] = reemplazo;

  guardarReemplazos(reemplazos);
  pintarGrilla(reemplazos);

  const primerNombre = nombreAusente.split(' ')[0];
  mostrarNotificacion(`${reemplazo} reemplazará a ${primerNombre} el ${dia}.`, 'exito');
};


// ───────────────────────────────────────────────────
//  CONSTRUCCIÓN DE HTML
// ───────────────────────────────────────────────────

/**
 * Genera el HTML de un integrante con reemplazo activo.
 * @param {string} nombre
 * @param {string} reemplazo
 * @returns {string}
 */
const htmlIntegranteAusente = (nombre, reemplazo) => `
  <div class="integrante-dia ausente">
    <span class="nombre-tachado">${nombre}</span>
    <span class="nombre-reemplazo">↪ ${reemplazo}</span>
  </div>
`;

/**
 * Genera el HTML de un integrante activo con botón de ausencia.
 * @param {string} nombre
 * @param {string} dia
 * @returns {string}
 */
const htmlIntegranteActivo = (nombre, dia) => `
  <div class="integrante-dia">
    <div class="integrante-info">
      <span class="punto-dia"></span>
      <span class="nombre-integrante">${nombre}</span>
    </div>
    <button class="btn-ausencia-mini" data-dia="${dia}" data-nombre="${nombre}">✕</button>
  </div>
`;

/**
 * Genera el HTML de la cabecera de una tarjeta de día.
 * @param {string} dia
 * @returns {string}
 */
const htmlCabeceraTarjeta = (dia) => `
  <div class="tarjeta-cabecera">
    <div class="dia-nombre">${dia.charAt(0).toUpperCase() + dia.slice(1)}</div>
  </div>
`;

/**
 * Convierte el nombre del día a una clase CSS válida (sin tildes).
 * Ejemplo: "miércoles" → "miercoles"
 * @param {string} dia
 * @returns {string}
 */
const diaAClaseCSS = (dia) =>
  dia.normalize('NFD').replace(/[\u0300-\u036f]/g, '');


// ───────────────────────────────────────────────────
//  RENDERIZADO
// ───────────────────────────────────────────────────

/**
 * Construye y retorna el elemento DOM de una tarjeta de día.
 * @param {string} dia
 * @param {Object} reemplazosDelDia - { [nombre]: nombreReemplazo }
 * @returns {HTMLElement}
 */
const crearTarjetaDia = (dia, reemplazosDelDia) => {
  const integrantes = INTEGRANTES_POR_DIA[dia];

  const listaHTML = integrantes.map(nombre => {
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

  // Conectar botones de ausencia
  tarjeta.querySelectorAll('.btn-ausencia-mini').forEach(btn => {
    btn.addEventListener('click', (e) => {
      registrarAusencia(e.target.dataset.dia, e.target.dataset.nombre);
    });
  });

  return tarjeta;
};

/**
 * Renderiza todas las tarjetas de días en el contenedor de la grilla.
 * @param {Object} reemplazos - { [dia]: { [nombre]: nombreReemplazo } }
 */
const pintarGrilla = (reemplazos) => {
  const contenedor = document.getElementById('grilla-dias');
  contenedor.innerHTML = '';

  DIAS_SEMANA.forEach(dia => {
    const reemplazosDelDia = reemplazos[dia] || {};
    const tarjeta = crearTarjetaDia(dia, reemplazosDelDia);
    contenedor.appendChild(tarjeta);
  });
};

/**
 * Muestra una notificación temporal en la esquina inferior derecha.
 * @param {string} mensaje
 * @param {'info' | 'exito' | 'error'} tipo
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
//  ACCIONES DEL USUARIO
// ───────────────────────────────────────────────────

/**
 * Maneja el click en "Reiniciar reemplazos":
 * pide confirmación, borra datos y repinta la grilla.
 */
const reiniciarReemplazos = () => {
  if (!confirm('¿Limpiar todos los reemplazos de esta semana?')) return;
  borrarReemplazos();
  pintarGrilla({});
  mostrarNotificacion('Reemplazos eliminados.', 'info');
};


// ───────────────────────────────────────────────────
//  INICIO DE LA APLICACIÓN
// ───────────────────────────────────────────────────

/**
 * Inicializa la aplicación:
 * muestra la semana actual, carga datos y conecta eventos.
 */
const iniciarApp = () => {
  const lunes = obtenerLunesActual();
  document.getElementById('semana-label').textContent = formatearEtiquetaSemana(lunes);

  const reemplazos = cargarReemplazos();
  pintarGrilla(reemplazos);

  document.getElementById('btn-limpiar').addEventListener('click', reiniciarReemplazos);
};

document.addEventListener('DOMContentLoaded', iniciarApp);