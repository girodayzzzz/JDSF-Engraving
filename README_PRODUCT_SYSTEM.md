# Product Management System (GitHub Pages Friendly)

Ta sistem je narejen tako, da **ne potrebujete programiranja** za dodajanje novih izdelkov.

## Kako dodati nov izdelek (2 koraka)
1. Naložite slike v ustrezno mapo: `assets/products/<kategorija>/`
2. Dodajte nov objekt v `data/products.json`

Stran bo izdelek samodejno prikazala v trgovini.

## Struktura map
- `products/` – kategorije (organizacija)
- `assets/products/` – slike izdelkov po kategorijah
- `data/products.json` – vsi izdelki

## Kategorije
Uporabite eno od teh vrednosti v polju `category`:
- `wood`
- `k9-crystal`
- `metal`
- `stone`
- `ornaments`
- `keychains`
- `personalized-gifts`

## Primer izdelka
```json
{
  "id": "k9-kristalna-kocka-001",
  "title": "K9 Kristalna kocka z gravuro slike",
  "category": "k9-crystal",
  "material": "K9 Kristal",
  "price": "Po povpraševanju",
  "personalized": true,
  "featured": true,
  "new": true,
  "shortDescription": "Personalizirana K9 kristalna kocka z gravuro fotografije.",
  "image": "assets/products/k9-crystal/kristal-kocka-001.jpg",
  "gallery": ["assets/products/k9-crystal/kristal-kocka-001.jpg"],
  "checkoutUrl": "https://buy.stripe.com/...",
  "customizationOptions": {
    "imageUpload": true,
    "customText": true,
    "fontSelection": true,
    "sizeSelection": true
  }
}
```

## Kako označiti “featured” ali “new”
- `"featured": true` → prikaže se v razdelku **Izpostavljeni izdelki**
- `"new": true` → prikaže se v razdelku **Novi izdelki**

## Kako dodati personalizacijo
- `"personalized": true`
- Nastavite `customizationOptions` (npr. slika, tekst, izbira pisave, velikosti)

## Priporočene velikosti slik
- Priporočeno: **1200 x 900 px**
- Razmerje: **4:3**
- Format: **JPG** (fotografije), **PNG** (logo/transparent)
- Velikost datoteke: idealno pod **400 KB** za hitrejše nalaganje

## Opomba
Po spremembah samo naredite commit/push na GitHub in GitHub Pages bo posodobil stran.
