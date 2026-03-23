(function () {
  const storageKey = "bytestorm-cart";

  const slugify = (text) =>
    text
      .normalize("NFD")
      .replace(/[\u0300-\u036f]/g, "")
      .toLowerCase()
      .replace(/[^a-z0-9]+/g, "-")
      .replace(/(^-|-$)/g, "");

  const products = (window.productsCatalog || []).map((product) => ({
    ...product,
    id: slugify(product.name)
  }));

  function getCart() {
    try {
      return JSON.parse(localStorage.getItem(storageKey)) || [];
    } catch {
      return [];
    }
  }

  function saveCart(cart) {
    localStorage.setItem(storageKey, JSON.stringify(cart));
  }

  function findProduct(productId) {
    return products.find((product) => product.id === productId);
  }

  function parsePrice(value) {
    return Number(value.replace("R$", "").replace(/\./g, "").replace(",", ".").trim());
  }

  function formatPrice(value) {
    return new Intl.NumberFormat("pt-BR", {
      style: "currency",
      currency: "BRL"
    }).format(value);
  }

  function addToCart(productId, quantity = 1) {
    const cart = getCart();
    const existing = cart.find((item) => item.id === productId);

    if (existing) {
      existing.quantity += quantity;
    } else {
      cart.push({ id: productId, quantity });
    }

    saveCart(cart);
    renderCartCount();
    renderCartPage();
  }

  function updateQuantity(productId, delta) {
    const cart = getCart()
      .map((item) => item.id === productId ? { ...item, quantity: item.quantity + delta } : item)
      .filter((item) => item.quantity > 0);

    saveCart(cart);
    renderCartCount();
    renderCartPage();
  }

  function removeFromCart(productId) {
    saveCart(getCart().filter((item) => item.id !== productId));
    renderCartCount();
    renderCartPage();
  }

  function clearCart() {
    saveCart([]);
    renderCartCount();
    renderCartPage();
  }

  function renderCartCount() {
    const count = getCart().reduce((total, item) => total + item.quantity, 0);
    document.querySelectorAll(".cart-count").forEach((element) => {
      element.textContent = count;
    });
  }

  function renderCartPage() {
    const list = document.getElementById("cart-list");
    const summary = document.getElementById("cart-summary");
    const total = document.getElementById("cart-total");
    const footer = document.getElementById("cart-footer");

    if (!list || !summary || !total || !footer) {
      return;
    }

    const detailedItems = getCart()
      .map((item) => {
        const product = findProduct(item.id);
        return product ? { ...product, quantity: item.quantity } : null;
      })
      .filter(Boolean);

    if (!detailedItems.length) {
      list.innerHTML = `<div class="summary-card cart-empty">Adicione produtos para visualizar suas compras aqui.</div>`;
      summary.textContent = "Seu carrinho esta vazio.";
      total.textContent = formatPrice(0);
      footer.hidden = true;
      return;
    }

    const totalValue = detailedItems.reduce((acc, item) => acc + parsePrice(item.price) * item.quantity, 0);

    list.innerHTML = detailedItems.map((item) => `
      <article class="summary-card cart-item">
        <img src="${item.image}" alt="${item.name}">
        <div>
          <span class="product-badge">${item.badge}</span>
          <h3>${item.name}</h3>
          <p>${item.description}</p>
        </div>
        <div class="cart-item-controls">
          <div class="price">${item.price}</div>
          <div class="qty-controls">
            <button class="qty-btn" type="button" data-cart-action="decrease" data-product-id="${item.id}">-</button>
            <span>${item.quantity}</span>
            <button class="qty-btn" type="button" data-cart-action="increase" data-product-id="${item.id}">+</button>
          </div>
          <button class="remove-btn" type="button" data-cart-action="remove" data-product-id="${item.id}">Remover</button>
        </div>
      </article>
    `).join("");

    summary.textContent = `${detailedItems.length} item(ns) diferente(s) no carrinho.`;
    total.textContent = formatPrice(totalValue);
    footer.hidden = false;
  }

  document.addEventListener("click", (event) => {
    const addButton = event.target.closest("[data-add-to-cart]");
    if (addButton) {
      addToCart(addButton.dataset.addToCart, 1);
      return;
    }

    const cartButton = event.target.closest("[data-cart-action]");
    if (!cartButton) {
      return;
    }

    const { cartAction, productId } = cartButton.dataset;

    if (cartAction === "increase") {
      updateQuantity(productId, 1);
    }

    if (cartAction === "decrease") {
      updateQuantity(productId, -1);
    }

    if (cartAction === "remove") {
      removeFromCart(productId);
    }
  });

  document.addEventListener("DOMContentLoaded", () => {
    renderCartCount();
    renderCartPage();

    const clearButton = document.getElementById("clear-cart");
    if (clearButton) {
      clearButton.addEventListener("click", clearCart);
    }
  });

  window.ByteStormCart = {
    addToCart,
    getCart,
    renderCartCount,
    renderCartPage,
    slugify
  };
})();
