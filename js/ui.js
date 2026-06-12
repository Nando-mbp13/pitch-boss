
const canvas = document.getElementById('cancha');
const ctx    = canvas.getContext('2d');

// ── DIBUJAR CANCHA ──
function dibujarCancha() {
  const W = canvas.width, H = canvas.height;

  // Fondo con franjas verticales
  for (let i = 0; i < 10; i++) {
    ctx.fillStyle = i % 2 === 0 ? '#0D1A0D' : '#0F1F0F';
    ctx.fillRect(i * (W / 10), 0, W / 10, H);
  }

  // Líneas en amarillo ácido tenue
  ctx.strokeStyle = 'rgba(232,255,0,0.22)';
  ctx.lineWidth   = 1;
  ctx.setLineDash([]);
  const p = 18;

  // Borde
  ctx.strokeRect(p, p, W - p*2, H - p*2);

  // Línea del medio
  ctx.beginPath();
  ctx.moveTo(W/2, p);
  ctx.lineTo(W/2, H - p);
  ctx.stroke();

  // Círculo central
  ctx.beginPath();
  ctx.arc(W/2, H/2, 46, 0, Math.PI*2);
  ctx.stroke();

  // Punto central
  ctx.fillStyle = 'rgba(232,255,0,0.5)';
  ctx.beginPath();
  ctx.arc(W/2, H/2, 3, 0, Math.PI*2);
  ctx.fill();

  // Áreas
  ctx.strokeRect(p,       H/2 - 52, 68, 104);
  ctx.strokeRect(p,       H/2 - 26, 28, 52);
  ctx.strokeRect(W-p-68,  H/2 - 52, 68, 104);
  ctx.strokeRect(W-p-28,  H/2 - 26, 28, 52);

  // Arcos de área — en rosa tenue
  ctx.strokeStyle = 'rgba(255,45,120,0.35)';
  ctx.lineWidth = 1;
  ctx.beginPath();
  ctx.arc(p + 68, H/2, 26, -Math.PI/2, Math.PI/2);
  ctx.stroke();
  ctx.beginPath();
  ctx.arc(W - p - 68, H/2, 26, Math.PI/2, -Math.PI/2);
  ctx.stroke();
}

// ── DIBUJAR JUGADORES ──
function dibujarJugadores(golesL, golesV) {
  const W = canvas.width, H = canvas.height;

  // Formación 4-4-2 local (rosa neón)
  const posLocal = [
    [78, H/2],
    [135, H/2-58],[135, H/2-19],[135, H/2+19],[135, H/2+58],
    [195, H/2-70],[195, H/2-23],[195, H/2+23],[195, H/2+70],
    [265, H/2-30],[265, H/2+30]
  ];

  posLocal.forEach(([x, y]) => {
    ctx.fillStyle   = '#FF2D78';
    ctx.strokeStyle = '#0A0A0A';
    ctx.lineWidth   = 1.5;
    ctx.beginPath();
    ctx.arc(x, y, 7, 0, Math.PI*2);
    ctx.fill(); ctx.stroke();
  });

  // Formación 4-4-2 rival (gris)
  const posRival = [
    [W-78, H/2],
    [W-135, H/2-58],[W-135, H/2-19],[W-135, H/2+19],[W-135, H/2+58],
    [W-195, H/2-70],[W-195, H/2-23],[W-195, H/2+23],[W-195, H/2+70],
    [W-265, H/2-30],[W-265, H/2+30]
  ];

  posRival.forEach(([x, y]) => {
    ctx.fillStyle   = '#444444';
    ctx.strokeStyle = '#0A0A0A';
    ctx.lineWidth   = 1.5;
    ctx.beginPath();
    ctx.arc(x, y, 7, 0, Math.PI*2);
    ctx.fill(); ctx.stroke();
  });

  // Pelota en el centro
  ctx.fillStyle   = '#F0F0F0';
  ctx.strokeStyle = '#0A0A0A';
  ctx.lineWidth   = 1;
  ctx.beginPath();
  ctx.arc(W/2, H/2, 5, 0, Math.PI*2);
  ctx.fill(); ctx.stroke();
}

// ── DIBUJAR MARCADOR EN CANVAS ──
function dibujarMarcadorCanvas(nombreL, nombreR, golesL, golesV, minuto) {
  const W = canvas.width;

  // Fondo del marcador
  ctx.fillStyle = 'rgba(10,10,10,0.85)';
  ctx.fillRect(W/2 - 130, 6, 260, 38);

  // Borde superior rosa
  ctx.fillStyle = '#FF2D78';
  ctx.fillRect(W/2 - 130, 6, 260, 2);

  // Nombres y marcador
  ctx.font      = 'bold 11px "Bebas Neue", sans-serif';
  ctx.textAlign = 'center';

  ctx.fillStyle = '#F0F0F0';
  ctx.font      = '13px "Bebas Neue", sans-serif';
  ctx.fillText(nombreL.toUpperCase().substring(0,12), W/2 - 75, 28);

  ctx.fillStyle = '#888888';
  ctx.fillText(nombreR.toUpperCase().substring(0,12), W/2 + 75, 28);

  ctx.fillStyle = '#E8FF00';
  ctx.font      = 'bold 22px "Bebas Neue", sans-serif';
  ctx.fillText(`${golesL}  —  ${golesV}`, W/2, 32);

  // Minuto
  ctx.fillStyle = '#FF2D78';
  ctx.font      = '9px "Share Tech Mono", monospace';
  ctx.fillText(`MIN. ${minuto}'`, W/2, 42);
}

// ── OVERLAY DE GOL ──
// Dibuja el texto GOL con efecto glitch directamente en canvas
function dibujarGolOverlay(equipo, nombreEquipo, minuto) {
  const W = canvas.width, H = canvas.height;
  const esLocal = equipo === 'local';

  // Fondo semitransparente
  ctx.fillStyle = esLocal
    ? 'rgba(255,45,120,0.12)'
    : 'rgba(68,68,68,0.12)';
  ctx.fillRect(0, 0, W, H);

  // Líneas de glitch horizontales
  const color = esLocal ? '#FF2D78' : '#666666';
  ctx.fillStyle = color;
  for (let i = 0; i < 4; i++) {
    const y   = Math.random() * H;
    const w   = 40 + Math.random() * 120;
    const x   = Math.random() * (W - w);
    ctx.fillRect(x, y, w, 1);
  }

  // Sombra del texto (offset glitch)
  const cx = esLocal ? W * 0.30 : W * 0.70;
  const cy = H / 2;

  ctx.font      = 'bold 64px "Bebas Neue", sans-serif';
  ctx.textAlign = 'center';

  // Capa glitch desplazada
  ctx.fillStyle = esLocal ? 'rgba(232,255,0,0.6)' : 'rgba(100,100,100,0.4)';
  ctx.fillText('GOL!', cx + 4, cy + 2);

  // Texto principal
  ctx.fillStyle = esLocal ? '#FF2D78' : '#888888';
  ctx.fillText('GOL!', cx, cy);

  // Nombre del equipo
  ctx.fillStyle = '#E8FF00';
  ctx.font      = '11px "Share Tech Mono", monospace';
  ctx.fillText(nombreEquipo.toUpperCase() + ' · MIN. ' + minuto + "'", cx, cy + 22);
}

// ── RESULTADO FINAL EN CANVAS ──
function dibujarResultadoCanvas(resultado, nombreL, nombreR, golesL, golesV) {
  const W = canvas.width, H = canvas.height;

  dibujarCancha();
  dibujarJugadores(golesL, golesV);

  // Overlay central
  ctx.fillStyle = 'rgba(10,10,10,0.75)';
  ctx.fillRect(W/2 - 140, H/2 - 50, 280, 100);

  const colorResultado = resultado === 'victoria' ? '#E8FF00'
                       : resultado === 'derrota'  ? '#666666'
                       :                            '#FF2D78';

  // Borde superior del bloque
  ctx.fillStyle = colorResultado;
  ctx.fillRect(W/2 - 140, H/2 - 50, 280, 3);

  ctx.font      = 'bold 42px "Bebas Neue", sans-serif';
  ctx.textAlign = 'center';
  ctx.fillStyle = colorResultado;
  ctx.fillText(resultado.toUpperCase(), W/2, H/2 + 8);

  ctx.fillStyle = '#888888';
  ctx.font      = '9px "Share Tech Mono", monospace';
  ctx.fillText('RESULTADO FINAL', W/2, H/2 - 30);
}

// ── ACTUALIZAR HEADER DEL PARTIDO ──
function actualizarHeaderPartido(nombreL, nombreR, golesL, golesV, minuto, vivo) {
  document.getElementById('titulo-partido').innerHTML =
    `<span class="equipo-local">${nombreL.toUpperCase()}</span>` +
    `<span class="bloque-marcador">` +
      `<span class="nums-marcador">${golesL}&nbsp;&mdash;&nbsp;${golesV}</span>` +
      `<span class="minuto-tag">${vivo ? '&#9679; MIN. ' + minuto + "'" : 'FINAL'}</span>` +
    `</span>` +
    `<span class="equipo-rival">${nombreR.toUpperCase()}</span>`;

  document.getElementById('marcador').textContent = '';
}

// ── REPRODUCIR PARTIDO ──
function reproducirPartido(resultado, nombreLocal) {
  mostrarPantalla('screen-partido');
  document.getElementById('btn-volver-hub').classList.add('hidden');

  const nombreRival = resultado.rival;
  const eventos     = resultado.eventos;
  let golesL = 0, golesV = 0, minuto = 0, idx = 0;
  let pausado = false;

  // Estado inicial
  actualizarHeaderPartido(nombreLocal, nombreRival, 0, 0, 0, true);
  dibujarCancha();
  dibujarJugadores(0, 0);

  const tick = setInterval(() => {
    if (pausado) return;
    minuto++;

    // ¿Hay gol en este minuto?
    if (idx < eventos.length && eventos[idx].minuto === minuto) {
      const ev = eventos[idx];

      if (ev.equipo === 'local') { golesL++; AudioMotor.golLocal(); }
      else                       { golesV++; AudioMotor.golRival(); }

      // Redibujar cancha + overlay de gol
      dibujarCancha();
      dibujarJugadores(golesL, golesV);
      dibujarGolOverlay(ev.equipo, ev.equipo === 'local' ? nombreLocal : nombreRival, minuto);

      actualizarHeaderPartido(nombreLocal, nombreRival, golesL, golesV, minuto, true);
      idx++;

      // Pausa 1.5s para el gol
      pausado = true;
      setTimeout(() => { pausado = false; }, 1500);

    } else {
      // Minuto normal — cancha limpia
      dibujarCancha();
      dibujarJugadores(golesL, golesV);
      actualizarHeaderPartido(nombreLocal, nombreRival, golesL, golesV, minuto, true);
    }

    if (minuto >= 90) {
      clearInterval(tick);
      setTimeout(() => mostrarResultadoFinal(resultado, nombreLocal), 800);
    }

  }, 120);
}

// ── RESULTADO FINAL ──
function mostrarResultadoFinal(resultado, nombreLocal) {
  const gL = resultado.golesLocal;
  const gV = resultado.golesVisita;

  if      (resultado.resultado === 'victoria') AudioMotor.victoria();
  else if (resultado.resultado === 'derrota')  AudioMotor.derrota();
  else                                          AudioMotor.empate();

  dibujarResultadoCanvas(resultado.resultado, nombreLocal, resultado.rival, gL, gV);
  actualizarHeaderPartido(nombreLocal, resultado.rival, gL, gV, 90, false);

  const premio = resultado.premio > 0
    ? ` &nbsp;|&nbsp; <span>+${formatearDinero(resultado.premio)}</span>`
    : '';
  document.getElementById('marcador').innerHTML =
    `<span class="footer-resultado-${resultado.resultado}">${resultado.resultado.toUpperCase()}</span>${premio}`;

  document.getElementById('btn-volver-hub').classList.remove('hidden');
}