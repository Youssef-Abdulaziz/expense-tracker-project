const WEATHER_API = "https://api.open-meteo.com/v1/forecast?latitude=31.95&longitude=35.91&current_weather=true";

async function loadWeather() {
  const response = await fetch(WEATHER_API);
  const data = await response.json();
  renderWeather(data);
}

function renderWeather(data) {
  const container = document.getElementById("cards-container");
  const weather = data.current_weather;

  const card = document.createElement("div");
  card.className = "card m-2 text-center border rounded-4";
  card.style.width = "20rem";

  card.innerHTML = `
    <div class="card-body">
      <h5 class="card-title">Amman Weather</h5>
      <p class="card-text">Temperature: ${weather.temperature}°C</p>
      <p class="card-text">Wind Speed: ${weather.windspeed} km/h</p>
    </div>
  `;

  container.appendChild(card);
}

loadWeather();