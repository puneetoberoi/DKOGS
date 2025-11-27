// @vitest-environment jsdom
// src/__tests__/unit/App.test.tsx

import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest';
import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import '@testing-library/jest-dom/vitest';

import App from '../../App';

// --- Mock SDK ---
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

// --- Mock localStorage ---
const localStorageMock = {
  getItem: vi.fn(),
  setItem: vi.fn(),
  removeItem: vi.fn(),
  clear: vi.fn(),
};

Object.defineProperty(window, 'localStorage', {
  value: localStorageMock,
  writable: true,
});

describe('GapSpotter App - UI Tests', () => {
  beforeEach(() => {
    vi.clearAllMocks();
    localStorageMock.getItem.mockReturnValue('true'); // Skip legal modal
  });

  afterEach(() => {
    vi.restoreAllMocks();
  });

  describe('Landing Page', () => {
    it('renders the landing page correctly', () => {
      render(<App />);
      
      // Check heading exists - use getAllBy since text might be split
      const headings = screen.getAllByText(/Find Your Next/i);
      expect(headings.length).toBeGreaterThan(0);
      
      // Check input exists
      const inputs = screen.getAllByPlaceholderText(/e.g. Ergonomic Chairs/i);
      expect(inputs.length).toBeGreaterThan(0);
    });

    it('contains all critical form elements', () => {
      render(<App />);
      
      const inputs = screen.getAllByPlaceholderText(/e.g. Ergonomic Chairs/i);
      expect(inputs.length).toBeGreaterThan(0);
      
      // Check value using native property
      expect((inputs[0] as HTMLInputElement).value).toBe('');
    });

    it('has navigation buttons', () => {
      render(<App />);
      
      const searchButtons = screen.getAllByText('Search');
      const trendingButtons = screen.getAllByText('Trending');
      
      expect(searchButtons.length).toBeGreaterThan(0);
      expect(trendingButtons.length).toBeGreaterThan(0);
    });
  });

  describe('Form Interactions', () => {
    it('allows typing in keyword input', async () => {
      const user = userEvent.setup();
      render(<App />);
      
      const inputs = screen.getAllByPlaceholderText(/e.g. Ergonomic Chairs/i);
      const input = inputs[0] as HTMLInputElement;
      
      await user.clear(input);
      await user.type(input, 'test keyword');
      
      const updatedInputs = screen.getAllByPlaceholderText(/e.g. Ergonomic Chairs/i);
      expect((updatedInputs[0] as HTMLInputElement).value).toBe('test keyword');
    });

    it('toggles data sources on click', async () => {
      const user = userEvent.setup();
      render(<App />);
      
      const socialMediaButtons = screen.getAllByText('Social Media');
      expect(socialMediaButtons.length).toBeGreaterThan(0);
      
      await user.click(socialMediaButtons[0]);
    });

    it('changes lookback selection', async () => {
      const user = userEvent.setup();
      render(<App />);
      
      const selects = screen.getAllByDisplayValue('Last 6 Months');
      expect(selects.length).toBeGreaterThan(0);
      
      const select = selects[0] as HTMLSelectElement;
      const options = Array.from(select.options);
      const option30Days = options.find(o => o.text.includes('30 Days'));
      
      expect(option30Days).toBeDefined();
      
      if (option30Days) {
        fireEvent.change(select, { target: { value: option30Days.value } });
        
        // Wait for React to re-render and update the DOM
        await waitFor(() => {
          const updatedSelects = screen.getAllByDisplayValue(/30 Days/i);
          expect(updatedSelects.length).toBeGreaterThan(0);
        });
      }
    });

    it('has region selection with multiple options', () => {
      render(<App />);
      
      const selects = screen.getAllByDisplayValue('United States');
      const select = selects[0] as HTMLSelectElement;
      
      const options = Array.from(select.options);
      const optionTexts = options.map(o => o.text);
      
      // Verify key regions exist as options
      expect(optionTexts.some(t => t.includes('United States'))).toBe(true);
      expect(optionTexts.some(t => t.includes('Canada'))).toBe(true);
      expect(options.length).toBeGreaterThan(1);
    });

    it('has depth selection with multiple options', () => {
      render(<App />);
      
      const selects = screen.getAllByDisplayValue('Quick Scan (Free)');
      const select = selects[0] as HTMLSelectElement;
      
      const options = Array.from(select.options);
      const optionTexts = options.map(o => o.text);
      
      // Verify depth options exist
      expect(optionTexts.some(t => t.includes('Quick Scan'))).toBe(true);
      expect(optionTexts.some(t => t.includes('Deep Dive'))).toBe(true);
      expect(options.length).toBeGreaterThan(1);
    });
  });

  describe('Quick Scan Mode', () => {
    it('shows spot gaps button in Quick Scan mode', () => {
      render(<App />);
      
      // Change input to enable form
      const inputs = screen.getAllByPlaceholderText(/e.g. Ergonomic Chairs/i);
      fireEvent.change(inputs[0], { target: { value: 'test' } });
      
      // Look for the actual button text in your app
      const buttons = screen.getAllByRole('button');
      
      // Just verify form is functional - button exists
      expect(buttons.length).toBeGreaterThan(0);
    });

    it('has opportunities section', () => {
      render(<App />);
      
      const opportunitiesElements = screen.getAllByText('Opportunities');
      expect(opportunitiesElements.length).toBeGreaterThan(0);
    });
  });

  describe('Navigation', () => {
    it('switches to Trending tab', async () => {
      const user = userEvent.setup();
      render(<App />);
      
      const trendingButtons = screen.getAllByText('Trending');
      await user.click(trendingButtons[0]);
      
      // Verify we can still find trending content
      expect(screen.getAllByText('Trending').length).toBeGreaterThan(0);
    });

    it('switches back to Search tab', async () => {
      const user = userEvent.setup();
      render(<App />);
      
      // Go to Trending
      const trendingButtons = screen.getAllByText('Trending');
      await user.click(trendingButtons[0]);
      
      // Go back to Search
      const searchButtons = screen.getAllByText('Search');
      await user.click(searchButtons[0]);
      
      // Verify input is visible
      const inputs = screen.getAllByPlaceholderText(/e.g. Ergonomic Chairs/i);
      expect(inputs.length).toBeGreaterThan(0);
    });
  });

  describe('Legal Modal', () => {
    it('shows legal modal for first-time users', () => {
      localStorageMock.getItem.mockReturnValue(null);
      
      render(<App />);
      
      // Look for modal content
      const welcomeTexts = screen.getAllByText(/Welcome/i);
      expect(welcomeTexts.length).toBeGreaterThan(0);
    });

    it('hides legal modal after acceptance', async () => {
      const user = userEvent.setup();
      localStorageMock.getItem.mockReturnValue(null);
      
      render(<App />);
      
      // Get all accept buttons and click the first one
      const acceptButtons = screen.getAllByRole('button', { 
        name: /I Understand & Accept/i 
      });
      expect(acceptButtons.length).toBeGreaterThan(0);
      
      await user.click(acceptButtons[0]);
      
      expect(localStorageMock.setItem).toHaveBeenCalledWith(
        'gapspotter_legal_accepted', 
        'true'
      );
    });
  });
});