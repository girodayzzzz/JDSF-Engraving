# Product JSON System

## Quick workflow (GitHub Pages)
1. Upload product images to the matching folder in `assets/products/<material>/`.
2. Copy `products/product.template.json` and save it in one of:
   - `products/wood/`
   - `products/k9-crystal/`
   - `products/metal/`
3. Fill all product fields.
4. Add the new file path into `products/index.json` under `files`.
5. Commit and push. Product appears automatically on `shop.html`.

## Allowed values
- `material`: `Wood`, `K9 Crystal`, `Metal`
- `category`: `Gifts`, `Business Gifts`, `Memorial`, `Decoration`, `Custom`

## Notes
- `featured: true` puts product at the top.
- `customizable: true` adds "Po meri" badge.
- `gallery` supports multiple images for future product detail views.
