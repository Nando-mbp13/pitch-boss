// =============================================
// PLAYERS.JS — Generador de jugadores
// Crea jugadores ficticios con stats aleatorios
// según su posición. Esto da rejugabilidad
// infinita sin necesidad de jugadores reales.
// =============================================


// --- DATOS PARA GENERAR NOMBRES ---
const NOMBRES = [
  "Carlos", "Luis", "Diego", "Andrés", "Miguel",
  "Juan", "Pedro", "Sergio", "Rafael", "Mateo",
  "Alexis", "Bruno", "Nicolás", "Gabriel", "Rodrigo",
  "Emilio", "Fabio", "Omar", "Iván", "Tomás"
];

const APELLIDOS = [
  "García", "López", "Martínez", "Rodríguez", "Pérez",
  "Sánchez", "Torres", "Flores", "Vargas", "Ramírez",
  "Herrera", "Castro", "Morales", "Jiménez", "Romero",
  "Mendoza", "Silva", "Ramos", "Cruz", "Núñez"
];

// Posiciones del juego y cuántos de cada una tiene un equipo
const POSICIONES = {
  Portero:   { cantidad: 2 },
  Defensa:   { cantidad: 6 },
  Mediocampista: { cantidad: 6 },
  Delantero: { cantidad: 4 }
};


// --- UTILIDADES ---

// Genera un número entero aleatorio entre min y max (inclusive)
function aleatorio(min, max) {
  return Math.floor(Math.random() * (max - min + 1)) + min;
}

// Genera un nombre completo aleatorio
function generarNombre() {
  const nombre   = NOMBRES[aleatorio(0, NOMBRES.length - 1)];
  const apellido = APELLIDOS[aleatorio(0, APELLIDOS.length - 1)];
  return `${nombre} ${apellido}`;
}


// --- GENERADOR DE STATS POR POSICIÓN ---
// Cada posición tiene rangos distintos para que tenga sentido.
// Un portero no debería tener 90 de disparo.

function generarStats(posicion) {
  // Definimos los rangos según la posición
  const rangos = {
    Portero: {
      velocidad:    [50, 70],
      disparo:      [20, 45],
      pase:         [45, 65],
      defensa:      [70, 90],
      resistencia:  [60, 80]
    },
    Defensa: {
      velocidad:    [55, 75],
      disparo:      [25, 55],
      pase:         [50, 70],
      defensa:      [65, 88],
      resistencia:  [65, 82]
    },
    Mediocampista: {
      velocidad:    [60, 80],
      disparo:      [50, 75],
      pase:         [65, 88],
      defensa:      [40, 65],
      resistencia:  [68, 85]
    },
    Delantero: {
      velocidad:    [68, 90],
      disparo:      [68, 92],
      pase:         [50, 72],
      defensa:      [20, 45],
      resistencia:  [65, 85]
    }
  };

  const r = rangos[posicion];

  return {
    velocidad:   aleatorio(r.velocidad[0],   r.velocidad[1]),
    disparo:     aleatorio(r.disparo[0],     r.disparo[1]),
    pase:        aleatorio(r.pase[0],        r.pase[1]),
    defensa:     aleatorio(r.defensa[0],     r.defensa[1]),
    resistencia: aleatorio(r.resistencia[0], r.resistencia[1])
  };
}


// --- CALCULAR MEDIA DEL JUGADOR ---
// Un solo número que resume qué tan bueno es.
// Lo usaremos en la simulación del partido.

function calcularMedia(stats) {
  const valores = Object.values(stats); // [78, 82, 65, 30, 74]
  const suma    = valores.reduce((acc, val) => acc + val, 0);
  return Math.round(suma / valores.length);
}


// --- CALCULAR VALOR DE MERCADO ---
// Basado en la media y la edad. Joven + bueno = más caro.

function calcularValor(media, edad) {
  const baseValor  = media * 10000;        // Media 75 → $750,000
  const factorEdad = edad <= 23 ? 1.4      // Joven: vale más
                   : edad <= 28 ? 1.0      // Pico: valor normal
                   :              0.7;     // Veterano: vale menos
  return Math.round(baseValor * factorEdad / 50000) * 50000; // Redondeo a 50k
}


// --- GENERADOR PRINCIPAL ---
// Crea un jugador completo dado su posición y un ID único.

let contadorId = 1; // Para dar IDs únicos a cada jugador

function crearJugador(posicion) {
  const stats = generarStats(posicion);
  const media = calcularMedia(stats);
  const edad  = aleatorio(18, 34);
  const valor = calcularValor(media, edad);

  return {
    id:           contadorId++,
    nombre:       generarNombre(),
    posicion:     posicion,
    edad:         edad,
    stats:        stats,
    media:        media,
    valorMercado: valor,
    salario:      Math.round(valor / 100 / 500) * 500, // ~1% del valor, redondeado
    titular:      false  // Se define al armar la táctica
  };
}


// --- GENERAR PLANTILLA COMPLETA ---
// Crea los 18 jugadores de un equipo según las cantidades
// definidas en POSICIONES arriba.

function generarPlantilla() {
  const plantilla = [];

  // Por cada posición, creamos la cantidad indicada
  for (const [posicion, config] of Object.entries(POSICIONES)) {
    for (let i = 0; i < config.cantidad; i++) {
      plantilla.push(crearJugador(posicion));
    }
  }

  return plantilla; // Array de 18 jugadores
}


// --- GENERAR MERCADO ---
// Jugadores disponibles para fichar. Se regenera cada jornada.

function generarMercado(cantidad = 12) {
  const posicionesArray = Object.keys(POSICIONES);
  const mercado = [];

  for (let i = 0; i < cantidad; i++) {
    // Posición aleatoria para cada jugador del mercado
    const posicion = posicionesArray[aleatorio(0, posicionesArray.length - 1)];
    mercado.push(crearJugador(posicion));
  }

  return mercado;
}