// =============================================
// UI.JS — Cinemática neon-punk nivel WOW
// Sonido y marcador sincronizan con el momento
// exacto en que la pelota entra en la portería.
// =============================================

const canvas = document.getElementById('cancha');
const ctx    = canvas.getContext('2d');
const W      = canvas.width;
const H      = canvas.height;
const PAD    = 18;

// ── ESTADO GLOBAL ──
let jugadoresLocal = [];
let jugadoresRival = [];
let pelota         = { x: W/2, y: H/2, tx: W/2, ty: H/2, trail: [] };
let animFrameId    = null;
let modoGol        = false;
let tickAnim       = 0;

// Callbacks para sincronizar marcador desde main.js
let onGolMarcado   = null; // se llama cuando la pelota entra

// ── POSICIONES BASE — FORMACIÓN 4-4-2 ──
function crearJugadores(esLocal) {
  const cy = H / 2;
  const pos = [
    { bx: esLocal ? PAD+20      : W-PAD-20,    by: cy,      rol: 'portero'   },
    { bx: esLocal ? W*0.22      : W*0.78,       by: cy-72,   rol: 'defensa'   },
    { bx: esLocal ? W*0.22      : W*0.78,       by: cy-24,   rol: 'defensa'   },
    { bx: esLocal ? W*0.22      : W*0.78,       by: cy+24,   rol: 'defensa'   },
    { bx: esLocal ? W*0.22      : W*0.78,       by: cy+72,   rol: 'defensa'   },
    { bx: esLocal ? W*0.42      : W*0.58,       by: cy-68,   rol: 'medio'     },
    { bx: esLocal ? W*0.42      : W*0.58,       by: cy-22,   rol: 'medio'     },
    { bx: esLocal ? W*0.42      : W*0.58,       by: cy+22,   rol: 'medio'     },
    { bx: esLocal ? W*0.42      : W*0.58,       by: cy+68,   rol: 'medio'     },
    { bx: esLocal ? W*0.65      : W*0.35,       by: cy-30,   rol: 'delantero' },
    { bx: esLocal ? W*0.65      : W*0.35,       by: cy+30,   rol: 'delantero' },
  ];
  return pos.map((p, i) => ({
    x: p.bx, y: p.by, tx: p.bx, ty: p.by,
    bx: p.bx, by: p.by, rol: p.rol,
    esLocal, i, radio: 7,
    velocidad: 0.03 + Math.random() * 0.02
  }));
}

// ── LERP ──
function lerp(a, b, t) { return a + (b - a) * t; }
function easeOut(t)     { return 1 - Math.pow(1 - t, 3); }

// ── ZONA DE MOVIMIENTO POR ROL ──
function zonaMovimiento(j) {
  const cy = H / 2, m = 14;
  if (j.rol === 'portero')    return { minX: j.esLocal?PAD+10:W*0.82,    maxX: j.esLocal?W*0.18:W-PAD-10, minY:cy-35,     maxY:cy+35      };
  if (j.rol === 'defensa')    return { minX: j.esLocal?W*0.12:W*0.55,    maxX: j.esLocal?W*0.45:W*0.88,   minY:PAD+m,     maxY:H-PAD-m    };
  if (j.rol === 'medio')      return { minX: W*0.30,                      maxX: W*0.70,                     minY:PAD+m,     maxY:H-PAD-m    };
  return                               { minX: j.esLocal?W*0.45:W*0.10,   maxX: j.esLocal?W*0.90:W*0.55,   minY:PAD+m,     maxY:H-PAD-m    };
}

function nuevoDestino(j) {
  const z = zonaMovimiento(j);
  j.tx = z.minX + Math.random() * (z.maxX - z.minX);
  j.ty = z.minY + Math.random() * (z.maxY - z.minY);
}

// ── ACTUALIZAR JUGADORES ──
function actualizarJugadores() {
  [...jugadoresLocal, ...jugadoresRival].forEach(j => {
    if (Math.hypot(j.tx-j.x, j.ty-j.y) < 4) nuevoDestino(j);
    j.x = lerp(j.x, j.tx, j.velocidad);
    j.y = lerp(j.y, j.ty, j.velocidad);
  });
}

// ── PELOTA CON TRAIL ──
function actualizarPelota(vel = 0.07) {
  pelota.trail.push({ x: pelota.x, y: pelota.y });
  if (pelota.trail.length > 10) pelota.trail.shift();
  pelota.x = lerp(pelota.x, pelota.tx, vel);
  pelota.y = lerp(pelota.y, pelota.ty, vel);
}

function pasarPelotaJugadores() {
  const todos = [...jugadoresLocal.slice(1,9), ...jugadoresRival.slice(1,9)];
  const t = todos[Math.floor(Math.random() * todos.length)];
  pelota.tx = t.x + (Math.random()-0.5)*25;
  pelota.ty = t.y + (Math.random()-0.5)*25;
}

// ══════════════════════════════════════
// DIBUJO
// ══════════════════════════════════════

function dibujarCancha() {
  for (let i = 0; i < 10; i++) {
    ctx.fillStyle = i%2===0 ? '#0D1A0D' : '#0F1F0F';
    ctx.fillRect(i*(W/10), 0, W/10, H);
  }
  ctx.strokeStyle = 'rgba(232,255,0,0.22)';
  ctx.lineWidth = 1; ctx.setLineDash([]);
  ctx.strokeRect(PAD, PAD, W-PAD*2, H-PAD*2);
  ctx.beginPath(); ctx.moveTo(W/2,PAD); ctx.lineTo(W/2,H-PAD); ctx.stroke();
  ctx.beginPath(); ctx.arc(W/2,H/2,46,0,Math.PI*2); ctx.stroke();
  ctx.fillStyle='rgba(232,255,0,0.5)';
  ctx.beginPath(); ctx.arc(W/2,H/2,3,0,Math.PI*2); ctx.fill();
  ctx.strokeRect(PAD,H/2-52,68,104); ctx.strokeRect(PAD,H/2-26,28,52);
  ctx.strokeRect(W-PAD-68,H/2-52,68,104); ctx.strokeRect(W-PAD-28,H/2-26,28,52);
  ctx.strokeStyle='rgba(255,45,120,0.35)';
  ctx.beginPath(); ctx.arc(PAD+68,H/2,26,-Math.PI/2,Math.PI/2); ctx.stroke();
  ctx.beginPath(); ctx.arc(W-PAD-68,H/2,26,Math.PI/2,-Math.PI/2); ctx.stroke();
}

function dibujarJugador(j) {
  ctx.fillStyle='rgba(0,0,0,0.25)';
  ctx.beginPath(); ctx.ellipse(j.x+2,j.y+4,j.radio,3,0,0,Math.PI*2); ctx.fill();
  ctx.fillStyle   = j.esLocal ? '#FF2D78' : '#444444';
  ctx.strokeStyle = '#0A0A0A'; ctx.lineWidth = 1.5;
  ctx.beginPath(); ctx.arc(j.x,j.y,j.radio,0,Math.PI*2); ctx.fill(); ctx.stroke();
  ctx.fillStyle='rgba(255,255,255,0.2)';
  ctx.beginPath(); ctx.arc(j.x-2,j.y-2,2.5,0,Math.PI*2); ctx.fill();
}

function dibujarPelota() {
  pelota.trail.forEach((p,i) => {
    ctx.fillStyle=`rgba(255,45,120,${(i/pelota.trail.length)*0.4})`;
    ctx.beginPath(); ctx.arc(p.x,p.y,2+(i/pelota.trail.length)*3,0,Math.PI*2); ctx.fill();
  });
  ctx.fillStyle='rgba(0,0,0,0.3)';
  ctx.beginPath(); ctx.ellipse(pelota.x+3,pelota.y+4,5,2.5,0,0,Math.PI*2); ctx.fill();
  ctx.fillStyle='#F0F0F0'; ctx.strokeStyle='#222222'; ctx.lineWidth=1;
  ctx.beginPath(); ctx.arc(pelota.x,pelota.y,5,0,Math.PI*2); ctx.fill(); ctx.stroke();
  ctx.fillStyle='rgba(255,255,255,0.6)';
  ctx.beginPath(); ctx.arc(pelota.x-1.5,pelota.y-1.5,1.8,0,Math.PI*2); ctx.fill();
}

function dibujarFrame() {
  dibujarCancha();
  jugadoresRival.forEach(dibujarJugador);
  jugadoresLocal.forEach(dibujarJugador);
  dibujarPelota();
}

// ── LOOP PRINCIPAL ——
function animLoop() {
  animFrameId = requestAnimationFrame(animLoop);
  tickAnim++;

  // Si hay gol activo, el setInterval de la cinemática
  // maneja TODO el dibujo — no dibujamos aquí
  if (modoGol) return;

  if (tickAnim % 55 === 0) {
    const todos = [...jugadoresLocal, ...jugadoresRival];
    const n = 3 + Math.floor(Math.random()*4);
    for (let i=0;i<n;i++) nuevoDestino(todos[Math.floor(Math.random()*todos.length)]);
    pasarPelotaJugadores();
  }
  actualizarJugadores();
  actualizarPelota(0.05);
  dibujarFrame();
}

// ── SKIP PARTIDO ──
function skipPartido() {
  // Cancela todo lo que esté corriendo
  if (animFrameId) { cancelAnimationFrame(animFrameId); animFrameId = null; }
  modoGol = false;

  // Señal global para que el tick del partido sepa que debe parar
  window._skipActivo = true;
}

// ══════════════════════════════════════
// OVERLAY GOL — se muestra DESPUÉS de que
// la pelota entra. Recibe progreso 0→1.
// ══════════════════════════════════════
function overlayGol(equipo, nombreEquipo, minuto, progreso) {
  const esLocal = equipo === 'local';

  // Posición según equipo — local a la izquierda, rival a la derecha
  const cx = esLocal ? W * 0.28 : W * 0.72;
  const cy = H / 2;

  // Fondo de destello radial
  const grd = ctx.createRadialGradient(cx, cy, 5, cx, cy, 120);
  grd.addColorStop(0, esLocal ? 'rgba(255,45,120,0.35)' : 'rgba(100,100,100,0.25)');
  grd.addColorStop(1, 'rgba(0,0,0,0)');
  ctx.fillStyle = grd;
  ctx.fillRect(0, 0, W, H);

  // Líneas de glitch horizontales
  for (let i = 0; i < 5; i++) {
    const gy  = cy - 60 + Math.random() * 120;
    const gw  = 20 + Math.random() * 100;
    const gx  = cx - gw/2 + (Math.random()-0.5)*60;
    ctx.fillStyle = esLocal
      ? `rgba(255,45,120,${0.4 + Math.random()*0.5})`
      : `rgba(160,160,160,${0.3 + Math.random()*0.4})`;
    ctx.fillRect(gx, gy, gw, 1 + Math.random()*2);
  }

  // Escala de entrada
  const escala = progreso < 0.3
    ? easeOut(progreso / 0.3)
    : 1 + Math.sin(progreso * Math.PI * 5) * 0.03;

  const off = (Math.random()-0.5) * 6;

  ctx.save();
  ctx.translate(cx, cy);
  ctx.scale(escala, escala);
  ctx.translate(-cx, -cy);

  ctx.font = 'bold 72px "Bebas Neue", sans-serif';
  ctx.textAlign = 'center';

  // Capa glitch amarilla desplazada
  ctx.fillStyle = esLocal
    ? 'rgba(232,255,0,0.7)'
    : 'rgba(180,180,180,0.5)';
  ctx.fillText('GOL!', cx + off + 5, cy + 5);

  // Texto principal
  ctx.fillStyle = esLocal ? '#FF2D78' : '#AAAAAA';
  ctx.fillText('GOL!', cx, cy);

  // Nombre y minuto
  ctx.fillStyle = '#E8FF00';
  ctx.font = 'bold 10px "Share Tech Mono", monospace';
  ctx.fillText(
    nombreEquipo.toUpperCase() + ' · MIN. ' + minuto + "'",
    cx, cy + 26
  );

  ctx.restore();
}

// ══════════════════════════════════════
// HELPER: frame exacto en que la pelota
// entra a portería y debemos disparar el gol
// ══════════════════════════════════════
// Cada cinemática declara golEnFrame — el frame
// donde ocurre el gol. La función inter comprueba
// si t === golEnFrame y llama dispararGol().

function dispararGol(equipo, nombreEquipo, minuto) {
  AudioMotor.golLocal && (equipo === 'local' ? AudioMotor.golLocal() : AudioMotor.golRival());
  if (typeof onGolMarcado === 'function') onGolMarcado();
}

// ── FINALIZAR CINEMÁTICA ──
function finalizarCinematica(cb) {
  jugadoresLocal.forEach(j => { j.tx=j.bx; j.ty=j.by; });
  jugadoresRival.forEach(j => { j.tx=j.bx; j.ty=j.by; });
  pelota.tx=W/2; pelota.ty=H/2; pelota.trail=[];
  setTimeout(() => { modoGol=false; if(typeof cb==='function') cb(); }, 500);
}

// ══════════════════════════════════════
// 5 CINEMÁTICAS
// golEnFrame = frame exacto donde pelota entra
// ══════════════════════════════════════

// ── 1: JUGADA POR EL CENTRO ──
function cinematicaCentro(equipo, nombreEquipo, minuto, cb) {
  const esLocal=equipo==='local', jug=esLocal?jugadoresLocal:jugadoresRival;
  const medio=jug[6], delant=jug[9];
  const portX=esLocal?W-PAD-14:PAD+14, cy=H/2;
  const dur=180, golEnFrame=Math.round(dur*0.82);
  let t=0, golDisparado=false, overlayT=0;

  const inter=setInterval(()=>{
    t++;
    const p=Math.min(t/dur,1);

    if(p<0.25){ pelota.tx=medio.x; pelota.ty=medio.y; medio.tx=lerp(medio.bx,W/2,p/0.25); }
    else if(p<0.55){ const q=(p-0.25)/0.30; pelota.tx=lerp(medio.x,delant.x,q); pelota.ty=lerp(medio.y,delant.y,q); delant.tx=lerp(delant.bx,portX-40,q); delant.ty=lerp(delant.by,cy+(Math.random()-0.5)*30,0.05); }
    else if(p<0.82){ delant.tx=lerp(delant.tx,portX-18,0.09); delant.ty=lerp(delant.ty,cy,0.06); pelota.tx=delant.x+(esLocal?12:-12); pelota.ty=delant.y; }
    else{ pelota.tx=portX; pelota.ty=cy; }

    if(t===golEnFrame && !golDisparado){ golDisparado=true; dispararGol(equipo,nombreEquipo,minuto); }

    actualizarJugadores(); actualizarPelota(0.12); dibujarFrame();
    if(t>golEnFrame){
      overlayT++;
      overlayGol(equipo, nombreEquipo, minuto, Math.min(overlayT/40, 1));
    }
    if(t>=dur){ clearInterval(inter); finalizarCinematica(cb); }
  },16);
}

// ── 2: CONTRAATAQUE ──
function cinematicaContra(equipo, nombreEquipo, minuto, cb) {
  const esLocal=equipo==='local', jug=esLocal?jugadoresLocal:jugadoresRival;
  const defensa=jug[2], medio=jug[5], delant=jug[10];
  const portX=esLocal?W-PAD-14:PAD+14, cy=H/2;
  const dur=220, golEnFrame=Math.round(dur*0.87);
  let t=0, golDisparado=false, overlayT=0;

  const inter=setInterval(()=>{
    t++;
    const p=Math.min(t/dur,1);

    if(p<0.20){ pelota.tx=defensa.x; pelota.ty=defensa.y; defensa.tx=lerp(defensa.bx,defensa.bx+(esLocal?30:-30),p/0.20); }
    else if(p<0.45){ const q=(p-0.20)/0.25; pelota.tx=lerp(defensa.x,medio.x,q); pelota.ty=lerp(defensa.y,medio.y,q); medio.tx=lerp(medio.bx,W*(esLocal?0.55:0.45),q); }
    else if(p<0.70){ const q=(p-0.45)/0.25; pelota.tx=lerp(medio.x,delant.x+(esLocal?60:-60),q); pelota.ty=lerp(medio.y,cy,q); delant.tx=lerp(delant.bx,portX-30,q); delant.ty=lerp(delant.by,cy+(Math.random()-0.5)*50,0.04); medio.tx=lerp(medio.tx,W*(esLocal?0.72:0.28),0.05); }
    else if(p<0.87){ delant.tx=lerp(delant.tx,portX-15,0.1); pelota.tx=delant.x+(esLocal?10:-10); pelota.ty=delant.y+(Math.random()-0.5)*5; }
    else{ pelota.tx=portX; pelota.ty=cy+(Math.random()-0.5)*30; }

    if(t===golEnFrame && !golDisparado){ golDisparado=true; dispararGol(equipo,nombreEquipo,minuto); }

    actualizarJugadores(); actualizarPelota(0.10); dibujarFrame();
    if(t>golEnFrame){
      overlayT++;
      overlayGol(equipo, nombreEquipo, minuto, Math.min(overlayT/40, 1));
    }
    if(t>=dur){ clearInterval(inter); finalizarCinematica(cb); }
  },16);
}

// ── 3: COMBINACIÓN POR BANDA ──
function cinematicaBanda(equipo, nombreEquipo, minuto, cb) {
  const esLocal=equipo==='local', jug=esLocal?jugadoresLocal:jugadoresRival;
  const lateral=jug[1], extremo=jug[5], delant=jug[9];
  const portX=esLocal?W-PAD-14:PAD+14, bandaY=PAD+20;
  const dur=200, golEnFrame=Math.round(dur*0.86);
  let t=0, golDisparado=false, overlayT=0;

  const inter=setInterval(()=>{
    t++;
    const p=Math.min(t/dur,1);

    if(p<0.25){ const q=p/0.25; pelota.tx=lateral.x; pelota.ty=lateral.y; lateral.tx=lerp(lateral.bx,esLocal?W*0.65:W*0.35,q); lateral.ty=lerp(lateral.by,bandaY,q); }
    else if(p<0.50){ const q=(p-0.25)/0.25; pelota.tx=lerp(lateral.x,extremo.x,q); pelota.ty=lerp(lateral.y,bandaY+10,q); extremo.tx=lerp(extremo.bx,esLocal?W*0.78:W*0.22,q); extremo.ty=lerp(extremo.by,bandaY+15,q); }
    else if(p<0.72){ const q=(p-0.50)/0.22; pelota.tx=lerp(extremo.x,portX-25,q); pelota.ty=lerp(bandaY+10,H/2+(Math.random()-0.5)*40,q); delant.tx=lerp(delant.bx,portX-22,q); delant.ty=lerp(delant.by,H/2,q); }
    else if(p<0.86){ const q=(p-0.72)/0.14; pelota.tx=lerp(pelota.tx,portX,q); pelota.ty=lerp(pelota.ty,H/2+(Math.random()-0.5)*25,q); }
    else{ pelota.tx=portX; pelota.ty=H/2; }

    if(t===golEnFrame && !golDisparado){ golDisparado=true; dispararGol(equipo,nombreEquipo,minuto); }

    actualizarJugadores(); actualizarPelota(0.11); dibujarFrame();
    if(t>golEnFrame){
      overlayT++;
      overlayGol(equipo, nombreEquipo, minuto, Math.min(overlayT/40, 1));
    }
    if(t>=dur){ clearInterval(inter); finalizarCinematica(cb); }
  },16);
}

// ── 4: TIRO LIBRE ──
function cinematicaTiroLibre(equipo, nombreEquipo, minuto, cb) {
  const esLocal=equipo==='local', jug=esLocal?jugadoresLocal:jugadoresRival;
  const tirador=jug[6];
  const portX=esLocal?W-PAD-14:PAD+14, portY=H/2+(Math.random()-0.5)*40;
  const tiroX=esLocal?W*0.62:W*0.38, tiroY=H/2+(Math.random()-0.5)*60;
  const dur=160, golEnFrame=Math.round(dur*0.80);
  let t=0, golDisparado=false, overlayT=0;

  const inter=setInterval(()=>{
    t++;
    const p=Math.min(t/dur,1);

    if(p<0.20){ pelota.tx=tiroX; pelota.ty=tiroY; tirador.tx=tiroX+(esLocal?-25:25); tirador.ty=tiroY; }
    else if(p<0.30){ pelota.tx=tiroX; pelota.ty=tiroY; }
    else if(p<0.80){ const q=(p-0.30)/0.50, ex=easeOut(q); const curva=Math.sin(q*Math.PI)*35; pelota.tx=lerp(tiroX,portX,ex); pelota.ty=lerp(tiroY,portY,ex)-curva*(esLocal?1:-1); }
    else{ pelota.tx=portX; pelota.ty=portY; }

    if(t===golEnFrame && !golDisparado){ golDisparado=true; dispararGol(equipo,nombreEquipo,minuto); }

    actualizarJugadores(); actualizarPelota(0.14); dibujarFrame();

    if(p>=0.30&&p<0.80){
      ctx.strokeStyle='rgba(232,255,0,0.15)'; ctx.lineWidth=1; ctx.setLineDash([4,4]);
      ctx.beginPath(); ctx.moveTo(tiroX,tiroY);
      ctx.quadraticCurveTo((tiroX+portX)/2,Math.min(tiroY,portY)-40,pelota.x,pelota.y);
      ctx.stroke(); ctx.setLineDash([]);
    }

    if(t>golEnFrame){
      overlayT++;
      overlayGol(equipo, nombreEquipo, minuto, Math.min(overlayT/40, 1));
    }
    if(t>=dur){ clearInterval(inter); finalizarCinematica(cb); }
  },16);
}

// ── 5: GOLAZO EN SOLITARIO ──
function cinematicaGolazo(equipo, nombreEquipo, minuto, cb) {
  const esLocal=equipo==='local', jug=esLocal?jugadoresLocal:jugadoresRival;
  const rival=esLocal?jugadoresRival:jugadoresLocal;
  const delant=jug[9];
  const portX=esLocal?W-PAD-14:PAD+14, cy=H/2;
  const inicioX=esLocal?W*0.40:W*0.60, inicioY=cy+(Math.random()-0.5)*60;
  const dur=250, golEnFrame=Math.round(dur*0.83);
  let t=0, golDisparado=false, overlayT=0;
  const obs=[rival[3],rival[4],rival[7]];

  const inter=setInterval(()=>{
    t++;
    const p=Math.min(t/dur,1);

    if(p<0.15){ pelota.tx=inicioX; pelota.ty=inicioY; delant.tx=lerp(delant.bx,inicioX+(esLocal?-20:20),p/0.15); }
    else if(p<0.65){ const q=(p-0.15)/0.50, ex=easeOut(q), zz=Math.sin(q*Math.PI*3)*18; delant.tx=lerp(inicioX,portX-20,ex); delant.ty=inicioY+zz; pelota.tx=delant.x+(esLocal?14:-14); pelota.ty=delant.y+zz*0.6; obs.forEach(r=>{ if(r){ r.tx=lerp(r.bx,delant.x+(Math.random()-0.5)*30,0.03); r.ty=lerp(r.by,delant.y+(Math.random()-0.5)*30,0.03); }}); }
    else if(p<0.83){ delant.tx=lerp(delant.tx,portX-18,0.09); delant.ty=lerp(delant.ty,cy,0.06); pelota.tx=lerp(pelota.tx,portX,easeOut((p-0.65)/0.18)); pelota.ty=lerp(pelota.ty,cy+(Math.random()-0.5)*30,0.08); }
    else{ pelota.tx=portX; pelota.ty=cy; }

    if(t===golEnFrame && !golDisparado){ golDisparado=true; dispararGol(equipo,nombreEquipo,minuto); }

    actualizarJugadores(); actualizarPelota(0.13); dibujarFrame();

    if(p>0.15&&p<0.70){ ctx.strokeStyle='rgba(255,45,120,0.12)'; ctx.lineWidth=2; ctx.setLineDash([3,5]); ctx.beginPath(); ctx.moveTo(inicioX,inicioY); ctx.lineTo(delant.x,delant.y); ctx.stroke(); ctx.setLineDash([]); }

    if(t>golEnFrame){
      overlayT++;
      overlayGol(equipo, nombreEquipo, minuto, Math.min(overlayT/40, 1));
    }
    if(t>=dur){ clearInterval(inter); finalizarCinematica(cb); }
  },16);
}

// ── LANZAR CINEMÁTICA ALEATORIA ──
const CINEMATICAS=[cinematicaCentro,cinematicaContra,cinematicaBanda,cinematicaTiroLibre,cinematicaGolazo];

function lanzarCinematica(equipo, nombreEquipo, minuto, onGol, cb) {
  modoGol    = true;
  onGolMarcado = onGol; // callback para actualizar marcador en main.js
  const fn   = CINEMATICAS[Math.floor(Math.random()*CINEMATICAS.length)];
  fn(equipo, nombreEquipo, minuto, cb);
}

// ══════════════════════════════════════
// RESULTADO FINAL EN CANVAS
// ══════════════════════════════════════
function dibujarResultadoCanvas(resultado, nombreL, nombreR, golesL, golesV) {
  dibujarCancha();
  jugadoresRival.forEach(dibujarJugador);
  jugadoresLocal.forEach(dibujarJugador);
  dibujarPelota();

  const colorRes = resultado==='victoria'?'#E8FF00':resultado==='derrota'?'#666666':'#FF2D78';

  ctx.fillStyle='rgba(10,10,10,0.80)';
  ctx.fillRect(W/2-150,H/2-55,300,110);
  ctx.fillStyle=colorRes;
  ctx.fillRect(W/2-150,H/2-55,300,3);

  ctx.font='bold 46px "Bebas Neue", sans-serif';
  ctx.textAlign='center';
  ctx.fillStyle=colorRes;
  ctx.fillText(resultado.toUpperCase(),W/2,H/2+14);

  ctx.fillStyle='#555';
  ctx.font='9px "Share Tech Mono", monospace';
  ctx.fillText('RESULTADO FINAL',W/2,H/2-32);

  // ── Anuncio igual que el GOL pero con el resultado ──
  const colorOverlay = resultado==='victoria'?'rgba(232,255,0,0.10)':resultado==='derrota'?'rgba(80,80,80,0.10)':'rgba(255,45,120,0.10)';
  for(let i=0;i<4;i++){
    const gy=Math.random()*H, gw=30+Math.random()*120;
    ctx.fillStyle=colorRes.replace(')',',0.3)').replace('rgb','rgba').replace('#','rgba(').replace(/([0-9a-fA-F]{2})/g,h=>parseInt(h,16)+',').slice(0,-1)+',0.3)';
  }
}

// ── HEADER HTML DEL PARTIDO ──
function actualizarHeaderPartido(nombreL, nombreR, golesL, golesV, minuto, vivo) {
  document.getElementById('titulo-partido').innerHTML =
    `<span class="equipo-local">${nombreL.toUpperCase()}</span>`+
    `<span class="bloque-marcador">`+
      `<span class="nums-marcador">${golesL}&nbsp;&mdash;&nbsp;${golesV}</span>`+
      `<span class="minuto-tag">${vivo?'&#9679; MIN. '+minuto+"'":'FINAL'}</span>`+
    `</span>`+
    `<span class="equipo-rival">${nombreR.toUpperCase()}</span>`;
  document.getElementById('marcador').textContent='';
}

// ── REPRODUCIR PARTIDO ──
function reproducirPartido(resultado, nombreLocal) {
  mostrarPantalla('screen-partido');
  document.getElementById('btn-volver-hub').classList.add('hidden');

  const nombreRival=resultado.rival, eventos=resultado.eventos;
  let golesL=0, golesV=0, minuto=0, idx=0, pausado=false;

  jugadoresLocal=crearJugadores(true);
  jugadoresRival=crearJugadores(false);
  pelota={x:W/2,y:H/2,tx:W/2,ty:H/2,trail:[]};
  modoGol=false; tickAnim=0;

  if(animFrameId) cancelAnimationFrame(animFrameId);
  animLoop();

  window._skipActivo = false;
  document.getElementById('btn-skip').onclick = () => {
    skipPartido();

    // Simulamos los goles restantes instantáneamente
    while (idx < eventos.length) {
      const ev = eventos[idx];
      if (ev.equipo === 'local') golesL++;
      else                       golesV++;
      idx++;
    }

    mostrarResultadoFinal({
      ...resultado,
      golesLocal:  golesL,
      golesVisita: golesV,
    }, nombreLocal);
  };

  actualizarHeaderPartido(nombreLocal,nombreRival,0,0,0,true);

  const tick=setInterval(()=>{
    if (window._skipActivo) { clearInterval(tick); return; }

    if(pausado) return;
    minuto++;

    if(idx<eventos.length && eventos[idx].minuto===minuto){
      const ev=eventos[idx];
      const esLocal=ev.equipo==='local';
      idx++;
      pausado=true;

      // onGol se llama desde dentro de la cinemática
      // en el frame exacto donde la pelota entra
      lanzarCinematica(
        ev.equipo,
        esLocal ? nombreLocal : nombreRival,
        minuto,
        // ── CALLBACK GOL: sonido + marcador sincronizados ──
        () => {
          if(esLocal) golesL++; else golesV++;
          if(esLocal) AudioMotor.golLocal(); else AudioMotor.golRival();
          actualizarHeaderPartido(nombreLocal,nombreRival,golesL,golesV,minuto,true);
        },
        // ── CALLBACK FIN: reanuda el reloj ──
        () => { pausado=false; }
      );

    } else {
      actualizarHeaderPartido(nombreLocal,nombreRival,golesL,golesV,minuto,true);
    }

    if(minuto>=90){
      clearInterval(tick);
      setTimeout(()=>mostrarResultadoFinal(resultado,nombreLocal),800);
    }
  },120);
}

// ── MOSTRAR RESULTADO FINAL ──
function mostrarResultadoFinal(resultado, nombreLocal) {
  if(animFrameId){ cancelAnimationFrame(animFrameId); animFrameId=null; }

  if     (resultado.resultado==='victoria') AudioMotor.victoria();
  else if(resultado.resultado==='derrota')  AudioMotor.derrota();
  else                                       AudioMotor.empate();

  dibujarResultadoCanvas(
    resultado.resultado, nombreLocal, resultado.rival,
    resultado.golesLocal, resultado.golesVisita
  );
  actualizarHeaderPartido(
    nombreLocal, resultado.rival,
    resultado.golesLocal, resultado.golesVisita, 90, false
  );

  // Anuncio en footer igual que GOL — con color según resultado
  const colorClase = resultado.resultado;
  const emoji      = resultado.resultado==='victoria'?'🏆':resultado.resultado==='derrota'?'😔':'🤝';
  const premio     = resultado.premio>0
    ? ` &nbsp;|&nbsp; <span>+${formatearDinero(resultado.premio)}</span>` : '';

  document.getElementById('marcador').innerHTML =
    `<span class="footer-resultado-${colorClase}">` +
    `${emoji} ${resultado.resultado.toUpperCase()}` +
    `</span>${premio}`;

  document.getElementById('btn-volver-hub').classList.remove('hidden');
}