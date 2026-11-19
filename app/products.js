import { readFileSync } from 'node:fs';

/**
 * @typedef {object} Product
 * @property {string} id Unique id in the `p-001` format.
 * @property {string} name Display name.
 * @property {'books' | 'games' | 'office'} category Lowercase category slug.
 * @property {number} priceCents Integer price in cents, always > 0.
 * @property {'USD'} currency ISO 4217 currency code.
 * @property {boolean} inStock Whether the product can be shipped right now.
 */

const CATALOG_URL = new URL('../data/products.json', import.meta.url);

/** @type {readonly Readonly<Product>[]} Loaded once at startup. */
const products = Object.freeze(
  JSON.parse(readFileSync(CATALOG_URL, 'utf8')).map(Object.freeze),
);

/**
 * Returns every product in catalog order.
 * @returns {readonly Readonly<Product>[]}
 */
export const listProducts = () => products;

/**
 * Finds a product by id.
 * @param {string} id
 * @returns {Readonly<Product> | undefined}
 */
export const getProductById = (id) => products.find((product) => product.id === id);
