import { connect as cloudflareConnect } from 'cloudflare:sockets';

import { Duplex, newStreamDuplexFromReadableWritablePair } from './stream.mjs';
import { setTimeout } from './timers.mjs';

export class Socket extends Duplex {
  constructor(options) {
    super(options);
    this.timeoutRef = null;
  }

  setKeepAlive() {
    return;
  }

  setTimeout() {
    // Implementing time out is hard
  }

  setNoDelay() {
    return;
  }
}

export function connect(options) {
  const socket = cloudflareConnect({
    hostname: options.host,
    port: options.port,
    secureTransport: 'off'
  });

  const nodeSocket = newStreamDuplexFromReadableWritablePair(Socket, {
    readable: socket.readable,
    writable: socket.writable
  });

  nodeSocket.once('ready', () => nodeSocket.emit('connect'));
  // setTimeout(() => nodeSocket.emit('connect'), 500);

  nodeSocket.remoteAddress = options.host;
  nodeSocket.remotePort = +options.port;

  return nodeSocket;
}
export const createConnection = connect;

// IPv4 Segment
const v4Seg = '(?:25[0-5]|2[0-4][0-9]|1[0-9][0-9]|[1-9][0-9]|[0-9])';
const v4Str = `(?:${v4Seg}\\.){3}${v4Seg}`;
const IPv4Reg = new RegExp(`^${v4Str}$`);

// IPv6 Segment
const v6Seg = '(?:[0-9a-fA-F]{1,4})';
const IPv6Reg = new RegExp(
  '^(?:' +
    `(?:${v6Seg}:){7}(?:${v6Seg}|:)|` +
    `(?:${v6Seg}:){6}(?:${v4Str}|:${v6Seg}|:)|` +
    `(?:${v6Seg}:){5}(?::${v4Str}|(?::${v6Seg}){1,2}|:)|` +
    `(?:${v6Seg}:){4}(?:(?::${v6Seg}){0,1}:${v4Str}|(?::${v6Seg}){1,3}|:)|` +
    `(?:${v6Seg}:){3}(?:(?::${v6Seg}){0,2}:${v4Str}|(?::${v6Seg}){1,4}|:)|` +
    `(?:${v6Seg}:){2}(?:(?::${v6Seg}){0,3}:${v4Str}|(?::${v6Seg}){1,5}|:)|` +
    `(?:${v6Seg}:){1}(?:(?::${v6Seg}){0,4}:${v4Str}|(?::${v6Seg}){1,6}|:)|` +
    `(?::(?:(?::${v6Seg}){0,5}:${v4Str}|(?::${v6Seg}){1,7}|:))` +
    ')(?:%[0-9a-zA-Z-.:]{1,})?$'
);

export function isIPv4(s) {
  return IPv4Reg.test(s);
}

export function isIPv6(s) {
  return IPv6Reg.test(s);
}

export function isIP(s) {
  if (isIPv4(s)) return 4;
  if (isIPv6(s)) return 6;
  return 0;
}
