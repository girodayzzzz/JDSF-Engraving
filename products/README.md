# Starejši zapisi izdelkov

Ta mapa vsebuje starejše ločene `.json` zapise in predlogo izdelka.

Trenutna trgovina, stran posameznega izdelka in Stripe checkout uporabljajo glavni katalog:

- `data/products.json`

Za dodajanje ali urejanje aktivnih izdelkov zato najprej posodobite `data/products.json`, nato zaženite:

```bash
node scripts/validate-products.mjs
```

Validacija preveri obvezna polja, podprte kategorije, veljavne cene, podvojene ID-je in obstoj slik.


## Hitra navodila za slike, cene in povezave

Če želite posodobiti aktivne izdelke v GitHubu:

1. Nove fotografije izdelkov naložite v `assets/products/<kategorija>/`. Fotografije za predstavitveno galerijo naložite v `assets/gallery/`.
2. V `data/products.json` za vsak izdelek uredite `title`, `price`, `shortDescription`, `image`, `gallery` in po potrebi `checkoutUrl`.
3. Če mi pošljete slike, cene in povezave do izdelkov, lahko ta polja uredim namesto vas. Najbolje je, da pri vsakem izdelku navedete ime izdelka, novo ceno, link, glavno sliko in dodatne galerijske slike.
4. Po urejanju zaženite `node scripts/validate-products.mjs`, da preverite, ali so slike in podatki pravilni.
