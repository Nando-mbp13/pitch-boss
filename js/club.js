// =============================================
// CLUB.JS — El estado central del juego
// Aquí vive toda la información del club
// del jugador. Es el "cerebro" de la partida.
// =============================================


// --- EL OBJETO CLUB ---
// Empieza vacío. Se llena cuando el jugador
// confirma el nombre de su club en la Fase de creación.

const club = {
  nombre:      '',
  presupuesto: 5000000,   // $5,000,000 para empezar
  salarioSemanal: 0,      // Se calcula al fichar jugadores
  temporada: 1,
  jornada:     1,
  puntos:      0,
  ganados:     0,
  empatados:   0,
  perdidos:    0,
  golesFavor:  0,
  golesContra: 0,
  plantilla:   [],        // Array de jugadores (de players.js)
  mercado:     [],        // Jugadores disponibles para fichar
  titulares:   []         // Los 11 elegidos para el partido
};

function iniciarNuevaTemporada() {

  club.temporada++;

  club.jornada = 1;

  club.puntos = 0;
  club.ganados = 0;
  club.empatados = 0;
  club.perdidos = 0;
  club.golesFavor = 0;
  club.golesContra = 0;

  avanzarEdadJugadores();

  inicializarLiga(club.nombre);
}

function avanzarEdadJugadores() {

  club.plantilla.forEach(jugador => {

    jugador.edad++;

    if (jugador.edad > 34) {

      jugador.media -= aleatorio(1,3);

      jugador.media = Math.max(40, jugador.media);

      jugador.valorMercado =
        calcularValor(jugador.media, jugador.edad);
    }
  });

}


// --- INICIALIZAR CLUB ---
// Se llama una sola vez cuando el jugador crea su club.
// Genera la plantilla inicial y el mercado.

function inicializarClub(nombreElegido) {
  club.nombre      = nombreElegido;
  club.plantilla   = generarPlantilla();  // de players.js
  club.mercado     = generarMercado();    // de players.js
  club.titulares   = elegirTitularesAutomatico(); // Los mejores 11 por defecto
  calcularSalarioTotal();
}


// --- ELEGIR TITULARES AUTOMÁTICO ---
// Al inicio, ponemos los mejores jugadores de cada posición
// como titulares para que el equipo no salga vacío.

function elegirTitularesAutomatico() {
  // Separamos jugadores por posición
  const porteros  = club.plantilla.filter(j => j.posicion === 'Portero');
  const defensas  = club.plantilla.filter(j => j.posicion === 'Defensa');
  const medios    = club.plantilla.filter(j => j.posicion === 'Mediocampista');
  const delanteros = club.plantilla.filter(j => j.posicion === 'Delantero');

  // Ordenamos cada grupo por media (mayor a menor)
  const ordenarPorMedia = arr => [...arr].sort((a, b) => b.media - a.media);

  // Formación 4-4-2: 1 portero, 4 defensas, 4 medios, 2 delanteros
  const titulares = [
    ...ordenarPorMedia(porteros).slice(0, 1),
    ...ordenarPorMedia(defensas).slice(0, 4),
    ...ordenarPorMedia(medios).slice(0, 4),
    ...ordenarPorMedia(delanteros).slice(0, 2)
  ];

  // Marcamos a estos jugadores como titulares en el objeto
  titulares.forEach(j => j.titular = true);

  return titulares;
}

// --- RECALCULAR TITULARES ---
// Resetea todos los titulares y vuelve a elegir
// los mejores 11 con la plantilla actual.

function recalcularTitulares() {
  // Primero quitamos el flag titular a todos
  club.plantilla.forEach(j => j.titular = false);

  // Volvemos a elegir los mejores 11
  club.titulares = elegirTitularesAutomatico();
}


// --- CALCULAR SALARIO TOTAL SEMANAL ---
// Suma el salario de todos los jugadores en plantilla.

function calcularSalarioTotal() {
  club.salarioSemanal = club.plantilla.reduce(
    (total, jugador) => total + jugador.salario, 0
  );
}


// --- FICHAR JUGADOR ---
// Mueve un jugador del mercado a la plantilla
// y descuenta su valor del presupuesto.

function ficharJugador(idJugador) {
  // Buscamos al jugador en el mercado
  const indice  = club.mercado.findIndex(j => j.id === idJugador);
  const jugador = club.mercado[indice];

  // Verificamos que el club tenga suficiente dinero
  if (club.presupuesto < jugador.valorMercado) {
    return { ok: false, mensaje: '¡Presupuesto insuficiente!' };
  }

  // Descontamos el costo
  club.presupuesto -= jugador.valorMercado;

  // Lo movemos del mercado a la plantilla
  club.mercado.splice(indice, 1);
  club.plantilla.push(jugador);

  // Recalculamos el salario total
  calcularSalarioTotal();

  recalcularTitulares();

  return { ok: true, mensaje: `¡${jugador.nombre} fichado!` };
}


// --- VENDER JUGADOR ---
// Mueve un jugador de la plantilla al mercado
// y suma el 80% de su valor al presupuesto.

function venderJugador(idJugador) {
  const indice  = club.plantilla.findIndex(j => j.id === idJugador);
  const jugador = club.plantilla[indice];

  // No puedes vender si quedarías con menos de 11 jugadores
  if (club.plantilla.length <= 11) {
    return { ok: false, mensaje: 'Necesitas al menos 11 jugadores.' };
  }

  // Recibimos el 80% del valor (el mercado no paga el 100%)
  const dineroRecibido = Math.round(jugador.valorMercado * 0.8);
  club.presupuesto += dineroRecibido;

  // Si era titular, lo quitamos de los titulares
  if (jugador.titular) {
    jugador.titular = false;
    club.titulares = club.titulares.filter(j => j.id !== idJugador);
  }

  // Lo quitamos de la plantilla
  club.plantilla.splice(indice, 1);
  calcularSalarioTotal();

  recalcularTitulares();

  return { ok: true, mensaje: `${jugador.nombre} vendido por $${dineroRecibido.toLocaleString()}` };
}


// --- CALCULAR MEDIA DEL EQUIPO ---
// Promedio de media de los 11 titulares.
// Este número es el que entra a la simulación del partido.

function mediaEquipo() {
  if (club.titulares.length === 0) return 0;
  const suma = club.titulares.reduce((acc, j) => acc + j.media, 0);
  return Math.round(suma / club.titulares.length);
}


// --- FORMATEAR DINERO ---
// Utilidad para mostrar números grandes legibles.
// 5000000 → "$5,000,000"

function formatearDinero(cantidad) {
  return '$' + cantidad.toLocaleString('es-PE');
}