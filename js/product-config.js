(() => {
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

  const CATEGORY_ORDER = [
    'all',
    'kamen',
    'obeski',
    'nakit',
    'dodatki',
    'kristali',
    'leseni-izdelki',
    'kovinski-izdelki',
    'personalizirano'
  ];

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

  const CUSTOMIZATION_LABELS = {
    imageUpload: 'Možnost nalaganja slike',
    customText: 'Osebno besedilo',
    fontSelection: 'Izbira pisave',
    sizeSelection: 'Izbira velikosti'
  };

  const normalizeCategory = (raw) => CATEGORY_ALIASES[String(raw || '').trim().toLowerCase()] || 'personalizirano';

  const getCategoryLabel = (category) => CATEGORY_LABELS[normalizeCategory(category)] || CATEGORY_LABELS.personalizirano;

  const normalizeSelectionOptions = (options = []) => (Array.isArray(options) ? options : [])
    .map((option) => ({
      id: String(option.id || option.name || '').trim(),
      label: String(option.label || option.name || option.id || '').trim(),
      required: option.required !== false,
      choices: (Array.isArray(option.choices) ? option.choices : [])
        .map((choice) => ({
          value: String(choice.value || choice.id || choice.label || '').trim(),
          label: String(choice.label || choice.value || choice.id || '').trim()
        }))
        .filter((choice) => choice.value && choice.label)
    }))
    .filter((option) => option.id && option.label && option.choices.length);

  const normalizeProduct = (product, index = 0) => {
    const category = normalizeCategory(product.category || product.kategorija || product.material);

    return {
      id: product.id || `izdelek-${index + 1}`,
      name: product.name || product.title || product.ime || 'Izdelek',
      description: product.description || product.shortDescription || product.opis || '',
      category,
      material: product.material || '',
      price: product.price || product.cena || '',
      image: product.image || product.slika || '',
      gallery: Array.isArray(product.gallery) ? product.gallery : [],
      featured: Boolean(product.featured),
      isNew: Boolean(product.new),
      personalized: Boolean(product.personalized),
      customizationOptions: product.customizationOptions && typeof product.customizationOptions === 'object'
        ? product.customizationOptions
        : {},
      selectionOptions: normalizeSelectionOptions(product.selectionOptions || product.options || product.choices)
    };
  };

  const getCustomizationLabels = (customizationOptions = {}) => Object.entries(CUSTOMIZATION_LABELS)
    .filter(([key]) => customizationOptions[key])
    .map(([, label]) => label);

  const getProductBadges = (product) => [
    product.isNew ? 'Novo' : '',
    product.featured ? 'Priporočeno' : '',
    product.personalized ? 'Personalizacija' : ''
  ].filter(Boolean);

  window.JDSFProducts = {
    CATEGORY_LABELS,
    CATEGORY_ORDER,
    normalizeProduct,
    getCategoryLabel,
    getCustomizationLabels,
    getProductBadges
  };
})();
