const products = window.productsCatalog || [];

const promoGrid = document.getElementById("product-grid");
const catalogGrid = document.getElementById("catalog-grid");
const searchInput = document.getElementById("search-input");
const searchForm = document.getElementById("search-form");
const searchStatus = document.getElementById("search-status");
const emptyState = document.getElementById("empty-state");
const searchSuggestions = document.getElementById("search-suggestions");

const slugify = window.ByteStormCart?.slugify || ((text) => text);
const detailLink = (product) => product.link || `produtos/produto.html?id=${slugify(product.name)}`;
const searchPageLink = (term) => `search.html?q=${encodeURIComponent(term.trim())}`;

const sortedCatalog = [...products].sort((a, b) => a.name.localeCompare(b.name, "pt-BR"));

function createPromoCard(product) {
  return `
    <article class="product-card">
      <img src="${product.image}" alt="${product.name}">
      <div class="product-content">
        <span class="product-badge">${product.badge}</span>
        <h3>${product.name}</h3>
        <p>${product.description}</p>
        <div class="product-meta">
          <div>
            <div class="old-price">${product.oldPrice}</div>
            <div class="price">${product.price}</div>
          </div>
          <div class="product-actions">
            <button class="btn btn-secondary" type="button" data-add-to-cart="${slugify(product.name)}">Adicionar</button>
            <a class="btn btn-primary" href="${detailLink(product)}">Comprar</a>
          </div>
        </div>
      </div>
    </article>
  `;
}

function createCatalogCard(product) {
  const badge = product.promo ? product.badge : (product.category || "Produto");
  const oldPrice = product.promo ? `<div class="old-price">${product.oldPrice}</div>` : "";

  return `
    <article class="product-card catalog-card">
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

function renderProducts() {
  const promoProducts = sortedCatalog.filter((product) => product.promo).slice(0, 5);

  promoGrid.innerHTML = promoProducts.map(createPromoCard).join("");
  catalogGrid.innerHTML = sortedCatalog.map(createCatalogCard).join("");
  emptyState.hidden = true;
  searchStatus.textContent = "Mostrando as melhores ofertas do dia.";
}

function getSuggestions(term = "") {
  const query = term.trim().toLowerCase();
  if (!query) {
    return [];
  }

  return sortedCatalog
    .filter((product) =>
      [product.name, product.category || "", product.description].some((value) =>
        value.toLowerCase().includes(query)
      )
    )
    .slice(0, 6);
}

function renderSuggestions(term = "") {
  if (!searchSuggestions) {
    return;
  }

  const suggestions = getSuggestions(term);

  if (!suggestions.length) {
    searchSuggestions.hidden = true;
    searchSuggestions.innerHTML = "";
    return;
  }

  searchSuggestions.innerHTML = suggestions.map((product) => `
    <button class="suggestion-item" type="button" data-suggestion="${product.name}">
      <img src="${product.image}" alt="${product.name}">
      <span>
        ${product.name}
        <small>${product.category || "Produto"} - ${product.price}</small>
      </span>
    </button>
  `).join("");
  searchSuggestions.hidden = false;
}

if (promoGrid && catalogGrid && searchInput && searchForm) {
  renderProducts();

  searchInput.addEventListener("input", (event) => {
    renderSuggestions(event.target.value);
  });

  searchForm.addEventListener("submit", (event) => {
    event.preventDefault();
    const value = searchInput.value.trim();
    if (!value) {
      return;
    }
    window.location.href = searchPageLink(value);
  });

  document.addEventListener("click", (event) => {
    const suggestion = event.target.closest("[data-suggestion]");

    if (suggestion) {
      const value = suggestion.dataset.suggestion;
      searchInput.value = value;
      window.location.href = searchPageLink(value);
      return;
    }

    if (!event.target.closest("#search-form") && searchSuggestions) {
      searchSuggestions.hidden = true;
    }
  });

  searchInput.addEventListener("focus", () => {
    renderSuggestions(searchInput.value);
  });
}
