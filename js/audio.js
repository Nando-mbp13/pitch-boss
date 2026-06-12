// =============================================
// AUDIO.JS — Motor de sonido neon-punk
// Sonidos agresivos, eléctricos e industriales
// generados 100% por Web Audio API.
// Sin archivos externos.
// =============================================

const AudioMotor = (() => {

  let ctx = null;
  function ac() {
    if (!ctx) ctx = new (window.AudioContext || window.webkitAudioContext)();
    return ctx;
  }

  // ── UTILIDADES BASE ──

  // Tono sintético con envelope
  function tono(freq, dur, vol = 0.3, type = 'square', delay = 0) {
    const c = ac();
    const o = c.createOscillator();
    const g = c.createGain();
    o.connect(g); g.connect(c.destination);
    o.type = type;
    o.frequency.setValueAtTime(freq, c.currentTime + delay);
    g.gain.setValueAtTime(0, c.currentTime + delay);
    g.gain.linearRampToValueAtTime(vol, c.currentTime + delay + 0.008);
    g.gain.exponentialRampToValueAtTime(0.001, c.currentTime + delay + dur);
    o.start(c.currentTime + delay);
    o.stop(c.currentTime + delay + dur + 0.01);
  }

  // Distorsión agresiva — onda con waveshaper
  function tonoDistorsionado(freq, dur, vol = 0.4, delay = 0) {
    const c   = ac();
    const o   = c.createOscillator();
    const ws  = c.createWaveShaper();
    const g   = c.createGain();

    // Curva de distorsión hard-clip
    const samples = 256;
    const curve   = new Float32Array(samples);
    const k       = 80;
    for (let i = 0; i < samples; i++) {
      const x  = (i * 2) / samples - 1;
      curve[i] = (Math.PI + k) * x / (Math.PI + k * Math.abs(x));
    }
    ws.curve = curve;

    o.connect(ws); ws.connect(g); g.connect(c.destination);
    o.type = 'sawtooth';
    o.frequency.setValueAtTime(freq, c.currentTime + delay);
    g.gain.setValueAtTime(0, c.currentTime + delay);
    g.gain.linearRampToValueAtTime(vol, c.currentTime + delay + 0.01);
    g.gain.exponentialRampToValueAtTime(0.001, c.currentTime + delay + dur);
    o.start(c.currentTime + delay);
    o.stop(c.currentTime + delay + dur + 0.01);
  }

  // Ruido blanco — percusión industrial
  function ruido(dur, vol = 0.3, delay = 0, highpass = 1000) {
    const c      = ac();
    const buffer = c.createBuffer(1, c.sampleRate * dur, c.sampleRate);
    const data   = buffer.getChannelData(0);
    for (let i = 0; i < data.length; i++) data[i] = Math.random() * 2 - 1;

    const src    = c.createBufferSource();
    const filter = c.createBiquadFilter();
    const g      = c.createGain();

    src.buffer        = buffer;
    filter.type       = 'highpass';
    filter.frequency.value = highpass;

    src.connect(filter); filter.connect(g); g.connect(c.destination);
    g.gain.setValueAtTime(0, c.currentTime + delay);
    g.gain.linearRampToValueAtTime(vol, c.currentTime + delay + 0.005);
    g.gain.exponentialRampToValueAtTime(0.001, c.currentTime + delay + dur);
    src.start(c.currentTime + delay);
    src.stop(c.currentTime + delay + dur + 0.01);
  }

  // Sub-bajo pesado
  function subBajo(freq, dur, vol = 0.5, delay = 0) {
    const c = ac();
    const o = c.createOscillator();
    const g = c.createGain();
    o.connect(g); g.connect(c.destination);
    o.type = 'sine';
    o.frequency.setValueAtTime(freq, c.currentTime + delay);
    o.frequency.exponentialRampToValueAtTime(freq * 0.5, c.currentTime + delay + dur);
    g.gain.setValueAtTime(vol, c.currentTime + delay);
    g.gain.exponentialRampToValueAtTime(0.001, c.currentTime + delay + dur);
    o.start(c.currentTime + delay);
    o.stop(c.currentTime + delay + dur + 0.01);
  }

  // ── SONIDOS DEL JUEGO ──

  const sons = {

    // Click de nav — toque metálico seco
    click() {
      ruido(0.04, 0.15, 0, 3000);
      tono(800, 0.04, 0.1, 'square', 0);
    },

    // Modal — bip eléctrico corto
    modal() {
      tono(1200, 0.03, 0.12, 'square', 0);
      tono(900,  0.05, 0.10, 'square', 0.04);
    },

    // Fichaje — acorde eléctrico ascendente agresivo
    fichaje() {
      subBajo(80, 0.3, 0.35, 0);
      tonoDistorsionado(220, 0.15, 0.25, 0.00);
      tonoDistorsionado(330, 0.15, 0.25, 0.12);
      tonoDistorsionado(440, 0.20, 0.30, 0.24);
      ruido(0.08, 0.2, 0, 2000);
    },

    // Venta — descarga eléctrica descendente
    venta() {
      tonoDistorsionado(440, 0.12, 0.3, 0.00);
      tonoDistorsionado(300, 0.12, 0.25, 0.14);
      tonoDistorsionado(180, 0.20, 0.20, 0.28);
      ruido(0.06, 0.15, 0, 1500);
    },

    // Error — buzz industrial desagradable
    error() {
      ruido(0.06, 0.35, 0,    500);
      tono(120, 0.08, 0.3, 'sawtooth', 0.00);
      tono(100, 0.08, 0.3, 'sawtooth', 0.09);
      tono(80,  0.12, 0.3, 'sawtooth', 0.18);
    },

    // Inicio de partido — explosión industrial + sirena
    inicioPartido() {
      // Explosión de ruido
      ruido(0.12, 0.5, 0, 200);
      // Sub bajo
      subBajo(60, 0.4, 0.6, 0);
      // Sirena ascendente
      const c = ac();
      const o = c.createOscillator();
      const g = c.createGain();
      o.connect(g); g.connect(c.destination);
      o.type = 'sawtooth';
      o.frequency.setValueAtTime(300, c.currentTime + 0.15);
      o.frequency.linearRampToValueAtTime(900, c.currentTime + 0.65);
      g.gain.setValueAtTime(0.3, c.currentTime + 0.15);
      g.gain.exponentialRampToValueAtTime(0.001, c.currentTime + 0.7);
      o.start(c.currentTime + 0.15);
      o.stop(c.currentTime + 0.75);
      // Hit final
      tonoDistorsionado(440, 0.2, 0.4, 0.7);
      ruido(0.06, 0.3, 0.7, 2000);
    },

    // Gol local — EXPLOSIÓN ELÉCTRICA AGRESIVA
    golLocal() {
      // Sub bajo impacto
      subBajo(55, 0.5, 0.7, 0);
      // Ruido de impacto
      ruido(0.08, 0.6, 0, 300);
      // Acorde distorsionado ascendente
      tonoDistorsionado(220, 0.18, 0.4, 0.05);
      tonoDistorsionado(330, 0.18, 0.4, 0.18);
      tonoDistorsionado(440, 0.18, 0.4, 0.31);
      tonoDistorsionado(550, 0.25, 0.5, 0.44);
      // Chispa final
      ruido(0.05, 0.3, 0.55, 3000);
      tono(880, 0.15, 0.25, 'square', 0.58);
    },

    // Gol rival — impacto sordo y grave
    golRival() {
      subBajo(45, 0.5, 0.5, 0);
      ruido(0.1, 0.4, 0, 200);
      tono(150, 0.25, 0.3, 'sawtooth', 0.05);
      tono(120, 0.25, 0.25, 'sawtooth', 0.28);
      tono(90,  0.35, 0.2, 'sawtooth', 0.52);
    },

    // Victoria — fanfarria eléctrica punk
    victoria() {
      subBajo(65, 0.6, 0.6, 0);
      ruido(0.06, 0.5, 0, 400);
      const hits = [
        [220,0.12,0.10],[330,0.12,0.22],[440,0.12,0.34],
        [330,0.10,0.46],[440,0.10,0.56],[550,0.20,0.66],
        [660,0.30,0.82]
      ];
      hits.forEach(([f,d,t]) => tonoDistorsionado(f, d, 0.35, t));
      ruido(0.08, 0.4, 1.0, 2000);
    },

    // Derrota — caída industrial pesada
    derrota() {
      subBajo(80, 0.8, 0.5, 0);
      ruido(0.1, 0.4, 0, 150);
      const caida = [
        [300,0.25,0.00],[240,0.25,0.28],
        [180,0.25,0.56],[120,0.40,0.84]
      ];
      caida.forEach(([f,d,t]) => tono(f, d, 0.25, 'sawtooth', t));
    },

    // Empate — two-tone industrial neutro
    empate() {
      ruido(0.05, 0.2, 0, 1000);
      tono(440, 0.15, 0.2, 'square', 0.05);
      tono(330, 0.15, 0.2, 'square', 0.28);
      ruido(0.04, 0.15, 0.5, 1500);
    },

    // Fin de temporada — clímax industrial completo
    temporadaFin() {
      subBajo(55, 1.2, 0.6, 0);
      ruido(0.15, 0.6, 0, 200);
      const fanfarria = [
        [220,0.10,0.10],[262,0.10,0.22],[330,0.10,0.34],[392,0.10,0.46],
        [440,0.18,0.58],[440,0.10,0.80],[523,0.10,0.94],[440,0.18,1.08],
        [392,0.10,1.30],[330,0.10,1.42],[262,0.10,1.54],[220,0.40,1.66]
      ];
      fanfarria.forEach(([f,d,t]) => tonoDistorsionado(f, d, 0.3, t));
      ruido(0.10, 0.4, 2.0, 2000);
    }
  };

  return sons;
})();