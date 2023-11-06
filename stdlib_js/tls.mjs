import { connect as cloudflareConnect } from 'cloudflare:sockets';

import { Socket } from './net.mjs';
import { newStreamDuplexFromReadableWritablePair } from './stream.mjs';
import { setTimeout } from './timers.mjs';

export function connect(options) {
  const secureSocket = cloudflareConnect({
    hostname: options.host,
    port: options.port,
    secureTransport: 'off'
  });



  const nodeSocket = newStreamDuplexFromReadableWritablePair(Socket, {
    readable: secureSocket.readable,
    writable: secureSocket.writable
  });

  // nodeSocket.once('ready', () => nodeSocket.emit('secureConnect'));
  setTimeout(() => nodeSocket.emit('secureConnect'), 10);

  nodeSocket.remoteAddress = options.host;
  nodeSocket.remotePort = +options.port;

  return nodeSocket;
}
