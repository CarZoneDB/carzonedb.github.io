// =====================
// DROPDOWN
// =====================
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

// =====================
// DATA STATE
// =====================
const carList = document.getElementById("carList");
let carsData = [];
let initialLoadDone = false;

// =====================
// PACK LINKS
// =====================
const packLinks = {
  vip: "https://www.roblox.com/game-pass/984631403/VIP",
  "starter pack": "https://www.roblox.com/game-pass/984407482/Starter-Pack",
  "hyper pack": "https://www.roblox.com/game-pass/1260965456/Hyper-Pack",
  "track pack": "https://www.roblox.com/game-pass/1105690213/Track-Pack"
};

// =====================
// NORMALIZE DATA
// =====================
function normalizeCar(car) {
  if (!car || typeof car !== "object") return null;

  return {
    CarName: car.CarName || "Unknown Car",
    TYPE: car.TYPE || "Unknown",
    BodyKits: car.BodyKits || false,
    VMAX: car.VMAX || 0,
    ACC: car.ACC || 0,
    NEWCAR: car.NEWCAR || false,
    SHOP: car.SHOP || false,
    POWER: car.POWER || 0,
    EXP: car.EXP || 0,
    PRICE: car.PRICE || 0,
    RAP: car.RAP || 0,
    PACKNAME: car.PACKNAME || null,
    GAMEPASSID: car.GAMEPASSID || null
  };
}

// =====================
// RENDER
// =====================
function renderCars(data) {
  carList.innerHTML = data.length
    ? data.map(car => {
        const packKey = car.PACKNAME?.toLowerCase().trim();
        const packLink = packLinks[packKey] || null;

        const safeId = car.CarName.replace(/[^a-z0-9]+/gi, "-").toLowerCase();

        return `
<article class="car" id="car-${safeId}">
  <h2>${car.CarName}</h2>

  <div class="badges">
    ${car.NEWCAR ? '<span class="badge new">NEW</span>' : ""}
    ${car.TYPE === "Limited" ? '<span class="badge limited">Limited</span>' : ""}
    ${car.BodyKits ? '<span class="badge">Body Kits</span>' : ""}
    ${car.GAMEPASSID ? '<span class="badge gamepass">Gamepass</span>' : ""}
    ${
      packLink
        ? `<a class="badge pack" href="${packLink}" target="_blank">${car.PACKNAME}</a>`
        : car.PACKNAME
        ? `<span class="badge pack">${car.PACKNAME}</span>`
        : ""
    }
  </div>

  <div class="car-details">
    <div><strong>Type:</strong> ${car.TYPE}</div>
    <div><strong>In Shop:</strong> ${car.SHOP ? "Yes" : "No"}</div>
    <div><strong>Price:</strong> $${Number(car.PRICE).toLocaleString()}</div>

    <div class="rap-row">
      <strong>RAP:</strong>
      <span id="rap-${safeId}">
        ${car.RAP === 0 ? "N/A" : "$" + Number(car.RAP).toLocaleString()}
      </span>
      <span id="rap-delta-${safeId}"></span>
    </div>

    <div><strong>V-Max:</strong> ${car.VMAX} MPH</div>
    <div><strong>Horsepower:</strong> ${car.POWER} HP</div>
    <div><strong>Acceleration:</strong> 0-60 in ${car.ACC}s</div>
    <div><strong>EXP:</strong> ${car.EXP}</div>
  </div>
</article>
        `;
      }).join("")
    : "<p>No cars match your criteria.</p>";
}

// =====================
// RAP PATCH
// =====================
function patchRap(newData) {
  newData.forEach(newCar => {
    const existing = carsData.find(c => c.CarName === newCar.CarName);
    if (!existing) return;

    const oldRap = existing.RAP;
    const newRap = newCar.RAP;
    if (oldRap === newRap) return;

    const safeId = newCar.CarName.replace(/[^a-z0-9]+/gi, "-").toLowerCase();

    const rapEl = document.getElementById(`rap-${safeId}`);
    const deltaEl = document.getElementById(`rap-delta-${safeId}`);
    const cardEl = document.getElementById(`car-${safeId}`);

    if (!rapEl) return;

    const isUp = newRap > oldRap;
    const diff = newRap - oldRap;
    const sign = isUp ? "+" : "";

    rapEl.textContent = newRap === 0 ? "N/A" : `$${Number(newRap).toLocaleString()}`;

    if (deltaEl) {
      deltaEl.textContent = `${sign}${diff.toLocaleString()}`;
      deltaEl.className = "rap-delta " + (isUp ? "delta-up" : "delta-down");

      requestAnimationFrame(() => deltaEl.classList.add("delta-visible"));

      setTimeout(() => {
        deltaEl.classList.remove("delta-visible");
        deltaEl.classList.add("delta-fade");

        setTimeout(() => {
          deltaEl.textContent = "";
          deltaEl.className = "rap-delta";
        }, 600);
      }, 2000);
    }

    if (cardEl) {
      cardEl.classList.add(isUp ? "card-glow-up" : "card-glow-down");
      setTimeout(() => {
        cardEl.classList.remove("card-glow-up", "card-glow-down");
      }, 1800);
    }

    existing.RAP = newRap;
  });
}

// =====================
// FILTER + SORT
// =====================
function applyFilters() {
  const search = document.querySelector(".filter-input").value.toLowerCase();

  const types = [...document.querySelectorAll(".filter-dropdown:nth-of-type(1) input:checked")]
    .map(i => i.value);

  const shop = [...document.querySelectorAll(".filter-dropdown:nth-of-type(2) input:checked")]
    .map(i => i.value);

  const body = document.querySelectorAll(".filter-chip")[0].classList.contains("active");
  const newC = document.querySelectorAll(".filter-chip")[1].classList.contains("active");
  const gamepass = document.querySelectorAll(".filter-chip")[2].classList.contains("active");

  const minPrice = Number(document.getElementById("minPrice").value) || 0;
  const maxPrice = Number(document.getElementById("maxPrice").value) || Infinity;

  const minRap = Number(document.getElementById("minRap").value) || 0;
  const maxRap = Number(document.getElementById("maxRap").value) || Infinity;

  // SORT STATE
  const sortGroups = {};
  document.querySelectorAll(".sort-option:checked").forEach(opt => {
    sortGroups[opt.dataset.group] = opt.value;
  });

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

    if (body && !car.BodyKits) return false;
    if (newC && !car.NEWCAR) return false;
    if (gamepass && !car.GAMEPASSID) return false;

    if (car.PRICE < minPrice || car.PRICE > maxPrice) return false;
    if (car.RAP < minRap || car.RAP > maxRap) return false;

    return true;
  });

  // SORT PRIORITY SYSTEM
  const priority = ["vmax", "acc", "power", "exp"];

  filtered.sort((a, b) => {
    for (const group of priority) {
      const mode = sortGroups[group];
      if (!mode) continue;

      let diff = 0;

      switch (mode) {
        case "vmax-low": diff = a.VMAX - b.VMAX; break;
        case "vmax-high": diff = b.VMAX - a.VMAX; break;
        case "acc-low": diff = a.ACC - b.ACC; break;
        case "acc-high": diff = b.ACC - a.ACC; break;
        case "power-low": diff = a.POWER - b.POWER; break;
        case "power-high": diff = b.POWER - a.POWER; break;
        case "exp-low": diff = a.EXP - b.EXP; break;
        case "exp-high": diff = b.EXP - a.EXP; break;
      }

      if (diff !== 0) return diff;
    }
    return 0;
  });

  renderCars(filtered);
}

// =====================
// EVENTS
// =====================
document.querySelector(".filter-input").addEventListener("input", applyFilters);

document.querySelectorAll(".filter-dropdown input").forEach(el =>
  el.addEventListener("change", applyFilters)
);

document.querySelectorAll(".filter-chip").forEach(chip =>
  chip.addEventListener("click", () => {
    chip.classList.toggle("active");
    applyFilters();
  })
);

// SORT CHECKBOX RULES
document.querySelectorAll(".sort-option").forEach(cb => {
  cb.addEventListener("change", () => {
    const group = cb.dataset.group;

    if (cb.checked && group !== "none") {
      document.querySelectorAll(`.sort-option[data-group="${group}"]`)
        .forEach(o => {
          if (o !== cb) o.checked = false;
        });
    }

    if (cb.value === "none" && cb.checked) {
      document.querySelectorAll(".sort-option").forEach(o => {
        if (o !== cb) o.checked = false;
      });
    }

    applyFilters();
  });
});

// =====================
// LOAD DATA
// =====================
async function loadCars() {
  try {
    const res = await fetch(`https://carzonedb.github.io/assets/infojsons/cars.json?${Date.now()}`);
    const api = await res.json();

    const newCars = Object.values(api.data || {})
      .map(normalizeCar)
      .filter(Boolean);

    if (!initialLoadDone) {
      carsData = newCars;
      initialLoadDone = true;
      renderCars(carsData);
    } else {
      patchRap(newCars);
    }

  } catch (err) {
    console.error("Failed to load cars:", err);
  }
}

loadCars();
setInterval(loadCars, 15000);
