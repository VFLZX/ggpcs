import { CATEGORIES } from './categories.js';

export class CatalogError extends Error {
  constructor(message) { super(message); this.name = 'CatalogError'; }
}

const safeUrl = value => {
  if (!value) return true;
  try { const url=new URL(value);return url.protocol==='https:'&&!url.username&&!url.password; } catch { return false; }
};

export function parseCatalog(text) {
  let data;
  try { data = JSON.parse(text); } catch { throw new CatalogError('The catalog is not valid JSON.'); }
  if (!data || !Array.isArray(data.products)) throw new CatalogError('Catalog must contain a products array.');
  const ids = new Set();
  for (const [index, p] of data.products.entries()) {
    const at = `Product ${index + 1}`;
    if (!p || typeof p !== 'object' || !/^[\w.-]{1,80}$/.test(p.id || '')) throw new CatalogError(`${at} needs a safe, unique id.`);
    if (ids.has(p.id)) throw new CatalogError(`Product ${p.id} has a duplicate id.`);
    ids.add(p.id);
    for (const key of ['priceCHF', 'previousPriceCHF', 'priceUSD', 'priceEUR', 'rating']) {
      if (p[key] != null && (typeof p[key] !== 'number' || !Number.isFinite(p[key]) || p[key] < 0)) throw new CatalogError(`${at} has an invalid ${key}.`);
    }
    if (!safeUrl(p.productUrl) || !safeUrl(p.imageUrl) || !safeUrl(p.priceSourceUrl) || !safeUrl(p.refreshRateSourceUrl)) throw new CatalogError(`${at} has an unsafe product, image, or source URL.`);
    if (p.productUrl && (!['www.digitec.ch','digitec.ch'].includes(new URL(p.productUrl).hostname)||new URL(p.productUrl).port)) throw new CatalogError(`${at} product URL must point directly to Digitec Switzerland over HTTPS.`);
    if (!CATEGORIES.some(c=>c.id===p.category) || !p.name || typeof p.name !== 'string' || !p.name.trim()) throw new CatalogError(`${at} needs a known category and name.`);
    if (p.specs != null && (typeof p.specs !== 'object' || Array.isArray(p.specs))) throw new CatalogError(`${at} specs must be an object.`);
    if (p.updatedAt != null && !Number.isFinite(Date.parse(p.updatedAt))) throw new CatalogError(`${at} has an invalid update timestamp.`);
    if (p.priceType === 'us-reference' && (p.priceCurrency !== 'USD' || p.priceUSD == null || p.priceCHF == null || !Number.isFinite(Date.parse(p.priceDate)) || !Number.isFinite(Date.parse(p.fxDate)) || !(p.fxRate > 0) || typeof p.priceSource !== 'string' || !p.priceSource.trim() || !p.priceSourceUrl)) throw new CatalogError(`${at} has incomplete U.S. reference price provenance.`);
    if (p.priceType === 'eu-reference' && (p.priceCurrency !== 'EUR' || p.priceEUR == null || p.priceCHF == null || !Number.isFinite(Date.parse(p.priceDate)) || !Number.isFinite(Date.parse(p.fxDate)) || !(p.fxRate > 0) || typeof p.priceSource !== 'string' || !p.priceSource.trim() || !p.priceSourceUrl)) throw new CatalogError(`${at} has incomplete European reference price provenance.`);
    if (p.priceHistory != null && (!Array.isArray(p.priceHistory) || p.priceHistory.some(point => !point || !Number.isFinite(point.priceCHF) || point.priceCHF < 0 || !Number.isFinite(Date.parse(point.timestamp))))) throw new CatalogError(`${at} has invalid price history.`);
    if (p.benchmarks != null && (!Array.isArray(p.benchmarks) || p.benchmarks.some(b=>!b || !Number.isFinite(b.score) || b.score<0 || typeof b.testId!=='string' || !b.testId.trim() || typeof b.source!=='string' || !b.source.trim() || !Number.isFinite(Date.parse(b.testedAt)) || !['higher','lower'].includes(b.direction)))) throw new CatalogError(`${at} has invalid benchmark evidence; include a test ID, score, direction, source, and test date.`);
  }
  if (data.updatedAt != null && !Number.isFinite(Date.parse(data.updatedAt))) throw new CatalogError('Catalog has an invalid update timestamp.');
  return { kind: data.kind === 'builtin-public' ? 'builtin-public' : 'imported', source: String(data.source || 'Imported catalog'), updatedAt: data.updatedAt || null, products: data.products };
}

export function getProvider(config = {}) {
  if (config.type === 'digitec') {
    if (!config.url || !config.authorized) return { async load() { throw new CatalogError('Digitec data is not connected. Configure an authorized data feed first.'); } };
    return { async load() { const response = await fetch(config.url); if (!response.ok) throw new CatalogError(`Data feed returned ${response.status}.`); return parseCatalog(await response.text()); } };
  }
  const catalogUrl = new URL('../data/catalog.json', import.meta.url);
  const compressedCatalogUrl = new URL('../data/catalog.json.gz', import.meta.url);
  return { async load(url = catalogUrl) {
    if (url === catalogUrl && typeof DecompressionStream === 'function') {
      const compressed = await fetch(compressedCatalogUrl);
      if (compressed.ok) {
        const stream = compressed.body.pipeThrough(new DecompressionStream('gzip'));
        return parseCatalog(await new Response(stream).text());
      }
    }
    const response = await fetch(url);
    if (!response.ok) throw new CatalogError(`Catalog returned ${response.status}.`);
    return parseCatalog(await response.text());
  } };
}
