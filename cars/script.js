
// ======================
// STATE
// ======================
const carList = document.getElementById("carList");

let carsData = [];
const carMap = new Map(); // name -> { el, data, rap }

// ======================
// PACK LINKS
// ======================
const packLinks = {
  vip: "https://www.roblox.com/game-pass/984631403/VIP",
  "starter pack": "https://www.roblox.com/game-pass/984407482/Starter-Pack",
  "hyper pack": "https://www.roblox.com/game-pass/1260965456/Hyper-Pack",
  "track pack": "https://www.roblox.com/game-pass/1105690213/Track-Pack"
};

// ======================
// NORMALIZE
// ======================
function normalizeCar(car) {
  if (!car || typeof car !== "object" || Array.isArray(car)) return null;

  return {
    CarName: car.CarName || "Unknown Car",
    TYPE: car.TYPE || "Unknown",
    BodyKits: car.BodyKits || false,
    ICON: car.ICON || "",
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

// ======================
// BUILD CARDS ONCE
// ======================
function buildCars(data) {
  carList.innerHTML = "";

  data.forEach(car => {
    const safeId = car.CarName.replace(/[^a-z0-9]+/gi, "-").toLowerCase();

    const el = document.createElement("article");
    el.className = "car";
    el.id = `car-${safeId}`;

    el.dataset.name = car.CarName.toLowerCase();

    el.dataset.price = car.PRICE;
    el.dataset.rap = car.RAP;

    el.innerHTML = `
      <h2>${car.CarName}</h2>

      <div class="badges">
        ${car.NEWCAR ? '<span class="badge new">NEW</span>' : ''}
        ${car.TYPE === 'Limited' ? '<span class="badge limited">Limited</span>' : ''}
        ${car.BodyKits ? '<span class="badge">BodyKit</span>' : ''}
        ${car.GAMEPASSID ? '<span class="badge gamepass">Gamepass</span>' : ''}
        ${car.PACKNAME ? `<span class="badge pack">${car.PACKNAME}</span>` : ''}
      </div>

      <div class="car-details">
        <div><strong>Type:</strong> ${car.TYPE}</div>
        <div><strong>In Shop:</strong> ${car.SHOP ? "Yes" : "No"}</div>
        <div><strong>Price:</strong> $${Number(car.PRICE).toLocaleString()}</div>

        <div>
          <strong>RAP:</strong>
          <span class="rap-value">$${Number(car.RAP).toLocaleString()}</span>
        </div>

        <div><strong>V-Max:</strong> ${car.VMAX} MPH</div>
        <div><strong>Horse Power:</strong> ${car.POWER} HP</div>
        <div><strong>Acceleration:</strong> 0-60 in ${car.ACC} sec</div>
        <div><strong>EXP for Driving:</strong> ${car.EXP}</div>
      </div>
    `;

    carList.appendChild(el);

    carMap.set(car.CarName, {
      el,
      rap: car.RAP,
      price: car.PRICE
    });
  });
}

// ======================
// LIVE RAP PATCHING (NO RERENDER)
// ======================
function patchCars(newData) {
  newData.forEach(car => {
    const entry = carMap.get(car.CarName);
    if (!entry) return;

    const rapEl = entry.el.querySelector(".rap-value");

    const oldRap = entry.rap;
    const newRap = car.RAP;

    if (oldRap !== newRap) {
      rapEl.textContent = `$${Number(newRap).toLocaleString()}`;

      rapEl.classList.remove("rap-up", "rap-down");

      if (newRap > oldRap) {
        rapEl.classList.add("rap-up");
      } else {
        rapEl.classList.add("rap-down");
      }

      setTimeout(() => {
        rapEl.classList.remove("rap-up", "rap-down");
      }, 800);

      entry.rap = newRap;
    }
  });
}

// ======================
// FILTERS (DOM ONLY, NO RERENDER)
// ======================
function applyFilters() {
  const search = document.querySelector(".filter-input").value.toLowerCase();

  const priceMode = document.querySelector("input[name='price']:checked").value;
  const rapMode = document.querySelector("input[name='rap']:checked").value;

  const minPrice = Number(document.getElementById("minPrice").value) || 0;
  const maxPrice = Number(document.getElementById("maxPrice").value) || Infinity;

  const minRap = Number(document.getElementById("minRap").value) || 0;
  const maxRap = Number(document.getElementById("maxRap").value) || Infinity;

  const chips = document.querySelectorAll(".filter-chip");
  const body = chips[0]?.classList.contains("active");
  const newC = chips[1]?.classList.contains("active");
  const gamepass = chips[2]?.classList.contains("active");

  carMap.forEach((data, name) => {
    const el = data.el;

    let show = true;

    if (!name.toLowerCase().includes(search)) show = false;

    const price = data.price;
    const rap = data.rap;

    if (price < minPrice || price > maxPrice) show = false;
    if (rap < minRap || rap > maxRap) show = false;

    if (body && !el.querySelector(".badge:not(.new)")) show = false;
    if (newC && !el.querySelector(".badge.new")) show = false;
    if (gamepass && !el.querySelector(".badge.gamepass")) show = false;

    el.style.display = show ? "" : "none";
  });
}

// ======================
// SORTING (DOM REORDER, NO RERENDER)
// ======================
function sortCars(mode) {
  const cards = [...carMap.values()].map(v => v.el);

  let sorted = cards.sort((a, b) => {
    if (mode === "price-low") return a.dataset.price - b.dataset.price;
    if (mode === "price-high") return b.dataset.price - a.dataset.price;
    if (mode === "rap-low") return a.dataset.rap - b.dataset.rap;
    if (mode === "rap-high") return b.dataset.rap - a.dataset.rap;
    return 0;
  });

  const frag = document.createDocumentFragment();
  sorted.forEach(el => frag.appendChild(el));
  carList.appendChild(frag);
}

// ======================
// EVENTS
// ======================
document.querySelector(".filter-input").addEventListener("input", applyFilters);

document.querySelectorAll(".filter-dropdown input").forEach(el => {
  el.addEventListener("change", applyFilters);
});

document.querySelectorAll(".filter-chip").forEach(chip => {
  chip.addEventListener("click", () => {
    chip.classList.toggle("active");
    applyFilters();
  });
});

document.querySelectorAll("input[name='price'], #minPrice, #maxPrice")
  .forEach(el => el.addEventListener("input", applyFilters));

document.querySelectorAll("input[name='rap'], #minRap, #maxRap")
  .forEach(el => el.addEventListener("input", applyFilters));

// SORT TRIGGER (you must connect this to your UI)
window.sortCars = sortCars;

// ======================
// AUTO UPDATE SYSTEM
// ======================
async function loadCars() {
  try {
    const res = await fetch("https://carzonedb.github.io/assets/infojsons/cars.json");
    const api = await res.json();

    const rawCars = api.data || {};

    const newCars = Object.values(rawCars)
      .map(normalizeCar)
      .filter(Boolean);

    if (carMap.size === 0) {
      carsData = newCars;
      buildCars(newCars);
      return;
    }

    patchCars(newCars);

  } catch (err) {
    console.error("Failed to load cars:", err);
  }
}

// init
loadCars();
setInterval(loadCars, 60000);
