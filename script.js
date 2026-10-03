const state = {
  lat: 28.6139,
  lon: 77.2090,
  place: "New Delhi, India",
  weather: null,
  climate: null,
  charts: {},
  years: 10
};

const $ = (id) => document.getElementById(id);

let heroMap = null;
let heroMarker = null;


/* =========================================================
   HERO MAP
========================================================= */

function initHeroMap() {

  if (!window.L || heroMap) return;

  heroMap = L.map("heroMap", {

    center: [
      state.lat,
      state.lon
    ],

    zoom: 5,

    zoomControl: false,

    dragging: true,

    scrollWheelZoom: false,

    doubleClickZoom: true,

    touchZoom: true,

    worldCopyJump: true

  });


  L.tileLayer(
    "https://tile.openstreetmap.org/{z}/{x}/{y}.png",
    {

      maxZoom: 19,

      attribution:
        '&copy; OpenStreetMap contributors'

    }
  ).addTo(heroMap);


  updateHeroMap();
}


function updateHeroMap() {

  if (!heroMap) return;


  heroMap.setView(

    [
      state.lat,
      state.lon
    ],

    state.place.includes("India")
      ? 5
      : 6,

    {
      animate: true,
      duration: 0.8
    }

  );


  if (heroMarker) {

    heroMarker.remove();

  }


  const icon = L.divIcon({

    className: "",

    html:
      '<div class="location-marker"></div>',

    iconSize: [18, 18],

    iconAnchor: [9, 9],

    popupAnchor: [0, -10]

  });


  heroMarker = L.marker(

    [
      state.lat,
      state.lon
    ],

    {
      icon: icon
    }

  )

    .addTo(heroMap)

    .bindPopup(`

      <b>${state.place}</b>

      <br>

      Live climate location

    `);

}


/* =========================================================
   WEATHER CODES
========================================================= */

const weatherCode = {

  0: ["Clear sky", "☀"],

  1: ["Mainly clear", "🌤"],

  2: ["Partly cloudy", "⛅"],

  3: ["Overcast", "☁"],

  45: ["Fog", "🌫"],

  48: ["Rime fog", "🌫"],

  51: ["Light drizzle", "🌦"],

  53: ["Drizzle", "🌦"],

  55: ["Heavy drizzle", "🌧"],

  61: ["Light rain", "🌦"],

  63: ["Rain", "🌧"],

  65: ["Heavy rain", "🌧"],

  71: ["Light snow", "🌨"],

  73: ["Snow", "❄"],

  75: ["Heavy snow", "❄"],

  80: ["Rain showers", "🌦"],

  81: ["Rain showers", "🌧"],

  82: ["Heavy showers", "⛈"],

  95: ["Thunderstorm", "⛈"],

  96: ["Thunderstorm + hail", "⛈"],

  99: ["Thunderstorm + hail", "⛈"]

};


/* =========================================================
   TOAST
========================================================= */

function showToast(text) {

  const t = $("toast");

  if (!t) return;

  t.textContent = text;

  t.classList.add("show");

  setTimeout(
    () => t.classList.remove("show"),
    2800
  );

}


/* =========================================================
   LOCATION TEXT
========================================================= */

function setPlaceText(name) {

  state.place = name;


  if ($("placeName")) {

    $("placeName").textContent = name;

  }


  if ($("heroPlace")) {

    $("heroPlace").textContent = name;

  }


  if ($("regionName")) {

    $("regionName").textContent = name;

  }


  if ($("heroCoords")) {

    $("heroCoords").textContent =
      `${state.lat.toFixed(4)}°, ${state.lon.toFixed(4)}°`;

  }


  updateHeroMap();

}


/* =========================================================
   GET USER LOCATION
========================================================= */

async function getLocation() {

  if (!navigator.geolocation) {

    showToast(
      "Geolocation is not supported. Loading New Delhi."
    );

    await loadAll();

    return;

  }


  navigator.geolocation.getCurrentPosition(

    async (pos) => {

      state.lat = pos.coords.latitude;

      state.lon = pos.coords.longitude;


      try {

        const r = await fetch(

          `https://api.bigdatacloud.net/data/reverse-geocode-client?latitude=${state.lat}&longitude=${state.lon}&localityLanguage=en`

        );


        const d = await r.json();


        const locality =
          d.city ||
          d.locality ||
          d.principalSubdivision ||
          "Current location";


        const country =
          d.countryName ||
          "India";


        setPlaceText(
          `${locality}, ${country}`
        );


      }

      catch {

        setPlaceText(
          "Current location"
        );

      }


      await loadAll();

    },


    async () => {

      showToast(
        "Location permission unavailable. Using a default city."
      );

      await loadAll();

    },

    {

      enableHighAccuracy: true,

      timeout: 10000,

      maximumAge: 300000

    }

  );

}


/* =========================================================
   LIVE WEATHER
========================================================= */

async function loadWeather() {

  const url =
    `https://api.open-meteo.com/v1/forecast?latitude=${state.lat}&longitude=${state.lon}&current=temperature_2m,relative_humidity_2m,apparent_temperature,precipitation,weather_code,wind_speed_10m,uv_index&daily=temperature_2m_max,temperature_2m_min&timezone=auto&forecast_days=1`;


  const r = await fetch(url);


  if (!r.ok) {

    throw new Error(
      "Weather request failed"
    );

  }


  const d = await r.json();


  state.weather = d;


  const c = d.current;

  const daily = d.daily;


  const [condition, icon] =
    weatherCode[c.weather_code] ||
    ["Unknown", "•"];


  if ($("currentTemp")) {

    $("currentTemp").textContent =
      Math.round(c.temperature_2m);

  }


  if ($("heroTemp")) {

    $("heroTemp").textContent =
      Math.round(c.temperature_2m);

  }


  if ($("feelsLike")) {

    $("feelsLike").textContent =
      `${Math.round(c.apparent_temperature)}°C`;

  }


  if ($("currentCondition")) {

    $("currentCondition").textContent =
      condition;

  }


  if ($("heroCondition")) {

    $("heroCondition").textContent =
      condition;

  }


  if ($("currentIcon")) {

    $("currentIcon").textContent =
      icon;

  }


  if ($("heroWeatherIcon")) {

    $("heroWeatherIcon").textContent =
      icon;

  }


  if ($("humidity")) {

    $("humidity").textContent =
      Math.round(
        c.relative_humidity_2m
      );

  }


  if ($("rainfallNow")) {

    $("rainfallNow").textContent =
      Number(c.precipitation).toFixed(1);

  }


  if ($("wind")) {

    $("wind").textContent =
      Math.round(c.wind_speed_10m);

  }


  if ($("uv")) {

    $("uv").textContent =
      Number(c.uv_index ?? 0).toFixed(1);

  }


  if ($("dayMin")) {

    $("dayMin").textContent =
      `${Math.round(
        daily.temperature_2m_min[0]
      )}°`;

  }


  if ($("dayMax")) {

    $("dayMax").textContent =
      `${Math.round(
        daily.temperature_2m_max[0]
      )}°`;

  }


  const pct =
    Math.max(
      5,
      Math.min(
        95,
        (c.temperature_2m + 10) / 55 * 100
      )
    );


  if ($("tempBar")) {

    $("tempBar").style.width =
      pct + "%";

  }


  if ($("regionTemp")) {

    $("regionTemp").textContent =
      `${Math.round(
        c.temperature_2m
      )}°C`;

  }


  if ($("regionHumidity")) {

    $("regionHumidity").textContent =
      `${Math.round(
        c.relative_humidity_2m
      )}%`;

  }


  if ($("regionRain")) {

    $("regionRain").textContent =
      `${Number(
        c.precipitation
      ).toFixed(1)} mm`;

  }


  if ($("lastUpdated")) {

    $("lastUpdated").textContent =
      new Date().toLocaleTimeString(
        [],
        {
          hour: "2-digit",
          minute: "2-digit"
        }
      );

  }

}


/* =========================================================
   HISTORICAL YEAR RANGE
========================================================= */

function yearsForRange(n) {

  const end = 2025;

  return Array.from(
    { length: n },
    (_, i) => end - n + 1 + i
  );

}


/* =========================================================
   HISTORICAL CLIMATE DATA
========================================================= */

async function loadClimate() {

  const end = 2025;

  const start =
    end - state.years + 1;


  const url =
    `https://archive-api.open-meteo.com/v1/archive?latitude=${state.lat}&longitude=${state.lon}&start_date=${start}-01-01&end_date=${end}-12-31&daily=temperature_2m_mean,precipitation_sum&timezone=auto`;


  const r = await fetch(url);


  if (!r.ok) {

    throw new Error(
      "Historical climate request failed"
    );

  }


  const d = await r.json();


  const byYear = {};


  const months =
    Array.from(
      { length: 12 },
      () => 0
    );


  const monthCounts =
    Array.from(
      { length: 12 },
      () => 0
    );


  d.daily.time.forEach(

    (date, i) => {

      const y =
        Number(date.slice(0, 4));


      const m =
        Number(date.slice(5, 7)) - 1;


      byYear[y] ||= {

        temps: [],

        rain: 0

      };


      if (
        d.daily.temperature_2m_mean[i]
        != null
      ) {

        byYear[y].temps.push(
          d.daily.temperature_2m_mean[i]
        );

      }


      if (
        d.daily.precipitation_sum[i]
        != null
      ) {

        byYear[y].rain +=
          d.daily.precipitation_sum[i];

      }


      if (
        y === end &&
        d.daily.precipitation_sum[i]
        != null
      ) {

        months[m] +=
          d.daily.precipitation_sum[i];

        monthCounts[m]++;

      }

    }

  );


  const years =
    Object.keys(byYear)
      .map(Number)
      .sort();


  const temp =
    years.map(

      y => {

        const values =
          byYear[y].temps;

        return values.length

          ? values.reduce(
              (a, b) => a + b,
              0
            ) / values.length

          : 0;

      }

    );


  const rain =
    years.map(
      y => byYear[y].rain
    );


  const monthly =
    months.map(
      v => v
    );


  state.climate = {

    years,

    temp,

    rain,

    monthly

  };


  drawClimate();

  populateYearSelects();

}


/* =========================================================
   DRAW CLIMATE CHARTS
========================================================= */

function drawClimate() {

  const {
    years,
    temp,
    rain,
    monthly
  } = state.climate;


  if (!years.length) return;


  const avg =
    temp.reduce(
      (a, b) => a + b,
      0
    ) / temp.length;


  const warmI =
    temp.indexOf(
      Math.max(...temp)
    );


  const coolI =
    temp.indexOf(
      Math.min(...temp)
    );


  if ($("avgTemp")) {

    $("avgTemp").textContent =
      `${avg.toFixed(1)}°C`;

  }


  if ($("warmestYear")) {

    $("warmestYear").textContent =
      years[warmI];

  }


  if ($("warmestValue")) {

    $("warmestValue").textContent =
      `${temp[warmI].toFixed(1)}°C average`;

  }


  if ($("coolestYear")) {

    $("coolestYear").textContent =
      years[coolI];

  }


  if ($("coolestValue")) {

    $("coolestValue").textContent =
      `${temp[coolI].toFixed(1)}°C average`;

  }


  const tempSlope =
    temp.length > 1
      ? temp[temp.length - 1] -
        temp[0]
      : 0;


  const rainSlope =
    rain.length > 1
      ? rain[rain.length - 1] -
        rain[0]
      : 0;


  if ($("tempTrend")) {

    $("tempTrend").textContent =
      (tempSlope >= 0 ? "↗ " : "↘ ") +
      Math.abs(tempSlope).toFixed(2) +
      "°C period change";

  }


  if ($("rainTrend")) {

    $("rainTrend").textContent =
      (rainSlope >= 0 ? "↗ " : "↘ ") +
      Math.abs(rainSlope).toFixed(0) +
      " mm period change";

  }


  const common = {

    responsive: true,

    maintainAspectRatio: false,

    plugins: {

      legend: {
        display: false
      },

      tooltip: {

        backgroundColor: "#091725",

        borderColor:
          "rgba(150,205,255,.15)",

        borderWidth: 1,

        titleColor: "#fff",

        bodyColor: "#b9cfdd"

      }

    },

    scales: {

      x: {

        grid: {
          display: false
        },

        ticks: {

          color: "#60798b",

          font: {
            size: 9
          }

        }

      },

      y: {

        grid: {

          color:
            "rgba(150,205,255,.07)"

        },

        ticks: {

          color: "#60798b",

          font: {
            size: 9
          }

        }

      }

    }

  };


  if (state.charts.temp) {

    state.charts.temp.destroy();

  }


  if (state.charts.rain) {

    state.charts.rain.destroy();

  }


  if (state.charts.month) {

    state.charts.month.destroy();

  }


  state.charts.temp = new Chart(

    $("temperatureChart"),

    {

      type: "line",

      data: {

        labels: years,

        datasets: [

          {

            data: temp,

            borderColor: "#4fe4ff",

            backgroundColor:
              "rgba(79,228,255,.08)",

            fill: true,

            tension: .35,

            pointRadius: 2,

            pointBackgroundColor:
              "#4fe4ff",

            borderWidth: 2

          }

        ]

      },

      options: {

        ...common,

        scales: {

          ...common.scales,

          y: {

            ...common.scales.y,

            title: {

              display: true,

              text: "°C",

              color: "#60798b"

            }

          }

        }

      }

    }

  );


  state.charts.rain = new Chart(

    $("rainfallChart"),

    {

      type: "bar",

      data: {

        labels: years,

        datasets: [

          {

            data: rain,

            backgroundColor:
              "rgba(83,157,255,.48)",

            borderRadius: 5

          }

        ]

      },

      options: {

        ...common,

        scales: {

          ...common.scales,

          y: {

            ...common.scales.y,

            title: {

              display: true,

              text: "mm",

              color: "#60798b"

            }

          }

        }

      }

    }

  );


  state.charts.month = new Chart(

    $("monthlyChart"),

    {

      type: "bar",

      data: {

        labels: [

          "Jan",
          "Feb",
          "Mar",
          "Apr",
          "May",
          "Jun",
          "Jul",
          "Aug",
          "Sep",
          "Oct",
          "Nov",
          "Dec"

        ],

        datasets: [

          {

            data: monthly,

            backgroundColor:
              "rgba(85,230,165,.5)",

            borderRadius: 5

          }

        ]

      },

      options: common

    }

  );

}


/* =========================================================
   YEAR SELECTORS
========================================================= */

function populateYearSelects() {

  if (!state.climate) return;


  const years =
    state.climate.years;


  ["yearA", "yearB"].forEach(

    (id) => {

      if ($(id)) {

        $(id).innerHTML =
          years
            .map(
              y =>
                `<option value="${y}">${y}</option>`
            )
            .join("");

      }

    }

  );


  if ($("yearA")) {

    $("yearA").value =
      years[
        Math.max(
          0,
          years.length - 6
        )
      ];

  }


  if ($("yearB")) {

    $("yearB").value =
      years[years.length - 1];

  }


  compareYears();

}


/* =========================================================
   YEAR COMPARISON
========================================================= */

function compareYears() {

  if (!state.climate) return;


  const a =
    Number(
      $("yearA").value
    );


  const b =
    Number(
      $("yearB").value
    );


  const i =
    state.climate.years.indexOf(a);


  const j =
    state.climate.years.indexOf(b);


  if (i < 0 || j < 0) return;


  const td =
    state.climate.temp[j] -
    state.climate.temp[i];


  const rd =
    state.climate.rain[j] -
    state.climate.rain[i];


  const pct =
    state.climate.rain[i]
      ? rd /
        state.climate.rain[i] *
        100
      : 0;


  if ($("compareTemp")) {

    $("compareTemp").textContent =
      `${td >= 0 ? "+" : ""}${td.toFixed(2)}°C`;

  }


  if ($("compareRain")) {

    $("compareRain").textContent =
      `${rd >= 0 ? "+" : ""}${rd.toFixed(0)} mm`;

  }


  if ($("comparePercent")) {

    $("comparePercent").textContent =
      `${pct >= 0 ? "+" : ""}${pct.toFixed(1)}%`;

  }


  const indicator =

    Math.abs(td) >= 1.0 ||
    Math.abs(pct) >= 20

      ? "Significant shift"

      : Math.abs(td) >= .5 ||
        Math.abs(pct) >= 10

        ? "Noticeable shift"

        : "Smaller shift";


  if ($("compareIndicator")) {

    $("compareIndicator").textContent =
      indicator;

  }

}


/* =========================================================
   CHAT MESSAGE
========================================================= */

function addMessage(text, type) {

  const el =
    document.createElement("div");


  el.className =
    `message ${type}`;


  el.textContent = text;


  $("messages").appendChild(el);


  $("messages").scrollTop =
    $("messages").scrollHeight;


  return el;

}


/* =========================================================
   BUILD CLIMATE CONTEXT FOR INDRA
========================================================= */

function getClimateContext() {

  const weather =
    state.weather?.current;


  const climate =
    state.climate;


  let historical = null;


  if (
    climate &&
    climate.years.length > 0
  ) {

    const first =
      climate.years[0];

    const last =
      climate.years[
        climate.years.length - 1
      ];


    const firstTemp =
      climate.temp[0];


    const lastTemp =
      climate.temp[
        climate.temp.length - 1
      ];


    const firstRain =
      climate.rain[0];


    const lastRain =
      climate.rain[
        climate.rain.length - 1
      ];


    historical = {

      period:
        `${first} to ${last}`,

      startingTemperature:
        Number(firstTemp.toFixed(2)),

      latestTemperature:
        Number(lastTemp.toFixed(2)),

      temperatureChange:
        Number(
          (lastTemp - firstTemp)
            .toFixed(2)
        ),

      startingRainfall:
        Number(
          firstRain.toFixed(2)
        ),

      latestRainfall:
        Number(
          lastRain.toFixed(2)
        ),

      rainfallChange:
        Number(
          (lastRain - firstRain)
            .toFixed(2)
        )

    };

  }


  return {

    location: state.place,

    latitude: state.lat,

    longitude: state.lon,

    currentWeather: weather
      ? {

          temperature:
            weather.temperature_2m,

          apparentTemperature:
            weather.apparent_temperature,

          humidity:
            weather.relative_humidity_2m,

          precipitation:
            weather.precipitation,

          windSpeed:
            weather.wind_speed_10m,

          uvIndex:
            weather.uv_index,

          weatherCode:
            weather.weather_code

        }

      : null,

    historicalClimate:
      historical

  };

}


/* =========================================================
   INDRA AI CHAT
========================================================= */

async function sendToIndra(question, thinkingMessage) {

  try {

    const response =
      await fetch(
        "/api/chat",
        {

          method: "POST",

          headers: {

            "Content-Type":
              "application/json"

          },

          body: JSON.stringify({

            message: question,

            climateData:
              getClimateContext()

          })

        }
      );


    let data;


    try {

      data =
        await response.json();

    }

    catch {

      throw new Error(
        "The server returned an invalid response."
      );

    }


    if (!response.ok) {

      throw new Error(
        data.error ||
        "INDRA AI request failed."
      );

    }


    if (
      !data.answer ||
      !String(data.answer).trim()
    ) {

      throw new Error(
        "INDRA returned an empty answer."
      );

    }


    thinkingMessage.textContent =
      data.answer;


    $("messages").scrollTop =
      $("messages").scrollHeight;


  }

  catch (error) {

    console.error(
      "INDRA AI ERROR:",
      error
    );


    thinkingMessage.textContent =
      "INDRA could not connect to the AI server. Please check that the server is running and try again.";


  }

}


/* =========================================================
   SEARCH PLACE
========================================================= */

async function searchPlace(query) {

  const cleanQuery =
    query.trim();


  if (!cleanQuery) {

    throw new Error(
      "Please enter a place."
    );

  }


  const url =
    `https://geocoding-api.open-meteo.com/v1/search?name=${encodeURIComponent(cleanQuery)}&count=1&language=en&format=json`;


  const r =
    await fetch(url);


  if (!r.ok) {

    throw new Error(
      "Place search failed."
    );

  }


  const d =
    await r.json();


  if (!d.results?.length) {

    throw new Error(
      "Place not found"
    );

  }


  const p =
    d.results[0];


  state.lat =
    p.latitude;


  state.lon =
    p.longitude;


  setPlaceText(

    `${p.name}${p.admin1 ? ", " + p.admin1 : ""}, ${p.country}`

  );


  await loadAll();


  const dashboard =
    document.querySelector(
      "#dashboard"
    );


  if (dashboard) {

    dashboard.scrollIntoView({
      behavior: "smooth"
    });

  }

}


/* =========================================================
   LOAD EVERYTHING
========================================================= */

async function loadAll() {

  try {

    await loadWeather();

    await loadClimate();

  }

  catch (e) {

    console.error(e);

    showToast(
      "Some climate data could not be loaded. Check your internet connection."
    );

  }

}


/* =========================================================
   SEARCH MODAL
========================================================= */

function openSearch() {

  const modal =
    $("searchModal");


  if (!modal) return;


  modal.classList.add("open");


  modal.setAttribute(
    "aria-hidden",
    "false"
  );


  if ($("searchInput")) {

    $("searchInput").focus();

  }

}


function closeSearch() {

  const modal =
    $("searchModal");


  if (!modal) return;


  modal.classList.remove("open");


  modal.setAttribute(
    "aria-hidden",
    "true"
  );

}


/* =========================================================
   BUTTON EVENTS
========================================================= */

if ($("heroLocation")) {

  $("heroLocation").onclick =
    () => getLocation();

}


if ($("navLocation")) {

  $("navLocation").onclick =
    () => getLocation();

}


if ($("refreshWeather")) {

  $("refreshWeather").onclick =
    () => loadAll();

}


if ($("openSearch")) {

  $("openSearch").onclick =
    openSearch;

}


if ($("closeSearch")) {

  $("closeSearch").onclick =
    closeSearch;

}


/* =========================================================
   SEARCH MODAL CLICK OUTSIDE
========================================================= */

if ($("searchModal")) {

  $("searchModal").addEventListener(

    "click",

    (e) => {

      if (
        e.target.id ===
        "searchModal"
      ) {

        closeSearch();

      }

    }

  );

}


/* =========================================================
   SEARCH FORM
========================================================= */

if ($("searchForm")) {

  $("searchForm").addEventListener(

    "submit",

    async (e) => {

      e.preventDefault();


      try {

        await searchPlace(
          $("searchInput").value
        );


        closeSearch();

      }

      catch {

        showToast(
          "Place not found. Try another city."
        );

      }

    }

  );

}


/* =========================================================
   QUICK SEARCH BUTTONS
========================================================= */

document
  .querySelectorAll(
    ".quick-search button"
  )
  .forEach(

    (button) => {

      button.onclick =
        async () => {

          try {

            await searchPlace(
              button.dataset.city
            );


            closeSearch();

          }

          catch {

            showToast(
              "Could not load that place."
            );

          }

        };

    }

  );


/* =========================================================
   HISTORICAL RANGE BUTTONS
========================================================= */

document
  .querySelectorAll(".range")
  .forEach(

    (button) => {

      button.onclick =
        async () => {

          document
            .querySelectorAll(
              ".range"
            )
            .forEach(
              x =>
                x.classList.remove(
                  "active"
                )
            );


          button.classList.add(
            "active"
          );


          state.years =
            Number(
              button.dataset.years
            );


          try {

            await loadClimate();

          }

          catch {

            showToast(
              "Historical data could not be loaded."
            );

          }

        };

    }

  );


/* =========================================================
   YEAR COMPARISON BUTTON
========================================================= */

if ($("compareBtn")) {

  $("compareBtn").onclick =
    compareYears;

}


if ($("yearA")) {

  $("yearA").onchange =
    compareYears;

}


if ($("yearB")) {

  $("yearB").onchange =
    compareYears;

}


/* =========================================================
   AI SUGGESTION BUTTONS
========================================================= */

document
  .querySelectorAll(
    ".suggestions button"
  )
  .forEach(

    (button) => {

      button.onclick = () => {

        if (!$("chatInput")) return;


        $("chatInput").value =
          button.dataset.question;


        if ($("chatForm")) {

          $("chatForm").requestSubmit();

        }

      };

    }

  );


/* =========================================================
   AI CHAT FORM
========================================================= */

if ($("chatForm")) {

  $("chatForm").addEventListener(

    "submit",

    async (e) => {

      e.preventDefault();


      const input =
        $("chatInput");


      if (!input) return;


      const question =
        input.value.trim();


      if (!question) return;


      /* USER MESSAGE */

      addMessage(
        question,
        "user"
      );


      /* CLEAR INPUT */

      input.value = "";


      /* INDRA THINKING MESSAGE */

      const thinkingMessage =
        addMessage(
          "INDRA is thinking...",
          "bot"
        );


      /* SEND TO BACKEND */

      await sendToIndra(
        question,
        thinkingMessage
      );

    }

  );

}


/* =========================================================
   INITIALIZE WEBSITE
========================================================= */

setPlaceText(
  "Detecting your location…"
);


initHeroMap();


getLocation();