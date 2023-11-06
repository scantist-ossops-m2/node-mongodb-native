import { createHistogram } from 'node:perf_hooks';

const h = createHistogram();
for (let i = 0; i < 100; i++) {
  h.recordDelta();
  await (await fetch('http://127.0.0.1:8787')).json();
  h.recordDelta();
}

const makeReadableTime = (nanoseconds) => (nanoseconds / 1e6).toFixed(3).padStart(7, ' ');

console.log(
  'mean:',
  makeReadableTime(h.mean),
  'median:',
  makeReadableTime(h.percentile(50)),
  'stddev:',
  makeReadableTime(h.stddev)
);
