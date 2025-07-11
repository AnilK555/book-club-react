import '@testing-library/jest-dom';
const localStorageMock = {
  getItem: vi.fn(),
  setItem: vi.fn(),
  removeItem: vi.fn(),
  clear: vi.fn(),
};
globalThis.localStorage = localStorageMock;

globalThis.fetch = vi.fn();

afterEach(() => {
  vi.clearAllMocks();
});
