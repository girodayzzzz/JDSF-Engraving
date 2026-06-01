import { readFile } from 'node:fs/promises';
import { existsSync } from 'node:fs';

const CATALOG_PATH = 'data/products.json';
const ALLOWED_CATEGORIES = new Set([
  'kamen',
  'obeski',
  'nakit',
  'dodatki',
  'kristali',
  'leseni-izdelki',
  'kovinski-izdelki',
  'personalizirano'
]);

const errors = [];

const addError = (message) => errors.push(message);

const parsePrice = (price) => {
  const value = Number(String(price || '').replace(/[^\d,.-]/g, '').replace(',', '.'));
  return Number.isFinite(value) ? value : 0;
};

let products;
try {
  products = JSON.parse(await readFile(CATALOG_PATH, 'utf8'));
} catch (error) {
  addError(`${CATALOG_PATH} ni mogoče prebrati kot veljaven JSON: ${error.message}`);
}

if (!Array.isArray(products)) {
  addError(`${CATALOG_PATH} mora biti JSON tabela izdelkov.`);
} else {
  const ids = new Set();

  products.forEach((product, index) => {
    const label = product?.id || `izdelek #${index + 1}`;

    if (!product || typeof product !== 'object' || Array.isArray(product)) {
      addError(`${label}: zapis izdelka mora biti objekt.`);
      return;
    }

    if (!product.id || typeof product.id !== 'string') {
      addError(`${label}: manjka polje "id".`);
    } else if (ids.has(product.id)) {
      addError(`${label}: podvojen "id".`);
    } else {
      ids.add(product.id);
    }

    if (!product.title && !product.name && !product.ime) {
      addError(`${label}: manjka ime izdelka ("title", "name" ali "ime").`);
    }

    if (!product.shortDescription && !product.description && !product.opis) {
      addError(`${label}: manjka opis izdelka.`);
    }

    if (!ALLOWED_CATEGORIES.has(product.category)) {
      addError(`${label}: kategorija "${product.category || ''}" ni podprta.`);
    }

    if (!product.material || typeof product.material !== 'string') {
      addError(`${label}: manjka material.`);
    }

    if (parsePrice(product.price || product.cena) <= 0) {
      addError(`${label}: cena ni veljavna.`);
    }

    if (!product.image || typeof product.image !== 'string') {
      addError(`${label}: manjka glavna slika.`);
    } else if (!existsSync(product.image)) {
      addError(`${label}: glavna slika ne obstaja (${product.image}).`);
    }

    if (product.gallery !== undefined && !Array.isArray(product.gallery)) {
      addError(`${label}: "gallery" mora biti tabela poti do slik.`);
    }

    if (Array.isArray(product.gallery)) {
      product.gallery.forEach((imagePath) => {
        if (!imagePath || typeof imagePath !== 'string') {
          addError(`${label}: galerija vsebuje neveljavno pot do slike.`);
        } else if (!existsSync(imagePath)) {
          addError(`${label}: slika v galeriji ne obstaja (${imagePath}).`);
        }
      });
    }
  });
}

if (errors.length) {
  console.error('Validacija izdelkov ni uspela:');
  errors.forEach((error) => console.error(`- ${error}`));
  process.exit(1);
}

console.log(`Validacija izdelkov uspešna: ${products.length} izdelkov v ${CATALOG_PATH}.`);
