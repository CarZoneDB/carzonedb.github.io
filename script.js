Promise.all([
  fetch(`https://carzonedb.github.io/assets/infojsons/cars.json?${Date.now()}`).then(res => res.json()),
  fetch(`https://carzonedb.github.io/assets/infojsons/races.json?${Date.now()}`).then(res => res.json())
])
.then(([carData, raceData]) => {

  const cars = carData.data || {};
  const races = raceData.data || {};

  const totalCars = Object.values(cars).filter(car => car.CarName).length;
  const totalRaces = Object.keys(races).length;

  const carUpdated = carData.meta?.updatedAt ? new Date(carData.meta.updatedAt) : null;
  const raceUpdated = raceData.meta?.updatedAt ? new Date(raceData.meta.updatedAt) : null;

const format = date =>
  date
    ? new Intl.DateTimeFormat('en-US', {
        month: 'short',
        day: 'numeric',
        year: 'numeric',
        hour: 'numeric',
        minute: '2-digit',
        timeZoneName: 'short'
      }).format(date)
    : 'Unknown';

  const carDate = format(carUpdated);
  const raceDate = format(raceUpdated);

  document.getElementById('carsStats').innerHTML = `
    <div class="stat-number">${totalCars.toLocaleString()}</div>
    <div class="stat-label">Cars</div>
    <div class="stat-updated">Last Updated:</div>
    <div class="stat-date">${carDate}</div>
  `;

  document.getElementById('racesStats').innerHTML = `
    <div class="stat-number">${totalRaces.toLocaleString()}</div>
    <div class="stat-label">Races</div>
    <div class="stat-updated">Last Updated:</div>
    <div class="stat-date">${raceDate}</div>
  `;

})
.catch(err => {
  document.getElementById('carsStats').textContent = 'Failed to load stats.';
  document.getElementById('racesStats').textContent = 'Failed to load stats.';
  console.error(err);
});
