import { getShippingConfig } from '../_lib/shipping.js';

const jsonResponse = (body, init = {}) => Response.json(body, {
  headers: {
    'Cache-Control': 'no-store',
    ...init.headers
  },
  ...init
});

export function onRequestGet({ env }) {
  return jsonResponse({
    shipping: getShippingConfig(env)
  });
}
