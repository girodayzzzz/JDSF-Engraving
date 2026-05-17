(() => {
  const getProductId = () => new URLSearchParams(window.location.search).get('id');

  const normalizeCategory = (category) => {
    const key = String(category || '').toLowerCase();
    if (key === 'wood' || key === 'les') return 'Les';
    if (key === 'k9-crystal' || key === 'crystal' || key === 'kristal') return 'K9 Kristal';
    if (key === 'metal' || key === 'kovina') return 'Kovina';
    if (key === 'stone' || key === 'kamen') return 'Kamen';
    return 'Personalizirano';
  };

  const normalizeProduct = (product) => ({
    id: product.id,
    name: product.name || product.title || product.ime || 'Izdelek',
    description: product.description || product.shortDescription || product.opis || '',
    price: product.price || product.cena || '',
    image: product.image || product.slika || '',
    gallery: Array.isArray(product.gallery) ? product.gallery : [],
    category: product.category || product.kategorija || product.material || ''
  });

  const renderProduct = (product) => {
    const mainImage = document.getElementById('productMainImage');
    const galleryWrap = document.getElementById('productGallery');

    document.title = `${product.name} | JDSF Graviranje`;
    document.getElementById('productName').textContent = product.name;
    document.getElementById('productDescription').textContent = product.description;
    document.getElementById('productPrice').textContent = product.price;
    document.getElementById('productCategory').textContent = normalizeCategory(product.category);

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
