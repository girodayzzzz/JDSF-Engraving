(() => {
  const getProductId = () => new URLSearchParams(window.location.search).get('id');

  const {
    normalizeProduct,
    getCategoryLabel,
    getCustomizationLabels,
    getProductBadges
  } = window.JDSFProducts;

  const escapeHtml = (value) => String(value || '').replace(/[&<>"']/g, (char) => ({
    '&': '&amp;',
    '<': '&lt;',
    '>': '&gt;',
    '"': '&quot;',
    "'": '&#39;'
  }[char]));

  const getSelectedOptions = (wrap) => Array.from(wrap?.querySelectorAll('[data-product-option]') || [])
    .map((select) => ({
      id: select.dataset.productOption,
      label: select.dataset.productOptionLabel,
      value: select.value,
      valueLabel: select.options[select.selectedIndex]?.textContent || select.value
    }))
    .filter((option) => option.id && option.value);

  const renderProduct = (product) => {
    const mainImage = document.getElementById('productMainImage');
    const galleryWrap = document.getElementById('productGallery');
    const checkoutLink = document.getElementById('productCheckoutLink');
    const addToCartButton = document.getElementById('productAddToCart');
    const quantityInput = document.getElementById('productQuantity');
    const cartMessage = document.getElementById('productCartMessage');
    const productBadges = document.getElementById('productBadges');
    const customizationList = document.getElementById('productCustomizationList');
    const customizationWrap = document.getElementById('productCustomization');
    const selectionOptionsWrap = document.getElementById('productSelectionOptions');

    document.title = `${product.name} | JDSF Graviranje`;
    document.getElementById('productName').textContent = product.name;
    document.getElementById('productDescription').textContent = product.description;
    document.getElementById('productPrice').textContent = product.price;
    document.getElementById('productCategory').textContent = getCategoryLabel(product.category);

    if (productBadges) {
      productBadges.innerHTML = '';
      getProductBadges(product).forEach((badge) => {
        const item = document.createElement('span');
        item.textContent = badge;
        productBadges.appendChild(item);
      });
      productBadges.hidden = productBadges.children.length === 0;
    }

    if (customizationList && customizationWrap) {
      const options = getCustomizationLabels(product.customizationOptions);
      customizationList.innerHTML = '';
      options.forEach((option) => {
        const item = document.createElement('li');
        item.textContent = option;
        customizationList.appendChild(item);
      });
      customizationWrap.hidden = options.length === 0;
    }

    if (selectionOptionsWrap) {
      selectionOptionsWrap.innerHTML = '';
      const options = Array.isArray(product.selectionOptions) ? product.selectionOptions : [];
      options.forEach((option) => {
        const field = document.createElement('label');
        field.className = 'product-option-field';
        field.innerHTML = `<span>${escapeHtml(option.label)}</span><select data-product-option="${escapeHtml(option.id)}" data-product-option-label="${escapeHtml(option.label)}" ${option.required ? 'required' : ''}>${option.required ? '<option value="">Izberi možnost</option>' : ''}${option.choices.map((choice) => `<option value="${escapeHtml(choice.value)}">${escapeHtml(choice.label)}</option>`).join('')}</select>`;
        selectionOptionsWrap.appendChild(field);
      });
      selectionOptionsWrap.hidden = options.length === 0;
    }

    if (checkoutLink) checkoutLink.href = 'kosarica.html';
    if (addToCartButton) {
      addToCartButton.addEventListener('click', () => {
        const quantity = Math.max(1, Math.floor(Number(quantityInput?.value) || 1));
        if (quantityInput) quantityInput.value = quantity;
        const selectedOptions = getSelectedOptions(selectionOptionsWrap);
        const requiredOptionCount = (product.selectionOptions || []).filter((option) => option.required).length;
        if (selectedOptions.length < requiredOptionCount) {
          if (cartMessage) cartMessage.textContent = 'Najprej izberi označbo izdelka.';
          return;
        }
        window.JDSFCart?.addItem(product, quantity, { selectedOptions });
        if (cartMessage) {
          cartMessage.textContent = `Dodano ${quantity} × v košarico ✓`;
          setTimeout(() => {
            cartMessage.textContent = '';
          }, 1600);
        }
      });
    }

    const gallery = [product.image, ...product.gallery].filter(Boolean);
    const uniqueGallery = [...new Set(gallery)];

    mainImage.src = uniqueGallery[0] || '';
    mainImage.alt = product.name;

    galleryWrap.innerHTML = '';
    uniqueGallery.forEach((imgSrc, index) => {
      const thumbBtn = document.createElement('button');
      thumbBtn.type = 'button';
      thumbBtn.style.border = '1px solid #ddd';
      thumbBtn.style.padding = '0';
      thumbBtn.style.borderRadius = '0.5rem';
      thumbBtn.style.overflow = 'hidden';
      thumbBtn.setAttribute('aria-label', `Slika ${index + 1}`);

      const thumb = document.createElement('img');
      thumb.src = imgSrc;
      thumb.alt = `${product.name} - slika ${index + 1}`;
      thumb.loading = 'lazy';

      thumbBtn.addEventListener('click', () => {
        mainImage.src = imgSrc;
      });

      thumbBtn.appendChild(thumb);
      galleryWrap.appendChild(thumbBtn);
    });
  };

  const showError = (message) => {
    const error = document.getElementById('productError');
    const detail = document.getElementById('productDetail');
    detail.hidden = true;
    error.hidden = false;
    error.textContent = message;
  };

  const init = async () => {
    const productId = getProductId();
    if (!productId) {
      showError('Manjka parameter izdelka v URL-ju (id).');
      return;
    }

    try {
      const response = await fetch('data/products.json', { cache: 'no-store' });
      if (!response.ok) throw new Error('Napaka pri nalaganju products.json');
      const rawProducts = await response.json();
      const product = rawProducts.map(normalizeProduct).find((p) => p.id === productId);
      if (!product) {
        showError('Izdelek s podanim ID-jem ne obstaja.');
        return;
      }
      renderProduct(product);
    } catch (_) {
      showError('Napaka pri nalaganju izdelka.');
    }
  };

  init();
})();
