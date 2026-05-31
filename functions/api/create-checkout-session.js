const CURRENCY = 'eur';
const DEFAULT_SITE_URL = 'https://www.jdsf-lasercraft.com';

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

  return {
    name: product.title || product.name || product.ime || 'Izdelek',
    image: product.image || product.slika || '',
    productId: product.id,
    quantity: normalizeQuantity(cartItem.quantity),
    unitAmount
  };
});

const getAbsoluteUrl = (url, siteUrl) => {
  if (!url) return '';
  return new URL(url, siteUrl).href;
};

const appendLineItems = (form, lineItems, siteUrl) => {
  lineItems.forEach((item, index) => {
    form.append(`line_items[${index}][quantity]`, String(item.quantity));
    form.append(`line_items[${index}][price_data][currency]`, CURRENCY);
    form.append(`line_items[${index}][price_data][unit_amount]`, String(item.unitAmount));
    form.append(`line_items[${index}][price_data][product_data][name]`, item.name);
    form.append(`line_items[${index}][price_data][product_data][metadata][product_id]`, item.productId);
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
  form.append('success_url', `${siteUrl}/uspesno.html?session_id={CHECKOUT_SESSION_ID}`);
  form.append('cancel_url', `${siteUrl}/kosarica.html?canceled=1`);
  form.append('billing_address_collection', 'auto');
  form.append('shipping_address_collection[allowed_countries][0]', 'SI');
  form.append('metadata[source]', 'jdsf-cart');
  form.append('metadata[cart_items]', JSON.stringify(lineItems.map((item) => ({ id: item.productId, quantity: item.quantity }))));
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

export function onRequestGet() {
  return jsonResponse({ error: 'Uporabite POST zahtevo za začetek plačila.' }, { status: 405 });
}
