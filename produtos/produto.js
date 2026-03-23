const products = window.productsCatalog || [];

const slugify = window.ByteStormCart?.slugify || ((text) => text);

const params = new URLSearchParams(window.location.search);
const id = params.get("id");
const product = products.find((item) => slugify(item.name) === id);

const container = document.getElementById("dynamic-product");
const breadcrumb = document.getElementById("product-breadcrumb");

function buildSpecs(item) {
  return [
    `${item.category || "Tecnologia"} com acabamento premium`,
    "Compra segura com envio para todo o Brasil",
    "Parcelamento facilitado e suporte especializado"
  ];
}

if (!product) {
  document.title = "Produto nao encontrado | ByteStorm";
  container.innerHTML = `
    <div class="summary-card">
      <h1>Produto nao encontrado</h1>
      <p class="product-description">Esse item nao foi localizado no catalogo atual.</p>
      <div class="buy-actions">
        <a class="btn btn-primary" href="../index.html#catalogo">Voltar ao catalogo</a>
      </div>
    </div>
  `;
} else {
  document.title = `${product.name} | ByteStorm`;
  breadcrumb.innerHTML = `<a href="../index.html">Home</a> / ${product.category || "Catalogo"} / ${product.name}`;

  container.innerHTML = `
    <div class="details-image">
      <img src="${product.image}" alt="${product.name}">
    </div>
    <div class="product-side">
      <div class="details-copy">
        <span class="product-badge">${product.badge}</span>
        <h1>${product.name}</h1>
        <p class="product-description">${product.description}</p>
        <ul class="specs">
          ${buildSpecs(product).map((item) => `<li>${item}</li>`).join("")}
        </ul>
      </div>
      <aside class="summary-card">
        <div class="old-price">${product.oldPrice}</div>
        <div class="price">${product.price}</div>
        <p class="installments">ou 10x sem juros no cartao</p>
        <div class="buy-actions">
          <button class="btn btn-primary" type="button" data-add-to-cart="${slugify(product.name)}">Adicionar ao carrinho</button>
          <a class="btn btn-secondary" href="../index.html#catalogo">Continuar comprando</a>
        </div>
        <ul class="summary-list">
          <li>Nota fiscal e garantia inclusas</li>
          <li>Atendimento rapido via WhatsApp</li>
          <li>Envio com acompanhamento do pedido</li>
        </ul>
      </aside>
    </div>
  `;
}
