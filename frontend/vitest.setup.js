// vitest.setup.js
import '@testing-library/jest-dom';
import { vi } from 'vitest';

// Mock jest globals for compatibility
global.jest = {
  fn: vi.fn,
  mock: vi.mock,
  unmock: vi.unmock,
  requireActual: vi.importActual,
  spyOn: vi.spyOn,
  clearAllMocks: vi.clearAllMocks,
  resetAllMocks: vi.resetAllMocks,
  restoreAllMocks: vi.restoreAllMocks,
};

// Object.defineProperty to handle mocks
Object.defineProperty(global, '__vitest_worker__', {
  get() {
    return {
      vitest: vi,
    };
  },
});