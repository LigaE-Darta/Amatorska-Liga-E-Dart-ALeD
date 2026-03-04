console.log("START JS");

function saveData() {
  localStorage.setItem("aled-data", JSON.stringify(data));
}
function loadData() {
  const saved = localStorage.getItem("aled-data");
  if (saved) {
    data = JSON.parse(saved);

    // ⭐ DODAJEMY BRAKUJĄCE POLE DO STARYCH LIG
    data.leagues.forEach(league => {
      if (league.bracket === undefined) {
        league.bracket = null;
      }
    });

  } else {
    data = { leagues: [] };
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

const leaguesSection = document.getElementById('leagues-section');
const leaguesList = document.getElementById('leagues-list');
const leagueForm = document.getElementById('league-form');

const backToLeaguesBtn = document.getElementById('back-to-leagues');
const leagueNameInput = document.getElementById('league-name');
const leaguePromotionInput = document.getElementById('league-promotion');
const leagueRelegationInput = document.getElementById('league-relegation');

const leagueView = document.getElementById('league-view');
const leagueTitle = document.getElementById('league-title');
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
function deleteLeague(id) {
  data.leagues = data.leagues.filter(l => l.id !== id);
  saveData();
  renderLeagues();
}

function renderLeagues() {
  leaguesList.innerHTML = '';

  data.leagues.forEach(league => {
    const li = document.createElement('li');

    // przycisk otwierania ligi
    const openBtn = document.createElement('button');
    openBtn.textContent = league.name;
    openBtn.addEventListener('click', () => openLeague(league.id));

    // przycisk usuwania ligi
    const deleteBtn = document.createElement('button');
    deleteBtn.textContent = "Usuń";
    deleteBtn.classList.add("delete-league-btn");

    deleteBtn.addEventListener('click', () => {
      const confirmDelete = confirm(`Czy na pewno chcesz usunąć ligę "${league.name}"?`);
      if (confirmDelete) {
        deleteLeague(league.id);
      }
    });

    li.appendChild(openBtn);
    li.appendChild(deleteBtn);
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
    matches: [],
    bracket: null
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
const urlParams = new URLSearchParams(window.location.search);
const leagueIdFromUrl = urlParams.get("league");

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
  renderSchedule(league);
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
  // 🔍 Szukamy meczu w terminarzu po parach zawodników
const matchToUpdate = league.matches.find(m =>
  (m.playerAId === playerAId && m.playerBId === playerBId) ||
  (m.playerAId === playerBId && m.playerBId === playerAId)
);

if (matchToUpdate) {
  matchToUpdate.scoreA = scoreA;
  matchToUpdate.scoreB = scoreB;
  matchToUpdate.cancelled = cancelled;
  matchToUpdate.reason = cancelled ? cancelReasonInput.value.trim() : '';
  matchToUpdate.statsA = statsA;
  matchToUpdate.statsB = statsB;
  matchToUpdate.timestamp = new Date().toISOString();
} else {
  league.matches.push({
    id: 'm-' + Date.now() + '-' + Math.random(),
    playerAId,
    playerBId,
    scoreA,
    scoreB,
    cancelled,
    reason: cancelled ? cancelReasonInput.value.trim() : '',
    statsA,
    statsB,
    round: null,
    timestamp: new Date().toISOString()
  });
}
  saveData();
renderSchedule(league);
renderTable();
renderPlayers();
renderMatchPlayersSelects();
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
          id: 'm-' + Date.now() + '-' + Math.random(),
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

    // PRZYCISK KOLEJKI
    const toggle = document.createElement("button");
    toggle.classList.add("round-toggle");
    toggle.textContent = `Kolejka ${r}`;
    container.appendChild(toggle);

    // KONTENER NA MECZE (UKRYTY)
    const content = document.createElement("div");
    content.classList.add("round-content");
    container.appendChild(content);

    // MECZE W KOLEJCE
    rounds[r].forEach(m => {
      const div = document.createElement("div");

      const nameA = playersMap[m.playerAId] || "???";
      const nameB = playersMap[m.playerBId] || "???";

      const hasScore =
        m.scoreA !== null &&
        m.scoreB !== null &&
        m.scoreA !== "" &&
        m.scoreB !== "" &&
        !isNaN(m.scoreA) &&
        !isNaN(m.scoreB);

      div.classList.add("match-card");
      if (hasScore) div.classList.add("played");

      div.innerHTML = `
        <span class="teams">${nameA} vs ${nameB}</span>
        ${
          hasScore
            ? `<span class="score">${m.scoreA} : ${m.scoreB}</span>`
            : `<span class="pending">do rozegrania</span>`
        }
      `;

      content.appendChild(div);
    });

    // ROZWIJANIE / ZWIJANIE
    toggle.addEventListener("click", () => {
      content.style.display =
        content.style.display === "block" ? "none" : "block";
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
function renderBracket(league) {
  const container = document.getElementById("bracket-container");
  container.innerHTML = "";

  if (!league.bracket) {
    container.innerHTML = `
      <button id="create-bracket-btn">Utwórz drabinkę</button>
    `;
    return;
  }
let html = "";

const rounds = league.bracket.rounds;
const roundNumbers = Object.keys(rounds).map(n => parseInt(n)).sort((a, b) => a - b);

roundNumbers.forEach(roundNum => {
  const matches = rounds[roundNum];

  html += `<h4>Runda ${roundNum}</h4>`;

  matches.forEach((m, index) => {
    const playerA = league.players.find(p => p.id === m.playerAId);
    const playerB = league.players.find(p => p.id === m.playerBId);

    const finished = m.scoreA !== null && m.scoreB !== null;

    html += `
      <div class="bracket-match">
        <h5>${playerA.name} vs ${playerB.name}</h5>
    `;

    if (!finished) {
      // formularz do wpisania wyniku
      html += `
        <div class="bracket-inputs">
          <label>Legi ${playerA.name}:
            <input type="number" class="bracket-scoreA" data-match="${index}" data-round="${roundNum}" min="0">
          </label>

          <label>Legi ${playerB.name}:
            <input type="number" class="bracket-scoreB" data-match="${index}" data-round="${roundNum}" min="0">
          </label>
        </div>

        <div class="bracket-stats">
          <fieldset>
            <legend>${playerA.name} – statystyki</legend>
            <label>Średnia 3-lotek:
              <input type="number" class="bracket-avgA" data-match="${index}" data-round="${roundNum}" step="0.01">
            </label>
            <label>Najlepszy leg:
              <input type="number" class="bracket-bestLegA" data-match="${index}" data-round="${roundNum}">
            </label>
            <label>Najlepszy checkout:
              <input type="number" class="bracket-checkoutA" data-match="${index}" data-round="${roundNum}">
            </label>
            <label>Maxy:
              <input type="number" class="bracket-maxA" data-match="${index}" data-round="${roundNum}">
            </label>
          </fieldset>

          <fieldset>
            <legend>${playerB.name} – statystyki</legend>
            <label>Średnia 3-lotek:
              <input type="number" class="bracket-avgB" data-match="${index}" data-round="${roundNum}" step="0.01">
            </label>
            <label>Najlepszy leg:
              <input type="number" class="bracket-bestLegB" data-match="${index}" data-round="${roundNum}">
            </label>
            <label>Najlepszy checkout:
              <input type="number" class="bracket-checkoutB" data-match="${index}" data-round="${roundNum}">
            </label>
            <label>Maxy:
              <input type="number" class="bracket-maxB" data-match="${index}" data-round="${roundNum}">
            </label>
          </fieldset>
        </div>

        <button class="save-bracket-result" data-match="${index}" data-round="${roundNum}">
          Zapisz wynik
        </button>
      `;
    } else {
      // mecz zakończony — pokazujemy wynik
      html += `
        <p><strong>Wynik:</strong> ${m.scoreA} : ${m.scoreB}</p>
        <p>Zwycięzca: <strong>${league.players.find(p => p.id === m.winnerId).name}</strong></p>
      `;
    }

    html += `</div>`;
  });
});

// jeśli mamy mistrza
if (league.bracket.championId) {
  const champ = league.players.find(p => p.id === league.bracket.championId);
  html += `<h3>Mistrz turnieju: ${champ.name}</h3>`;
}

container.innerHTML = html;

  // Tu później wyświetlimy drabinkę
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
renderSchedule(league);
renderHistory(league);
  alert("Terminarz wygenerowany!");
});
renderLeagues();

const showBracketBtn = document.getElementById("show-bracket");
if (showBracketBtn) {
  showBracketBtn.addEventListener("click", () => {
    const league = getLeagueById(currentLeagueId);
    renderBracket(league);

    document.getElementById("bracket-section").scrollIntoView({
      behavior: "smooth"
    });
  });
}
document.addEventListener("click", e => {
  if (e.target && e.target.id === "create-bracket-btn") {
    openBracketSetup();
  }
});

function openBracketSetup() {
  const league = getLeagueById(currentLeagueId);
  const modal = document.getElementById("bracket-modal");
  const optionsContainer = document.getElementById("bracket-size-options");

  const playerCount = league.players.length;
  const sizes = [2, 4, 8, 16, 32, 64, 128];

  const availableSizes = sizes.filter(s => s <= playerCount);

  optionsContainer.innerHTML = availableSizes
    .map(size => `<button class="bracket-size-btn" data-size="${size}">${size} zawodników</button>`)
    .join("");

  modal.classList.remove("hidden");
}
document.addEventListener("click", e => {
  if (e.target.classList.contains("bracket-size-btn")) {
    const size = parseInt(e.target.dataset.size);
    createBracket(size);
    document.getElementById("bracket-modal").classList.add("hidden");
  }
});
const closeBracketModalBtn = document.getElementById("close-bracket-modal");
if (closeBracketModalBtn) {
  closeBracketModalBtn.addEventListener("click", () => {
    document.getElementById("bracket-modal").classList.add("hidden");
  });
}
  document.getElementById("bracket-modal").classList.add("hidden");
});

function createBracket(size) {
  const league = getLeagueById(currentLeagueId);

  // kopiujemy zawodników
  let players = [...league.players];

  // tasowanie (Fisher-Yates)
  for (let i = players.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [players[i], players[j]] = [players[j], players[i]];
  }

  // bierzemy tylko tylu, ile wybrano
  players = players.slice(0, size);

  // tworzymy pary
  const matches = [];
  for (let i = 0; i < size; i += 2) {
    matches.push({
      playerAId: players[i].id,
      playerBId: players[i + 1].id,
      scoreA: null,
      scoreB: null,
      round: 1
    });
  }

  league.bracket = {
    size,
    rounds: {
      1: matches
    }
  };

  saveData();
  renderBracket(league);
}

document.addEventListener("click", e => {
  if (!e.target.classList.contains("save-bracket-result")) return;

  const index = parseInt(e.target.dataset.match);
  const league = getLeagueById(currentLeagueId);
  const match = league.bracket.rounds[1][index];

  // Pobieramy dane z formularza
  const scoreA = parseInt(document.querySelector(`.bracket-scoreA[data-match="${index}"]`).value);
  const scoreB = parseInt(document.querySelector(`.bracket-scoreB[data-match="${index}"]`).value);

  const avgA = parseFloat(document.querySelector(`.bracket-avgA[data-match="${index}"]`).value);
  const avgB = parseFloat(document.querySelector(`.bracket-avgB[data-match="${index}"]`).value);

  const bestLegA = parseInt(document.querySelector(`.bracket-bestLegA[data-match="${index}"]`).value);
  const bestLegB = parseInt(document.querySelector(`.bracket-bestLegB[data-match="${index}"]`).value);

  const checkoutA = parseInt(document.querySelector(`.bracket-checkoutA[data-match="${index}"]`).value);
  const checkoutB = parseInt(document.querySelector(`.bracket-checkoutB[data-match="${index}"]`).value);

  const maxA = parseInt(document.querySelector(`.bracket-maxA[data-match="${index}"]`).value);
  const maxB = parseInt(document.querySelector(`.bracket-maxB[data-match="${index}"]`).value);

  // Zapisujemy do obiektu meczu
  match.scoreA = scoreA;
  match.scoreB = scoreB;

  match.statsA = { avgA, bestLegA, checkoutA, maxA };
  match.statsB = { avgB, bestLegB, checkoutB, maxB };

  saveData();
  alert("Wynik zapisany!");
    // Ustalamy zwycięzcę
  let winnerId = null;
  if (scoreA > scoreB) winnerId = match.playerAId;
  if (scoreB > scoreA) winnerId = match.playerBId;

  match.winnerId = winnerId;

  // Sprawdzamy, czy wszystkie mecze rundy są już uzupełnione
  const roundNumber = match.round || 1;
  const currentRound = league.bracket.rounds[roundNumber];

  const allFinished = currentRound.every(m => m.scoreA !== null && m.scoreB !== null);

  if (!allFinished) {
    saveData();
    renderBracket(league);
    return;
  }

  // Jeśli wszystkie mecze są gotowe → generujemy kolejną rundę
  const winners = currentRound.map(m => m.winnerId);

  if (winners.length === 1) {
    // mamy zwycięzcę całego turnieju
    league.bracket.championId = winners[0];
    saveData();
    renderBracket(league);
    return;
  }

  // Tworzymy kolejną rundę
  const nextRoundNumber = roundNumber + 1;
  const nextMatches = [];

  for (let i = 0; i < winners.length; i += 2) {
    nextMatches.push({
      playerAId: winners[i],
      playerBId: winners[i + 1],
      scoreA: null,
      scoreB: null,
      round: nextRoundNumber
    });
  }

  league.bracket.rounds[nextRoundNumber] = nextMatches;

  saveData();
  renderBracket(league);

  // W kolejnym kroku: automatyczne przejście zwycięzcy
});
