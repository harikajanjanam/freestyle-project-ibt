const countriesContainer = document.getElementById("countries");
const searchInput = document.getElementById("search");
const regionFilter = document.getElementById("region-filter");
const sortBySelect = document.getElementById("sort-by");

let countriesData = [];

fetch("https://restcountries.com/v3.1/all")
  .then(res => res.json())
  .then(data => {
    countriesData = data;
    renderCountries(countriesData);
  });

function renderCountries(data) {
  countriesContainer.innerHTML = "";
  data.forEach(country => {
    const cca2 = country.cca2 || "";
    const card = document.createElement("div");
    card.className = "country-card";

    const commonName = country.name.common;
    const region = country.region;
    const population = country.population.toLocaleString();
    const capital = country.capital ? country.capital[0] : "N/A";
    const currency = country.currencies ? Object.values(country.currencies)[0].name : "N/A";
    const languages = country.languages ? Object.values(country.languages).join(", ") : "N/A";

    card.innerHTML = `
  <div class="mainsection">
    <div class="subsection">
        <img class="flag" src="${country.flags.png}" alt="${commonName} flag">
        <h2>${commonName}</h2>
    </div>
    <div class="subsection chevronsection">
        <div id="chevron-arrow-up" class="chevron"></div>
        <div id="chevron-arrow-down" class="chevron hidden"></div>
    </div>
  </div>
  <div class="details">
    <div class="detail-text">
      <p><strong>Capital:</strong> ${capital}</p>
      <p><strong>Region:</strong> ${region}</p>
      <p><strong>Population:</strong> ${population}</p>
      <p><strong>Currency:</strong> ${currency}</p>
      <p><strong>Languages:</strong> ${languages}</p>
    </div>
    <div id="plot-${cca2}" class="plot-container"></div>
  </div>
`;


    card.addEventListener("click", () => {
      card.classList.toggle("open");

      const up = document.getElementById("chevron-arrow-up");
  const down = document.getElementById("chevron-arrow-down");

  up.classList.toggle("hidden");
  down.classList.toggle("hidden");

      // Only fetch and plot if expanded and not already plotted
      const plotId = `plot-${cca2}`;
      const container = document.getElementById(plotId);
      if (card.classList.contains("open") && container.innerHTML.trim() === "") {
        fetchGDPData(cca2, plotId, commonName);
      }
    });

    countriesContainer.appendChild(card);
  });
}

function fetchGDPData(countryCode, plotId, title) {
  fetch(`https://api.worldbank.org/v2/country/${countryCode}/indicator/NY.GDP.MKTP.CD?format=json&per_page=20`)
    .then(res => res.json())
    .then(data => {
      const series = data[1];
      if (!series) return;

      const years = series.map(d => d.date).reverse();
      const values = series.map(d => d.value / 1e9).reverse(); // Convert to billions

      Plotly.newPlot(plotId, [{
        x: years,
        y: values,
        type: "scatter",
        mode: "lines+markers",
        line: { color: "#3498db" }
      }], {
        title: `${title} - GDP (in Billions USD)`,
        margin: { t: 40 },
        height: 300
      });
    })
    .catch(err => {
      console.error("Error fetching GDP data for:", countryCode, err);
      document.getElementById(plotId).innerHTML = "<p>GDP data not available.</p>";
    });
}

searchInput.addEventListener("input", () => filterAndSort());
regionFilter.addEventListener("change", () => filterAndSort());
sortBySelect.addEventListener("change", () => filterAndSort());

function filterAndSort() {
  let filtered = countriesData.filter(c =>
    c.name.common.toLowerCase().includes(searchInput.value.toLowerCase()) &&
    (regionFilter.value === "" || c.region === regionFilter.value)
  );

  if (sortBySelect.value === "name") {
    filtered.sort((a, b) => a.name.common.localeCompare(b.name.common));
  } else if (sortBySelect.value === "population") {
    filtered.sort((a, b) => b.population - a.population);
  }

  renderCountries(filtered);
}
