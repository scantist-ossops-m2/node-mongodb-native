import { setTimeout } from './timers.mjs';

export * from 'node:stream';

export function newStreamDuplexFromReadableWritablePair(ctor, pair, options = {}) {
  // validateObject(pair, 'pair');
  const { readable: readableStream, writable: writableStream } = pair;

  // if (!isReadableStream(readableStream)) {
  //   throw new ERR_INVALID_ARG_TYPE('pair.readable', 'ReadableStream', readableStream);
  // }
  // if (!isWritableStream(writableStream)) {
  //   throw new ERR_INVALID_ARG_TYPE('pair.writable', 'WritableStream', writableStream);
  // }

  // validateObject(options, 'options');
  const {
    allowHalfOpen = false,
    objectMode = false,
    encoding,
    decodeStrings = true,
    highWaterMark,
    signal
  } = options;

  // validateBoolean(objectMode, 'options.objectMode');
  // if (encoding !== undefined && !Buffer.isEncoding(encoding))
  //   throw new ERR_INVALID_ARG_VALUE(encoding, 'options.encoding');

  /** @type {WritableStreamDefaultWriter} */
  const writer = writableStream.getWriter();
  /** @type {ReadableStreamDefaultReader} */
  const reader = readableStream.getReader();
  let writableClosed = false;
  let readableClosed = false;

  const duplex = new ctor({
    allowHalfOpen,
    highWaterMark,
    objectMode,
    encoding,
    decodeStrings,
    signal,

    write(chunk, encoding, callback) {
      function done(error) {
        try {
          callback(error);
        } catch (error) {
          duplex.destroy(error);
        }
      }

      writer.ready.then(() => {
        return writer.write(chunk).then(done, done);
      }, done);
    },

    final(callback) {
      function done(error) {
        try {
          callback(error);
        } catch (error) {
          // In a next tick because this is happening within
          // a promise context, and if there are any errors
          // thrown we don't want those to cause an unhandled
          // rejection. Let's just escape the promise and
          // handle it separately.
          queueMicrotask(() => duplex.destroy(error));
        }
      }

      if (!writableClosed) {
        // writer.close();
        queueMicrotask(done);
      }
    },

    read() {
      reader.read().then(
        chunk => {
          if (chunk.done) {
            duplex.push(null);
          } else {
            duplex.push(chunk.value);
          }
        },
        error => duplex.destroy(error)
      );
    },

    destroy(error, callback) {
      function done() {
        try {
          callback(error);
        } catch (error) {
          // In a next tick because this is happening within
          // a promise context, and if there are any errors
          // thrown we don't want those to cause an unhandled
          // rejection. Let's just escape the promise and
          // handle it separately.
          queueMicrotask(() => {
            throw error;
          });
        }
      }

      async function closeWriter() {
        if (!writableClosed) await writer.abort(error);
      }

      async function closeReader() {
        if (!readableClosed) await reader.cancel(error);
      }

      if (!writableClosed || !readableClosed) {
        Promise.all([closeWriter(), closeReader()]).then(done, done);
        return;
      }

      done();
    }
  });

  // Non-standard event!!
  Promise.race([writer.ready, new Promise(resolve => setTimeout(resolve, 100))]).then(
    () => duplex.emit('ready'),
    error => duplex.destroy(error)
  );

  writer.closed.then(
    () => {
      writableClosed = true;
      if (!duplex.writableEnded) duplex.destroy(new Error('premature closure'));
    },
    error => {
      writableClosed = true;
      readableClosed = true;
      duplex.destroy(error);
    }
  );

  reader.closed.then(
    () => {
      readableClosed = true;
    },
    error => {
      writableClosed = true;
      readableClosed = true;
      duplex.destroy(error);
    }
  );

  return duplex;
}
