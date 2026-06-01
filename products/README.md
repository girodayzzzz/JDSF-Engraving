# Starejši zapisi izdelkov

Ta mapa vsebuje starejše ločene `.json` zapise in predlogo izdelka.

Trenutna trgovina, stran posameznega izdelka in Stripe checkout uporabljajo glavni katalog:

- `data/products.json`

Za dodajanje ali urejanje aktivnih izdelkov zato najprej posodobite `data/products.json`, nato zaženite:

```bash
node scripts/validate-products.mjs
```

Validacija preveri obvezna polja, podprte kategorije, veljavne cene, podvojene ID-je in obstoj slik.
