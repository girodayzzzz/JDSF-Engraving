// Mobile nav toggle
const navToggle = document.getElementById("navToggle");
const navMenu = document.getElementById("navMenu");

if (navToggle && navMenu) {
  navToggle.addEventListener("click", () => {
    navMenu.classList.toggle("open");
  });
}

// Intro loader transition
window.addEventListener("load", () => {
  const loader = document.getElementById("pageLoader");
  if (loader) {
    setTimeout(() => loader.classList.add("hidden"), 600);
  }
});

// Scroll reveal animation
const revealItems = document.querySelectorAll(".reveal");
const revealObserver = new IntersectionObserver(
  (entries) => {
    entries.forEach((entry) => {
      if (entry.isIntersecting) {
        entry.target.classList.add("visible");
        revealObserver.unobserve(entry.target);
      }
    });
  },
  { threshold: 0.12 }
);

revealItems.forEach((item) => revealObserver.observe(item));

// Demo contact form submission behavior
const contactForm = document.querySelector(".contact-form");
if (contactForm) {
  contactForm.addEventListener("submit", (event) => {
    event.preventDefault();
    const button = contactForm.querySelector("button[type='submit']");
    if (button) {
      button.textContent = "Sporočilo poslano ✓";
      button.disabled = true;
    }
  });
}

// Shop customization and direct Stripe checkout logic (shop page only)
const productGrid = document.getElementById("productGrid");

if (productGrid) {
  const productCards = [...document.querySelectorAll(".product-card")];
  const filterButtons = [...document.querySelectorAll(".btn-filter")];
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

  const materialLabels = {
    wood: "LES",
    glass: "STEKLO / KRISTAL",
    slate: "SKRILAVEC",
    leather: "USNJE",
    metal: "KOVINA",
  };
  let currentProduct = null;
  let uploadedLogoData = "";

  const resetCustomizer = () => {
    engravingTextInput.value = "";
    fontSelect.value = "serif";
    fontSize.value = "24";
    logoUpload.value = "";
    uploadedLogoData = "";
    previewLogo.src = "";
    previewLogo.hidden = true;
    updatePreview();
  };

  // Updates the live engraving preview in real-time.
  const updatePreview = () => {
    const previewValue = engravingTextInput.value.trim() || "Vaše besedilo gravure";
    previewText.textContent = previewValue;
    previewText.style.fontFamily = fontSelect.value;
    previewText.style.fontSize = `${fontSize.value}px`;

    if (uploadedLogoData) {
      previewLogo.src = uploadedLogoData;
      previewLogo.hidden = false;
    } else {
      previewLogo.hidden = true;
    }
  };

  const openModal = () => {
    productModal.classList.add("open");
    productModal.setAttribute("aria-hidden", "false");
    document.body.style.overflow = "hidden";
  };

  const closeModal = () => {
    productModal.classList.remove("open");
    productModal.setAttribute("aria-hidden", "true");
    document.body.style.overflow = "";
  };

  const openProductWithCard = (card) => {
    currentProduct = {
      id: card.dataset.productId,
      name: card.dataset.name,
      description: card.dataset.description,
      material: card.dataset.material,
      price: Number(card.dataset.price),
      image: card.querySelector("img")?.src || "",
      checkoutUrl: card.dataset.checkoutUrl || "",
    };

    modalProductImage.src = currentProduct.image;
    productModalTitle.textContent = currentProduct.name;
    modalDescription.textContent = currentProduct.description;
    modalPrice.textContent = `$${currentProduct.price.toFixed(2)}`;
    modalMaterial.textContent = materialLabels[currentProduct.material] || currentProduct.material;

    resetCustomizer();
    openModal();
  };

  filterButtons.forEach((button) => {
    button.addEventListener("click", () => {
      const filter = button.dataset.filter;
      filterButtons.forEach((btn) => btn.classList.remove("active"));
      button.classList.add("active");

      productCards.forEach((card) => {
        const shouldShow = filter === "all" || card.dataset.material === filter;
        card.classList.toggle("is-hidden", !shouldShow);
      });
    });
  });

  productCards.forEach((card) => {
    const viewBtn = card.querySelector(".view-product-btn");
    const customizeBtn = card.querySelector(".customize-btn");

    if (viewBtn) {
      viewBtn.addEventListener("click", () => openProductWithCard(card));
    }

    if (customizeBtn) {
      customizeBtn.addEventListener("click", () => openProductWithCard(card));
    }

    card.querySelector("img")?.addEventListener("click", () => openProductWithCard(card));
  });

  [engravingTextInput, fontSelect, fontSize].forEach((input) => {
    input.addEventListener("input", updatePreview);
  });

  logoUpload.addEventListener("change", (event) => {
    const [file] = event.target.files || [];
    if (!file) return;

    const accepted = ["image/png", "image/jpeg"];
    if (!accepted.includes(file.type)) {
      alert("Naložite sliko PNG ali JPG.");
      logoUpload.value = "";
      return;
    }

    const reader = new FileReader();
    reader.onload = () => {
      uploadedLogoData = String(reader.result);
      updatePreview();
    };
    reader.readAsDataURL(file);
  });

  customizationForm.addEventListener("submit", (event) => {
    event.preventDefault();

    if (!currentProduct) return;
    if (!currentProduct.checkoutUrl) {
      alert("Stripe checkout povezava še ni nastavljena za ta izdelek.");
      return;
    }
    stripeCheckoutBtn.disabled = true;
    stripeCheckoutBtn.textContent = "Preusmerjam na Stripe…";
    window.location.href = currentProduct.checkoutUrl;
  });

  startDesignBtn.addEventListener("click", () => {
    const firstVisibleProduct = productCards.find((card) => !card.classList.contains("is-hidden"));
    if (firstVisibleProduct) {
      openProductWithCard(firstVisibleProduct);
    }
  });

  productModalClose.addEventListener("click", closeModal);
  productModal.addEventListener("click", (event) => {
    if (event.target === productModal) {
      closeModal();
    }
  });

  updatePreview();
}
