// ══════════════════════════════════════
// MAIN.JS
// ══════════════════════════════════════

// ── SISTEMA DE PANTALLAS ──
function mostrarPantalla(idPantalla) {
  document.querySelectorAll('.screen').forEach(s => s.classList.remove('active'));
  document.getElementById(idPantalla).classList.add('active');
}

function mostrarPanel(idPanel) {
  document.querySelectorAll('.panel').forEach(p => p.classList.add('hidden'));
  document.getElementById('panel-' + idPanel).classList.remove('hidden');
  document.querySelectorAll('.btn-nav').forEach(b => b.classList.remove('activo'));
  document.querySelector(`.btn-nav[data-panel="${idPanel}"]`).classList.add('activo');
}

// ── MODAL ──
function mostrarModal(titulo, mensaje, onCerrar = null) {
  AudioMotor.modal();
  document.getElementById('modal-titulo').textContent  = titulo;
  document.getElementById('modal-mensaje').textContent = mensaje;
  document.getElementById('modal').classList.remove('hidden');
  document.getElementById('modal')._onCerrar = onCerrar;
}

document.getElementById('modal-cerrar').addEventListener('click', () => {
  const cb = document.getElementById('modal')._onCerrar;
  document.getElementById('modal').classList.add('hidden');
  if (typeof cb === 'function') cb();
});

// ── HEADER ──
function actualizarHeader() {
  document.getElementById('info-club-nombre').textContent = club.nombre.toUpperCase();
  document.getElementById('info-presupuesto').textContent = formatearDinero(club.presupuesto);
  document.getElementById('info-jornada').textContent     = club.jornada + ' / 9';
}

// ── RENDER HELPERS ──
const ORDEN_POSICIONES = { 'Portero':1,'Defensa':2,'Mediocampista':3,'Delantero':4 };
function ordenarPorPosicion(arr) {
  return [...arr].sort((a,b) => ORDEN_POSICIONES[a.posicion] - ORDEN_POSICIONES[b.posicion]);
}

function cardJugadorHTML(jugador, accionHTML) {
  return `
    <div class="card-jugador ${jugador.titular ? 'titular' : ''}">
      <div class="card-fila-principal">
        <div class="jugador-media">${jugador.media}</div>
        <div class="jugador-info">
          <span class="jugador-nombre">${jugador.nombre}</span>
          <span class="jugador-pos-edad">${jugador.posicion} · ${jugador.edad} años</span>
        </div>
        <span class="jugador-valor">${formatearDinero(jugador.valorMercado)}</span>
        ${accionHTML}
      </div>
      <div class="card-stats">
        <span class="stat-item">VEL <span>${jugador.stats.velocidad}</span></span>
        <span class="stat-item">DIS <span>${jugador.stats.disparo}</span></span>
        <span class="stat-item">PAS <span>${jugador.stats.pase}</span></span>
        <span class="stat-item">DEF <span>${jugador.stats.defensa}</span></span>
        <span class="stat-item">RES <span>${jugador.stats.resistencia}</span></span>
      </div>
    </div>
  `;
}

function renderConSeparadores(jugadores, generarAccion) {
  const ordenados = ordenarPorPosicion(jugadores);
  let html = '';
  let posActual = '';
  ordenados.forEach(j => {
    if (j.posicion !== posActual) {
      posActual = j.posicion;
      html += `<div class="separador-posicion">${posActual}s</div>`;
    }
    html += cardJugadorHTML(j, generarAccion(j));
  });
  return html;
}

// ── RENDERIZAR PLANTILLA ──
function renderizarPlantilla() {
  document.getElementById('lista-jugadores').innerHTML =
    renderConSeparadores(club.plantilla, j =>
      `<button onclick="accionVender(${j.id})">Vender</button>`
    );
}

// ── RENDERIZAR MERCADO ──
function renderizarMercado() {
  document.getElementById('lista-mercado').innerHTML =
    renderConSeparadores(club.mercado, j =>
      `<button onclick="accionFichar(${j.id})">Fichar</button>`
    );
}

// ── ACCIONES MERCADO ──
function accionFichar(idJugador) {
  const resultado = ficharJugador(idJugador);
  mostrarModal(resultado.ok ? '✅ FICHAJE' : '❌ ERROR', resultado.mensaje, () => {
    if (resultado.ok) {
      AudioMotor.fichaje();
      actualizarHeader(); renderizarMercado(); renderizarPlantilla();
    } else {
      AudioMotor.error();
    }
  });
}

function accionVender(idJugador) {
  const resultado = venderJugador(idJugador);
  mostrarModal(resultado.ok ? '💰 VENTA' : '❌ ERROR', resultado.mensaje, () => {
    if (resultado.ok) {
      AudioMotor.venta();
      actualizarHeader(); renderizarPlantilla();
    } else {
      AudioMotor.error();
    }
  });
}

// ── RENDERIZAR TÁCTICA ──
function renderizarTactica() {
  const suplentes = club.plantilla.filter(j => !j.titular);
  const totalTit  = club.titulares.length;
  const claseCount= totalTit < 11 ? 'alerta' : 'ok';

  document.getElementById('panel-tactica').innerHTML = `
    <div class="tactica-wrapper">
      <div class="tactica-seccion">
        <h4>⚽ ONCE TITULAR</h4>
        <p class="tactica-hint">Haz clic en un titular para quitarlo</p>
        ${ordenarPorPosicion(club.titulares).map(j => `
          <div class="card-jugador titular" onclick="quitarTitular(${j.id})" style="cursor:pointer">
            <div class="card-fila-principal">
              <div class="jugador-media">${j.media}</div>
              <div class="jugador-info">
                <span class="jugador-nombre">${j.nombre}</span>
                <span class="jugador-pos-edad">${j.posicion}</span>
              </div>
              <span class="tactica-accion">✕</span>
            </div>
          </div>
        `).join('')}
      </div>
      <div class="tactica-seccion">
        <h4>🪑 SUPLENTES</h4>
        <p class="tactica-hint">Haz clic para hacer titular</p>
        ${suplentes.length === 0
          ? '<p class="tactica-hint">No hay suplentes disponibles</p>'
          : ordenarPorPosicion(suplentes).map(j => `
            <div class="card-jugador" onclick="ponerTitular(${j.id})" style="cursor:pointer">
              <div class="card-fila-principal">
                <div class="jugador-media">${j.media}</div>
                <div class="jugador-info">
                  <span class="jugador-nombre">${j.nombre}</span>
                  <span class="jugador-pos-edad">${j.posicion}</span>
                </div>
                <span class="tactica-accion">+</span>
              </div>
            </div>
          `).join('')
        }
      </div>
    </div>
    <div class="tactica-contador ${claseCount}">
      TITULARES: ${totalTit} / 11
      ${totalTit < 11 ? ' — ⚠️ NECESITAS ' + (11 - totalTit) + ' MÁS' : ' ✓ LISTO'}
    </div>
  `;
}

function quitarTitular(idJugador) {
  const j = club.plantilla.find(j => j.id === idJugador);
  if (!j) return;
  j.titular = false;
  club.titulares = club.titulares.filter(j => j.id !== idJugador);
  renderizarTactica();
}

function ponerTitular(idJugador) {
  if (club.titulares.length >= 11) {
    AudioMotor.error();
    mostrarModal('❌ ERROR', 'Ya tienes 11 titulares. Quita uno primero.');
    return;
  }
  const j = club.plantilla.find(j => j.id === idJugador);
  if (!j) return;
  j.titular = true;
  club.titulares.push(j);
  renderizarTactica();
}

// ── TABLA DE LIGA ──
let equiposLiga = [];

function inicializarLiga(nombreClub) {
  const rivales = [
    'FC AMAZONAS','CLUB PACÍFICO','DEPORTIVO SUR',
    'ATHLETIC NORTE','REAL ANDINO','SPORTING LIMA',
    'CF COSTERO','UNIDOS FC','CLUB ESTRELLA'
  ];
  equiposLiga = [
    { nombre:nombreClub, esJugador:true,  pj:0,g:0,e:0,p:0,gf:0,gc:0,pts:0 },
    ...rivales.map(n => ({ nombre:n, esJugador:false, pj:0,g:0,e:0,p:0,gf:0,gc:0,pts:0 }))
  ];
}

function simularJornadaLiga(nombreClub, golesLJ, golesVJ, nombreRival) {
  const eqJ = equiposLiga.find(e => e.esJugador);
  const eqR = equiposLiga.find(e => e.nombre === nombreRival);

  eqJ.pj++; eqJ.gf += golesLJ; eqJ.gc += golesVJ;
  if      (golesLJ > golesVJ)   { eqJ.g++; eqJ.pts += 3; }
  else if (golesLJ === golesVJ) { eqJ.e++; eqJ.pts += 1; }
  else                          { eqJ.p++; }

  if (eqR) {
    eqR.pj++; eqR.gf += golesVJ; eqR.gc += golesLJ;
    if      (golesVJ > golesLJ)   { eqR.g++; eqR.pts += 3; }
    else if (golesVJ === golesLJ) { eqR.e++; eqR.pts += 1; }
    else                          { eqR.p++; }
  }

  const otros = equiposLiga.filter(e => !e.esJugador && e.nombre !== nombreRival);
  for (let i = 0; i < otros.length - 1; i += 2) {
    const l = otros[i], v = otros[i+1];
    const gL = aleatorio(0,3), gV = aleatorio(0,3);
    l.pj++; l.gf+=gL; l.gc+=gV;
    v.pj++; v.gf+=gV; v.gc+=gL;
    if      (gL>gV)  { l.g++; l.pts+=3; v.p++; }
    else if (gL===gV){ l.e++; l.pts+=1; v.e++; v.pts+=1; }
    else             { v.g++; v.pts+=3; l.p++; }
  }
}

function renderizarTablaLiga() {
  const ordenada = [...equiposLiga].sort((a,b) =>
    b.pts !== a.pts ? b.pts-a.pts : (b.gf-b.gc)-(a.gf-a.gc)
  );
  document.getElementById('tabla-liga').innerHTML = `
    <table class="tabla-posiciones">
      <thead><tr>
        <th>#</th><th>EQUIPO</th><th>PJ</th><th>G</th>
        <th>E</th><th>P</th><th>GF</th><th>GC</th><th>DG</th><th>PTS</th>
      </tr></thead>
      <tbody>
        ${ordenada.map((eq,i) => `
          <tr class="${eq.esJugador ? 'fila-jugador' : ''}">
            <td>${i+1}</td>
            <td class="nombre-equipo">${eq.nombre}</td>
            <td>${eq.pj}</td><td>${eq.g}</td><td>${eq.e}</td><td>${eq.p}</td>
            <td>${eq.gf}</td><td>${eq.gc}</td><td>${eq.gf-eq.gc}</td>
            <td><strong>${eq.pts}</strong></td>
          </tr>
        `).join('')}
      </tbody>
    </table>
  `;
}

// ── EVENTOS ──
document.getElementById('btn-nueva-partida').addEventListener('click', () => {
  mostrarPantalla('screen-crear-club');
});

document.getElementById('btn-confirmar-club').addEventListener('click', () => {
  const nombreClub = document.getElementById('nombre-club').value.trim();
  if (!nombreClub) { mostrarModal('❌ ERROR', '¡Ponle un nombre a tu club!'); return; }
  inicializarClub(nombreClub);
  inicializarLiga(nombreClub);
  mostrarPantalla('screen-hub');
  actualizarHeader();
  renderizarPlantilla();
});

document.querySelectorAll('.btn-nav').forEach(btn => {
  btn.addEventListener('click', () => {
    AudioMotor.click();
    const panel = btn.dataset.panel;
    mostrarPanel(panel);
    if (panel === 'plantilla') renderizarPlantilla();
    if (panel === 'mercado')   renderizarMercado();
    if (panel === 'liga')      renderizarTablaLiga();
    if (panel === 'tactica')   renderizarTactica();
  });
});

document.getElementById('btn-jugar-partido').addEventListener('click', () => {
  if (club.titulares.length < 11) {
    mostrarModal('❌ SIN EQUIPO', 'Necesitas 11 titulares para jugar. Ve a Táctica.');
    return;
  }
  if (club.jornada > 9) {
    mostrarModal('🏁 TEMPORADA FINALIZADA', 'Ya jugaste todas las jornadas.');
    return;
  }

  const nombreRival = equiposLiga.filter(e => !e.esJugador)[club.jornada-1].nombre;
  const rival       = generarEquipoRival(club.jornada, nombreRival);
  const resultado   = simularPartido(rival);

  aplicarResultado(resultado);
  simularJornadaLiga(club.nombre, resultado.golesLocal, resultado.golesVisita, nombreRival);
  actualizarHeader();
  club.mercado = generarMercado();
  AudioMotor.inicioPartido();
  reproducirPartido(resultado, club.nombre);
});

document.getElementById('btn-volver-hub').addEventListener('click', () => {
  document.getElementById('btn-volver-hub').classList.add('hidden');
  mostrarPantalla('screen-hub');
  renderizarPlantilla();
  renderizarTablaLiga();
  mostrarPanel('liga');

  if (club.jornada > 9) {
    const ordenada = [...equiposLiga].sort((a,b) =>
      b.pts !== a.pts ? b.pts-a.pts : (b.gf-b.gc)-(a.gf-a.gc)
    );
    const pos     = ordenada.findIndex(e => e.esJugador) + 1;
    const emoji   = pos === 1 ? '🏆' : pos <= 3 ? '🥉' : '📋';
    const mensaje = pos === 1
      ? `¡CAMPEÓN DE LA LIGA CON ${equiposLiga.find(e=>e.esJugador).pts} PUNTOS!`
      : `TERMINASTE EN LA POSICIÓN ${pos} CON ${equiposLiga.find(e=>e.esJugador).pts} PUNTOS.`;

    setTimeout(() => {
      AudioMotor.temporadaFin();
      mostrarModal(`${emoji} TEMPORADA FINALIZADA`, mensaje);
    }, 300);
  }
});

// ── SISTEMA DE TEMAS ──
const TEMAS  = ['dark', 'sepia'];
const ICONOS = { dark: '🌙', sepia: '☀️' };

function aplicarTema(tema) {
  document.documentElement.setAttribute('data-tema', tema);
  localStorage.setItem('pitch-boss-tema', tema);
  const btn = document.getElementById('btn-tema');
  if (btn) btn.textContent = ICONOS[tema];
}

const temaInicial = localStorage.getItem('pitch-boss-tema') ||
  (window.matchMedia('(prefers-color-scheme: light)').matches ? 'sepia' : 'dark');
aplicarTema(temaInicial);

document.getElementById('btn-tema').addEventListener('click', () => {
  const actual    = document.documentElement.getAttribute('data-tema');
  const siguiente = TEMAS[(TEMAS.indexOf(actual) + 1) % TEMAS.length];
  AudioMotor.click();
  aplicarTema(siguiente);
});

// ── ARRANQUE ──
mostrarPantalla('screen-menu');