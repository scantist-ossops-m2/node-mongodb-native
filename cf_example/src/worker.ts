import { BSON, MongoClient } from 'mongodb/dist/mongodb.ecma.mjs';

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

export interface Env {
  MONGODB_URI: string;
}

function monitorAll(client) {
  for (const eventName of MONGO_CLIENT_EVENTS)
    client.on(eventName, (e: any) =>
      // eslint-disable-next-line no-console
      console.log(
        JSON.stringify({ name: eventName, address: e.address }, (key, value) => value ?? undefined),
        ''
      )
    );
}

let client = null;
let requestCount = 0;

export default {
  async fetch(request: Request, env: Env, _ctx: ExecutionContext): Promise<Response> {
    console.log(JSON.stringify({ requestCount }));
    requestCount += 1;
    client ??= new MongoClient(env.MONGODB_URI, {
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

    return new Response(BSON.EJSON.stringify(await coll.findOne({ a: 1 }), null, '  ', { relaxed: false }));
  },
};
