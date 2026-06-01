const navToggle = document.getElementById("navToggle");
const navMenu = document.getElementById("navMenu");
if (navToggle && navMenu) navToggle.addEventListener("click", () => navMenu.classList.toggle("open"));

const CART_STORAGE_KEY = "jdsfCart";

const parseCartPrice = (price) => Number(String(price || "").replace(/[^\d,.-]/g, "").replace(",", ".")) || 0;

const readCart = () => {
  try {
    const stored = JSON.parse(localStorage.getItem(CART_STORAGE_KEY) || "[]");
    return Array.isArray(stored) ? stored : [];
  } catch (_) {
    return [];
  }
};

const saveCart = (items) => {
  localStorage.setItem(CART_STORAGE_KEY, JSON.stringify(items));
  window.dispatchEvent(new CustomEvent("jdsf-cart-updated", { detail: { items } }));
};

const normalizeCartQuantity = (quantity) => Math.max(1, Math.floor(Number(quantity) || 1));

const getCartCount = () => readCart().reduce((sum, item) => sum + (Number(item.quantity) || 0), 0);

const updateCartBadges = () => {
  const count = getCartCount();
  document.querySelectorAll("[data-cart-count]").forEach((badge) => {
    const isEmpty = count === 0;
    badge.textContent = String(count);
    badge.classList.toggle("is-empty", isEmpty);
    badge.setAttribute("aria-hidden", String(isEmpty));
  });
  document.querySelectorAll("[data-cart-label]").forEach((label) => {
    label.setAttribute("aria-label", count ? `Košarica, ${count} izdelkov` : "Košarica je prazna");
  });
};

const addHeaderCartLink = () => {
  const nav = document.getElementById("navMenu");
  if (!nav || nav.querySelector("[data-cart-label]")) return;

  const link = document.createElement("a");
  link.href = "kosarica.html";
  link.className = `cart-nav-link${window.location.pathname.endsWith("kosarica.html") ? " active" : ""}`;
  link.setAttribute("data-cart-label", "");
  link.innerHTML = 'Košarica <span class="cart-count is-empty" data-cart-count aria-hidden="true">0</span>';
  nav.appendChild(link);
  updateCartBadges();
};

window.JDSFCart = {
  getItems: readCart,
  addItem(product, quantity = 1) {
    if (!product || !product.id) return [];

    const quantityToAdd = normalizeCartQuantity(quantity);
    const items = readCart();
    const existing = items.find((item) => item.id === product.id);
    if (existing) {
      existing.quantity = (Number(existing.quantity) || 1) + quantityToAdd;
    } else {
      items.push({
        id: product.id,
        name: product.name || product.title || product.ime || "Izdelek",
        price: product.price || product.cena || "",
        image: product.image || product.slika || "",
        category: product.category || product.kategorija || "",
        quantity: quantityToAdd
      });
    }

    saveCart(items);
    return items;
  },
  updateQuantity(productId, quantity) {
    const normalizedQuantity = Math.max(0, Math.floor(Number(quantity) || 0));
    const items = readCart()
      .map((item) => (item.id === productId ? { ...item, quantity: normalizedQuantity } : item))
      .filter((item) => item.quantity > 0);
    saveCart(items);
    return items;
  },
  removeItem(productId) {
    const items = readCart().filter((item) => item.id !== productId);
    saveCart(items);
    return items;
  },
  clear() {
    saveCart([]);
  },
  getCount: getCartCount,
  getTotal() {
    return readCart().reduce((sum, item) => sum + parseCartPrice(item.price) * (Number(item.quantity) || 0), 0);
  },
  formatTotal(value) {
    return `${Number(value || 0).toFixed(2).replace(".", ",")} €`;
  }
};

window.addEventListener("jdsf-cart-updated", updateCartBadges);
document.addEventListener("DOMContentLoaded", () => {
  addHeaderCartLink();
  updateCartBadges();
});

window.addEventListener("load", () => {
  const loader = document.getElementById("pageLoader");
  if (loader) setTimeout(() => loader.classList.add("hidden"), 600);
});

const revealObserver = new IntersectionObserver(
  (entries) =>
    entries.forEach((entry) => {
      if (entry.isIntersecting) {
        entry.target.classList.add("visible");
        revealObserver.unobserve(entry.target);
      }
    }),
  { threshold: 0.12 }
);

document.querySelectorAll(".reveal").forEach((item) => revealObserver.observe(item));

document.querySelectorAll("form[data-managed-form]").forEach((contactForm) => {
  const fileInput = contactForm.querySelector("input[type='file']");
  const fileStatus = contactForm.querySelector("[data-file-status]");

  if (fileInput && fileStatus) {
    fileInput.addEventListener("change", () => {
      const selectedFiles = Array.from(fileInput.files || []).map((file) => file.name);
      fileStatus.textContent = selectedFiles.length
        ? `Izbrano: ${selectedFiles.join(", ")}`
        : "Datoteka ni obvezna, vendar zelo pomaga pri pripravi predloga.";
    });
  }

  contactForm.addEventListener("submit", () => {
    const method = (contactForm.getAttribute("method") || "GET").toUpperCase();
    const action = (contactForm.getAttribute("action") || "").trim();
    const isRemotePostForm = action.length > 0 && method === "POST";

    if (!isRemotePostForm) return;

    const button = contactForm.querySelector("button[type='submit']");
    if (button) {
      button.textContent = contactForm.dataset.submittingText || "Pošiljanje ...";
      button.disabled = true;
      button.setAttribute("aria-disabled", "true");
    }
  });
});
