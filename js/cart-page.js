(() => {
  const cartItems = document.getElementById('cartItems');
  if (!cartItems) return;

  const emptyState = document.getElementById('cartEmpty');
  const itemCount = document.getElementById('cartItemCount');
  const total = document.getElementById('cartTotal');
  const inquiryLink = document.getElementById('cartInquiryLink');
  const clearCartButton = document.getElementById('clearCart');

  const createInquiryHref = (items) => {
    if (!items.length) return 'kontakt.html';

    const lines = items.map((item) => `- ${item.name} | količina: ${item.quantity} | cena: ${item.price || 'po ponudbi'}`);
    const body = [
      'Pozdravljeni,',
      '',
      'zanima me naročilo oziroma ponudba za naslednje izdelke:',
      '',
      ...lines,
      '',
      'Opomba za personalizacijo:',
      '',
      'Hvala.'
    ].join('\n');

    return `mailto:info@jdsf-lasercraft.com?subject=${encodeURIComponent('Povpraševanje iz košarice')}&body=${encodeURIComponent(body)}`;
  };

  const renderCart = () => {
    const items = window.JDSFCart?.getItems() || [];
    const count = items.reduce((sum, item) => sum + (Number(item.quantity) || 0), 0);
    const cartTotal = window.JDSFCart?.getTotal() || 0;

    cartItems.innerHTML = '';
    emptyState.hidden = items.length > 0;
    itemCount.textContent = String(count);
    total.textContent = window.JDSFCart?.formatTotal(cartTotal) || '0,00 €';
    inquiryLink.href = createInquiryHref(items);
    inquiryLink.classList.toggle('is-disabled', items.length === 0);
    clearCartButton.hidden = items.length === 0;

    items.forEach((item) => {
      const article = document.createElement('article');
      article.className = 'cart-item';
      article.innerHTML = `
        <img src="${item.image}" alt="${item.name}" loading="lazy" />
        <div class="cart-item-main">
          <h3>${item.name}</h3>
          <p>${item.price || 'Cena po ponudbi'}</p>
          <a href="izdelek.html?id=${encodeURIComponent(item.id)}">Poglej izdelek</a>
        </div>
        <div class="cart-quantity">
          <label for="qty-${item.id}">Količina</label>
          <input id="qty-${item.id}" type="number" min="1" value="${Number(item.quantity) || 1}" data-cart-quantity="${item.id}" />
        </div>
        <button class="btn btn-ghost cart-remove" type="button" data-remove-from-cart="${item.id}">Odstrani</button>`;
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
    if (!button) return;
    window.JDSFCart?.removeItem(button.dataset.removeFromCart);
    renderCart();
  });

  clearCartButton.addEventListener('click', () => {
    window.JDSFCart?.clear();
    renderCart();
  });

  window.addEventListener('jdsf-cart-updated', renderCart);
  renderCart();
})();
