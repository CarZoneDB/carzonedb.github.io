const container = document.getElementById("card-container");

// ===== MAP =====
function extractAssetId(url) {
  if (!url) return null;
  const match = url.match(/(\d+)/);
  return match ? match[1] : null;
}

function openMap(url) {
  const assetId = extractAssetId(url);
  if (!assetId) return;

  const apiUrl = `https://thumbnails.roproxy.com/v1/assets?assetIds=${assetId}&size=420x420&format=png`;

  fetch(apiUrl)
    .then(res => res.json())
    .then(data => {
      const imageUrl = data?.data?.[0]?.imageUrl;
      if (imageUrl) {
        document.getElementById("mapImage").src = imageUrl;
        document.getElementById("mapModal").style.display = "flex";
      }
    })
    .catch(console.error);
}

function closeMap() {
  document.getElementById("mapModal").style.display = "none";
  document.getElementById("mapImage").src = "";
}

// ===== RENDER RACES (API STYLE FIXED) =====
function renderRaces(api) {
  const races = api.data || {};
  const lastUpdated = api.meta?.updatedAt;

  const difficultyOrder = {
    EASY: 1,
    MEDIUM: 2,
    HARD: 3,
    EXTREME: 4
  };

  const sorted = Object.entries(races).sort(([, a], [, b]) => {
    const diffA = (a.difficulty ?? "").toUpperCase();
    const diffB = (b.difficulty ?? "").toUpperCase();
    return (difficultyOrder[diffA] || 99) - (difficultyOrder[diffB] || 99);
  });

  container.innerHTML = sorted.map(([name, race]) => {
    const rewards = race.rewards ?? [];
    const difficulty = (race.difficulty ?? "").toUpperCase();

    return `
<article class="card">
  <div class="card-header">
    <h2>${name}</h2>
    <button class="map-btn" onclick="openMap('${race.map}')">Map</button>
  </div>

  <div class="badges">
    ${difficulty === 'EASY' ? '<span class="badge easy">Easy</span>' : ''}
    ${difficulty === 'MEDIUM' ? '<span class="badge medium">Medium</span>' : ''}
    ${difficulty === 'HARD' ? '<span class="badge hard">Hard</span>' : ''}
    ${difficulty === 'EXTREME' ? '<span class="badge extreme">EXTREME</span>' : ''}
  </div>

  <div class="details">
    <div><strong>Laps:</strong> ${race.laps ?? 'N/A'}</div>
    <div><strong>Players:</strong> ${rewards.length}</div>
  </div>

  <h3>Top Rewards</h3>

  <div class="rewards">
    ${rewards.slice(0, 3).map((r, i) => `
      <div class="reward">
        <span>${i === 0 ? '🥇' : i === 1 ? '🥈' : '🥉'}</span>
        $${(r[0] ?? 0).toLocaleString()}
        <span class="xp">${r[1] ?? 0} XP</span>
      </div>
    `).join('')}
  </div>

  ${rewards.length > 3 ? `
  <details>
    <summary>View All</summary>
    ${rewards.slice(3).map((r, i) => `
      <div class="reward">
        <span>${i + 4}.</span>
        <span>$${(r[0] ?? 0).toLocaleString()}</span>
        <span class="xp">${r[1] ?? 0} XP</span>
      </div>
    `).join('')}
  </details>
  ` : ''}

</article>
`;
  }).join('');
}

// ===== FETCH RACES =====
fetch(`https://carzonedb.github.io/assets/infojsons/races.json?${Date.now()}`)
  .then(res => res.json())
  .then(renderRaces)
  .catch(() => {
    container.innerHTML = "<p>Failed to load races.</p>";
  });
