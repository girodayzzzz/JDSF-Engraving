export const CURRENCY = 'eur';
export const DEFAULT_SHIPPING_AMOUNT_CENTS = 490;
export const SHIPPING_RATE_NAME = 'Poštnina';

const parseShippingAmountCents = (value) => {
  if (value === undefined || value === null || String(value).trim() === '') return null;

  const amount = Number(value);
  if (!Number.isFinite(amount) || amount < 0) return null;

  return Math.round(amount);
};

export const getShippingAmountCents = (env = {}) => (
  parseShippingAmountCents(env.SHIPPING_AMOUNT_CENTS) ?? DEFAULT_SHIPPING_AMOUNT_CENTS
);

export const getShippingAmount = (env = {}) => getShippingAmountCents(env) / 100;

export const getShippingConfig = (env = {}) => {
  const amountCents = getShippingAmountCents(env);

  return {
    name: SHIPPING_RATE_NAME,
    amount: amountCents / 100,
    amountCents,
    currency: CURRENCY
  };
};
