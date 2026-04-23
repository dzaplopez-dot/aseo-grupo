// ═══════════════════════════════════════════════════
//  app.js — Cronograma de Aseo · ADSO SENA 2026
//  Fase 5: SOLID — Trazabilidad de principios
//
//  [S] Single Responsibility — cada función hace UNA sola cosa
//  [O] Open/Closed          — abierto a extensión, cerrado a modificación
//  [L] Liskov               — funciones intercambiables sin romper el sistema
//  [I] Interface Segregation — cada función expone solo lo que necesita
//  [D] Dependency Inversion  — depende de abstracciones, no de detalles
// ═══════════════════════════════════════════════════


// ───────────────────────────────────────────────────
//  CONFIGURACIÓN
//  [O] Para agregar un nuevo día o cambiar colores,
//      solo se modifica este bloque. El resto del
//      código no necesita cambiar.
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
//  [S] Estas funciones solo se encargan de guardar
//      y cargar datos. No saben nada de la UI.
//  [I] Cada función expone solo una operación:
//      guardar, cargar o borrar.
// ───────────────────────────────────────────────────

/**
 * Guarda el mapa de reemplazos en localStorage.
 * [S] Responsabilidad única: persistir datos.
 * @param {Object} reemplazos - { [dia]: { [nombre]: nombreReemplazo } }
 */
const guardarReemplazos = (reemplazos) => {
  localStorage.setItem(CLAVE_STORAGE, JSON.stringify(reemplazos));
};

/**
 * Carga el mapa de reemplazos desde localStorage.
 * [S] Responsabilidad única: leer datos guardados.
 * [L] Si cambiamos localStorage por otra fuente,
 *     el resto del sistema no se entera.
 * @returns {Object}
 */
const cargarReemplazos = () => {
  const datos = localStorage.getItem(CLAVE_STORAGE);
  return datos ? JSON.parse(datos) : {};
};

/**
 * Elimina todos los reemplazos guardados.
 * [S] Responsabilidad única: borrar datos.
 */
const borrarReemplazos = () => {
  localStorage.removeItem(CLAVE_STORAGE);
};


// ───────────────────────────────────────────────────
//  FECHAS
//  [S] Solo se ocupan del cálculo y formato de fechas.
//      No tocan el DOM ni el localStorage.
// ───────────────────────────────────────────────────

/**
 * Retorna la fecha ISO del lunes de la semana actual.
 * [S] Responsabilidad única: calcular la fecha del lunes.
 * [L] Se puede reemplazar por otra lógica de fecha
 *     sin afectar el resto del sistema.
 * @returns {string} Ejemplo: "2026-04-20"
 */
const obtenerLunesActual = () => {
  const hoy = new Date();
  const diaSemana = hoy.getDay();
  const diasHastaLunes = diaSemana === 0 ? -6 : 1 - diaSemana;
  const lunes = new Date(hoy);
  lunes.setDate(hoy.getDate() + diasHastaLunes);
  return lunes.toISOString().split('T')[0];
};

/**
 * Convierte una fecha ISO a texto legible en español.
 * [S] Responsabilidad única: formatear la fecha.
 * [O] El locale 'es-CO' se puede cambiar sin tocar
 *     ninguna otra función.
 * @param {string} fechaISO
 * @returns {string} Ejemplo: "Semana del 20 de abril de 2026"
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
//  [S] Cada función tiene una sola responsabilidad:
//      obtener candidatos, elegir uno, o registrar.
//  [D] registrarAusencia depende de funciones
//      abstractas (cargar, guardar, pintar),
//      no de implementaciones concretas.
// ───────────────────────────────────────────────────

/**
 * Obtiene todos los integrantes que NO son del día indicado.
 * [S] Responsabilidad única: filtrar candidatos.
 * [I] Solo recibe el día excluido, nada más.
 * @param {string} diaExcluido
 * @returns {string[]}
 */
const obtenerCandidatosReemplazo = (diaExcluido) =>
  DIAS_SEMANA
    .filter(dia => dia !== diaExcluido)
    .flatMap(dia => INTEGRANTES_POR_DIA[dia]);

/**
 * Selecciona un elemento al azar de un arreglo.
 * [S] Responsabilidad única: elegir aleatoriamente.
 * [L] Se puede reemplazar por otra estrategia
 *     (por ejemplo, el menos usado) sin romper nada.
 * [O] Abierta a extensión: se podría recibir una
 *     estrategia como parámetro en el futuro.
 * @param {string[]} candidatos
 * @returns {string | null}
 */
const elegirAlAzar = (candidatos) => {
  if (candidatos.length === 0) return null;
  const indice = Math.floor(Math.random() * candidatos.length);
  return candidatos[indice];
};

/**
 * Orquesta el proceso completo de ausencia:
 * selecciona reemplazo, guarda y actualiza la UI.
 * [D] Depende de funciones abstractas:
 *     cargarReemplazos, guardarReemplazos, pintarGrilla.
 *     Si cambian internamente, esta función no cambia.
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
//  [S] Cada función genera solo un fragmento de HTML.
//  [I] Reciben solo los datos que necesitan.
// ───────────────────────────────────────────────────

/**
 * HTML de un integrante con reemplazo activo (ausente).
 * [S] Responsabilidad única: construir este fragmento.
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
 * HTML de un integrante activo con botón de ausencia.
 * [S] Responsabilidad única: construir este fragmento.
 * [I] Solo recibe nombre y día, nada más.
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
 * HTML de la cabecera de una tarjeta.
 * [S] Responsabilidad única: construir la cabecera.
 * @param {string} dia
 * @returns {string}
 */
const htmlCabeceraTarjeta = (dia) => `
  <div class="tarjeta-cabecera">
    <div class="dia-nombre">${dia.charAt(0).toUpperCase() + dia.slice(1)}</div>
  </div>
`;

/**
 * Convierte el nombre del día a una clase CSS válida sin tildes.
 * [S] Responsabilidad única: normalizar texto para CSS.
 * Ejemplo: "miércoles" → "miercoles"
 * @param {string} dia
 * @returns {string}
 */
const diaAClaseCSS = (dia) =>
  dia.normalize('NFD').replace(/[\u0300-\u036f]/g, '');


// ───────────────────────────────────────────────────
//  RENDERIZADO
//  [S] Cada función tiene una sola tarea de UI.
//  [D] pintarGrilla no sabe de dónde vienen los
//      reemplazos, solo los recibe y los pinta.
// ───────────────────────────────────────────────────

/**
 * Construye el elemento DOM completo de una tarjeta de día.
 * [S] Responsabilidad única: crear la tarjeta.
 * [D] Recibe los reemplazos como parámetro, no los busca.
 * @param {string} dia
 * @param {Object} reemplazosDelDia
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

  tarjeta.querySelectorAll('.btn-ausencia-mini').forEach(btn => {
    btn.addEventListener('click', (e) => {
      registrarAusencia(e.target.dataset.dia, e.target.dataset.nombre);
    });
  });

  return tarjeta;
};

/**
 * Renderiza todas las tarjetas en el contenedor de la grilla.
 * [S] Responsabilidad única: pintar la grilla completa.
 * [D] Recibe los reemplazos como parámetro,
 *     no accede directamente a localStorage.
 * @param {Object} reemplazos
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
 * Muestra una notificación temporal en pantalla.
 * [S] Responsabilidad única: mostrar feedback visual.
 * [I] Solo necesita el mensaje y el tipo.
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
//  [S] Cada acción responde a un solo evento.
// ───────────────────────────────────────────────────

/**
 * Reinicia todos los reemplazos de la semana.
 * [S] Responsabilidad única: manejar el reinicio.
 */
const reiniciarReemplazos = () => {
  if (!confirm('¿Limpiar todos los reemplazos de esta semana?')) return;
  borrarReemplazos();
  pintarGrilla({});
  mostrarNotificacion('Reemplazos eliminados.', 'info');
};


// ───────────────────────────────────────────────────
//  INICIO
//  [D] iniciarApp orquesta todo sin conocer detalles
//      internos de cada módulo.
// ───────────────────────────────────────────────────

/**
 * Punto de entrada de la aplicación.
 * [S] Responsabilidad única: inicializar y conectar módulos.
 * [D] Depende de abstracciones (funciones), no de
 *     implementaciones concretas de DOM o storage.
 */
const iniciarApp = () => {
  const lunes = obtenerLunesActual();
  document.getElementById('semana-label').textContent = formatearEtiquetaSemana(lunes);

  const reemplazos = cargarReemplazos();
  pintarGrilla(reemplazos);

  document.getElementById('btn-limpiar').addEventListener('click', reiniciarReemplazos);
};

document.addEventListener('DOMContentLoaded', iniciarApp);