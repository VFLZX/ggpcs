export function pageItems(items, page = 1, pageSize = 30) {
  const safeSize = Math.max(1, Math.floor(pageSize));
  const safePage = Math.max(1, Math.floor(page));
  const shown = Math.min(items.length, safePage * safeSize);
  return { items: items.slice(0, shown), total: items.length, shown, remaining: items.length - shown };
}
