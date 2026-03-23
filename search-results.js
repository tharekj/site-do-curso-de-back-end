const products = window.productsCatalog || [];
const slugify = window.ByteStormCart?.slugify || ((text) => text);

const detailLink = (product) => product.link || `produtos/produto.html?id=${slugify(product.name)}`;
const params = new URLSearchParams(window.location.search);
const initialQuery = params.get("q") || "";

const searchInput = document.getElementById("results-search-input");
const searchForm = document.getElementById("results-search-form");
const suggestionsBox = document.getElementById("results-search-suggestions");
const resultsGrid = document.getElementById("results-grid");
const resultsTitle = document.getElementById("results-title");
const resultsSummary = document.getElementById("results-summary");
const resultsEmpty = document.getElementById("results-empty");
const filterForm = document.getElementById("price-filter-form");
const minPriceInput = document.getElementById("min-price");
const maxPriceInput = document.getElementById("max-price");
const clearFilterButton = document.getElementById("clear-price-filter");

const sortedCatalog = [...products].sort((a, b) => a.name.localeCompare(b.name, "pt-BR"));

const parsePrice = (value) =>
  Number(value.replace("R$", "").replace(/\./g, "").replace(",", ".").trim());

function matchesQuery(product, query) {
  const normalized = query.trim().toLowerCase();
  if (!normalized) {
    return true;
  }

  return [product.name, product.description, product.category || "", product.badge]
    .some((value) => value.toLowerCase().includes(normalized));
}

function createResultCard(product) {
  const badge = product.promo ? product.badge : (product.category || "Produto");
  const oldPrice = product.promo ? `<div class="old-price">${product.oldPrice}</div>` : "";

  return `
    <article class="product-card catalog-card result-card">
      <img src="${product.image}" alt="${product.name}">
      <span class="product-badge">${badge}</span>
      <h3>${product.name}</h3>
      <p>${product.description}</p>
      <div class="catalog-meta">
        <div>
          ${oldPrice}
          <div class="price">${product.price}</div>
        </div>
        <div class="product-actions">
          <button class="btn btn-secondary" type="button" data-add-to-cart="${slugify(product.name)}">Adicionar</button>
          <a class="btn btn-primary" href="${detailLink(product)}">Ver</a>
        </div>
      </div>
    </article>
  `;
}

function renderSuggestions(term = "") {
  const query = term.trim().toLowerCase();

  if (!query) {
    suggestionsBox.hidden = true;
    suggestionsBox.innerHTML = "";
    return;
  }

  const suggestions = sortedCatalog
    .filter((product) => matchesQuery(product, query))
    .slice(0, 6);

  if (!suggestions.length) {
    suggestionsBox.hidden = true;
    suggestionsBox.innerHTML = "";
    return;
  }

  suggestionsBox.innerHTML = suggestions.map((product) => `
    <button class="suggestion-item" type="button" data-suggestion="${product.name}">
      <img src="${product.image}" alt="${product.name}">
      <span>
        ${product.name}
        <small>${product.category || "Produto"} - ${product.price}</small>
      </span>
    </button>
  `).join("");
  suggestionsBox.hidden = false;
}

function renderResults() {
  const query = searchInput.value.trim();
  const minPrice = Number(minPriceInput.value || 0);
  const maxPrice = Number(maxPriceInput.value || 0);

  const filtered = sortedCatalog.filter((product) => {
    const price = parsePrice(product.price);
    const queryMatch = matchesQuery(product, query);
    const minMatch = !minPrice || price >= minPrice;
    const maxMatch = !maxPrice || price <= maxPrice;
    return queryMatch && minMatch && maxMatch;
  });

  resultsTitle.textContent = query ? `Resultados para "${query}"` : "Todos os produtos";
  resultsSummary.textContent = `${filtered.length} produto(s) encontrado(s).`;
  resultsGrid.innerHTML = filtered.map(createResultCard).join("");
  resultsEmpty.hidden = filtered.length > 0;
}

if (searchInput && searchForm && filterForm) {
  searchInput.value = initialQuery;
  renderResults();

  searchInput.addEventListener("input", (event) => {
    renderSuggestions(event.target.value);
  });

  searchInput.addEventListener("focus", () => {
    renderSuggestions(searchInput.value);
  });

  searchForm.addEventListener("submit", (event) => {
    event.preventDefault();
    const query = searchInput.value.trim();
    const nextParams = new URLSearchParams(window.location.search);

    if (query) {
      nextParams.set("q", query);
    } else {
      nextParams.delete("q");
    }

    const queryString = nextParams.toString();
    window.history.replaceState({}, "", queryString ? `${window.location.pathname}?${queryString}` : window.location.pathname);
    suggestionsBox.hidden = true;
    renderResults();
  });

  filterForm.addEventListener("submit", (event) => {
    event.preventDefault();
    renderResults();
  });

  clearFilterButton.addEventListener("click", () => {
    minPriceInput.value = "";
    maxPriceInput.value = "";
    renderResults();
  });

  document.addEventListener("click", (event) => {
    const suggestion = event.target.closest("[data-suggestion]");

    if (suggestion) {
      searchInput.value = suggestion.dataset.suggestion;
      suggestionsBox.hidden = true;
      renderResults();
      return;
    }

    if (!event.target.closest("#results-search-form")) {
      suggestionsBox.hidden = true;
    }
  });
}
