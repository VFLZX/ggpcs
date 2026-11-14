export function selectOptions(products, category, key) {
  const values = products
    .filter(product => !category || product.category === category)
    .flatMap(product => {
      const value = key === 'manufacturer' ? product.specs?.manufacturer ?? product.brand : product.specs?.[key];
      return Array.isArray(value) ? value : [value];
    })
    .filter(value => value != null && String(value).trim() !== '')
    .map(String);
  return [...new Set(values)].sort((a, b) => a.localeCompare(b, undefined, { numeric: true, sensitivity: 'base' }));
}

export function numericBounds(products, category, key, fallback = [0, 100, 1]) {
  const values = products
    .filter(product => !category || product.category === category)
    .map(product => key === 'priceCHF' ? product.priceCHF : product.specs?.[key])
    .filter(value => typeof value === 'number' && Number.isFinite(value));
  if (!values.length) return fallback;
  const step = fallback[2] || 1;
  const low = Math.min(fallback[0] ?? Math.min(...values), Math.floor(Math.min(...values) / step) * step);
  const high = Math.max(fallback[1] ?? Math.max(...values), Math.ceil(Math.max(...values) / step) * step);
  return [low, high, step];
}
