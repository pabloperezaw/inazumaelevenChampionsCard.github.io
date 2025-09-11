let datosJugador;
let datosIa;
let jugador, ia;
let puntos = { jugador: 0, ia: 0 };

async function init() {
  datosJugador = await fetch('cartas.json').then(r => r.json());
  datosIa = await fetch('cartasIa.json').then(r => r.json());
  jugador = JSON.parse(JSON.stringify(datosJugador));
  ia = JSON.parse(JSON.stringify(datosIa));
  renderManos();
}

function renderManos() {
  const cj = document.getElementById('cartas-jugador');
  const tj = document.getElementById('tecnicas-jugador');
  cj.innerHTML = '';
  tj.innerHTML = '';

  jugador.jugadores.forEach((c, i) => {
    const btn = document.createElement('button');
    btn.textContent = `${c.nombre} [T:${c.estadisticas.tiro},R:${c.estadisticas.regate},D:${c.estadisticas.defensa},P:${c.estadisticas.parada}]`;
    btn.disabled = c.usada;
    btn.onclick = () => jugadorEligeCarta(i);
    cj.appendChild(btn);
  });

  jugador.tecnicas.forEach((t, i) => {
    const btn = document.createElement('button');
    btn.textContent = `${t.nombre} (${t.tipo}, P:${t.potencia})`;
    btn.disabled = t.usada;
    btn.onclick = () => jugadorEligeTecnica(i);
    tj.appendChild(btn);
  });

  document.getElementById('turno').textContent = `Turno de: Jugador`;
}

function log(msg) {
  const d = document.getElementById('log');
  d.innerHTML += `<div>${msg}</div>`;
  d.scrollTop = d.scrollHeight;
}

// Cuando el jugador elige carta de jugador
function jugadorEligeCarta(idx) {
  const cartaJ = jugador.jugadores[idx];
  if (cartaJ.usada) return;
  cartaJ.usada = true;

  const stats = Object.keys(cartaJ.estadisticas);
  const elegido = prompt(`¿Qué estadística usar? (${stats.join(', ')})`);
  if (!elegido) {
    cartaJ.usada = false;
    return;
  }
  const tipo = elegido.toLowerCase();
  const oponenteStat = (tipo === 'tiro') ? 'parada' :
                       (tipo === 'parada') ? 'tiro' :
                       (tipo === 'regate') ? 'defensa' :
                       (tipo === 'defensa') ? 'regate' : null;
  if (!oponenteStat) {
    alert('Estadística no válida.');
    cartaJ.usada = false;
    return;
  }

  // IA responde automáticamente
  const cartaI = ia.jugadores.find(c => !c.usada);
  if (!cartaI) {
    alert('IA no tiene cartas disponibles.');
    return;
  }
  cartaI.usada = true;

  comparar(
    `${cartaJ.nombre} (${tipo}:${cartaJ.estadisticas[tipo]})`,
    `IA responde con ${cartaI.nombre} (${oponenteStat}:${cartaI.estadisticas[oponenteStat]})`,
    cartaJ.estadisticas[tipo],
    cartaI.estadisticas[oponenteStat]
  );

  // Luego volver a permitir al jugador elegir
  renderManos();
}

// Cuando el jugador elige técnica
function jugadorEligeTecnica(idx) {
  const t = jugador.tecnicas[idx];
  if (t.usada) return;
  t.usada = true;

  const tIa = ia.tecnicas.find(x => !x.usada);
  if (!tIa) {
    alert('IA no tiene técnicas disponibles.');
    // si quieres, puedes deshacer el uso de la técnica del jugador
    t.usada = false;
    return;
  }
  tIa.usada = true;

  comparar(`Tú: ${t.nombre} (${t.potencia})`, `IA: ${tIa.nombre} (${tIa.potencia})`, t.potencia, tIa.potencia);

  renderManos();
}

function comparar(desc1, desc2, val1, val2) {
  log(`${desc1} vs ${desc2}`);
  if (val1 > val2) {
    puntos.jugador++;
    log(`➡️ Gana Jugador!`);
  } else if (val2 > val1) {
    puntos.ia++;
    log(`➡️ Gana IA!`);
  } else {
    log('➡️ Empate!');
  }
  document.getElementById('puntos-jugador').textContent = puntos.jugador;
  document.getElementById('puntos-ia').textContent = puntos.ia;

  // Verificar fin del juego
  const totalJ = jugador.jugadores.length + jugador.tecnicas.length;
  const usadasJ = jugador.jugadores.filter(c => c.usada).length +
                  jugador.tecnicas.filter(t => t.usada).length;
  const totalI = ia.jugadores.length + ia.tecnicas.length;
  const usadasI = ia.jugadores.filter(c => c.usada).length +
                  ia.tecnicas.filter(t => t.usada).length;

  if (usadasJ === totalJ && usadasI === totalI) {
    const ganador = puntos.jugador > puntos.ia ? '¡Tú ganas!' :
                    puntos.ia > puntos.jugador ? 'La IA gana' : 'Empate';
    log(`🎉 Fin: ${ganador}`);
  }
}

window.onload = init;
