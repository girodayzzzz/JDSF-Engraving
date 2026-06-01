(() => {
  const grid = document.getElementById('productGrid');
  if (!grid) return;

  const categoryWrap = document.getElementById('categoryFilters');
  const searchInput = document.getElementById('searchInput');
  const sortSelect = document.getElementById('sortSelect');
  const emptyState = document.getElementById('emptyState');

  const CATEGORY_LABELS = {
    all: 'Vsi izdelki',
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

  let currentCategory = 'all';
  let currentSearch = '';
  let currentSort = '';
  let products = [];

  const parsePrice = (price) => Number(String(price || '').replace(/[^\d,.-]/g, '').replace(',', '.')) || 0;
  const escapeHtml = (value) => String(value || '').replace(/[&<>"']/g, (char) => ({
    '&': '&amp;',
    '<': '&lt;',
    '>': '&gt;',
    '"': '&quot;',
    "'": '&#39;'
  }[char]));
  const normalizeCategory = (raw) => CATEGORY_ALIASES[String(raw || '').trim().toLowerCase()] || 'personalizirano';

  const normalizeProduct = (product, index) => ({
    id: product.id || `izdelek-${index + 1}`,
    name: product.name || product.title || product.ime || 'Izdelek',
    category: normalizeCategory(product.category || product.kategorija || product.material),
    material: product.material || '',
    price: product.price || product.cena || '',
    image: product.image || product.slika || '',
    description: product.description || product.shortDescription || product.opis || ''
  });

  const renderFilters = () => {
    const filters = [
      ['all', CATEGORY_LABELS.all],
      ['kamen', CATEGORY_LABELS.kamen],
      ['obeski', CATEGORY_LABELS.obeski],
      ['nakit', CATEGORY_LABELS.nakit],
      ['dodatki', CATEGORY_LABELS.dodatki],
      ['kristali', CATEGORY_LABELS.kristali],
      ['leseni-izdelki', CATEGORY_LABELS['leseni-izdelki']],
      ['kovinski-izdelki', CATEGORY_LABELS['kovinski-izdelki']],
      ['personalizirano', CATEGORY_LABELS.personalizirano]
    ];

    categoryWrap.innerHTML = filters
      .map(([key, label]) => `<button class="btn btn-filter ${key === currentCategory ? 'active' : ''}" data-category="${key}" type="button">${label}</button>`)
      .join('');

    categoryWrap.querySelectorAll('button').forEach((btn) => {
      btn.addEventListener('click', () => {
        currentCategory = btn.dataset.category;
        renderFilters();
        renderProducts();
      });
    });
  };

  const normalizeQuantity = (value) => Math.max(1, Math.floor(Number(value) || 1));

  const showAddedState = (message, quantity) => {
    message.textContent = `Dodano ${quantity} × v košarico ✓`;
    setTimeout(() => {
      message.textContent = '';
    }, 1600);
  };

  const createCard = (product) => {
    const article = document.createElement('article');
    article.className = 'shop-card';
    article.innerHTML = `<a class="shop-card-link" href="izdelek.html?id=${encodeURIComponent(product.id)}" aria-label="Odpri izdelek ${escapeHtml(product.name)}">
      <img src="${escapeHtml(product.image)}" alt="${escapeHtml(product.name)}" loading="lazy" />
      <div class="shop-card-body">
        <h3>${escapeHtml(product.name)}</h3>
        <p>${escapeHtml(product.description)}</p>
        <div class="price">${escapeHtml(product.price)}</div>
      </div>
    </a>
    <div class="shop-card-actions">
      <label class="quantity-field">Količina
        <input type="number" min="1" step="1" value="1" data-cart-quantity-input aria-label="Količina za ${escapeHtml(product.name)}" />
      </label>
      <button class="btn btn-primary" type="button" data-add-to-cart>Dodaj v košarico</button>
      <span class="cart-action-message" data-cart-action-message aria-live="polite"></span>
    </div>`;

    const productUrl = `izdelek.html?id=${encodeURIComponent(product.id)}`;
    const quantityInput = article.querySelector('[data-cart-quantity-input]');
    const actionMessage = article.querySelector('[data-cart-action-message]');

    article.dataset.productUrl = productUrl;

    article.addEventListener('click', (event) => {
      if (event.target.closest('button, input, label, a')) return;
      window.location.href = productUrl;
    });


    article.querySelector('[data-add-to-cart]').addEventListener('click', () => {
      const quantity = normalizeQuantity(quantityInput.value);
      quantityInput.value = quantity;
      window.JDSFCart?.addItem(product, quantity);
      showAddedState(actionMessage, quantity);
    });

    return article;
  };

  const renderProducts = () => {
    const filtered = products
      .filter((p) => currentCategory === 'all' || p.category === currentCategory)
      .filter((p) => [p.name, p.description, p.material, CATEGORY_LABELS[p.category]]
        .join(' ')
        .toLowerCase()
        .includes(currentSearch));

    if (currentSort === 'asc') filtered.sort((a, b) => parsePrice(a.price) - parsePrice(b.price));
    if (currentSort === 'desc') filtered.sort((a, b) => parsePrice(b.price) - parsePrice(a.price));

    grid.innerHTML = '';
    filtered.forEach((p) => grid.appendChild(createCard(p)));
    emptyState.hidden = filtered.length > 0;
  };

  const loadProducts = async () => {
    const response = await fetch('data/products.json', { cache: 'no-store' });
    if (!response.ok) throw new Error('Napaka pri nalaganju products.json');
    const rawProducts = await response.json();
    if (!Array.isArray(rawProducts)) throw new Error('Neveljavna oblika products.json');
    return rawProducts.map(normalizeProduct);
  };

  loadProducts()
    .then((items) => {
      products = items;
      renderFilters();
      renderProducts();
    })
    .catch(() => {
      emptyState.hidden = false;
      emptyState.textContent = 'Napaka pri nalaganju izdelkov.';
    });

  searchInput.addEventListener('input', () => {
    currentSearch = searchInput.value.trim().toLowerCase();
    renderProducts();
  });

  sortSelect.addEventListener('change', () => {
    currentSort = sortSelect.value;
    renderProducts();
  });

})();
