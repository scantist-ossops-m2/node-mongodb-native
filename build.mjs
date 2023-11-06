/* eslint-disable no-console */
import child_process from 'node:child_process';
import fs from 'node:fs/promises';

import * as esbuild from 'esbuild-wasm';

const devtoolsSharedExists = await fs.access('./devtools-shared').then(
  () => true,
  () => false
);

const execOptions = { stdio: 'inherit' };

if (!devtoolsSharedExists) {
  child_process.execSync(
    'git clone https://github.com/mongodb-js/devtools-shared.git devtools-shared --depth=1 --branch NODE-5108-saslprep-compression',
    execOptions
  );
  child_process.execSync('npm install', { cwd: './devtools-shared', ...execOptions });
  child_process.execSync('npm run bootstrap', { cwd: './devtools-shared', ...execOptions });
  child_process.execSync('npm install ./devtools-shared/packages/saslprep', execOptions);
}

await esbuild.build({
  entryPoints: ['./src/index.ts'],
  bundle: true,
  format: 'esm',
  alias: {
    'fs/promises': './stdlib_js/fs.mjs',
    buffer: './stdlib_js/buffer.mjs',
    child_process: './stdlib_js/child_process.mjs',
    crypto: './stdlib_js/crypto.mjs',
    dns: './stdlib_js/dns.mjs',
    events: './stdlib_js/events.mjs',
    fs: './stdlib_js/fs.mjs',
    http: './stdlib_js/http.mjs',
    net: './stdlib_js/net.mjs',
    os: './stdlib_js/os.mjs',
    path: './stdlib_js/path.mjs',
    process: './stdlib_js/process.mjs',
    stream: './stdlib_js/stream.mjs',
    timers: './stdlib_js/timers.mjs',
    tls: './stdlib_js/tls.mjs',
    url: './stdlib_js/url.mjs',
    util: './stdlib_js/util.mjs',
    zlib: './stdlib_js/zlib.mjs'
  },
  external: [
    'socks',
    'gcp-metadata',
    '@aws-sdk/credential-providers',
    '@mongodb-js/zstd',
    'snappy',
    'mongodb-client-encryption',
    'kerberos',
    // runtime
    'cloudflare:sockets',
    'node:crypto',
    'node:buffer',
    'node:events',
    'node:util',
    'node:stream'
    // '@mongodb-js/saslprep'
  ],
  outfile: 'dist/mongodb.ecma.mjs'
});

console.log('\x1b[0m\n');

child_process.execSync('npm install', { cwd: './cf_example', ...execOptions });
