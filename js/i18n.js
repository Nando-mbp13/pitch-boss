const TRADUCCIONES = {

  es: {

    lema: "Conviértete en el manager más grande del mundo",

    nuevaPartida: "Nueva Partida",
    continuar: "Continuar",

    crearClub: "Crea tu Club",
    nombreClub: "Nombre del club:",
    placeholderClub: "Ej: FC Trujillo",
    confirmar: "Confirmar →",

    presupuesto: "PRESUPUESTO",
    jornada: "JORNADA",

    plantilla: "SQUAD",
    fichajes: "FICHAJES",
    tactica: "TACTICA",
    liga: "LIGA",

    jugarJornada: "▶ JUGAR JORNADA",

    aceptar: "Aceptar",

    skip: "⏭ SKIP",
    volver: "← VOLVER"

  },

  en: {

    lema: "Become the greatest football manager in the world",

    nuevaPartida: "New Game",
    continuar: "Continue",

    crearClub: "Create Your Club",
    nombreClub: "Club Name:",
    placeholderClub: "Ex: FC Trujillo",
    confirmar: "Confirm →",

    presupuesto: "BUDGET",
    jornada: "MATCHDAY",

    plantilla: "SQUAD",
    fichajes: "TRANSFERS",
    tactica: "TACTICS",
    liga: "LEAGUE",

    jugarJornada: "▶ PLAY MATCHDAY",

    aceptar: "Accept",

    skip: "⏭ SKIP",
    volver: "← BACK"

  }

};

let idiomaActual =
  localStorage.getItem("pitch-boss-language")
  || "es";

function traducir(clave) {
  return TRADUCCIONES[idiomaActual][clave] || clave;
}

function aplicarIdioma() {

    document.querySelectorAll("[data-i18n]")
    .forEach(elemento => {

      const clave = elemento.dataset.i18n;

      elemento.textContent = traducir(clave);

    });

    document
    .querySelectorAll("[data-placeholder-i18n]")
    .forEach(elemento => {

        const clave =
        elemento.dataset.placeholderI18n;

        elemento.placeholder = traducir(clave);

    });
}

function cambiarIdioma(idioma) {

  idiomaActual = idioma;

  localStorage.setItem(
    "pitch-boss-language",
    idioma
  );

  aplicarIdioma();

  actualizarBotonIdioma();
}

function actualizarBotonIdioma(){

  const btn =
    document.getElementById("btn-idioma");

  if(!btn) return;

  btn.textContent =
    idiomaActual === "es"
      ? "🇪🇸"
      : "🇺🇸";

}

document.addEventListener("DOMContentLoaded", () => {

  actualizarBotonIdioma();

  aplicarIdioma();

  const btn =
    document.getElementById("btn-idioma");

  if(btn){

    btn.addEventListener("click", () => {

      cambiarIdioma(
        idiomaActual === "es"
          ? "en"
          : "es"
      );

    });

  }

});