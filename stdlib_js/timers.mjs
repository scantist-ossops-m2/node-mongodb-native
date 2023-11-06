export const clearTimeout = id => globalThis.clearTimeout(+id);

export const setTimeout = (...args) => {
  const id = globalThis.setTimeout(...args);
  return {
    unref() {
      return;
    },
    [Symbol.toPrimitive]() {
      return id;
    }
  };
};
