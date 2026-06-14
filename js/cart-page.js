(() => {
  const cartItems = document.getElementById('cartItems');
  if (!cartItems) return;

  const emptyState = document.getElementById('cartEmpty');
  const itemCount = document.getElementById('cartItemCount');
  const total = document.getElementById('cartTotal');
  const shippingRow = document.getElementById('cartShippingRow');
  const checkoutButton = document.getElementById('cartCheckoutButton');
  const checkoutStatus = document.getElementById('cartCheckoutStatus');
  const clearCartButton = document.getElementById('clearCart');

  const getProductUrl = (productId) => `izdelek.html?id=${encodeURIComponent(productId)}`;
  const catalogProducts = new Map();
  let catalogLoaded = false;
  const DEFAULT_SHIPPING_AMOUNT_CENTS = 490;
  let shippingAmountCents = DEFAULT_SHIPPING_AMOUNT_CENTS;

  const parseCartPrice = (price) => Number(String(price || '').replace(/[^\d,.-]/g, '').replace(',', '.')) || 0;
  const formatPrice = (amount) => window.JDSFCart?.formatTotal(amount) || `${amount.toFixed(2).replace('.', ',')} €`;
  const formatCents = (amountCents) => formatPrice((Number(amountCents) || 0) / 100);
  const escapeHtml = (value) => String(value || '').replace(/[&<>"']/g, (char) => ({
    '&': '&amp;',
    '<': '&lt;',
    '>': '&gt;',
    '"': '&quot;',
    "'": '&#39;'
  }[char]));

  const normalizeCatalogProduct = (product) => ({
    id: product.id,
    name: product.name || product.title || product.ime || 'Izdelek',
    price: product.price || product.cena || '',
    image: product.image || product.slika || ''
  });

  const getCurrentCartItem = (item) => {
    const product = catalogProducts.get(item.id);
    if (!product) return { ...item, unavailable: catalogLoaded };
    return { ...item, ...product, quantity: item.quantity, unavailable: false };
  };

  const loadShippingConfig = async () => {
    try {
      const response = await fetch('/api/create-checkout-session', { cache: 'no-store' });
      if (!response.ok) return;

      const config = await response.json().catch(() => null);
      const amountCents = Number(config?.shipping?.amount_cents);
      if (Number.isFinite(amountCents) && amountCents >= 0) {
        shippingAmountCents = Math.round(amountCents);
      }
    } catch (error) {
      shippingAmountCents = DEFAULT_SHIPPING_AMOUNT_CENTS;
    }
  };

  const loadCatalogProducts = async () => {
    const response = await fetch('data/products.json', { cache: 'no-store' });
    if (!response.ok) throw new Error('Kataloga izdelkov ni mogoče naložiti.');

    const products = await response.json();
    if (!Array.isArray(products)) throw new Error('Katalog izdelkov ni veljaven.');

    products.map(normalizeCatalogProduct).forEach((product) => {
      if (product.id) catalogProducts.set(product.id, product);
    });
    catalogLoaded = true;
  };

  const setCheckoutStatus = (message, type = 'info') => {
    if (!checkoutStatus) return;
    checkoutStatus.textContent = message;
    checkoutStatus.dataset.status = type;
  };

  const setCheckoutLoading = (isLoading) => {
    if (!checkoutButton) return;
    checkoutButton.disabled = isLoading;
    checkoutButton.setAttribute('aria-busy', String(isLoading));
    checkoutButton.textContent = isLoading ? 'Preusmerjam na plačilo ...' : 'Nadaljuj na varno plačilo';
  };

  const getCheckoutItems = () => (window.JDSFCart?.getItems() || []).map((item) => ({
    id: item.id,
    quantity: Math.max(1, Math.floor(Number(item.quantity) || 1)),
    selectedOptions: Array.isArray(item.selectedOptions) ? item.selectedOptions : []
  }));

  const renderSelectedOptions = (selectedOptions = []) => {
    const options = Array.isArray(selectedOptions) ? selectedOptions : [];
    if (!options.length) return '';
    return `<dl class="cart-item-options">${options.map((option) => `<div><dt>${escapeHtml(option.label || option.id)}</dt><dd>${escapeHtml(option.valueLabel || option.value)}</dd></div>`).join('')}</dl>`;
  };

  const renderCart = () => {
    const items = window.JDSFCart?.getItems() || [];
    const displayItems = items.map(getCurrentCartItem);
    const count = items.reduce((sum, item) => sum + (Number(item.quantity) || 0), 0);
    const cartTotal = displayItems.reduce((sum, item) => sum + parseCartPrice(item.price) * (Number(item.quantity) || 0), 0);
    const shippingTotal = items.length ? shippingAmountCents / 100 : 0;
    const hasUnavailableItems = displayItems.some((item) => item.unavailable);

    cartItems.innerHTML = '';
    emptyState.hidden = items.length > 0;
    itemCount.textContent = String(count);
    total.textContent = formatPrice(cartTotal + shippingTotal);
    if (shippingRow) {
      shippingRow.hidden = items.length === 0;
      const shippingAmount = shippingRow.querySelector('[data-cart-shipping-amount]');
      if (shippingAmount) shippingAmount.textContent = formatCents(shippingAmountCents);
    }
    checkoutButton.disabled = items.length === 0 || hasUnavailableItems;
    checkoutButton.classList.toggle('is-disabled', items.length === 0 || hasUnavailableItems);
    clearCartButton.hidden = items.length === 0;
    setCheckoutStatus(
      hasUnavailableItems
        ? 'Nekateri izdelki niso več na voljo. Odstranite jih pred plačilom.'
        : (items.length ? 'Plačilo bo izvedeno prek Stripe Checkout varne povezave.' : ''),
      hasUnavailableItems ? 'error' : 'info'
    );

    displayItems.forEach((item) => {
      const productUrl = getProductUrl(item.id);
      const itemKey = item.itemKey || item.id;
      const safeId = encodeURIComponent(itemKey);
      const quantity = Number(item.quantity) || 1;
      const article = document.createElement('article');
      article.className = 'cart-item';
      article.dataset.productUrl = productUrl;
      article.innerHTML = `
        <a class="cart-item-image-link" href="${productUrl}" aria-label="Odpri izdelek ${escapeHtml(item.name)}">
          <img src="${escapeHtml(item.image)}" alt="${escapeHtml(item.name)}" loading="lazy" />
        </a>
        <a class="cart-item-main" href="${productUrl}">
          <h3>${escapeHtml(item.name)}</h3>
          <p>${escapeHtml(item.unavailable ? 'Izdelek ni več na voljo' : (item.price || 'Cena ni nastavljena'))}</p>
          ${renderSelectedOptions(item.selectedOptions)}
          <span class="cart-item-hint">Kliknite sliko ali okvir za ogled izdelka</span>
        </a>
        <div class="cart-quantity">
          <label for="qty-${safeId}">Količina</label>
          <input id="qty-${safeId}" type="number" min="1" value="${quantity}" data-cart-quantity="${escapeHtml(itemKey)}" />
        </div>
        <button class="btn btn-ghost cart-remove" type="button" data-remove-from-cart="${escapeHtml(itemKey)}">Odstrani</button>`;
      cartItems.appendChild(article);
    });
  };

  cartItems.addEventListener('change', (event) => {
    const input = event.target.closest('[data-cart-quantity]');
    if (!input) return;
    window.JDSFCart?.updateQuantity(input.dataset.cartQuantity, input.value);
    renderCart();
  });

  cartItems.addEventListener('click', (event) => {
    const button = event.target.closest('[data-remove-from-cart]');
    if (button) {
      window.JDSFCart?.removeItem(button.dataset.removeFromCart);
      renderCart();
      return;
    }

    if (event.target.closest('button, input, label, a')) return;

    const cartItem = event.target.closest('[data-product-url]');
    if (cartItem?.dataset.productUrl) {
      window.location.href = cartItem.dataset.productUrl;
    }
  });


  checkoutButton.addEventListener('click', async () => {
    const items = getCheckoutItems();
    if (!items.length) return;

    setCheckoutLoading(true);
    setCheckoutStatus('Ustvarjam varno Stripe povezavo ...', 'info');

    try {
      const response = await fetch('/api/create-checkout-session', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ items })
      });
      const data = await response.json().catch(() => ({}));

      if (!response.ok || !data.url) {
        throw new Error(data.error || 'Plačila trenutno ni mogoče začeti.');
      }

      window.location.href = data.url;
    } catch (error) {
      setCheckoutStatus(error.message || 'Plačila trenutno ni mogoče začeti.', 'error');
      setCheckoutLoading(false);
    }
  });

  clearCartButton.addEventListener('click', () => {
    window.JDSFCart?.clear();
    renderCart();
  });

  window.addEventListener('jdsf-cart-updated', renderCart);
  renderCart();
  Promise.all([loadShippingConfig(), loadCatalogProducts()])
    .then(renderCart)
    .catch((error) => {
      setCheckoutStatus(error.message || 'Kataloga izdelkov ni mogoče osvežiti.', 'error');
    });
})();
