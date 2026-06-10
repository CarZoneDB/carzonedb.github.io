// ===== Dropdown =====
function toggleDropdown(button) {
  const menu = button.nextElementSibling;

  document.querySelectorAll(".dropdown-menu").forEach(d => {
    if (d !== menu) d.classList.remove("active", "flip-left");
  });

  menu.classList.toggle("active");

  if (menu.classList.contains("active")) {
    menu.classList.remove("flip-left");

    const rect = menu.getBoundingClientRect();
    if (rect.right > window.innerWidth) {
      menu.classList.add("flip-left");
    }
  }
}

document.addEventListener("click", e => {
  if (!e.target.closest(".filter-dropdown")) {
    document.querySelectorAll(".dropdown-menu").forEach(d => {
      d.classList.remove("active", "flip-left");
    });
  }
});

// ===== DATA =====
const carList = document.getElementById("carList");
let carsData = [];
let initialLoadDone = false;

// ===== PACK LINKS =====
const packLinks = {
  'vip': 'https://www.roblox.com/game-pass/984631403/VIP',
  'starter pack': 'https://www.roblox.com/game-pass/984407482/Starter-Pack',
  'hyper pack': 'https://www.roblox.com/game-pass/1260965456/Hyper-Pack',
  'track pack': 'https://www.roblox.com/game-pass/1105690213/Track-Pack'
};

// ===== NORMALIZE DATA =====
function normalizeCar(car) {
  if (!car || typeof car !== "object" || Array.isArray(car)) return null;

  return {
    CarName:  car.CarName  || "Unknown Car",
    TYPE:     car.TYPE     || "Unknown",
    BodyKits: car.BodyKits || false,
    ICON:     car.ICON     || "",
    VMAX:     car.VMAX     || 0,
    ACC:      car.ACC      || 0,
    NEWCAR:   car.NEWCAR   || false,
    SHOP:     car.SHOP     || false,
    POWER:    car.POWER    || 0,
    EXP:      car.EXP      || 0,
    PRICE:    car.PRICE    || 0,
    RAP:      car.RAP      || 0,
    PACKNAME:   car.PACKNAME   || null,
    GAMEPASSID: car.GAMEPASSID || null
  };
}

// ===== RENDER =====
function renderCars(data) {
  carList.innerHTML = data.length
    ? data.map(car => {
        const packKey  = car.PACKNAME?.toLowerCase().trim();
        const packLink = packLinks[packKey] || null;
        const safeId   = car.CarName.replace(/[^a-z0-9]+/gi, "-").toLowerCase();

        return `
<article class="car" id="car-${safeId}" tabindex="0">
  <h2>${car.CarName}</h2>
  <div class="badges">
    ${car.NEWCAR      ? '<span class="badge new">NEW</span>' : ''}
    ${car.TYPE === 'Limited' ? '<span class="badge limited">Limited</span>' : ''}
    ${car.BodyKits    ? '<span class="badge">BodyKit</span>' : ''}
    ${car.GAMEPASSID  ? '<span class="badge gamepass">Gamepass</span>' : ''}
    ${packLink
      ? `<a href="${packLink}" target="_blank" class="badge pack" title="View on Roblox">${car.PACKNAME} 🔗</a>`
      : (car.PACKNAME ? `<span class="badge pack">${car.PACKNAME}</span>` : '')
    }
  </div>
  <div class="car-details">
    <div><strong>Type</strong> ${car.TYPE || 'N/A'}</div>
    <div><strong>In Shop</strong> ${car.SHOP ? 'Yes' : 'No'}</div>
    <div><strong>Price</strong> $${Number(car.PRICE).toLocaleString()}</div>
    <div class="rap-row">
      <strong>RAP</strong>
      <span class="rap-value" id="rap-${safeId}">$${Number(car.RAP).toLocaleString()}</span>
      <span class="rap-delta" id="rap-delta-${safeId}"></span>
    </div>
    <div><strong>V-Max</strong> ${car.VMAX || 'N/A'} MPH</div>
    <div><strong>Horsepower</strong> ${car.POWER || 'N/A'} HP</div>
    <div><strong>0–60</strong> ${car.ACC || 'N/A'} sec</div>
    <div><strong>EXP</strong> ${car.EXP || 'N/A'}</div>
  </div>
</article>`;
      }).join('')
    : '<p>No cars match your criteria.</p>';
}

// ===== PATCH RAP (live update, no rerender) =====
function patchRap(newData) {
  newData.forEach(newCar => {
    const existing = carsData.find(c => c.CarName === newCar.CarName);
    if (!existing) return;

    const newRap = newCar.RAP;
    const oldRap = existing.RAP;
    if (oldRap === newRap) return;

    const safeId  = newCar.CarName.replace(/[^a-z0-9]+/gi, "-").toLowerCase();
    const rapEl   = document.getElementById(`rap-${safeId}`);
    const deltaEl = document.getElementById(`rap-delta-${safeId}`);
    const cardEl  = document.getElementById(`car-${safeId}`);
    if (!rapEl) return;

    const isUp = newRap > oldRap;
    const diff = newRap - oldRap;
    const sign = isUp ? "+" : "";

    rapEl.textContent = `$${Number(newRap).toLocaleString()}`;

    if (deltaEl) {
      if (deltaEl._fadeTimer) clearTimeout(deltaEl._fadeTimer);
      deltaEl.className = "rap-delta " + (isUp ? "delta-up" : "delta-down");
      deltaEl.textContent = `${sign}${Number(diff).toLocaleString()}`;

      requestAnimationFrame(() => {
        requestAnimationFrame(() => deltaEl.classList.add("delta-visible"));
      });

      deltaEl._fadeTimer = setTimeout(() => {
        deltaEl.classList.remove("delta-visible");
        deltaEl.classList.add("delta-fade");
        deltaEl._fadeTimer = setTimeout(() => {
          deltaEl.textContent = "";
          deltaEl.className = "rap-delta";
        }, 600);
      }, 2000);
    }

    rapEl.classList.remove("rap-up", "rap-down");
    void rapEl.offsetWidth;
    rapEl.classList.add(isUp ? "rap-up" : "rap-down");

    if (rapEl._clearTimer) clearTimeout(rapEl._clearTimer);
    rapEl._clearTimer = setTimeout(() => rapEl.classList.remove("rap-up", "rap-down"), 1800);

    if (cardEl) {
      cardEl.classList.remove("card-glow-up", "card-glow-down");
      void cardEl.offsetWidth;
      cardEl.classList.add(isUp ? "card-glow-up" : "card-glow-down");

      if (cardEl._glowTimer) clearTimeout(cardEl._glowTimer);
      cardEl._glowTimer = setTimeout(() => cardEl.classList.remove("card-glow-up", "card-glow-down"), 1800);
    }

    existing.RAP = newRap;
  });
}

// ===== FILTER =====
function applyFilters() {
  const search = document.querySelector(".filter-input").value.toLowerCase();

  const types = [...document.querySelectorAll(".filter-dropdown:nth-of-type(1) input:checked")].map(i => i.value);
  const shop  = [...document.querySelectorAll(".filter-dropdown:nth-of-type(2) input:checked")].map(i => i.value);

  const chips    = document.querySelectorAll(".filter-chip");
  const body     = chips[0].classList.contains("active");
  const newC     = chips[1].classList.contains("active");
  const gamepass = chips[2].classList.contains("active");

  const priceMode = document.querySelector("input[name='price']:checked").value;
  const minPrice  = Number(document.getElementById("minPrice").value) || 0;
  const maxPrice  = Number(document.getElementById("maxPrice").value) || Infinity;

  const rapMode = document.querySelector("input[name='rap']:checked").value;
  const minRap  = Number(document.getElementById("minRap").value) || 0;
  const maxRap  = Number(document.getElementById("maxRap").value) || Infinity;

  const vmaxMode = document.querySelector("input[name='vmax']:checked").value;
  const minVmax  = Number(document.getElementById("minVmax").value) || 0;
  const maxVmax  = Number(document.getElementById("maxVmax").value) || Infinity;

  const accMode = document.querySelector("input[name='acc']:checked").value;
  const minAcc  = Number(document.getElementById("minAcc").value) || 0;
  const maxAcc  = Number(document.getElementById("maxAcc").value) || Infinity;

  const powerMode = document.querySelector("input[name='power']:checked").value;
  const minPower  = Number(document.getElementById("minPower").value) || 0;
  const maxPower  = Number(document.getElementById("maxPower").value) || Infinity;

  const expMode = document.querySelector("input[name='exp']:checked").value;
  const minExp  = Number(document.getElementById("minExp").value) || 0;
  const maxExp  = Number(document.getElementById("maxExp").value) || Infinity;

  let filtered = carsData.filter(car => {
    if (!car.CarName.toLowerCase().includes(search)) return false;

    if (types.length) {
      const type = car.TYPE.toLowerCase().replace(" car", "");
      if (!types.includes(type)) return false;
    }

    if (shop.length) {
      const val = car.SHOP ? "available" : "unavailable";
      if (!shop.includes(val)) return false;
    }

    if (body     && !car.BodyKits)   return false;
    if (newC     && !car.NEWCAR)     return false;
    if (gamepass && !car.GAMEPASSID) return false;

    if (priceMode === "range" && (car.PRICE < minPrice || car.PRICE > maxPrice)) return false;
    if (rapMode   === "range" && (car.RAP   < minRap   || car.RAP   > maxRap))   return false;
    if (vmaxMode  === "range" && (car.VMAX  < minVmax  || car.VMAX  > maxVmax))  return false;
    if (accMode   === "range" && (car.ACC   < minAcc   || car.ACC   > maxAcc))   return false;
    if (powerMode === "range" && (car.POWER < minPower || car.POWER > maxPower)) return false;
    if (expMode   === "range" && (car.EXP   < minExp   || car.EXP   > maxExp))   return false;

    return true;
  });

  // Sort — first active sort wins
  const sorts = [
    { mode: priceMode, asc: (a, b) => a.PRICE - b.PRICE, desc: (a, b) => b.PRICE - a.PRICE },
    { mode: rapMode,   asc: (a, b) => a.RAP   - b.RAP,   desc: (a, b) => b.RAP   - a.RAP   },
    { mode: vmaxMode,  asc: (a, b) => a.VMAX  - b.VMAX,  desc: (a, b) => b.VMAX  - a.VMAX  },
    { mode: accMode,   asc: (a, b) => a.ACC   - b.ACC,   desc: (a, b) => b.ACC   - a.ACC   },
    { mode: powerMode, asc: (a, b) => a.POWER - b.POWER, desc: (a, b) => b.POWER - a.POWER },
    { mode: expMode,   asc: (a, b) => a.EXP   - b.EXP,   desc: (a, b) => b.EXP   - a.EXP   },
  ];

  for (const s of sorts) {
    if (s.mode === "low-high") { filtered.sort(s.asc);  break; }
    if (s.mode === "high-low") { filtered.sort(s.desc); break; }
  }

  renderCars(filtered);
}

// ===== EVENTS =====
document.querySelector(".filter-input").addEventListener("input", applyFilters);

document.querySelectorAll(".filter-dropdown input")
  .forEach(el => el.addEventListener("change", applyFilters));

document.querySelectorAll(".filter-chip").forEach(chip => {
  chip.addEventListener("click", () => {
    chip.classList.toggle("active");
    applyFilters();
  });
});

["minPrice","maxPrice","minRap","maxRap","minVmax","maxVmax","minAcc","maxAcc","minPower","maxPower","minExp","maxExp"]
  .forEach(id => document.getElementById(id)?.addEventListener("input", applyFilters));

["price","rap","vmax","acc","power","exp"]
  .forEach(name => document.querySelectorAll(`input[name='${name}']`)
    .forEach(el => el.addEventListener("input", applyFilters)));

// ===== LOAD CARS =====
async function loadCars() {
  try {
    const res = await fetch(`https://carzonedb.github.io/assets/infojsons/cars.json?${Date.now()}`);
    if (!res.ok) throw new Error(`HTTP Error: ${res.status}`);

    const api     = await res.json();
    const rawCars = api.data || {};
    const newCars = Object.values(rawCars).map(normalizeCar).filter(Boolean);

    if (!initialLoadDone) {
      carsData        = newCars;
      initialLoadDone = true;
      console.log("Cars loaded:", carsData.length);
      renderCars(carsData);
    } else {
      patchRap(newCars);
    }

  } catch (err) {
    console.error("Failed to load cars:", err);
    if (!initialLoadDone) {
      carList.innerHTML = `<p style="color:#e63946;">Failed to load cars data.</p>`;
    }
  }
}

loadCars();
setInterval(loadCars, 15000);
