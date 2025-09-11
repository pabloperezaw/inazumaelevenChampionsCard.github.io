let datos;
let jugador, ia;
let turno = 'jugador';
let puntos = { jugador: 0, ia: 0 };

async function init() {
  datos = await fetch('cartas.json').then(r => r.json());
  jugador = JSON.parse(JSON.stringify(datos));
  ia = JSON.parse(JSON.stringify(datos));
  renderManos();
}

function renderManos() {
  const cj = document.getElementById('cartas-jugador');
  const tj = document.getElementById('tecnicas-jugador');
  cj.innerHTML = ''; tj.innerHTML = '';
  jugador.jugadores.forEach((c,i) => {
    const btn = document.createElement('button');
    btn.textContent = `${c.nombre} [T:${c.estadisticas.tiro},R:${c.estadisticas.regate},D:${c.estadisticas.defensa},P:${c.estadisticas.parada}]`;
    btn.disabled = c.usada || turno !== 'jugador';
    btn.onclick = () => usarCartaJugador(i);
    cj.appendChild(btn);
  });
  jugador.tecnicas.forEach((t,i) => {
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
  if (turno === 'ia') setTimeout(turnoIA, 800);
}

function turnoIA() {
  // // IA elige aleatoriamente entre técnica y jugador
  // const disponibles = ia.jugadores.filter(c => !c.usada);
  // const tec = ia.tecnicas.filter(t => !t.usada);
  // if (Math.random() < 0.5 && tec.length) usarTecnicaIA(tec[Math.floor(Math.random()*tec.length)]);
  // else if (disponibles.length) usarCartaJugadorIA(disponibles[Math.floor(Math.random()*disponibles.length)]);
  // IA elige aleatoriamente entre técnica y jugador
  const disponibles = ia.jugadores.filter(c => !c.usada);
  const tec = ia.tecnicas.filter(t => !t.usada);
  
  if (Math.random() < 0.5 && tec.length) {
    usarTecnicaIA(tec[Math.floor(Math.random() * tec.length)]);
  } else if (disponibles.length) {
    usarCartaJugadorIA(disponibles[Math.floor(Math.random() * disponibles.length)]);
  }

  // Después de que la IA haya jugado, se cambia el turno al jugador
  setTimeout(() => {
    turno = 'jugador';
    renderManos();
  }, 800); // Retardo de 800 ms para simular la acción de la IA

}

function usarCartaJugador(idx) {
  const cartaJ = jugador.jugadores[idx];
  cartaJ.usada = true;
  const stats = Object.keys(cartaJ.estadisticas);
  const elegido = prompt(`¿Qué estadística usar? (${stats.join(', ')})`);
  const tipo = elegido.toLowerCase();
  const oponenteStat = (tipo === 'tiro') ? 'parada' :
                       (tipo === 'parada') ? 'tiro' :
                       (tipo === 'regate') ? 'defensa' :
                       (tipo === 'defensa') ? 'regate' : null;
  if (!oponenteStat) return alert('Estadística no válida.');
  const cartaI = ia.jugadores.find(c => !c.usada);
  cartaI.usada = true;
  comparar(`${cartaJ.nombre} (${tipo}:${cartaJ.estadisticas[tipo]})`, `${cartaI.nombre} (${oponenteStat}:${cartaI.estadisticas[oponenteStat]})`,
            cartaJ.estadisticas[tipo], cartaI.estadisticas[oponenteStat]);
  switchTurno();
}

function usarCartaJugadorIA(cartaI) {
  cartaI.usada = true;
  const tipo = ['tiro','regate','defensa','parada'][Math.floor(Math.random()*4)];
  const op = (tipo === 'tiro') ? 'parada' :
             (tipo === 'parada') ? 'tiro' :
             (tipo === 'regate') ? 'defensa' :
             'regate';
  const cartaJ = jugador.jugadores.find(c => !c.usada);
  cartaJ.usada = true;
  comparar(`IA eligió ${cartaI.nombre} (${tipo}:${cartaI.estadisticas[tipo]})`,
            `${cartaJ.nombre} (${op}:${cartaJ.estadisticas[op]})`,
            cartaI.estadisticas[tipo], cartaJ.estadisticas[op]);
  switchTurno();
}

function usarTecnica(idx) {
  const t = jugador.tecnicas[idx];
  t.usada = true;
  const tIa = ia.tecnicas.find(x => !x.usada);
  tIa.usada = true;
  comparar(`Tú: ${t.nombre} (${t.potencia})`, `IA: ${tIa.nombre} (${tIa.potencia})`, t.potencia, tIa.potencia);
  switchTurno();
}

function usarTecnicaIA(tIa) {
  tIa.usada = true;
  const t = jugador.tecnicas.find(x => !x.usada);
  t.usada = true;
  comparar(`IA: ${tIa.nombre} (${tIa.potencia})`, `Tú: ${t.nombre} (${t.potencia})`, tIa.potencia, t.potencia);
  switchTurno();
}

function comparar(desc1, desc2, val1, val2) {
  log(`${desc1} vs ${desc2}`);
  if (val1 > val2) {
    puntos[turno === 'jugador' ? 'jugador' : 'ia']++;
    log(`➡️ Gana ${turno === 'jugador' ? 'Jugador' : 'IA'}!`);
  } else if (val2 > val1) {
    puntos[turno === 'jugador' ? 'ia' : 'jugador']++;
    log(`➡️ Gana ${turno === 'jugador' ? 'IA' : 'Jugador' }!`);
  } else {
    log('➡️ Empate!');
  }
  document.getElementById('puntos-jugador').textContent = puntos.jugador;
  document.getElementById('puntos-ia').textContent = puntos.ia;
  if (puntos.jugador + puntos.ia === 5*2 + 3*2) { // todas usadas
    const ganador = puntos.jugador > puntos.ia ? '¡Tú ganas!' : puntos.ia > puntos.jugador ? 'La IA gana' : 'Empate';
    log(`🎉 Fin del juego: ${ganador}`);
  }
}

window.onload = init;
