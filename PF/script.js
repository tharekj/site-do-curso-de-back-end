const products = window.productsCatalog || [];

const promoGrid = document.getElementById("product-grid");
const catalogGrid = document.getElementById("catalog-grid");
const searchInput = document.getElementById("search-input");
const searchForm = document.getElementById("search-form");
const searchStatus = document.getElementById("search-status");
const emptyState = document.getElementById("empty-state");
const searchSuggestions = document.getElementById("search-suggestions");
const categoryFilters = document.getElementById("category-filters");
const sortSelect = document.getElementById("sort-select");

const slugify = window.ByteStormCart?.slugify || ((text) => text);
const detailLink = (product) => product.link || `produtos/produto.html?id=${slugify(product.name)}`;
const searchPageLink = (term) => `search.html?q=${encodeURIComponent(term.trim())}`;

const sortedCatalog = [...products].sort((a, b) => a.name.localeCompare(b.name, "pt-BR"));
const catalogCategories = ["Todos", ...new Set(sortedCatalog.map((product) => product.category || "Produto"))];

let activeCategory = "Todos";
let activeSort = "alphabetical";

function parsePriceLabel(value = "") {
  return Number(value.replace("R$", "").replace(/\./g, "").replace(",", ".").trim());
}

function getInstallments(product) {
  const installmentCount = parsePriceLabel(product.price) >= 1000 ? 12 : 6;
  const installmentValue = parsePriceLabel(product.price) / installmentCount;

  return {
    count: installmentCount,
    value: new Intl.NumberFormat("pt-BR", {
      style: "currency",
      currency: "BRL"
    }).format(installmentValue)
  };
}

function getRatingData(product) {
  const base = (product.name.length % 5) + 45;
  const rating = (base / 10).toFixed(1);
  const reviews = 18 + (product.name.length * 3);

  return { rating, reviews };
}

function createStars(rating) {
  const roundedRating = Math.round(Number(rating));
  return "&#9733;".repeat(roundedRating) + "&#9734;".repeat(5 - roundedRating);
}

function createPromoCard(product) {
  const { rating, reviews } = getRatingData(product);
  const installments = getInstallments(product);

  return `
    <article class="product-card">
      <img src="${product.image}" alt="${product.name}">
      <div class="product-content">
        <span class="product-badge">${product.badge}</span>
        <h3>${product.name}</h3>
        <p>${product.description}</p>
        <div class="product-rating">
          <span class="stars" aria-label="Avaliacao ${rating} de 5">${createStars(rating)}</span>
          <span class="rating-copy">${rating} (${reviews} avaliacoes)</span>
        </div>
        <div class="product-meta">
          <div>
            <div class="old-price">${product.oldPrice}</div>
            <div class="price">${product.price}</div>
            <div class="installments-copy">ou ate ${installments.count}x de ${installments.value}</div>
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
  const { rating, reviews } = getRatingData(product);
  const installments = getInstallments(product);

  return `
    <article class="product-card catalog-card">
      <img src="${product.image}" alt="${product.name}">
      <span class="product-badge">${badge}</span>
      <h3>${product.name}</h3>
      <p>${product.description}</p>
      <div class="product-rating">
        <span class="stars" aria-label="Avaliacao ${rating} de 5">${createStars(rating)}</span>
        <span class="rating-copy">${rating} (${reviews} avaliacoes)</span>
      </div>
      <div class="catalog-meta">
        <div class="card-benefits">
          ${oldPrice}
          <div class="price">${product.price}</div>
          <div class="installments-copy">ou ate ${installments.count}x de ${installments.value}</div>
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
  searchStatus.textContent = "Mostrando as melhores ofertas do dia.";
  renderCatalog();
}

function getFilteredCatalog() {
  let filteredProducts = [...sortedCatalog];

  if (activeCategory !== "Todos") {
    filteredProducts = filteredProducts.filter((product) => (product.category || "Produto") === activeCategory);
  }

  if (activeSort === "price-asc") {
    filteredProducts.sort((a, b) => parsePriceLabel(a.price) - parsePriceLabel(b.price));
  }

  if (activeSort === "price-desc") {
    filteredProducts.sort((a, b) => parsePriceLabel(b.price) - parsePriceLabel(a.price));
  }

  if (activeSort === "promo") {
    filteredProducts = filteredProducts.filter((product) => product.promo);
  }

  return filteredProducts;
}

function renderCatalogFilters() {
  if (!categoryFilters) {
    return;
  }

  categoryFilters.innerHTML = catalogCategories.map((category) => `
    <button
      class="filter-chip ${category === activeCategory ? "active" : ""}"
      type="button"
      data-category-filter="${category}">
      ${category}
    </button>
  `).join("");
}

function renderCatalog() {
  if (!catalogGrid) {
    return;
  }

  const filteredProducts = getFilteredCatalog();

  catalogGrid.innerHTML = filteredProducts.map(createCatalogCard).join("");
  emptyState.hidden = filteredProducts.length > 0;

  if (!filteredProducts.length) {
    emptyState.textContent = "Nenhum produto encontrado para os filtros selecionados.";
  }
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
  renderCatalogFilters();

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

  categoryFilters?.addEventListener("click", (event) => {
    const filterButton = event.target.closest("[data-category-filter]");
    if (!filterButton) {
      return;
    }

    activeCategory = filterButton.dataset.categoryFilter;
    renderCatalogFilters();
    renderCatalog();
  });

  sortSelect?.addEventListener("change", (event) => {
    activeSort = event.target.value;
    renderCatalog();
  });
}
