// ═══════════════════════════════════════════════════
//  app.js — Lógica completa de la aplicación
//  Fase 3: Módulos funcionales con grupos fijos
// ═══════════════════════════════════════════════════


// ───────────────────────────────────────────────────
//  CONFIGURACIÓN
//  Días, colores y grupos fijos por día
// ───────────────────────────────────────────────────

const DIAS = ['lunes', 'martes', 'miércoles', 'jueves', 'viernes'];

const COLORES_DIAS = {
  lunes:      { color: '#4A6FA5', etiqueta: 'Azul' },
  martes:     { color: '#6B9E78', etiqueta: 'Verde' },
  miércoles:  { color: '#9B6B9E', etiqueta: 'Violeta' },
  jueves:     { color: '#8C8C8C', etiqueta: 'Gris' },
  viernes:    { color: '#C4A84F', etiqueta: 'Amarillo' },
};

const GRUPOS_FIJOS = {
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


// ───────────────────────────────────────────────────
//  PERSISTENCIA
//  Guardar y cargar reemplazos en localStorage
//  (Los grupos fijos no necesitan guardarse)
// ───────────────────────────────────────────────────

const guardarReemplazos = (reemplazos) => {
  localStorage.setItem('aseo_reemplazos', JSON.stringify(reemplazos));
};

const cargarReemplazos = () => {
  const datos = localStorage.getItem('aseo_reemplazos');
  return datos ? JSON.parse(datos) : {};
};


// ───────────────────────────────────────────────────
//  LÓGICA DE FECHAS
// ───────────────────────────────────────────────────

const obtenerLunesSemana = () => {
  const hoy = new Date();
  const diaSemana = hoy.getDay();
  const diferencia = diaSemana === 0 ? -6 : 1 - diaSemana;
  const lunes = new Date(hoy);
  lunes.setDate(hoy.getDate() + diferencia);
  return lunes.toISOString().split('T')[0];
};

const formatearFechaSemana = (fechaISO) => {
  const fecha = new Date(fechaISO + 'T12:00:00');
  return 'Semana del ' + fecha.toLocaleDateString('es-CO', {
    day: 'numeric',
    month: 'long',
    year: 'numeric',
  });
};


// ───────────────────────────────────────────────────
//  ALGORITMO DE REEMPLAZO
//  Selecciona aleatoriamente a alguien de otro día
// ───────────────────────────────────────────────────

const seleccionarReemplazo = (diaOriginal, nombreAusente) => {
  // Recoger todos los integrantes de otros días
  const candidatos = DIAS
    .filter(d => d !== diaOriginal)
    .flatMap(d => GRUPOS_FIJOS[d]);

  if (candidatos.length === 0) return null;

  const indiceAleatorio = Math.floor(Math.random() * candidatos.length);
  return candidatos[indiceAleatorio];
};


// ───────────────────────────────────────────────────
//  RENDERIZADO
//  Pintar la UI con los grupos por día
// ───────────────────────────────────────────────────

const pintarGrillaDias = (reemplazos) => {
  const contenedor = document.getElementById('grilla-dias');
  contenedor.innerHTML = '';

  DIAS.forEach(dia => {
    const config = COLORES_DIAS[dia];
    const grupo = GRUPOS_FIJOS[dia];
    const reemplazosDelDia = reemplazos[dia] || {};

    // Clase CSS según el día (sin tildes para el className)
    const claseDia = dia.replace('é', 'e').replace('i', 'i');

    const tarjeta = document.createElement('div');
    tarjeta.className = `tarjeta-dia ${claseDia}`;

    // Lista de integrantes del día
    const listaHTML = grupo.map(nombre => {
      const reemplazo = reemplazosDelDia[nombre];
      if (reemplazo) {
        return `
          <div class="integrante-dia ausente">
            <span class="nombre-tachado">${nombre}</span>
            <span class="nombre-reemplazo">↪ ${reemplazo}</span>
          </div>
        `;
      }
      return `
        <div class="integrante-dia">
          <div class="integrante-info">
            <span class="punto-dia"></span>
            <span class="nombre-integrante">${nombre}</span>
          </div>
          <button class="btn-ausencia-mini" data-dia="${dia}" data-nombre="${nombre}">✕</button>
        </div>
      `;
    }).join('');

    tarjeta.innerHTML = `
      <div class="tarjeta-cabecera">
        <div class="dia-nombre">${dia.charAt(0).toUpperCase() + dia.slice(1)}</div>
      </div>
      <div class="tarjeta-cuerpo">${listaHTML}</div>
    `;

    // Eventos de ausencia
    tarjeta.querySelectorAll('.btn-ausencia-mini').forEach(btn => {
      btn.addEventListener('click', (e) => {
        manejarAusencia(e.target.dataset.dia, e.target.dataset.nombre);
      });
    });

    contenedor.appendChild(tarjeta);
  });
};

const mostrarToast = (mensaje, tipo = 'info') => {
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
  }, 3000);
};


// ───────────────────────────────────────────────────
//  ACCIONES
// ───────────────────────────────────────────────────

const manejarAusencia = (dia, nombreAusente) => {
  const reemplazo = seleccionarReemplazo(dia, nombreAusente);

  if (!reemplazo) {
    mostrarToast('No hay candidatos disponibles.', 'error');
    return;
  }

  const reemplazos = cargarReemplazos();

  // Crear el objeto del día si no existe
  if (!reemplazos[dia]) reemplazos[dia] = {};
  reemplazos[dia][nombreAusente] = reemplazo;

  guardarReemplazos(reemplazos);
  pintarGrillaDias(reemplazos);
  mostrarToast(`${reemplazo} reemplazará a ${nombreAusente.split(' ')[0]} el ${dia}.`, 'exito');
};

const limpiarReemplazos = () => {
  if (!confirm('¿Limpiar todos los reemplazos de esta semana?')) return;
  localStorage.removeItem('aseo_reemplazos');
  pintarGrillaDias({});
  mostrarToast('Reemplazos eliminados.', 'info');
};


// ───────────────────────────────────────────────────
//  INICIO
// ───────────────────────────────────────────────────

const iniciar = () => {
  // Mostrar semana actual
  const fechaSemana = obtenerLunesSemana();
  document.getElementById('semana-label').textContent = formatearFechaSemana(fechaSemana);

  // Cargar reemplazos guardados y pintar
  const reemplazos = cargarReemplazos();
  pintarGrillaDias(reemplazos);

  // Conectar botón limpiar
  document.getElementById('btn-limpiar').addEventListener('click', limpiarReemplazos);
};

document.addEventListener('DOMContentLoaded', iniciar);