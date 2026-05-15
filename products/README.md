# Sistem izdelkov (Trgovina)

Za dodajanje novega izdelka ni treba spreminjati glavne kode trgovine.

## Struktura
- `products/les/`
- `products/kovina/`
- `products/darila/`

Vsak izdelek je ločena `.json` datoteka s polji:
- `ime`
- `opis`
- `cena`
- `slika`
- `kategorija` (`Les`, `Kovina`, `Darila`)

## GitHub Pages
Na produkciji (`*.github.io`) trgovina samodejno prebere vse `.json` datoteke iz map `les`, `kovina`, `darila` preko GitHub API.

## Lokalni razvoj
Za lokalni predogled se uporablja `products/index.json` kot rezervni manifest.
