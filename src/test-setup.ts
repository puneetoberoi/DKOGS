import '@testing-library/jest-dom';
import { cleanup } from '@testing-library/react';
import { afterEach } from 'vitest';

// Clean up the virtual DOM after every test to prevent memory leaks
afterEach(() => {
  cleanup();
});