import assert from 'node:assert/strict';
import { buildArchiveUrl, cleanUrl, isArchiveHost } from './url.js';

assert.equal(cleanUrl('https://example.com/story#section'), 'https://example.com/story');
assert.equal(cleanUrl('https://example.com/story?#section'), 'https://example.com/story');

const trackers = [
  'utm_source', 'UTM_medium', '%75tm_campaign', 'fbclid', 'gclid', 'dclid',
  'msclkid', 'mc_cid', 'mc_eid', 'igshid', '_ga', 'ref_src', 'yclid'
].map((name) => `${name}=123`).join('&');

assert.equal(cleanUrl(`https://example.com/?${trackers}`), 'https://example.com/');
assert.equal(
  cleanUrl(`https://example.com/?tag=a%20b&${trackers}&tag=c+d&flag&gclid_extra=1#top`),
  'https://example.com/?tag=a%20b&tag=c+d&flag&gclid_extra=1'
);

for (const suffix of ['is', 'today', 'ph', 'fo', 'li', 'md', 'vn']) {
  assert.equal(isArchiveHost(`archive.${suffix}`), true);
  assert.equal(isArchiveHost(`one.two.archive.${suffix}`), true);
}
assert.equal(isArchiveHost('SUB.ARCHIVE.TODAY.'), true);
for (const host of ['notarchive.is', 'archive.is.example.com', 'archive.org', 'example.com']) {
  assert.equal(isArchiveHost(host), false);
}

const url = 'https://example.com/story?tag=a%20b&fbclid=123#top';
assert.equal(
  buildArchiveUrl(url, 'viewer', 'archive.ph'),
  'https://archive.ph/newest/https://example.com/story?tag=a%20b'
);
assert.equal(
  buildArchiveUrl(url, 'capture', 'archive.today'),
  'https://archive.today/?run=1&url=https%3A%2F%2Fexample.com%2Fstory%3Ftag%3Da%2520b'
);

console.log('ok');
