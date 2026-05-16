/**
 * Postinstall patch: fix buffer-equal-constant-time for Node.js 22+
 *
 * `SlowBuffer` was removed from Node.js in v22. The old
 * `buffer-equal-constant-time` package (pulled in by jsonwebtoken → jwa)
 * still references it and crashes. This script replaces every occurrence
 * of `SlowBuffer` with `Buffer` in that file — they were always equivalent.
 */

'use strict';
const fs   = require('fs');
const path = require('path');

const target = path.join(
  __dirname,
  '../node_modules/buffer-equal-constant-time/index.js'
);

if (!fs.existsSync(target)) {
  console.log('patch-deps: buffer-equal-constant-time not found, skipping.');
  process.exit(0);
}

let src = fs.readFileSync(target, 'utf8');

if (!src.includes('SlowBuffer')) {
  console.log('patch-deps: already patched, nothing to do.');
  process.exit(0);
}

// Replace the broken require line and every usage of SlowBuffer → Buffer
src = src
  .replace(/var SlowBuffer = require\('buffer'\)\.SlowBuffer;?\n?/, '')
  .replace(/SlowBuffer/g, 'Buffer');

fs.writeFileSync(target, src, 'utf8');
console.log('patch-deps: patched buffer-equal-constant-time for Node 22+');
