import assert from 'node:assert/strict';
import { DEFAULT_SHIPPING_AMOUNT_CENTS, getShippingAmount, getShippingAmountCents, getShippingConfig } from '../functions/_lib/shipping.js';

assert.equal(DEFAULT_SHIPPING_AMOUNT_CENTS, 490);
assert.equal(getShippingAmountCents({}), 490);
assert.equal(getShippingAmountCents({ SHIPPING_AMOUNT_CENTS: '' }), 490);
assert.equal(getShippingAmountCents({ SHIPPING_AMOUNT_CENTS: '590' }), 590);
assert.equal(getShippingAmountCents({ SHIPPING_AMOUNT_CENTS: '0' }), 0);
assert.equal(getShippingAmountCents({ SHIPPING_AMOUNT_CENTS: '-100' }), 490);
assert.equal(getShippingAmountCents({ SHIPPING_AMOUNT_CENTS: 'abc' }), 490);
assert.equal(getShippingAmount({ SHIPPING_AMOUNT_CENTS: '590' }), 5.9);
assert.deepEqual(getShippingConfig({ SHIPPING_AMOUNT_CENTS: '590' }), {
  name: 'Poštnina',
  amount: 5.9,
  amountCents: 590,
  currency: 'eur'
});

console.log('Shipping configuration tests passed.');
