import { createClient } from "https://cdn.jsdelivr.net/npm/@supabase/supabase-js/+esm";

const supabase = createClient(
  "https://kroqqjuhuilvzrfuuvvj.supabase.co",
  "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Imtyb3FxanVodWlsdnpyZnV1dnZqIiwicm9sZSI6ImFub24iLCJpYXQiOjE3ODM4NTg4NzksImV4cCI6MjA5OTQzNDg3OX0.pnPPwWVQuruW0CQ1ELwGyOtgNgP9VWmlLB40X-GHaG4"
);

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

        const safeId = car.CarName
          .replace(/[^a-z0-9]+/gi, "-")
          .toLowerCase();

        return `
<article class="car" id="car-${safeId}" tabindex="0">

  <h2>${car.CarName}</h2>

  <div class="badges">
    ${car.NEWCAR ? '<span class="badge new">NEW</span>' : ''}
    ${car.TYPE === 'Limited' ? '<span class="badge limited">Limited</span>' : ''}
    ${car.BodyKits ? '<span class="badge">Body Kits</span>' : ''}
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
    <div class="rap-row">
      <strong>RAP:</strong>
      <span class="rap-value" id="rap-${safeId}">
        ${car.RAP === 0 ? "N/A" : `$${Number(car.RAP).toLocaleString()}`}
      </span>
      <span class="rap-delta" id="rap-delta-${safeId}"></span>
    </div>
    <div><strong>V-Max:</strong> ${car.VMAX || 'N/A'} MPH</div>
    <div><strong>Horse Power:</strong> ${car.POWER || 'N/A'} HP</div>
    <div><strong>Acceleration:</strong> 0-60 in ${car.ACC || 'N/A'} sec</div>
    <div><strong>EXP for Driving:</strong> ${car.EXP || 'N/A'}</div>
  </div>

<div class="rating">

<button onclick="vote('${car.CarName}', 'like')">
👍 <span id="likes-${safeId}">0</span>
</button>

<button onclick="vote('${car.CarName}', 'dislike')">
👎 <span id="dislikes-${safeId}">0</span>
</button>

</div>

</article>
        `;
      }).join('')
    : '<p>No cars match your criteria.</p>';

  data.forEach(car=>{
    loadRating(car.CarName);
});
  
}

// ===== PATCH RAP (live update, no rerender) =====
function patchRap(newData) {
  newData.forEach(newCar => {
    const existing = carsData.find(c => c.CarName === newCar.CarName);
    if (!existing) return;

    const newRap = newCar.RAP;
    const oldRap = existing.RAP;

    if (oldRap === newRap) return;

    const safeId = newCar.CarName
      .replace(/[^a-z0-9]+/gi, "-")
      .toLowerCase();

    const rapEl    = document.getElementById(`rap-${safeId}`);
    const deltaEl  = document.getElementById(`rap-delta-${safeId}`);
    const cardEl   = document.getElementById(`car-${safeId}`);
    if (!rapEl) return;

    const isUp = newRap > oldRap;
    const diff = newRap - oldRap;
    const sign = isUp ? "+" : "";

    // ── Update value text ──
    rapEl.textContent =
  newRap === 0
    ? "N/A"
    : `$${Number(newRap).toLocaleString()}`;

    // ── Delta pill: slides in, holds, then fades out ──
    if (deltaEl) {
      // Reset cleanly
      if (deltaEl._fadeTimer) clearTimeout(deltaEl._fadeTimer);
      deltaEl.className = "rap-delta " + (isUp ? "delta-up" : "delta-down");
      deltaEl.textContent = `${sign}${Number(diff).toLocaleString()}`;

      // Slide in on next frame so transition fires
      requestAnimationFrame(() => {
        requestAnimationFrame(() => {
          deltaEl.classList.add("delta-visible");
        });
      });

      // Hold for 2s then fade out
      deltaEl._fadeTimer = setTimeout(() => {
        deltaEl.classList.remove("delta-visible");
        deltaEl.classList.add("delta-fade");
        deltaEl._fadeTimer = setTimeout(() => {
          deltaEl.textContent = "";
          deltaEl.className = "rap-delta";
        }, 600);
      }, 2000);
    }

    // ── RAP value colour + slide animation ──
    rapEl.classList.remove("rap-up", "rap-down");
    void rapEl.offsetWidth; // force reflow so animation restarts cleanly
    rapEl.classList.add(isUp ? "rap-up" : "rap-down");

    if (rapEl._clearTimer) clearTimeout(rapEl._clearTimer);
    rapEl._clearTimer = setTimeout(() => {
      rapEl.classList.remove("rap-up", "rap-down");
    }, 1800);

    // ── Card border glow ──
    if (cardEl) {
      cardEl.classList.remove("card-glow-up", "card-glow-down");
      void cardEl.offsetWidth;
      cardEl.classList.add(isUp ? "card-glow-up" : "card-glow-down");

      if (cardEl._glowTimer) clearTimeout(cardEl._glowTimer);
      cardEl._glowTimer = setTimeout(() => {
        cardEl.classList.remove("card-glow-up", "card-glow-down");
      }, 1800);
    }

    existing.RAP = newRap;
  });
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

  const body     = chips[0].classList.contains("active");
  const newC     = chips[1].classList.contains("active");
  const gamepass = chips[2].classList.contains("active");

  const priceMode = document.querySelector("input[name='price']:checked").value;
  const minPrice  = Number(document.getElementById("minPrice").value) || 0;
  const maxPrice  = Number(document.getElementById("maxPrice").value) || Infinity;

  const rapMode = document.querySelector("input[name='rap']:checked").value;
  const minRap  = Number(document.getElementById("minRap").value) || 0;
  const maxRap  = Number(document.getElementById("maxRap").value) || Infinity;

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

    if (priceMode === "range") {
      if (car.PRICE < minPrice || car.PRICE > maxPrice) return false;
    }

    if (rapMode === "range") {
      if (car.RAP < minRap || car.RAP > maxRap) return false;
    }

    return true;
  });

// ===== SORT =====
const sortMode = document.querySelector("input[name='sort']:checked")?.value || "none";

switch (sortMode) {

  case "vmax-low":
    filtered.sort((a, b) => a.VMAX - b.VMAX);
    break;

  case "vmax-high":
    filtered.sort((a, b) => b.VMAX - a.VMAX);
    break;

  case "acc-low":
    // Lower 0-60 time = faster
    filtered.sort((a, b) => a.ACC - b.ACC);
    break;

  case "acc-high":
    filtered.sort((a, b) => b.ACC - a.ACC);
    break;

  case "power-low":
    filtered.sort((a, b) => a.POWER - b.POWER);
    break;

  case "power-high":
    filtered.sort((a, b) => b.POWER - a.POWER);
    break;

  case "exp-low":
    filtered.sort((a, b) => a.EXP - b.EXP);
    break;

  case "exp-high":
    filtered.sort((a, b) => b.EXP - a.EXP);
    break;

    case "ratings-high":
  filtered.sort((a,b) => b.VOTES - a.VOTES);
  break;

case "ratings-low":
  filtered.sort((a,b) => a.VOTES - b.VOTES);
  break;
}

  renderCars(filtered);
}

// ===== EVENTS =====
document.querySelector(".filter-input")
  .addEventListener("input", applyFilters);

document.querySelectorAll(".filter-dropdown input")
  .forEach(el => el.addEventListener("change", applyFilters));

document.querySelectorAll(".filter-chip")
  .forEach(chip => {
    chip.addEventListener("click", () => {
      chip.classList.toggle("active");
      applyFilters();
    });
  });

document.querySelectorAll("input[name='sort']")
  .forEach(el => el.addEventListener("change", applyFilters));

document.querySelectorAll("input[name='price'], #minPrice, #maxPrice")
  .forEach(el => el.addEventListener("input", applyFilters));

document.querySelectorAll("input[name='rap'], #minRap, #maxRap")
  .forEach(el => el.addEventListener("input", applyFilters));

// Load ratings
async function addCommunityVotes(cars){

  const { data, error } = await supabase
    .from("car_ratings")
    .select("*");

  if(error){
    console.error(error);
    return cars;
  }

  return cars.map(car => {

    const rating = data.find(
      r => r.car_name === car.CarName
    );

    return {
      ...car,
      LIKES: rating?.likes || 0,
      DISLIKES: rating?.dislikes || 0,
      VOTES: (rating?.likes || 0) + (rating?.dislikes || 0)
    };

  });

}

// ===== LOAD CARS =====
async function loadCars() {
  try {
    const res = await fetch(`https://carzonedb.github.io/assets/infojsons/cars.json?${Date.now()}`);

    if (!res.ok) throw new Error(`HTTP Error: ${res.status}`);

    const api     = await res.json();
    const rawCars = api.data || {};
    let newCars = Object.values(rawCars).map(normalizeCar).filter(Boolean);

newCars = await addCommunityVotes(newCars);

    if (!initialLoadDone) {
      carsData         = newCars;
      initialLoadDone  = true;
      console.log("Cars Loaded:", carsData.length);
      renderCars(carsData);
    } else {
      patchRap(newCars);
    }

  } catch (err) {
    console.error("Failed to load cars:", err);

    if (!initialLoadDone) {
      carList.innerHTML = `<p style="color:red;">Failed to load cars data.</p>`;
    }
  }
}

// like dislike stuff
async function loadRating(carName){

  const safeId = carName
    .replace(/[^a-z0-9]+/gi, "-")
    .toLowerCase();


  const {data,error} = await supabase
    .from("car_ratings")
    .select("*")
    .eq("car_name", carName)
    .maybeSingle();


  if(error || !data) return;


  document.getElementById(
    `likes-${safeId}`
  ).textContent = data.likes;


  document.getElementById(
    `dislikes-${safeId}`
  ).textContent = data.dislikes;

}



async function vote(carName,type){

  const alreadyVoted =
    localStorage.getItem(
      "vote-"+carName
    );


  if(alreadyVoted){
    alert("You already voted for this car!");
    return;
  }



  const {data} = await supabase
    .from("car_ratings")
    .select("*")
    .eq("car_name",carName)
    .maybeSingle();



  if(!data){

    await supabase
      .from("car_ratings")
      .insert({
        car_name:carName,
        likes:type==="like" ? 1 : 0,
        dislikes:type==="dislike" ? 1 : 0
      });


  } else {


    await supabase
      .from("car_ratings")
      .update({

        likes:
        type==="like"
        ? data.likes+1
        : data.likes,


        dislikes:
        type==="dislike"
        ? data.dislikes+1
        : data.dislikes

      })
      .eq("car_name",carName);

  }

  localStorage.setItem(
    "vote-"+carName,
    true
  );


  loadRating(carName);

}

  window.vote = vote;


// Initial load + poll every 5 seconds

loadCars();
setInterval(loadCars, 15000);
