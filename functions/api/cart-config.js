import { CURRENCY, SHIPPING_RATE_NAME, getShippingAmount, getShippingAmountCents } from '../_lib/shipping.js';

const jsonResponse = (body, init = {}) => Response.json(body, {
  headers: {
    'Cache-Control': 'no-store',
    ...init.headers
  },
  ...init
});

export function onRequestGet({ env }) {
  const amountCents = getShippingAmountCents(env);

  return jsonResponse({
    shipping: {
      name: SHIPPING_RATE_NAME,
      amount: getShippingAmount(env),
      amountCents,
      currency: CURRENCY
    }
  });
}
