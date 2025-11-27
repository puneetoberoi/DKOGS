import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest';
import { render, screen } from '@testing-library/react';
import App from '../App';

// --- 1. Setup Global Mocks ---
vi.stubGlobal('import', { meta: { env: { VITE_GEMINI_API_KEY: 'test-key' } } });

// --- 2. Setup SDK Mock ---
const { mockGenerateContent } = vi.hoisted(() => {
  return { mockGenerateContent: vi.fn() };
});

vi.mock('@google/genai', () => {
  return {
    GoogleGenAI: class {
      models = {
        generateContent: mockGenerateContent
      };
    },
    Type: { 
      OBJECT: 'OBJECT', STRING: 'STRING', NUMBER: 'NUMBER', 
      ARRAY: 'ARRAY', INTEGER: 'INTEGER', BOOLEAN: 'BOOLEAN' 
    }
  };
});

describe('GapSpotter Critical Path', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  afterEach(() => {
    vi.unstubAllGlobals();
  });

  it('renders the landing page correctly', () => {
    render(<App />);
    expect(screen.getByText(/Find Your Next/i)).toBeInTheDocument();
    expect(screen.getByPlaceholderText(/e.g. Ergonomic Chairs/i)).toBeInTheDocument();
  });

  it('contains all critical elements for user interaction', () => {
    render(<App />);
    
    // Verify the form elements exist
    const input = screen.getByPlaceholderText(/e.g. Ergonomic Chairs/i);
    const button = screen.getByRole('button', { name: /Scan Market/i });
    
    // Verify they are in the document
    expect(input).toBeInTheDocument();
    expect(button).toBeInTheDocument();
    
    // Verify initial state
    expect(input).toHaveValue('');
    expect(button).toBeDisabled(); // Button starts disabled when input is empty
  });
});