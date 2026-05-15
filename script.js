const navToggle = document.getElementById("navToggle");
const navMenu = document.getElementById("navMenu");
if (navToggle && navMenu) navToggle.addEventListener("click", () => navMenu.classList.toggle("open"));

window.addEventListener("load", () => { const loader = document.getElementById("pageLoader"); if (loader) setTimeout(() => loader.classList.add("hidden"), 600); });

const revealObserver = new IntersectionObserver((entries) => entries.forEach((entry) => { if (entry.isIntersecting) { entry.target.classList.add("visible"); revealObserver.unobserve(entry.target); } }), { threshold: 0.12 });
document.querySelectorAll(".reveal").forEach((item) => revealObserver.observe(item));

const contactForm = document.querySelector(".contact-form");
if (contactForm) contactForm.addEventListener("submit", (event) => { event.preventDefault(); const button = contactForm.querySelector("button[type='submit']"); if (button) { button.textContent = "Sporočilo poslano ✓"; button.disabled = true; } });

const productGrid = document.getElementById("productGrid");
if (productGrid) {
  const featuredGrid = document.getElementById("featuredGrid");
  const newProductsGrid = document.getElementById("newProductsGrid");
  const filterButtonsWrap = document.getElementById("filterButtons");
  const productSearch = document.getElementById("productSearch");
  const productsEmptyState = document.getElementById("productsEmptyState");
  const featuredSection = document.getElementById("featuredSection");
  const newSection = document.getElementById("newSection");
  const productModal = document.getElementById("productModal");
  const productModalClose = document.getElementById("productModalClose");
  const modalProductImage = document.getElementById("modalProductImage");
  const modalMaterial = document.getElementById("modalMaterial");
  const productModalTitle = document.getElementById("productModalTitle");
  const modalDescription = document.getElementById("modalDescription");
  const modalPrice = document.getElementById("modalPrice");
  const engravingTextInput = document.getElementById("engravingText");
  const fontSelect = document.getElementById("fontSelect");
  const fontSize = document.getElementById("fontSize");
  const logoUpload = document.getElementById("logoUpload");
  const previewText = document.getElementById("previewText");
  const previewLogo = document.getElementById("previewLogo");
  const startDesignBtn = document.getElementById("startDesignBtn");
  const customizationForm = document.getElementById("customizationForm");
  const stripeCheckoutBtn = document.getElementById("stripeCheckoutBtn");

  const categoryLabels = { all: "Vse", wood: "Les", "k9-crystal": "K9 kristal", metal: "Kovina", stone: "Kamen", ornaments: "Okraski", keychains: "Obeski", "personalized-gifts": "Personalizirana darila" };
  const materialLabels = { wood: "LES", "k9-crystal": "K9 KRISTAL", metal: "KOVINA", stone: "KAMEN", ornaments: "OKRASKI", keychains: "OBESKI", "personalized-gifts": "DARILA" };
  let products = []; let activeFilter = "all"; let searchTerm = ""; let currentProduct = null; let uploadedLogoData = "";

  const createProductCard = (product) => {
    const card = document.createElement("article"); card.className = "product-card reveal"; card.dataset.category = product.category;
    card.innerHTML = `<img src="${product.image}" alt="${product.title}" /><div class="product-content"><h3>${product.title}</h3><p>${product.price}</p><div class="product-actions"><button class="btn btn-ghost view-product-btn" type="button">Poglej podrobnosti</button><button class="btn btn-primary customize-btn" type="button">Prilagodi</button></div></div>`;
    card.querySelectorAll("button, img").forEach((el) => el.addEventListener("click", () => openProduct(product)));
    revealObserver.observe(card);
    return card;
  };
  const renderFilters = () => {
    const categories = ["all", ...new Set(products.map((p) => p.category))];
    filterButtonsWrap.innerHTML = categories.map((c) => `<button class="btn btn-filter ${c === activeFilter ? "active" : ""}" type="button" data-filter="${c}">${categoryLabels[c] || c}</button>`).join("");
    filterButtonsWrap.querySelectorAll(".btn-filter").forEach((button) => button.addEventListener("click", () => { activeFilter = button.dataset.filter; renderFilters(); renderProducts(); }));
  };
  const renderProducts = () => {
    const filtered = products.filter((p) => (activeFilter === "all" || p.category === activeFilter) && (`${p.title} ${p.shortDescription}`.toLowerCase().includes(searchTerm)));
    productGrid.innerHTML = ""; filtered.forEach((product) => productGrid.appendChild(createProductCard(product)));
    productsEmptyState.classList.toggle("is-hidden", filtered.length > 0);
  };
  const renderHighlights = () => {
    const featured = products.filter((p) => p.featured); featuredGrid.innerHTML = ""; featured.forEach((p) => featuredGrid.appendChild(createProductCard(p))); featuredSection.classList.toggle("is-hidden", featured.length === 0);
    const latest = products.filter((p) => p.new); newProductsGrid.innerHTML = ""; latest.forEach((p) => newProductsGrid.appendChild(createProductCard(p))); newSection.classList.toggle("is-hidden", latest.length === 0);
  };
  const updatePreview = () => { previewText.textContent = engravingTextInput.value.trim() || "Vaše besedilo gravure"; previewText.style.fontFamily = fontSelect.value; previewText.style.fontSize = `${fontSize.value}px`; previewLogo.hidden = !uploadedLogoData; if (uploadedLogoData) previewLogo.src = uploadedLogoData; };
  const resetCustomizer = () => { engravingTextInput.value = ""; fontSelect.value = "serif"; fontSize.value = "24"; logoUpload.value = ""; uploadedLogoData = ""; updatePreview(); };
  const openProduct = (product) => { currentProduct = product; modalProductImage.src = product.gallery?.[0] || product.image; productModalTitle.textContent = product.title; modalDescription.textContent = product.shortDescription; modalPrice.textContent = product.price; modalMaterial.textContent = materialLabels[product.category] || (product.material || product.category); resetCustomizer(); productModal.classList.add("open"); productModal.setAttribute("aria-hidden", "false"); document.body.style.overflow = "hidden"; };
  const closeModal = () => { productModal.classList.remove("open"); productModal.setAttribute("aria-hidden", "true"); document.body.style.overflow = ""; };

  const init = async () => {
    const response = await fetch("data/products.json"); products = await response.json();
    renderFilters(); renderHighlights(); renderProducts();
  };

  productSearch.addEventListener("input", () => { searchTerm = productSearch.value.trim().toLowerCase(); renderProducts(); });
  [engravingTextInput, fontSelect, fontSize].forEach((input) => input.addEventListener("input", updatePreview));
  logoUpload.addEventListener("change", (event) => { const [file] = event.target.files || []; if (!file) return; if (!["image/png", "image/jpeg"].includes(file.type)) { alert("Naložite sliko PNG ali JPG."); logoUpload.value = ""; return; } const reader = new FileReader(); reader.onload = () => { uploadedLogoData = String(reader.result); updatePreview(); }; reader.readAsDataURL(file); });
  customizationForm.addEventListener("submit", (event) => { event.preventDefault(); if (!currentProduct?.checkoutUrl) { alert("Stripe checkout povezava še ni nastavljena za ta izdelek."); return; } stripeCheckoutBtn.disabled = true; stripeCheckoutBtn.textContent = "Preusmerjam na Stripe…"; window.location.href = currentProduct.checkoutUrl; });
  startDesignBtn.addEventListener("click", () => { if (products.length) openProduct(products[0]); });
  productModalClose.addEventListener("click", closeModal); productModal.addEventListener("click", (event) => { if (event.target === productModal) closeModal(); });
  updatePreview(); init();
}
