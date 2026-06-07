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

// ===== DATA =====
const carList = document.getElementById("carList");
let carsData = [];

// ===== PACK LINKS =====
const packLinks = {
  'vip': 'https://www.roblox.com/game-pass/984631403/VIP',
  'starter pack': 'https://www.roblox.com/game-pass/984407482/Starter-Pack',
  'hyper pack': 'https://www.roblox.com/game-pass/1260965456/Hyper-Pack',
  'track pack': 'https://www.roblox.com/game-pass/1105690213/Track-Pack'
};

// ===== NORMALIZE DATA =====
function normalizeCar(car) {

  // skip invalid entries like:
  // "2020 Loput Ereto": [3]
  if (!car || typeof car !== "object" || Array.isArray(car)) {
    return null;
  }

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

// ===== RENDER =====
function renderCars(data) {

  carList.innerHTML = data.length
    ? data.map(car => {

        const packKey = car.PACKNAME?.toLowerCase().trim();
        const packLink = packLinks[packKey] || null;

        // sanitize id
        const safeId = car.CarName
          .replace(/[^a-z0-9]+/gi, "-")
          .toLowerCase();

        return `
<article class="car" id="car-${safeId}" tabindex="0">

  <h2>${car.CarName}</h2>

  <div class="badges">
    ${car.NEWCAR ? '<span class="badge new">NEW</span>' : ''}
    ${car.TYPE === 'Limited' ? '<span class="badge limited">Limited</span>' : ''}
    ${car.BodyKits ? '<span class="badge">BodyKit</span>' : ''}
    ${car.GAMEPASSID ? '<span class="badge gamepass">Gamepass</span>' : ''}

    ${packLink
      ? `<a href="${packLink}" target="_blank" class="badge pack" title="Click to view this pack on Roblox">${car.PACKNAME} 🔗</a>`
      : (car.PACKNAME
          ? `<span class="badge pack">${car.PACKNAME}</span>`
          : '')
    }
  </div>

  <div class="car-details">
    <div><strong>Type:</strong> ${car.TYPE || 'N/A'}</div>
    <div><strong>In Shop:</strong> ${car.SHOP ? 'Yes' : 'No'}</div>
    <div><strong>Price:</strong> $${Number(car.PRICE).toLocaleString()}</div>
    <div><strong>RAP:</strong> $${Number(car.RAP).toLocaleString()}</div>
    <div><strong>V-Max:</strong> ${car.VMAX || 'N/A'} MPH</div>
    <div><strong>Horse Power:</strong> ${car.POWER || 'N/A'} HP</div>
    <div><strong>Acceleration:</strong> 0-60 in ${car.ACC || 'N/A'} sec</div>
    <div><strong>EXP for Driving:</strong> ${car.EXP || 'N/A'}</div>
  </div>

</article>
        `;
      }).join('')
    : '<p>No cars match your criteria.</p>';
}

// ===== FILTER =====
function applyFilters() {

  const search = document
    .querySelector(".filter-input")
    .value
    .toLowerCase();

  const types = [
    ...document.querySelectorAll(
      ".filter-dropdown:nth-of-type(1) input:checked"
    )
  ].map(i => i.value);

  const shop = [
    ...document.querySelectorAll(
      ".filter-dropdown:nth-of-type(2) input:checked"
    )
  ].map(i => i.value);

  const chips = document.querySelectorAll(".filter-chip");

  const body = chips[0].classList.contains("active");
  const newC = chips[1].classList.contains("active");
  const gamepass = chips[2].classList.contains("active");

  const priceMode = document.querySelector(
    "input[name='price']:checked"
  ).value;

  const minPrice = Number(
    document.getElementById("minPrice").value
  ) || 0;

  const maxPrice = Number(
    document.getElementById("maxPrice").value
  ) || Infinity;

  const rapMode = document.querySelector(
    "input[name='rap']:checked"
  ).value;

  const minRap = Number(
    document.getElementById("minRap").value
  ) || 0;

  const maxRap = Number(
    document.getElementById("maxRap").value
  ) || Infinity;

  let filtered = carsData.filter(car => {

    if (!car.CarName.toLowerCase().includes(search)) {
      return false;
    }

    if (types.length) {
      const type = car.TYPE.toLowerCase().replace(" car", "");

      if (!types.includes(type)) {
        return false;
      }
    }

    if (shop.length) {
      const val = car.SHOP
        ? "available"
        : "unavailable";

      if (!shop.includes(val)) {
        return false;
      }
    }

    if (body && !car.BodyKits) {
      return false;
    }

    if (newC && !car.NEWCAR) {
      return false;
    }

    if (gamepass && !car.GAMEPASSID) {
      return false;
    }

    if (priceMode === "range") {
      if (car.PRICE < minPrice || car.PRICE > maxPrice) {
        return false;
      }
    }

    if (rapMode === "range") {
      if (car.RAP < minRap || car.RAP > maxRap) {
        return false;
      }
    }

    return true;
  });

  // ===== SORT =====
  // Price sort takes priority; RAP sort applies if price is "any"
  if (priceMode === "low-high") {
    filtered.sort((a, b) => a.PRICE - b.PRICE);

  } else if (priceMode === "high-low") {
    filtered.sort((a, b) => b.PRICE - a.PRICE);

  } else if (rapMode === "low-high") {
    filtered.sort((a, b) => a.RAP - b.RAP);

  } else if (rapMode === "high-low") {
    filtered.sort((a, b) => b.RAP - a.RAP);
  }

  renderCars(filtered);
}

// ===== EVENTS =====
document.querySelector(".filter-input")
  .addEventListener("input", applyFilters);

document.querySelectorAll(".filter-dropdown input")
  .forEach(el => {
    el.addEventListener("change", applyFilters);
  });

document.querySelectorAll(".filter-chip")
  .forEach(chip => {

    chip.addEventListener("click", () => {
      chip.classList.toggle("active");
      applyFilters();
    });

  });

document.querySelectorAll(
  "input[name='price'], #minPrice, #maxPrice"
).forEach(el => {
  el.addEventListener("input", applyFilters);
});

document.querySelectorAll(
  "input[name='rap'], #minRap, #maxRap"
).forEach(el => {
  el.addEventListener("input", applyFilters);
});

// ===== FETCH DATA =====
fetch("https://carzonedb.github.io/assets/infojsons/cars.json")

  .then(res => {

    if (!res.ok) {
      throw new Error(`HTTP Error: ${res.status}`);
    }

    return res.json();
  })

  .then(api => {

    const rawCars = api.data || {};

    carsData = Object.values(rawCars)
      .map(normalizeCar)
      .filter(Boolean);

    console.log("Cars Loaded:", carsData.length);

    renderCars(carsData);
  })

  .catch(err => {

    console.error("Failed to load cars:", err);

    carList.innerHTML = `
      <p style="color:red;">
        Failed to load cars data.
      </p>
    `;
  });
