# MongoDB CloudFlare Example

## Structure

The `stdlib_js` directory contains the necessary replacement dependencies to get the driver operational on a cloudflare worker with `compatibility_flags = ["nodejs_compat"]` enabled. The replacements for `net` and `stream`, respectively `stdlib_js/net.mjs` and `stdlib_js/stream.mjs` are the most interesting as they provide wrapping code that makes the CloudFlare socket layer available as a Node.js Socket API.

## How to

1. `npm install` in the root of the driver per usual
2. `node build.mjs`
  - Will clone the modified saslprep branch
    - avoids `Buffer` and `zlib` usage
  - Will build a driver bundle with the shims in stdlib_js
    - Most of stdlib_js is re-exporting `'node:xxx'`, currently we cannot use `'node:xxx'` syntax in the driver because it breaks webpack bundling
  - Will run `npm install` inside `cf_example/`
    - installs wrangler and the driver from `"../"`
3. Start a 3 node replica_set
  - `bash test/tools/cluster_setup.sh replica_set`
    - depends on [`mlaunch`](https://rueckstiess.github.io/mtools/install.html) and [`mongod`](https://github.com/aheckmann/m) being in your $PATH
  - open `cf_example/wrangler.toml` and update the URI to the given connection string
4. `cd cf_example/` and `npm install` and `npm run start`
  - navigate to the link that is shown on the terminal
