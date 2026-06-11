export const CURRENCY = 'eur';
export const DEFAULT_SHIPPING_AMOUNT_CENTS = 490;
export const SHIPPING_RATE_NAME = 'Poštnina';

export const getShippingAmountCents = (env = {}) => {
  const configuredAmount = Number(env.SHIPPING_AMOUNT_CENTS);
  return Number.isFinite(configuredAmount) && configuredAmount >= 0
    ? Math.round(configuredAmount)
    : DEFAULT_SHIPPING_AMOUNT_CENTS;
};

export const getShippingAmount = (env = {}) => getShippingAmountCents(env) / 100;
