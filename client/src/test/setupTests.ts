import '@testing-library/jest-dom';

if (!('randomUUID' in globalThis.crypto)) {
  Object.defineProperty(globalThis.crypto, 'randomUUID', {
    value: () => Math.random().toString(36).slice(2),
  });
}

// jsdom doesn't implement IntersectionObserver, but framer-motion's `whileInView`
// prop (used by ProductCard) checks for it on mount.
class MockIntersectionObserver {
  observe = jest.fn();
  unobserve = jest.fn();
  disconnect = jest.fn();
  takeRecords = jest.fn(() => []);
}
// @ts-expect-error -- test-only polyfill, not a spec-complete implementation
globalThis.IntersectionObserver = MockIntersectionObserver;
