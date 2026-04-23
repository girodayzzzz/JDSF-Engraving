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
      button.textContent = "Message Sent ✓";
      button.disabled = true;
    }
  });
}

// Shop customization and cart logic (shop page only)
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
  const cartSidebar = document.getElementById("cartSidebar");
  const cartToggleBtn = document.getElementById("cartToggleBtn");
  const cartCloseBtn = document.getElementById("cartCloseBtn");
  const cartItems = document.getElementById("cartItems");
  const cartTotal = document.getElementById("cartTotal");
  const cartCount = document.getElementById("cartCount");
  const startDesignBtn = document.getElementById("startDesignBtn");
  const customizationForm = document.getElementById("customizationForm");

  const CART_STORAGE_KEY = "jdsfCart";
  let cart = JSON.parse(localStorage.getItem(CART_STORAGE_KEY) || "[]");
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
    const previewValue = engravingTextInput.value.trim() || "Your engraving text";
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

  const renderCart = () => {
    cartItems.innerHTML = "";

    if (!cart.length) {
      cartItems.innerHTML = "<p>Your cart is empty.</p>";
      cartTotal.textContent = "$0.00";
      cartCount.textContent = "0";
      return;
    }

    let total = 0;

    cart.forEach((item, index) => {
      total += item.price;
      const row = document.createElement("article");
      row.className = "cart-item";
      row.innerHTML = `
        <p><strong>${item.name}</strong> — $${item.price.toFixed(2)}</p>
        <p>Text: ${item.engravingText || "(none)"}</p>
        <p>Font: ${item.font}</p>
        ${item.image ? `<img src="${item.image}" alt="Uploaded logo" style="width:56px;height:42px;object-fit:contain;border-radius:6px;">` : ""}
        <button class="btn btn-ghost" type="button" data-remove-index="${index}">Remove</button>
      `;
      cartItems.appendChild(row);
    });

    cartTotal.textContent = `$${total.toFixed(2)}`;
    cartCount.textContent = String(cart.length);
  };

  const persistCart = () => {
    localStorage.setItem(CART_STORAGE_KEY, JSON.stringify(cart));
    renderCart();
  };

  const openProductWithCard = (card) => {
    currentProduct = {
      id: card.dataset.productId,
      name: card.dataset.name,
      description: card.dataset.description,
      material: card.dataset.material,
      price: Number(card.dataset.price),
      image: card.querySelector("img")?.src || "",
    };

    modalProductImage.src = currentProduct.image;
    productModalTitle.textContent = currentProduct.name;
    modalDescription.textContent = currentProduct.description;
    modalPrice.textContent = `$${currentProduct.price.toFixed(2)}`;
    modalMaterial.textContent = currentProduct.material.toUpperCase();

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
      alert("Please upload a PNG or JPG image.");
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

    cart.push({
      id: currentProduct.id,
      name: currentProduct.name,
      price: currentProduct.price,
      engravingText: engravingTextInput.value.trim(),
      font: fontSelect.value,
      fontSize: Number(fontSize.value),
      image: uploadedLogoData,
    });

    persistCart();
    closeModal();
    cartSidebar.classList.add("open");
    cartSidebar.setAttribute("aria-hidden", "false");
  });

  cartItems.addEventListener("click", (event) => {
    const button = event.target.closest("[data-remove-index]");
    if (!button) return;

    const index = Number(button.dataset.removeIndex);
    cart = cart.filter((_, itemIndex) => itemIndex !== index);
    persistCart();
  });

  cartToggleBtn.addEventListener("click", () => {
    cartSidebar.classList.add("open");
    cartSidebar.setAttribute("aria-hidden", "false");
  });

  cartCloseBtn.addEventListener("click", () => {
    cartSidebar.classList.remove("open");
    cartSidebar.setAttribute("aria-hidden", "true");
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
  renderCart();
}
