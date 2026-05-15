# JDSF Product System (GitHub Pages)

## File structure
- `products/index.json` (manifest of product JSON files)
- `products/product.template.json` (copy this for every new item)
- `products/wood/*.json`
- `products/k9-crystal/*.json`
- `products/metal/*.json`
- `assets/products/wood/*`
- `assets/products/k9-crystal/*`
- `assets/products/metal/*`
- `js/products-loader.js` (auto render + filter + sorting)

## Add product in 3 steps
1. Upload product images to `assets/products/<material>/`.
2. Duplicate `products/product.template.json`, fill product data, and save into the correct material folder.
3. Add the JSON path to `products/index.json`.

Done. Product appears automatically on `shop.html`.

## Supported filtering
- Material: All, Wood, K9 Crystal, Metal
- Category: All, Gifts, Business Gifts, Memorial, Decoration, Custom

## Sorting
- Featured products are listed first automatically.
- Non-featured products follow.
