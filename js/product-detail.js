(() => {
  const getProductId = () => new URLSearchParams(window.location.search).get('id');

  const CATEGORY_LABELS = {
    kamen: 'Kamen',
    obeski: 'Obeski',
    nakit: 'Nakit',
    dodatki: 'Dodatki',
    kristali: 'Kristali',
    'leseni-izdelki': 'Leseni izdelki',
    'kovinski-izdelki': 'Kovinski izdelki',
    personalizirano: 'Personalizirano'
  };

  const CATEGORY_ALIASES = {
    kamen: 'kamen',
    stone: 'kamen',
    skrilavec: 'kamen',
    obeski: 'obeski',
    obesek: 'obeski',
    keychains: 'obeski',
    keychain: 'obeski',
    nakit: 'nakit',
    verizice: 'nakit',
    verižice: 'nakit',
    jewelry: 'nakit',
    dodatki: 'dodatki',
    dodatek: 'dodatki',
    accessories: 'dodatki',
    accessory: 'dodatki',
    okraski: 'dodatki',
    okrasek: 'dodatki',
    ornaments: 'dodatki',
    ornament: 'dodatki',
    kristali: 'kristali',
    kristal: 'kristali',
    crystal: 'kristali',
    'k9-crystal': 'kristali',
    les: 'leseni-izdelki',
    wood: 'leseni-izdelki',
    'leseni-izdelki': 'leseni-izdelki',
    kovina: 'kovinski-izdelki',
    kovine: 'kovinski-izdelki',
    metal: 'kovinski-izdelki',
    'kovinski-izdelki': 'kovinski-izdelki',
    custom: 'personalizirano',
    personalized: 'personalizirano',
    personalizirano: 'personalizirano',
    darila: 'personalizirano'
  };

  const normalizeCategory = (category) => CATEGORY_ALIASES[String(category || '').trim().toLowerCase()] || 'personalizirano';
  const getCategoryLabel = (category) => CATEGORY_LABELS[normalizeCategory(category)] || CATEGORY_LABELS.personalizirano;

  const normalizeProduct = (product) => ({
    id: product.id,
    name: product.name || product.title || product.ime || 'Izdelek',
    description: product.description || product.shortDescription || product.opis || '',
    price: product.price || product.cena || '',
    image: product.image || product.slika || '',
    gallery: Array.isArray(product.gallery) ? product.gallery : [],
    category: normalizeCategory(product.category || product.kategorija || product.material),
    checkoutUrl: product.checkoutUrl || 'kontakt.html'
  });

  const renderProduct = (product) => {
    const mainImage = document.getElementById('productMainImage');
    const galleryWrap = document.getElementById('productGallery');
    const checkoutLink = document.getElementById('productCheckoutLink');
    const addToCartButton = document.getElementById('productAddToCart');
    const quantityInput = document.getElementById('productQuantity');
    const cartMessage = document.getElementById('productCartMessage');

    document.title = `${product.name} | JDSF Graviranje`;
    document.getElementById('productName').textContent = product.name;
    document.getElementById('productDescription').textContent = product.description;
    document.getElementById('productPrice').textContent = product.price;
    document.getElementById('productCategory').textContent = getCategoryLabel(product.category);

    if (checkoutLink) checkoutLink.href = 'kosarica.html';
    if (addToCartButton) {
      addToCartButton.addEventListener('click', () => {
        const quantity = Math.max(1, Math.floor(Number(quantityInput?.value) || 1));
        if (quantityInput) quantityInput.value = quantity;
        window.JDSFCart?.addItem(product, quantity);
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
