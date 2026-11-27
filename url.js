const TRACKING_PARAMS = new Set([
  'fbclid', 'gclid', 'dclid', 'msclkid', 'mc_cid', 'mc_eid', 'igshid', '_ga', 'ref_src', 'yclid'
]);
const ARCHIVE_HOST = /(?:^|\.)archive\.(?:is|today|ph|fo|li|md|vn)\.?$/i;

export function cleanUrl(url) {
  const [withoutHash] = url.split('#', 1);
  const hash = url.slice(withoutHash.length);
  const route = hash.startsWith('#/') || hash.startsWith('#!') ? hash : '';
  const queryStart = withoutHash.indexOf('?');
  if (queryStart === -1) return withoutHash + route;

  // Preserve the original encoding and order of all retained parameters.
  const params = withoutHash.slice(queryStart + 1).split('&').filter((param) => {
    if (!param) return false;
    const name = new URLSearchParams(`?${param}`).keys().next().value.toLowerCase();
    return !name.startsWith('utm_') && !TRACKING_PARAMS.has(name);
  });
  const base = withoutHash.slice(0, queryStart);
  const query = params.length ? `?${params.join('&')}` : '';
  return base + query + route;
}

export function isArchiveHost(hostname) {
  return ARCHIVE_HOST.test(hostname);
}

export function buildArchiveUrl(url, mode, mirror) {
  const cleaned = cleanUrl(url);
  if (mode === 'capture') {
    return `https://${mirror}/?run=1&url=${encodeURIComponent(cleaned)}`;
  }
  return `https://${mirror}/newest/${cleaned.replaceAll('#', '%23')}`;
}
