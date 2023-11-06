export const platform = '';
export const arch = '';
export const env = Object.create(null);
export const version = '';
export function nextTick(fn, ...args) {
  return queueMicrotask(fn.bind(null, ...args));
}
export const stdout = null;
export const stderr = null;
export function hrtime() {
  const currDate = new Date().getTime();
  return [currDate / 1000, currDate % 1000];
}
export function emitWarning() {
  return;
}
