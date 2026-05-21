(() => {
  const grid = document.getElementById('productGrid');
  if (!grid) return;

  const categoryWrap = document.getElementById('categoryFilters');
  const searchInput = document.getElementById('searchInput');
  const sortSelect = document.getElementById('sortSelect');
  const emptyState = document.getElementById('emptyState');

  const CATEGORY_LABELS = {
    all: 'Vsi izdelki',
    wood: 'Les',
    'k9-crystal': 'K9 Kristal',
    metal: 'Kovina',
    custom: 'Personalizirano'
  };

  const CATEGORY_ALIASES = {
    wood: 'wood',
    les: 'wood',
    'k9-crystal': 'k9-crystal',
    crystal: 'k9-crystal',
    kristal: 'k9-crystal',
    metal: 'metal',
    kovina: 'metal',
    custom: 'custom',
    personalized: 'custom',
    personalizirano: 'custom',
    darila: 'custom'
  };

  let currentCategory = 'all';
  let currentSearch = '';
  let currentSort = '';
  let products = [];

  const parsePrice = (price) => Number(String(price || '').replace(/[^\d,.-]/g, '').replace(',', '.')) || 0;
  const normalizeCategory = (raw) => CATEGORY_ALIASES[String(raw || '').trim().toLowerCase()] || 'custom';

  const normalizeProduct = (product, index) => ({
    id: product.id || `izdelek-${index + 1}`,
    name: product.name || product.title || product.ime || 'Izdelek',
    category: normalizeCategory(product.category || product.kategorija || product.material),
    price: product.price || product.cena || '',
    image: product.image || product.slika || '',
    description: product.description || product.shortDescription || product.opis || ''
  });

  const renderFilters = () => {
    const filters = [
      ['all', CATEGORY_LABELS.all],
      ['wood', CATEGORY_LABELS.wood],
      ['k9-crystal', CATEGORY_LABELS['k9-crystal']],
      ['metal', CATEGORY_LABELS.metal],
      ['custom', CATEGORY_LABELS.custom]
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

  const createCard = (product) => {
    const article = document.createElement('article');
    article.className = 'shop-card';
    article.innerHTML = `<a class="shop-card-link" href="izdelek.html?id=${encodeURIComponent(product.id)}" aria-label="Odpri izdelek ${product.name}">
      <img src="${product.image}" alt="${product.name}" loading="lazy" />
      <div class="shop-card-body">
        <h3>${product.name}</h3>
        <p>${product.description}</p>
        <div class="price">${product.price}</div>
        <span class="btn btn-primary">Poglej izdelek</span>
      </div>
    </a>`;
    return article;
  };

  const renderProducts = () => {
    const filtered = products
      .filter((p) => currentCategory === 'all' || p.category === currentCategory)
      .filter((p) => p.name.toLowerCase().includes(currentSearch));

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
