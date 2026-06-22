const CURRENCY = 'eur';
const DEFAULT_SITE_URL = 'https://www.jdsf-lasercraft.com';
const DEFAULT_SHIPPING_AMOUNT_CENTS = 490;
const SHIPPING_RATE_NAME = 'Poštnina';

const jsonResponse = (body, init = {}) => Response.json(body, {
  headers: {
    'Cache-Control': 'no-store',
    ...init.headers
  },
  ...init
});

const parsePriceToCents = (price) => {
  const normalized = String(price || '').replace(/[^\d,.-]/g, '').replace(',', '.');
  const value = Number(normalized);
  return Number.isFinite(value) ? Math.round(value * 100) : 0;
};

const normalizeQuantity = (quantity) => Math.max(1, Math.min(99, Math.floor(Number(quantity) || 1)));

const normalizeSelectionOptions = (options = []) => (Array.isArray(options) ? options : [])
  .map((option) => ({
    id: String(option.id || '').trim(),
    label: String(option.label || option.id || '').trim(),
    value: String(option.value || '').trim(),
    valueLabel: String(option.valueLabel || option.value || '').trim()
  }))
  .filter((option) => option.id && option.value);

const getProductSelectionOptions = (product) => (Array.isArray(product.selectionOptions) ? product.selectionOptions : [])
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

const validateSelectedOptions = (product, selectedOptions = []) => {
  const configuredOptions = getProductSelectionOptions(product);
  const selected = normalizeSelectionOptions(selectedOptions);

  configuredOptions.forEach((option) => {
    const match = selected.find((item) => item.id === option.id);
    if (option.required && !match) throw new Error(`Izberi možnost "${option.label}" za izdelek "${product.title || product.name || product.id}".`);
    if (!match) return;

    const choice = option.choices.find((item) => item.value === match.value);
    if (!choice) throw new Error(`Možnost "${match.value}" ni veljavna za izdelek "${product.title || product.name || product.id}".`);
    match.label = option.label;
    match.valueLabel = choice.label;
  });

  return selected.filter((item) => configuredOptions.some((option) => option.id === item.id));
};

const formatSelectedOptions = (selectedOptions = []) => selectedOptions
  .map((option) => `${option.label}: ${option.valueLabel}`)
  .join(', ');

const getShippingAmountCents = (env = {}) => {
  const rawAmount = env.SHIPPING_AMOUNT_CENTS;
  if (rawAmount === undefined || rawAmount === null || String(rawAmount).trim() === '') {
    return DEFAULT_SHIPPING_AMOUNT_CENTS;
  }

  const configuredAmount = Number(rawAmount);
  return Number.isFinite(configuredAmount) && configuredAmount >= 0
    ? Math.round(configuredAmount)
    : DEFAULT_SHIPPING_AMOUNT_CENTS;
};

const getShippingConfig = (env) => ({
  amount_cents: getShippingAmountCents(env),
  currency: CURRENCY,
  display_name: SHIPPING_RATE_NAME
});

const loadProducts = async (request, env) => {
  const productsUrl = new URL('/data/products.json', request.url);
  const response = env.ASSETS
    ? await env.ASSETS.fetch(new Request(productsUrl, { method: 'GET' }))
    : await fetch(productsUrl);

  if (!response.ok) throw new Error('Kataloga izdelkov ni mogoče naložiti.');
  const products = await response.json();
  if (!Array.isArray(products)) throw new Error('Katalog izdelkov ni veljaven.');

  return new Map(products.map((product) => [product.id, product]));
};

const createLineItems = (cartItems, productMap) => cartItems.map((cartItem, index) => {
  const product = productMap.get(cartItem.id);
  if (!product) throw new Error(`Izdelek ${index + 1} ni več na voljo.`);

  const unitAmount = parsePriceToCents(product.price || product.cena);
  if (!unitAmount) throw new Error(`Izdelek "${product.title || product.name || product.id}" nima veljavne cene za plačilo.`);

  const selectedOptions = validateSelectedOptions(product, cartItem.selectedOptions);
  const optionSummary = formatSelectedOptions(selectedOptions);
  const baseName = product.title || product.name || product.ime || 'Izdelek';

  return {
    name: optionSummary ? `${baseName} (${optionSummary})` : baseName,
    image: product.image || product.slika || '',
    productId: product.id,
    quantity: normalizeQuantity(cartItem.quantity),
    selectedOptions,
    unitAmount
  };
});

const getAbsoluteUrl = (url, siteUrl) => {
  if (!url) return '';
  return new URL(url, siteUrl).href;
};

const appendShippingOption = (form, env) => {
  const shippingAmount = getShippingAmountCents(env);
  if (shippingAmount <= 0) return;

  form.append('shipping_options[0][shipping_rate_data][type]', 'fixed_amount');
  form.append('shipping_options[0][shipping_rate_data][fixed_amount][amount]', String(shippingAmount));
  form.append('shipping_options[0][shipping_rate_data][fixed_amount][currency]', CURRENCY);
  form.append('shipping_options[0][shipping_rate_data][display_name]', SHIPPING_RATE_NAME);
};

const appendLineItems = (form, lineItems, siteUrl) => {
  lineItems.forEach((item, index) => {
    form.append(`line_items[${index}][quantity]`, String(item.quantity));
    form.append(`line_items[${index}][price_data][currency]`, CURRENCY);
    form.append(`line_items[${index}][price_data][unit_amount]`, String(item.unitAmount));
    form.append(`line_items[${index}][price_data][product_data][name]`, item.name);
    form.append(`line_items[${index}][price_data][product_data][metadata][product_id]`, item.productId);
    if (item.selectedOptions?.length) {
      form.append(`line_items[${index}][price_data][product_data][metadata][selected_options]`, JSON.stringify(item.selectedOptions));
    }
    if (item.image) form.append(`line_items[${index}][price_data][product_data][images][0]`, getAbsoluteUrl(item.image, siteUrl));
  });
};

export async function onRequestPost({ request, env }) {
  if (!env.STRIPE_SECRET_KEY) {
    return jsonResponse({ error: 'Stripe secret ni nastavljen v Cloudflare okolju.' }, { status: 500 });
  }

  const payload = await request.json().catch(() => null);
  const cartItems = Array.isArray(payload?.items) ? payload.items : [];
  if (!cartItems.length) {
    return jsonResponse({ error: 'Košarica je prazna.' }, { status: 400 });
  }

  const siteUrl = env.SITE_URL || DEFAULT_SITE_URL;
  let lineItems;

  try {
    const productMap = await loadProducts(request, env);
    lineItems = createLineItems(cartItems, productMap);
  } catch (error) {
    return jsonResponse({ error: error.message || 'Košarice ni mogoče pripraviti za plačilo.' }, { status: 400 });
  }

  const form = new URLSearchParams();
  form.append('mode', 'payment');
  form.append('payment_method_types[0]', 'card');
  form.append('success_url', `${siteUrl}/potrjeno-narocilo.html?session_id={CHECKOUT_SESSION_ID}`);
  form.append('cancel_url', `${siteUrl}/zavrnjeno-narocilo.html`);
  form.append('billing_address_collection', 'auto');
  form.append('allow_promotion_codes', 'true');
  form.append('shipping_address_collection[allowed_countries][0]', 'SI');
  form.append('metadata[source]', 'jdsf-cart');
  appendShippingOption(form, env);
  form.append('metadata[cart_items]', JSON.stringify(lineItems.map((item) => ({
    id: item.productId,
    quantity: item.quantity,
    selectedOptions: item.selectedOptions
  }))));
  appendLineItems(form, lineItems, siteUrl);

  const stripeResponse = await fetch('https://api.stripe.com/v1/checkout/sessions', {
    method: 'POST',
    headers: {
      Authorization: `Bearer ${env.STRIPE_SECRET_KEY}`,
      'Content-Type': 'application/x-www-form-urlencoded'
    },
    body: form
  });

  const session = await stripeResponse.json().catch(() => ({}));
  if (!stripeResponse.ok || !session.url) {
    return jsonResponse({ error: session.error?.message || 'Stripe Checkout seje ni mogoče ustvariti.' }, { status: 400 });
  }

  return jsonResponse({ url: session.url });
}

export function onRequestGet({ env } = {}) {
  return jsonResponse({ shipping: getShippingConfig(env) });
}
