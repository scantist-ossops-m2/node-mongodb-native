/// <reference types="node" />
import http from 'node:http';

import { BSON, MongoClient } from 'mongodb';

let client,
  requestCount = 0;

const MONGO_CLIENT_EVENTS = [
  'connectionPoolCreated',
  'connectionPoolReady',
  'connectionPoolCleared',
  'connectionPoolClosed',
  'connectionCreated',
  'connectionReady',
  'connectionClosed',
  'connectionCheckOutStarted',
  'connectionCheckOutFailed',
  'connectionCheckedOut',
  'connectionCheckedIn',
  'commandStarted',
  'commandSucceeded',
  'commandFailed',
  'serverOpening',
  'serverClosed',
  'serverDescriptionChanged',
  'topologyOpening',
  'topologyClosed',
  'topologyDescriptionChanged',
  'error',
  'timeout',
  'close',
  'serverHeartbeatStarted',
  'serverHeartbeatSucceeded',
  'serverHeartbeatFailed',
];

function monitorAll(client) {
  for (const eventName of MONGO_CLIENT_EVENTS)
    client.on(eventName, (e) =>
      // eslint-disable-next-line no-console
      console.log(
        JSON.stringify({ name: eventName, address: e.address }, (key, value) => value ?? undefined),
        ''
      )
    );
}

const server = http.createServer((req, res) => {
  (async () => {
    console.log(JSON.stringify({ requestCount }));
    requestCount += 1;
    client ??= new MongoClient(process.env.MONGODB_URI, {
      tls: false,
      maxPoolSize: 1,
      minPoolSize: 0,
      serverSelectionTimeoutMS: 8000,
    });

    monitorAll(client);

    const db = client.db('test');
    const coll = db.collection('test');

    if ((await coll.countDocuments()) > 10) {
      await coll.drop().catch(() => null);
    }

    await coll.insertOne({ a: 1 });

    return BSON.EJSON.stringify(await coll.findOne({ a: 1 }), null, '  ', { relaxed: false });
  })().then(
    (result) => res.end(result),
    (error) => {
      res.statusCode = 500;
      res.end(JSON.stringify({ error: error.message, stack: error.stack }));
    }
  );
});

server.listen(8787, '127.0.0.1', () => {
  let address = server.address();
  address = typeof address === 'string' ? address : `${address?.address}:${address?.port}`;
  console.log(`listening: ${address}`);
});
