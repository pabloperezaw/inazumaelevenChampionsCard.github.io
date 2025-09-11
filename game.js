let datosJugador;
let datosIa;
let jugador, ia;
let turno = 'jugador';
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
    btn.disabled = c.usada || turno !== 'jugador';
    btn.onclick = () => usarCartaJugador(i);
    cj.appendChild(btn);
  });

  jugador.tecnicas.forEach((t, i) => {
    const btn = document.createElement('button');
    btn.textContent = `${t.nombre} (${t.tipo}, P:${t.potencia})`;
    btn.disabled = t.usada || turno !== 'jugador';
    btn.onclick = () => usarTecnica(i);
    tj.appendChild(btn);
  });

  document.getElementById('turno').textContent = `Turno de: ${turno === 'jugador' ? 'Jugador' : 'IA'}`;
}

function log(msg) {
  const d = document.getElementById('log');
  d.innerHTML += `<div>${msg}</div>`;
  d.scrollTop = d.scrollHeight;
}

function switchTurno() {
  turno = turno === 'jugador' ? 'ia' : 'jugador';
  renderManos();
  
  if (turno === 'ia') {
    setTimeout(() => {
      turnoIA();
      // Después de la acción de la IA, devolver el turno al jugador
      turno = 'jugador';
      renderManos();
    }, 800);
  }
}

function turnoIA() {
  const disponibles = ia.jugadores.filter(c => !c.usada);
  const tec = ia.tecnicas.filter(t => !t.usada);
  
  if (Math.random() < 0.5 && tec.length) {
    // Elegir aleatoriamente una técnica de la IA
    const tIa = tec[Math.floor(Math.random() * tec.length)];
    usarTecnicaIA(tIa);
  } else if (disponibles.length) {
    const cIa = disponibles[Math.floor(Math.random() * disponibles.length)];
    usarCartaJugadorIA(cIa);
  }
}

function usarCartaJugador(idx) {
  const cartaJ = jugador.jugadores[idx];
  if (cartaJ.usada || turno !== 'jugador') return; // protección extra
  cartaJ.usada = true;
  const stats = Object.keys(cartaJ.estadisticas);
  const elegido = prompt(`¿Qué estadística usar? (${stats.join(', ')})`);
  if (!elegido) {
    // Si el usuario cancela o no ingresa nada
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
  const cartaI = ia.jugadores.find(c => !c.usada);
  if (!cartaI) {
    alert('IA no tiene cartas disponibles.');
    return;
  }
  cartaI.usada = true;
  comparar(
    `${cartaJ.nombre} (${tipo}:${cartaJ.estadisticas[tipo]})`,
    `${cartaI.nombre} (${oponenteStat}:${cartaI.estadisticas[oponenteStat]})`,
    cartaJ.estadisticas[tipo],
    cartaI.estadisticas[oponenteStat]
  );
  switchTurno();
}

function usarCartaJugadorIA(cartaI) {
  if (cartaI.usada) return;
  cartaI.usada = true;
  const tipo = ['tiro','regate','defensa','parada'][Math.floor(Math.random() * 4)];
  const op = (tipo === 'tiro') ? 'parada' :
             (tipo === 'parada') ? 'tiro' :
             (tipo === 'regate') ? 'defensa' :
             'regate';
  const cartaJ = jugador.jugadores.find(c => !c.usada);
  if (!cartaJ) {
    alert('Tú no tienes cartas disponibles.');
    return;
  }
  cartaJ.usada = true;
  comparar(
    `IA eligió ${cartaI.nombre} (${tipo}:${cartaI.estadisticas[tipo]})`,
    `${cartaJ.nombre} (${op}:${cartaJ.estadisticas[op]})`,
    cartaI.estadisticas[tipo],
    cartaJ.estadisticas[op]
  );
}

function usarTecnica(idx) {
  const t = jugador.tecnicas[idx];
  if (t.usada || turno !== 'jugador') return;
  t.usada = true;
  const tIa = ia.tecnicas.find(x => !x.usada);
  if (!tIa) {
    alert('IA no tiene técnicas disponibles.');
    return;
  }
  tIa.usada = true;
  comparar(`Tú: ${t.nombre} (${t.potencia})`, `IA: ${tIa.nombre} (${tIa.potencia})`, t.potencia, tIa.potencia);
  switchTurno();
}

function usarTecnicaIA(tIa) {
  if (tIa.usada) return;
  tIa.usada = true;
  const t = jugador.tecnicas.find(x => !x.usada);
  if (!t) {
    alert('Tú no tienes técnicas disponibles.');
    return;
  }
  t.usada = true;
  comparar(`IA: ${tIa.nombre} (${tIa.potencia})`, `Tú: ${t.nombre} (${t.potencia})`, tIa.potencia, t.potencia);
}

function comparar(desc1, desc2, val1, val2) {
  log(`${desc1} vs ${desc2}`);
  if (val1 > val2) {
    puntos[turno === 'jugador' ? 'jugador' : 'ia']++;
    log(`➡️ Gana ${turno === 'jugador' ? 'Jugador' : 'IA'}!`);
  } else if (val2 > val1) {
    puntos[turno === 'jugador' ? 'ia' : 'jugador']++;
    log(`➡️ Gana ${turno === 'jugador' ? 'IA' : 'Jugador'}!`);
  } else {
    log('➡️ Empate!');
  }
  document.getElementById('puntos-jugador').textContent = puntos.jugador;
  document.getElementById('puntos-ia').textContent = puntos.ia;

  // Condición de fin del juego: todas las cartas y técnicas usadas
  const totalJugador = jugador.jugadores.length + jugador.tecnicas.length;
  const usadasJugador = jugador.jugadores.filter(c => c.usada).length + jugador.tecnicas.filter(t => t.usada).length;
  const totalIa = ia.jugadores.length + ia.tecnicas.length;
  const usadasIa = ia.jugadores.filter(c => c.usada).length + ia.tecnicas.filter(t => t.usada).length;

  if (usadasJugador === totalJugador && usadasIa === totalIa) {
    const ganador = puntos.jugador > puntos.ia ? '¡Tú ganas!' :
                    puntos.ia > puntos.jugador ? 'La IA gana' :
                    'Empate';
    log(`🎉 Fin del juego: ${ganador}`);
  }
}

window.onload = init;
