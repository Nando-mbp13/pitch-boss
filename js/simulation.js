// =============================================
// SIMULATION.JS — El motor del partido
// Simula un partido completo entre dos equipos
// y devuelve el resultado con eventos (goles).
// =============================================


// --- CALCULAR MEDIAS OFENSIVA Y DEFENSIVA ---
// No todos los stats pesan igual según el rol.
// El equipo ataca con velocidad + disparo + pase.
// El equipo defiende con defensa + resistencia.

function calcularMediaOfensiva(titulares) {
  return Math.round(
    titulares.reduce((acc, j) => {
      return acc + (j.stats.velocidad * 0.3)
                 + (j.stats.disparo   * 0.4)
                 + (j.stats.pase      * 0.3);
    }, 0) / titulares.length
  );
}

function calcularMediaDefensiva(titulares) {
  return Math.round(
    titulares.reduce((acc, j) => {
      return acc + (j.stats.defensa     * 0.6)
                 + (j.stats.resistencia * 0.4);
    }, 0) / titulares.length
  );
}


// --- GENERAR EQUIPO RIVAL ---
// El rival es un equipo de la liga con stats
// generados según la jornada (más fuerte con el tiempo).

function generarEquipoRival(jornada, nombreRival) {
  // La media del rival sube gradualmente con las jornadas
  const mediaBase = 55 + (jornada * 2);  // Jornada 1 → 57, Jornada 9 → 73

  // Generamos 11 titulares ficticios para el rival
  const posiciones = [
    'Portero',
    'Defensa','Defensa','Defensa','Defensa',
    'Mediocampista','Mediocampista','Mediocampista','Mediocampista',
    'Delantero','Delantero'
  ];

  const titulares = posiciones.map((pos, i) => ({
    id: 1000 + i,
    posicion: pos,
    // Cada jugador tiene una media cercana a la base con algo de variación
    stats: {
      velocidad:   Math.min(99, mediaBase + aleatorio(-8, 8)),
      disparo:     Math.min(99, mediaBase + aleatorio(-8, 8)),
      pase:        Math.min(99, mediaBase + aleatorio(-8, 8)),
      defensa:     Math.min(99, mediaBase + aleatorio(-8, 8)),
      resistencia: Math.min(99, mediaBase + aleatorio(-8, 8))
    }
  }));

  return {
    nombre:   nombreRival,
    titulares: titulares
  };
}


// --- SIMULAR UN MINUTO DE JUEGO ---
// Devuelve true si hubo gol, false si no.

function simularMinuto(mediaAtaque, mediaDefensa) {
  const fuerzaAtaque  = mediaAtaque  + aleatorio(-15, 15);
  const fuerzaDefensa = mediaDefensa + aleatorio(-15, 15);
  const hayOcasion    = fuerzaAtaque > fuerzaDefensa;

  if (!hayOcasion) return false;

  // 18% de probabilidad — más realista que el 35% anterior
  return Math.random() < 0.18;
}


// --- SIMULAR PARTIDO COMPLETO ---
// Corre 90 "minutos" y acumula goles y eventos.

function simularPartido(rival) {
  const miAtaque     = calcularMediaOfensiva(club.titulares);
  const miDefensa    = calcularMediaDefensiva(club.titulares);
  const ataqueRival  = calcularMediaOfensiva(rival.titulares);
  const defensaRival = calcularMediaDefensiva(rival.titulares);

  let golesLocal  = 0;
  let golesVisita = 0;
  const eventos   = [];

  // Reducimos a 20 "fases de juego" en lugar de 90 minutos literales.
  // Cada fase representa ~4-5 minutos reales.
  // Esto da entre 0 y 6 ocasiones por equipo — mucho más realista.
  const FASES = 20;

  for (let fase = 1; fase <= FASES; fase++) {
    const minuto = Math.round((fase / FASES) * 90); // Minuto proporcional

    // ¿Mi equipo marca?
    if (simularMinuto(miAtaque, defensaRival)) {
      golesLocal++;
      eventos.push({ minuto, equipo: 'local', marcador: `${golesLocal} - ${golesVisita}` });
    }

    // ¿El rival marca?
    if (simularMinuto(ataqueRival, miDefensa)) {
      golesVisita++;
      eventos.push({ minuto, equipo: 'visita', marcador: `${golesLocal} - ${golesVisita}` });
    }
  }

  const resultado = golesLocal > golesVisita ? 'victoria'
                  : golesLocal < golesVisita ? 'derrota'
                  :                            'empate';

  const premio = resultado === 'victoria' ? 300000
               : resultado === 'empate'   ? 100000
               :                            0;

  return { golesLocal, golesVisita, resultado, eventos, premio, rival: rival.nombre };
}


// --- APLICAR RESULTADO AL CLUB ---
// Actualiza las estadísticas del club después del partido.

function aplicarResultado(resultado) {
  club.presupuesto  += resultado.premio;
  club.golesFavor   += resultado.golesLocal;
  club.golesContra  += resultado.golesVisita;
  club.jornada++;

  if (resultado.resultado === 'victoria') {
    club.puntos  += 3;
    club.ganados++;
  } else if (resultado.resultado === 'empate') {
    club.puntos  += 1;
    club.empatados++;
  } else {
    club.perdidos++;
  }
}