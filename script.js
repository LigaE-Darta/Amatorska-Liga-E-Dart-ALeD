console.log("START JS");

function saveData() {
  localStorage.setItem("aled-data", JSON.stringify(data));
}
function loadData() {
  const saved = localStorage.getItem("aled-data");
  if (saved) {
    data = JSON.parse(saved);
  }
}
// 1. Najpierw deklaracja danych
let data = JSON.parse(localStorage.getItem('aled-data')) || {
  leagues: []
};

// 2. Funkcje zapisu/odczytu
function saveData() {
  localStorage.setItem("aled-data", JSON.stringify(data));
}

function loadData() {
  const saved = localStorage.getItem("aled-data");
  if (saved) {
    data = JSON.parse(saved);
  }
}

// 3. Dopiero teraz wywołanie
loadData();

console.log("POBRANO FORMULARZ:", document.getElementById("league-form"));

let currentLeagueId = null;

function saveData() {
  localStorage.setItem('aled-data', JSON.stringify(data));
}

sSection = document.getElementById('leagues-section');
sList = document.getElementById('leagues-list');
Form = document.getElementById('league-form');
NameInput = document.getElementById('league-name');
PromotionInput = document.getElementById('league-promotion');
RelegationInput = document.getElementById('league-relegation');

View = document.getElementById('league-view');
Title = document.getElementById('league-title');
const backToLeaguesBtn = document.getElementById('back-to-leagues');

const playerForm = document.getElementById('player-form');
const playerNameInput = document.getElementById('player-name');
const playersList = document.getElementById('players-list');

const tableBody = document.getElementById('table-body');

const matchForm = document.getElementById('match-form');
const matchPlayerASelect = document.getElementById('match-player-a');
const matchPlayerBSelect = document.getElementById('match-player-b');
const scoreAInput = document.getElementById('score-a');
const scoreBInput = document.getElementById('score-b');
const matchCancelledCheckbox = document.getElementById('match-cancelled');
const statsBlocks = document.getElementById('stats-blocks');
const cancelReasonInput = document.getElementById('cancel-reason');

const avgAInput = document.getElementById('avg-a');
const bestLegAInput = document.getElementById('best-leg-a');
const bestCheckoutAInput = document.getElementById('best-checkout-a');
const highestScoreAInput = document.getElementById('highest-score-a');
const maxesAInput = document.getElementById('maxes-a');

const avgBInput = document.getElementById('avg-b');
const bestLegBInput = document.getElementById('best-leg-b');
const bestCheckoutBInput = document.getElementById('best-checkout-b');
const highestScoreBInput = document.getElementById('highest-score-b');
const maxesBInput = document.getElementById('maxes-b');

const matchesList = document.getElementById('matches-list');

function getLeagueById(id) {
  return data.leagues.find(l => l.id === id);
}

function renderLeagues() {
  leaguesList.innerHTML = '';
  data.leagues.forEach(league => {
    const li = document.createElement('li');
    const btn = document.createElement('button');
    btn.textContent = league.name;
    btn.addEventListener('click', () => openLeague(league.id));
    li.appendChild(btn);
    leaguesList.appendChild(li);
  });
}

function openLeague(id) {

  const league = getLeagueById(id);
  if (!league) {
    console.warn("Liga nie istnieje:", id);
    return;
  }

  // 🔥 Zapisujemy ID ligi w adresie URL
  const url = new URL(window.location);
  url.searchParams.set("league", id);
  window.history.replaceState({}, "", url);

  currentLeagueId = id;

  leagueTitle.textContent = league.name;
  leaguesSection.classList.add('hidden');
  leagueView.classList.remove('hidden');

  renderPlayers();
  renderMatchPlayersSelects();
  renderTable();
 
renderSchedule(league);
renderHistory(league);
  renderSeasonStats();
}

backToLeaguesBtn.addEventListener('click', () => {
  currentLeagueId = null;
  leagueView.classList.add('hidden');
  leaguesSection.classList.remove('hidden');
});

leagueForm.addEventListener('submit', e => {
  e.preventDefault();
  console.log("SUBMIT DZIAŁA");
  const name = leagueNameInput.value.trim();
  if (!name) return;
  const promotion = parseInt(leaguePromotionInput.value) || 0;
  const relegation = parseInt(leagueRelegationInput.value) || 0;

  const id = 'league-' + Date.now();

  data.leagues.push({
    id,
    name,
    promotionSpots: promotion,
    relegationSpots: relegation,
    players: [],
    matches: []
  });

  leagueNameInput.value = '';
  leaguePromotionInput.value = 0;
  leagueRelegationInput.value = 0;

  saveData();
  renderLeagues();
});
// 🔥 Auto‑otwieranie ligi z URL
const params = new URLSearchParams(window.location.search);
IdFromUrl = params.get("league");

if (leagueIdFromUrl && getLeagueById(leagueIdFromUrl)) {
    openLeague(leagueIdFromUrl);
}

playerForm.addEventListener('submit', e => {
  e.preventDefault();
  const name = playerNameInput.value.trim();
  if (!name || !currentLeagueId) return;
  const league = getLeagueById(currentLeagueId);
  league.players.push({
    id: 'p-' + Date.now() + '-' + league.players.length,
    name
  });
  playerNameInput.value = '';
  saveData();
  renderPlayers();
  renderMatchPlayersSelects();
  renderTable();
});

function renderPlayers() {
  playersList.innerHTML = '';
  const league = getLeagueById(currentLeagueId);
  league.players.forEach(p => {
    const li = document.createElement('li');
    li.textContent = p.name;
    playersList.appendChild(li);
  });
}

function renderMatchPlayersSelects() {
  const league = getLeagueById(currentLeagueId);
  matchPlayerASelect.innerHTML = '<option value="">Zawodnik A</option>';
  matchPlayerBSelect.innerHTML = '<option value="">Zawodnik B</option>';
  league.players.forEach(p => {
    const optA = document.createElement('option');
    optA.value = p.id;
    optA.textContent = p.name;
    matchPlayerASelect.appendChild(optA);

    const optB = document.createElement('option');
    optB.value = p.id;
    optB.textContent = p.name;
    matchPlayerBSelect.appendChild(optB);
  });
}

matchCancelledCheckbox.addEventListener('change', () => {
  const cancelled = matchCancelledCheckbox.checked;
  statsBlocks.style.display = cancelled ? 'none' : 'grid';
});

matchForm.addEventListener('submit', e => {
  e.preventDefault();
  const league = getLeagueById(currentLeagueId);
  if (!league) return;

  const playerAId = matchPlayerASelect.value;
  const playerBId = matchPlayerBSelect.value;
  if (!playerAId || !playerBId || playerAId === playerBId) return;

  const cancelled = matchCancelledCheckbox.checked;

  let scoreA = 0;
  let scoreB = 0;
  let statsA = null;
  let statsB = null;

  if (!cancelled) {
    scoreA = parseInt(scoreAInput.value) || 0;
    scoreB = parseInt(scoreBInput.value) || 0;

    statsA = {
      avg: parseFloat(avgAInput.value) || 0,
      bestLeg: parseInt(bestLegAInput.value) || null,
      bestCheckout: parseInt(bestCheckoutAInput.value) || null,
      highestScore: parseInt(highestScoreAInput.value) || null,
      maxes: parseInt(maxesAInput.value) || 0
    };

    statsB = {
      avg: parseFloat(avgBInput.value) || 0,
      bestLeg: parseInt(bestLegBInput.value) || null,
      bestCheckout: parseInt(bestCheckoutBInput.value) || null,
      highestScore: parseInt(highestScoreBInput.value) || null,
      maxes: parseInt(maxesBInput.value) || 0
    };
  }

  const match = {
    id: 'm-' + Date.now(),
    playerAId,
    playerBId,
    scoreA,
    scoreB,
    cancelled,
    reason: cancelled ? cancelReasonInput.value.trim() : '',
    statsA,
    statsB,
    timestamp: new Date().toISOString()
  };

  league.matches.push(match);

  scoreAInput.value = '';
  scoreBInput.value = '';
  avgAInput.value = '';
  bestLegAInput.value = '';
  bestCheckoutAInput.value = '';
  highestScoreAInput.value = '';
  maxesAInput.value = 0;
  avgBInput.value = '';
  bestLegBInput.value = '';
  bestCheckoutBInput.value = '';
  highestScoreBInput.value = '';
  maxesBInput.value = 0;
  matchCancelledCheckbox.checked = false;
  cancelReasonInput.value = '';
  statsBlocks.style.display = 'grid';

  saveData();
  renderTable();
 renderMatches();
  renderSeasonStats();
});
function calculateLeagueStats(league) {

  const statsByPlayer = {};
  league.players.forEach(p => {
    statsByPlayer[p.id] = {
      player: p,
      matches: 0,
      wins: 0,
      draws: 0,
      losses: 0,
      legsFor: 0,
      legsAgainst: 0,
      points: 0,
      avgSum: 0,
      avgCount: 0,
      maxes: 0,
      cancelled: 0
    };
  });

  // MAPA ZAWODNIKÓW (MUSI BYĆ TUTAJ, POZA PĘTLĄ)
  const playersMap = {};
  league.players.forEach(p => playersMap[p.id] = p.name);

  // PRZELICZANIE MECZÓW
  league.matches.forEach(m => {
    const a = statsByPlayer[m.playerAId];
    const b = statsByPlayer[m.playerBId];
    if (!a || !b) return;
    if (m.cancelled) {
  a.cancelled++;
  b.cancelled++;
  return;
}

// 🔥 IGNORUJEMY MECZE BEZ WYNIKU
if (
  m.scoreA === null ||
  m.scoreB === null ||
  m.scoreA === "" ||
  m.scoreB === "" ||
  isNaN(m.scoreA) ||
  isNaN(m.scoreB)
) {
  return; // NIE LICZYMY DO TABELI
}

a.matches++;
b.matches++;

a.legsFor += m.scoreA;
a.legsAgainst += m.scoreB;
b.legsFor += m.scoreB;
b.legsAgainst += m.scoreA;
   
    if (m.scoreA > m.scoreB) {
      a.wins++;
      b.losses++;
      a.points += 3;
    } else if (m.scoreB > m.scoreA) {
      b.wins++;
      a.losses++;
      b.points += 3;
    } else {
      a.draws++;
      b.draws++;
      a.points++;
      b.points++;
    }

    if (m.statsA) {
      if (m.statsA.avg > 0) {
        a.avgSum += m.statsA.avg;
        a.avgCount++;
      }
      a.maxes += m.statsA.maxes || 0;
    }

    if (m.statsB) {
      if (m.statsB.avg > 0) {
        b.avgSum += m.statsB.avg;
        b.avgCount++;
      }
      b.maxes += m.statsB.maxes || 0;
    }
  });

  // TWORZENIE WIERSZY
  const rows = Object.values(statsByPlayer).map(s => ({
    ...s,
    avg: s.avgCount > 0 ? s.avgSum / s.avgCount : 0
  }));

  // SORTOWANIE LIGOWE
  rows.sort((a, b) => {
    if (b.points !== a.points) return b.points - a.points;

    const diffA = a.legsFor - a.legsAgainst;
    const diffB = b.legsFor - b.legsAgainst;
    if (diffB !== diffA) return diffB - diffA;

    if (b.wins !== a.wins) return b.wins - a.wins;

    if (a.losses !== b.losses) return a.losses - b.losses;

    const direct = compareHeadToHead(a.player.id, b.player.id, league.matches);
    if (direct !== 0) return direct;

    return 0;
  });

  // STATYSTYKI SEZONU
  let highestCheckout = 0, highestCheckoutPlayer = "";
  let shortestLeg = null, shortestLegPlayer = "";
  let highestScore = 0, highestScorePlayer = "";
  let highestAvg = 0, highestAvgPlayer = "";
  let mostMaxes = 0, mostMaxesPlayer = "";

  league.matches.forEach(m => {
    if (m.cancelled) return;

    if (m.statsA) {
      if (m.statsA.bestCheckout > highestCheckout) {
        highestCheckout = m.statsA.bestCheckout;
        highestCheckoutPlayer = playersMap[m.playerAId];
      }
      if (m.statsA.bestLeg && (!shortestLeg || m.statsA.bestLeg < shortestLeg)) {
        shortestLeg = m.statsA.bestLeg;
        shortestLegPlayer = playersMap[m.playerAId];
      }
      if (m.statsA.highestScore > highestScore) {
        highestScore = m.statsA.highestScore;
        highestScorePlayer = playersMap[m.playerAId];
      }
      if (m.statsA.avg > highestAvg) {
        highestAvg = m.statsA.avg;
        highestAvgPlayer = playersMap[m.playerAId];
      }
      if (m.statsA.maxes > mostMaxes) {
        mostMaxes = m.statsA.maxes;
        mostMaxesPlayer = playersMap[m.playerAId];
      }
    }

    if (m.statsB) {
      if (m.statsB.bestCheckout > highestCheckout) {
        highestCheckout = m.statsB.bestCheckout;
        highestCheckoutPlayer = playersMap[m.playerBId];
      }
      if (m.statsB.bestLeg && (!shortestLeg || m.statsB.bestLeg < shortestLeg)) {
        shortestLeg = m.statsB.bestLeg;
        shortestLegPlayer = playersMap[m.playerBId];
      }
      if (m.statsB.highestScore > highestScore) {
        highestScore = m.statsB.highestScore;
        highestScorePlayer = playersMap[m.playerBId];
      }
      if (m.statsB.avg > highestAvg) {
        highestAvg = m.statsB.avg;
        highestAvgPlayer = playersMap[m.playerBId];
      }
      if (m.statsB.maxes > mostMaxes) {
        mostMaxes = m.statsB.maxes;
        mostMaxesPlayer = playersMap[m.playerBId];
      }
    }
  });
  // ZAPIS STATYSTYK
  league.seasonStats = {
    highestCheckout,
    highestCheckoutPlayer,
    shortestLeg,
    shortestLegPlayer,
    highestScore,
    highestScorePlayer,
    highestAvg,
    highestAvgPlayer,
    mostMaxes,
    mostMaxesPlayer,
    bestPlayerByPoints: rows[0]?.player.name || "",
    bestPlayerByAvg: [...rows].sort((a, b) => b.avg - a.avg)[0]?.player.name || ""
  };

  return rows;
}

function compareHeadToHead(playerAId, playerBId, matches) {
  let aWins = 0;
  let bWins = 0;

  matches.forEach(m => {
    if (m.cancelled) return;

    const isA = m.playerAId === playerAId && m.playerBId === playerBId;
    const isB = m.playerAId === playerBId && m.playerBId === playerAId;

    if (!isA && !isB) return;

    if (isA) {
      if (m.scoreA > m.scoreB) aWins++;
      if (m.scoreB > m.scoreA) bWins++;
    }

    if (isB) {
      if (m.scoreB > m.scoreA) aWins++;
      if (m.scoreA > m.scoreB) bWins++;
    }
  });

  if (aWins > bWins) return -1; // A wyżej
  if (bWins > aWins) return 1;  // B wyżej
  return 0; // remis
}
function renderTable() {
  tableBody.innerHTML = '';
  const league = getLeagueById(currentLeagueId);
  if (!league) return;

  const rows = calculateLeagueStats(league);
  const promotion = league.promotionSpots || 0;
  const relegation = league.relegationSpots || 0;

  rows.forEach((row, index) => {
    const tr = document.createElement('tr');

    if (promotion > 0 && index < promotion) {
      tr.classList.add('awans');
    }
    if (relegation > 0 && index >= rows.length - relegation) {
      tr.classList.add('spadek');
    }

    const cancelledCount = row.cancelled || 0;
    const legsDiff = row.legsFor - row.legsAgainst;

    // 🔥 Forma zawodnika (ostatnie 5 meczów)
   const formArray = getPlayerForm(row.player.id, league);
const form = formArray
  .map(color => `<span class="form-dot ${color}"></span>`)
  .join('');

    tr.innerHTML = `
      <td>${index + 1}</td>
      <td>${row.player.name}</td>
      <td>${row.matches}</td>
      <td>${row.wins}</td>
      <td>${row.draws}</td>
      <td>${row.losses}</td>
      <td>${row.legsFor} / ${row.legsAgainst} (${legsDiff >= 0 ? '+' : ''}${legsDiff})</td>
      <td>${row.points}</td>
      <td>${row.avg.toFixed(2)}</td>
      <td>${row.maxes}</td>
      <td>${cancelledCount}</td>
      <td class="forma">${form}</td>
    `;

    tableBody.appendChild(tr);
  });
}
function generateSchedule(league) {
  let players = [...league.players];
  const matches = [];

  // Jeśli liczba graczy nieparzysta → dodajemy BYE
  if (players.length % 2 !== 0) {
    players.push({ id: "bye", name: "BYE" });
  }

  const n = players.length;
  const rounds = n - 1;
  const half = n / 2;

  let rotation = players.slice();

  for (let round = 1; round <= rounds; round++) {
    for (let i = 0; i < half; i++) {
      const home = rotation[i];
      const away = rotation[n - 1 - i];

      // Pomijamy BYE
      if (home.id !== "bye" && away.id !== "bye") {
        matches.push({
          id: Date.now() + Math.random(),
          playerAId: home.id,
          playerBId: away.id,
          scoreA: null,
          scoreB: null,
          cancelled: false,
          reason: "",
          round: round, // ⭐ KOLEJKA
          timestamp: new Date().toISOString()
        });
      }
    }

    // Rotacja zawodników (algorytm Berger)
    const fixed = rotation[0];
    const rest = rotation.slice(1);
    rest.unshift(rest.pop());
    rotation = [fixed, ...rest];
  }

  league.matches = matches;
  saveData();
}

function renderSchedule(league) {
  const container = document.getElementById("schedule");
  container.innerHTML = "";

  const playersMap = {};
  league.players.forEach(p => {
    playersMap[p.id] = p.name;
  });

  const rounds = {};

  league.matches.forEach(m => {
    if (!rounds[m.round]) rounds[m.round] = [];
    rounds[m.round].push(m);
  });

  Object.keys(rounds).sort((a, b) => a - b).forEach(r => {
    const header = document.createElement("h3");
    header.textContent = `Kolejka ${r}`;
    container.appendChild(header);

    rounds[r].forEach(m => {
      const div = document.createElement("div");
      div.classList.add("match-item");

      const nameA = playersMap[m.playerAId] || "???";
      const nameB = playersMap[m.playerBId] || "???";

      const text =
        m.scoreA !== null &&
        m.scoreB !== null &&
        m.scoreA !== "" &&
        m.scoreB !== "" &&
        !isNaN(m.scoreA) &&
        !isNaN(m.scoreB)
          ? `${nameA} ${m.scoreA}:${m.scoreB} ${nameB}`
          : `${nameA} vs ${nameB} – oczekuje na wynik`;

      div.textContent = text;
      container.appendChild(div);
    });
  });
}
function renderHistory(league) {
  const container = document.getElementById("history");
  container.innerHTML = "";

  const playersMap = {};
  league.players.forEach(p => {
    playersMap[p.id] = p.name;
  });

  const played = league.matches.filter(m =>
    m.scoreA !== null &&
    m.scoreB !== null &&
    m.scoreA !== "" &&
    m.scoreB !== "" &&
    !isNaN(m.scoreA) &&
    !isNaN(m.scoreB)
  );

  if (played.length === 0) {
    container.textContent = "Brak rozegranych meczów.";
    return;
  }

  played
    .sort((a, b) => new Date(b.timestamp) - new Date(a.timestamp))
    .forEach(m => {
      const div = document.createElement("div");
      div.classList.add("history-item");

      const nameA = playersMap[m.playerAId] || "???";
      const nameB = playersMap[m.playerBId] || "???";

      div.textContent = `${nameA} ${m.scoreA}:${m.scoreB} ${nameB}`;
      container.appendChild(div);
    });
}
function getPlayerForm(playerId, league) {
  const playedMatches = league.matches
    .filter(m =>
      (m.playerAId === playerId || m.playerBId === playerId) &&
      m.scoreA !== null &&
      m.scoreB !== null &&
      m.scoreA !== "" &&
      m.scoreB !== "" &&
      !isNaN(m.scoreA) &&
      !isNaN(m.scoreB)
    )
    .sort((a, b) => new Date(b.timestamp) - new Date(a.timestamp));

  const form = [];
  const count = playedMatches.length;

  if (count === 0) {
    return ['white', 'white', 'white', 'white', 'white'];
  }

  const limit = Math.min(count, 5);
  const lastMatches = playedMatches.slice(0, limit);

  lastMatches.forEach(m => {
    const isA = m.playerAId === playerId;
    const myScore = isA ? m.scoreA : m.scoreB;
    const oppScore = isA ? m.scoreB : m.scoreA;

    if (myScore > oppScore) form.push('green');
    else if (myScore < oppScore) form.push('red');
    else form.push('orange');
  });

  while (form.length < 5) {
    form.push('white');
  }

  return form;
}

function renderSeasonStats() {
  const league = getLeagueById(currentLeagueId);
  if (!league) return;

  // ⭐ Jeśli liga nie ma jeszcze statystyk → ustaw puste
  if (!league.seasonStats) {
    league.seasonStats = {
      highestCheckout: null,
      highestCheckoutPlayer: null,
      shortestLeg: null,
      shortestLegPlayer: null,
      highestScore: null,
      highestScorePlayer: null,
      highestAvg: null,
      highestAvgPlayer: null,
      mostMaxes: null,
      mostMaxesPlayer: null,
      bestPlayerByPoints: null,
      bestPlayerByAvg: null
    };
  }

  const stats = league.seasonStats;
  const list = document.getElementById('season-stats');

  list.innerHTML = `
    <li><strong>Najwyższy checkout:</strong> 
      ${stats.highestCheckout || "—"} 
      ${stats.highestCheckoutPlayer ? " – " + stats.highestCheckoutPlayer : ""}
    </li>
    <li><strong>Najkrótszy leg:</strong> 
      ${stats.shortestLeg || "—"} 
      ${stats.shortestLegPlayer ? " – " + stats.shortestLegPlayer : ""}
    </li>
    <li><strong>Najwyższy wynik:</strong> 
      ${stats.highestScore || "—"} 
      ${stats.highestScorePlayer ? " – " + stats.highestScorePlayer : ""}
    </li>
    <li><strong>Najwyższa średnia w meczu:</strong> 
      ${stats.highestAvg ? stats.highestAvg.toFixed(2) : "—"} 
      ${stats.highestAvgPlayer ? " – " + stats.highestAvgPlayer : ""}
    </li>
    <li><strong>Najwięcej maksów (180):</strong> 
      ${stats.mostMaxes || "—"} 
      ${stats.mostMaxesPlayer ? " – " + stats.mostMaxesPlayer : ""}
    </li>
    <li><strong>Najlepszy zawodnik (punkty):</strong> ${stats.bestPlayerByPoints || "—"}</li>
    <li><strong>Najlepszy zawodnik (średnia):</strong> ${stats.bestPlayerByAvg || "—"}</li>
  `;
}
document.getElementById("generate-schedule-btn").addEventListener("click", () => {
  console.log("Klik działa!");
  const league = getLeagueById(currentLeagueId);
  if (!league) return;

  if (league.players.length < 2) {
    alert("Potrzeba minimum 2 zawodników, aby wygenerować terminarz.");
    return;
  }

  if (league.matches.length > 0) {
    const confirmReset = confirm("Terminarz już istnieje. Nadpisać?");
    if (!confirmReset) return;
  }

  generateSchedule(league);
  const league = getLeagueById(currentLeagueId);
renderSchedule(league);
renderHistory(league);
  alert("Terminarz wygenerowany!");
});
renderLeagues();
