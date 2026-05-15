(() => {
  const grid = document.getElementById("productGrid");
  if (!grid) return;

  const categoryWrap = document.getElementById("categoryFilters");
  const searchInput = document.getElementById("searchInput");
  const sortSelect = document.getElementById("sortSelect");
  const emptyState = document.getElementById("emptyState");
  const modal = document.getElementById("productModal");

  const CATEGORY_LABELS = ["Vse", "Les", "Kovina", "Darila"];
  let currentCategory = "Vse";
  let currentSearch = "";
  let currentSort = "";
  let products = [];

  const parsePrice = (price) => Number(String(price).replace(/[^\d,.-]/g, "").replace(",", ".")) || 0;

  const renderFilters = () => {
    categoryWrap.innerHTML = CATEGORY_LABELS.map((cat) => `<button class="btn btn-filter ${cat === currentCategory ? "active" : ""}" data-category="${cat}" type="button">${cat}</button>`).join("");
    categoryWrap.querySelectorAll("button").forEach((btn) => {
      btn.addEventListener("click", () => {
        currentCategory = btn.dataset.category;
        renderFilters();
        renderProducts();
      });
    });
  };

  const openModal = (product) => {
    document.getElementById("modalImage").src = product.slika;
    document.getElementById("modalImage").alt = product.ime;
    document.getElementById("modalCategory").textContent = product.kategorija;
    document.getElementById("modalTitle").textContent = product.ime;
    document.getElementById("modalDescription").textContent = product.opis;
    document.getElementById("modalPrice").textContent = product.cena;
    modal.classList.add("is-open");
    modal.setAttribute("aria-hidden", "false");
  };

  const createCard = (product) => {
    const article = document.createElement("article");
    article.className = "shop-card";
    article.innerHTML = `<img src="${product.slika}" alt="${product.ime}" loading="lazy" />
      <div class="shop-card-body">
        <h3>${product.ime}</h3>
        <p>${product.opis}</p>
        <div class="price">${product.cena}</div>
        <button class="btn btn-primary" type="button">Poglej izdelek</button>
      </div>`;
    article.querySelector("button").addEventListener("click", () => openModal(product));
    return article;
  };

  const renderProducts = () => {
    const filtered = products
      .filter((p) => currentCategory === "Vse" || p.kategorija === currentCategory)
      .filter((p) => p.ime.toLowerCase().includes(currentSearch));

    if (currentSort === "asc") filtered.sort((a, b) => parsePrice(a.cena) - parsePrice(b.cena));
    if (currentSort === "desc") filtered.sort((a, b) => parsePrice(b.cena) - parsePrice(a.cena));

    grid.innerHTML = "";
    filtered.forEach((p) => grid.appendChild(createCard(p)));
    emptyState.hidden = filtered.length > 0;
  };

  const loadFallbackManifest = async () => {
    const res = await fetch("products/index.json");
    const manifest = await res.json();
    const data = await Promise.all(manifest.files.map(async (file) => (await fetch(file)).json()));
    return data;
  };

  const loadProductsFromGithubApi = async () => {
    const host = window.location.hostname;
    if (!host.endsWith("github.io")) throw new Error("Ni GitHub Pages okolje");
    const [owner] = host.split(".");
    const repo = window.location.pathname.split("/")[1];
    const categories = ["les", "kovina", "darila"];

    const allFiles = await Promise.all(categories.map(async (category) => {
      const endpoint = `https://api.github.com/repos/${owner}/${repo}/contents/products/${category}`;
      const res = await fetch(endpoint);
      if (!res.ok) return [];
      const files = await res.json();
      return files.filter((f) => f.name.endsWith(".json")).map((f) => f.download_url);
    }));

    const productUrls = allFiles.flat();
    if (!productUrls.length) throw new Error("Ni JSON izdelkov");
    return Promise.all(productUrls.map(async (url) => (await fetch(url)).json()));
  };

  Promise.resolve()
    .then(loadProductsFromGithubApi)
    .catch(loadFallbackManifest)
    .then((items) => {
      products = items;
      renderFilters();
      renderProducts();
    })
    .catch(() => {
      emptyState.hidden = false;
      emptyState.textContent = "Napaka pri nalaganju izdelkov.";
    });

  searchInput.addEventListener("input", () => {
    currentSearch = searchInput.value.trim().toLowerCase();
    renderProducts();
  });

  sortSelect.addEventListener("change", () => {
    currentSort = sortSelect.value;
    renderProducts();
  });

  document.getElementById("closeModal").addEventListener("click", () => {
    modal.classList.remove("is-open");
    modal.setAttribute("aria-hidden", "true");
  });
})();
