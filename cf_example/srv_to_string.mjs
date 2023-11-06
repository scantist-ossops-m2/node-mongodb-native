/* eslint-disable no-console */
import dns from 'node:dns/promises';
import process from 'node:process';

const input = process.argv[2];

const url = new URL(input);

const results = await dns.resolveSrv(url.hostname);
const txt = await dns.resolveTxt(url.hostname).catch(() => null);
if (txt != null) {
  const params = new URLSearchParams(txt[0][0]);
  params.forEach((value, name) => url.searchParams.set(name, value));
}

url.searchParams.set('authSource', '$external');
url.searchParams.set('tls', 'true');
console.log();
console.log(
  'set -x MONGODB_URI "mongodb://' + results.map((r) => `${r.name}:${r.port}`).join(',') + '?' + url.searchParams.toString() + '"'
);
console.log();
