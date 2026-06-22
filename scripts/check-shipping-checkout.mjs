import assert from 'node:assert/strict';
import { onRequestGet, onRequestPost } from '../functions/api/create-checkout-session.js';

const readJson = async (response) => response.json();

const defaultConfigResponse = await onRequestGet({ env: {} });
assert.equal(defaultConfigResponse.status, 200);
assert.deepEqual(await readJson(defaultConfigResponse), {
  shipping: {
    amount_cents: 490,
    currency: 'eur',
    display_name: 'Poštnina'
  }
});

const overrideConfigResponse = await onRequestGet({ env: { SHIPPING_AMOUNT_CENTS: '590' } });
assert.equal((await readJson(overrideConfigResponse)).shipping.amount_cents, 590);

const freeConfigResponse = await onRequestGet({ env: { SHIPPING_AMOUNT_CENTS: '0' } });
assert.equal((await readJson(freeConfigResponse)).shipping.amount_cents, 0);

const productCatalog = [{
  id: 'test-product',
  title: 'Testni izdelek',
  price: '10,00 €',
  image: '/assets/test.png'
}];

let capturedStripeBody;
const originalFetch = globalThis.fetch;
globalThis.fetch = async (url, init) => {
  assert.equal(url, 'https://api.stripe.com/v1/checkout/sessions');
  capturedStripeBody = init.body;
  return Response.json({ url: 'https://checkout.stripe.test/session' });
};

try {
  const postResponse = await onRequestPost({
    request: new Request('https://example.test/api/create-checkout-session', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ items: [{ id: 'test-product', quantity: 2 }] })
    }),
    env: {
      STRIPE_SECRET_KEY: 'sk_test_checkout',
      ASSETS: { fetch: async () => Response.json(productCatalog) }
    }
  });

  assert.equal(postResponse.status, 200);
  assert.equal((await readJson(postResponse)).url, 'https://checkout.stripe.test/session');
  assert.equal(capturedStripeBody.get('shipping_options[0][shipping_rate_data][fixed_amount][amount]'), '490');
  assert.equal(capturedStripeBody.get('shipping_options[0][shipping_rate_data][fixed_amount][currency]'), 'eur');
  assert.equal(capturedStripeBody.get('shipping_options[0][shipping_rate_data][display_name]'), 'Poštnina');
  assert.equal(capturedStripeBody.get('allow_promotion_codes'), 'true');
  assert.equal(capturedStripeBody.get('line_items[0][price_data][unit_amount]'), '1000');
  assert.equal(capturedStripeBody.get('line_items[0][quantity]'), '2');

  await onRequestPost({
    request: new Request('https://example.test/api/create-checkout-session', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ items: [{ id: 'test-product', quantity: 1 }] })
    }),
    env: {
      STRIPE_SECRET_KEY: 'sk_test_checkout',
      SHIPPING_AMOUNT_CENTS: '0',
      ASSETS: { fetch: async () => Response.json(productCatalog) }
    }
  });

  assert.equal(capturedStripeBody.has('shipping_options[0][shipping_rate_data][fixed_amount][amount]'), false);
} finally {
  globalThis.fetch = originalFetch;
}

console.log('Shipping checkout checks passed.');
