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
    const card = document.createElement("div");
    card.className = "country-card";
    card.innerHTML = `
      <img class="flag" src="${country.flags.png}" alt="${country.name.common} flag">
      <h2>${country.name.common}</h2>
      <div class="details">
        <p><strong>Capital:</strong> ${country.capital ? country.capital[0] : "N/A"}</p>
        <p><strong>Region:</strong> ${country.region}</p>
        <p><strong>Population:</strong> ${country.population.toLocaleString()}</p>
        <p><strong>Currency:</strong> ${country.currencies ? Object.values(country.currencies)[0].name : "N/A"}</p>
        <p><strong>Languages:</strong> ${country.languages ? Object.values(country.languages).join(", ") : "N/A"}</p>
      </div>
    `;
    card.addEventListener("click", () => card.classList.toggle("open"));
    countriesContainer.appendChild(card);
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
