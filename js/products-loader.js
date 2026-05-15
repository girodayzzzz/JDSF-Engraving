(() => {
  const productGrid = document.getElementById("productGrid");
  if (!productGrid) return;

  const filterButtonsWrap = document.getElementById("filterButtons");
  const productSearch = document.getElementById("productSearch");
  const productsEmptyState = document.getElementById("productsEmptyState");
  const materialFilterWrap = document.getElementById("materialFilterButtons");
  const customOrderBtn = document.getElementById("startDesignBtn");

  const MATERIAL_ORDER = ["All", "Wood", "Metal", "Crystal"];
  const CATEGORY_ORDER = ["All", "Gifts", "Business Gifts", "Memorial", "Decoration", "Custom"];

  let products = [];
  let activeMaterial = "All";
  let activeCategory = "All";
  let searchTerm = "";

  const normalize = (value) => (value || "").toString().trim();
  const normalizeMaterial = (value) => {
    const clean = normalize(value).toLowerCase();
    if (clean.includes("wood") || clean.includes("les")) return "Wood";
    if (clean.includes("metal") || clean.includes("kov")) return "Metal";
    if (clean.includes("crystal") || clean.includes("kristal") || clean.includes("k9")) return "Crystal";
    return normalize(value);
  };

  const productCard = (product) => {
    const card = document.createElement("article");
    card.className = "product-card reveal";
    card.dataset.material = product.material.toLowerCase();
    card.innerHTML = `
      <div class="product-image-wrap">
        <img src="${product.image}" alt="${product.title} - lasersko graviran izdelek" loading="lazy" decoding="async" />
      </div>
      <div class="product-content">
        <div class="product-tags">
          <span class="tag tag-material tag-material-${product.material.toLowerCase()}">${product.material}</span>
          ${product.customizable ? '<span class="tag tag-custom">Po meri</span>' : ""}
          ${product.badge ? `<span class="tag tag-badge">${product.badge}</span>` : ""}
        </div>
        <h3>${product.title}</h3>
        <p class="product-description">${product.description}</p>
        <p class="product-price">${product.price}</p>
        <div class="product-actions">
          <a class="btn btn-primary" href="${product.checkoutUrl || "contact.html"}">Povprašaj</a>
        </div>
      </div>`;
    return card;
  };

  const renderMaterialFilters = () => {
    materialFilterWrap.innerHTML = MATERIAL_ORDER.map((m) => `<button class="btn btn-filter ${activeMaterial === m ? "active" : ""}" type="button" data-material="${m}">${m}</button>`).join("");
    materialFilterWrap.querySelectorAll("button").forEach((button) => {
      button.addEventListener("click", () => {
        activeMaterial = button.dataset.material;
        renderMaterialFilters();
        renderProducts();
      });
    });
  };

  const renderCategoryFilters = () => {
    filterButtonsWrap.innerHTML = CATEGORY_ORDER.map((c) => `<button class="btn btn-filter ${activeCategory === c ? "active" : ""}" type="button" data-category="${c}">${c}</button>`).join("");
    filterButtonsWrap.querySelectorAll("button").forEach((button) => {
      button.addEventListener("click", () => {
        activeCategory = button.dataset.category;
        renderCategoryFilters();
        renderProducts();
      });
    });
  };

  const renderProducts = () => {
    const filtered = products.filter((p) => {
      const materialMatch = activeMaterial === "All" || p.material === activeMaterial;
      const categoryMatch = activeCategory === "All" || p.category === activeCategory;
      const searchMatch = `${p.title} ${p.description}`.toLowerCase().includes(searchTerm);
      return materialMatch && categoryMatch && searchMatch;
    });

    productGrid.innerHTML = "";
    filtered.forEach((p) => productGrid.appendChild(productCard(p)));
    productsEmptyState.classList.toggle("is-hidden", filtered.length > 0);
  };

  const loadProducts = async () => {
    const manifestResponse = await fetch("products/index.json", { cache: "no-store" });
    const manifest = await manifestResponse.json();
    const loaded = await Promise.all(manifest.files.map(async (file) => {
      const response = await fetch(file, { cache: "no-store" });
      return response.json();
    }));

    products = loaded
      .map((p) => ({
        ...p,
        material: normalizeMaterial(p.material),
        category: normalize(p.category),
        description: normalize(p.description)
      }))
      .sort((a, b) => Number(b.featured) - Number(a.featured));

    renderMaterialFilters();
    renderCategoryFilters();
    renderProducts();
  };

  productSearch.addEventListener("input", () => {
    searchTerm = productSearch.value.trim().toLowerCase();
    renderProducts();
  });

  if (customOrderBtn) customOrderBtn.addEventListener("click", () => { window.location.href = "contact.html"; });

  loadProducts().catch(() => {
    productsEmptyState.textContent = "Napaka pri nalaganju izdelkov. Poskusite ponovno.";
    productsEmptyState.classList.remove("is-hidden");
  });
})();
