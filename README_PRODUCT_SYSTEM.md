# JDSF Product System

## Glavni katalog
- `data/products.json` je glavni vir izdelkov za trgovino, stran posameznega izdelka in Stripe checkout.
- `js/product-config.js` vsebuje skupne kategorije, oznake in normalizacijo izdelkov.
- `js/shop-products.js` bere katalog za prikaz na `trgovina.html`.
- `js/product-detail.js` bere isti katalog za `izdelek.html`.
- `functions/api/create-checkout-session.js` uporablja isti katalog za preverjanje izdelkov in cen pred Stripe plačilom.


## Stripe Checkout in poštnina
- Stripe Checkout sejo pripravi `functions/api/create-checkout-session.js`.
- Vsako naročilo v košarici dobi Stripe postavko poštnine `Poštnina` v znesku 4,90 €; to ni dodaten izdelek v katalogu, ampak Stripe shipping option.
- Če v Cloudflare Pages ni nastavljene okoljske spremenljivke, se samodejno uporabi 4,90 €. Znesek lahko po želji spremeniš z `SHIPPING_AMOUNT_CENTS` (npr. `590` za 5,90 € ali `0` za brez poštnine). Košarica vrednost prebere prek `/api/cart-config`, zato prikaz v košarici ostane usklajen s Stripe Checkoutom.

## Dodaj izdelek v 3 korakih
1. Naloži slike v ustrezno mapo znotraj `assets/products/`.
2. Dodaj izdelek v `data/products.json` z unikatnim `id`, imenom, opisom, kategorijo, materialom, ceno, glavno sliko in galerijo.
3. Zaženi validacijo:
   ```bash
   node scripts/validate-products.mjs
   ```

Če validacija uspe, se izdelek prikaže v trgovini in je pripravljen za dodajanje v košarico.

## Podprte kategorije
- `kamen`
- `obeski`
- `nakit`
- `dodatki`
- `kristali`
- `leseni-izdelki`
- `kovinski-izdelki`
- `personalizirano`

## Opomba o mapi `products/`
Mapa `products/` ostaja v repozitoriju zaradi starejših zapisov in primerov, vendar je za trenutno trgovino glavni katalog `data/products.json`. Stari brskalniški loader za ločene JSON zapise je odstranjen, zato nove spremembe izdelkov urejajte v glavnem katalogu.
