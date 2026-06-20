import React from 'react';
import { render, screen, fireEvent, waitFor, act } from '@testing-library/react';
import { describe, it, expect, vi, beforeEach } from 'vitest';
import { CompanionChat } from './CompanionChat';

// ── Mocks ──────────────────────────────────────────────────────────────────────

// Mock fetch globally for all tests
global.fetch = vi.fn();

// Mock localStorage
const localStorageMock = (() => {
  let store: Record<string, string> = {};
  return {
    getItem: (key: string) => store[key] ?? null,
    setItem: (key: string, value: string) => { store[key] = value; },
    removeItem: (key: string) => { delete store[key]; },
    clear: () => { store = {}; },
  };
})();
Object.defineProperty(window, 'localStorage', { value: localStorageMock });

// Mock URL.createObjectURL
global.URL.createObjectURL = vi.fn(() => 'blob:mock-url');

// Default mock props
const mockSetStressLevel = vi.fn();
const defaultProps = {
  stressLevel: 'calm' as const,
  setStressLevel: mockSetStressLevel,
};

// ── Helpers ────────────────────────────────────────────────────────────────────

function renderChat(props = defaultProps) {
  return render(<CompanionChat {...props} />);
}

// ── Test Suites ────────────────────────────────────────────────────────────────

describe('CompanionChat Component', () => {

  beforeEach(() => {
    vi.clearAllMocks();
    localStorageMock.clear();
    localStorageMock.setItem('mannmitra_username', 'Rahul');
    localStorageMock.setItem('mannmitra_exam', 'JEE Advanced');
  });

  // ── 1. Initial Render ───────────────────────────────────────────────────────

  describe('Initial render', () => {
    it('renders Mitra welcome message on mount', () => {
      renderChat();
      expect(screen.getByText(/I know how heavy the prep load is right now/i)).toBeTruthy();
    });

    it('renders the text input area', () => {
      renderChat();
      expect(screen.getByPlaceholderText(/Tell Mitra what's stressing you/i)).toBeTruthy();
    });

    it('renders the hold-to-talk microphone button', () => {
      renderChat();
      expect(screen.getByTitle(/Hold to talk/i)).toBeTruthy();
    });

    it('loads username from localStorage', async () => {
      renderChat();
      // The welcome message "Hey Arjun" is replaced with the stored name
      await waitFor(() => {
        expect(screen.getByText(/Rahul/i)).toBeTruthy();
      });
    });
  });

  // ── 2. Text Input & Send ────────────────────────────────────────────────────

  describe('Text input and send', () => {
    it('enables send button only when input has text', () => {
      renderChat();
      const input = screen.getByPlaceholderText(/Tell Mitra what's stressing you/i);

      // Initially empty — textarea should be blank
      expect((input as HTMLTextAreaElement).value).toBe('');

      // Type into the input
      fireEvent.change(input, { target: { value: 'I am stressed' } });
      expect((input as HTMLTextAreaElement).value).toBe('I am stressed');
    });

    it('clears input after sending a message', async () => {
      (global.fetch as any).mockResolvedValueOnce({
        ok: true,
        headers: { get: vi.fn().mockReturnValue(null) },
        body: {
          getReader: () => ({
            read: vi.fn()
              .mockResolvedValueOnce({ done: false, value: new TextEncoder().encode('Great') })
              .mockResolvedValueOnce({ done: true, value: undefined }),
          }),
        },
      });

      renderChat();
      const input = screen.getByPlaceholderText(/Tell Mitra what's stressing you/i);

      fireEvent.change(input, { target: { value: 'I feel tired' } });
      fireEvent.keyDown(input, { key: 'Enter', code: 'Enter' });

      await waitFor(() => {
        expect((input as HTMLTextAreaElement).value).toBe('');
      });
    });
  });

  // ── 3. Safety Interceptor ───────────────────────────────────────────────────

  describe('Safety interceptor', () => {
    it('shows safety modal when a high-risk phrase is typed and sent', async () => {
      renderChat();
      const input = screen.getByPlaceholderText(/Tell Mitra what's stressing you/i);

      fireEvent.change(input, { target: { value: 'I want to give up and end everything' } });
      fireEvent.keyDown(input, { key: 'Enter', code: 'Enter' });

      await waitFor(() => {
        expect(screen.getByText(/Emergency Support Available/i)).toBeTruthy();
      });
    });

    it('aborts fetch call when a high-risk phrase is detected', async () => {
      renderChat();
      const input = screen.getByPlaceholderText(/Tell Mitra what's stressing you/i);

      fireEvent.change(input, { target: { value: 'I want to commit suicide' } });
      fireEvent.keyDown(input, { key: 'Enter', code: 'Enter' });

      // fetch should NOT have been called
      await waitFor(() => {
        expect(global.fetch).not.toHaveBeenCalled();
      });
    });

    it('shows Vandrevala Foundation helpline in safety modal', async () => {
      renderChat();
      const input = screen.getByPlaceholderText(/Tell Mitra what's stressing you/i);

      fireEvent.change(input, { target: { value: 'no point living anymore' } });
      fireEvent.keyDown(input, { key: 'Enter', code: 'Enter' });

      await waitFor(() => {
        expect(screen.getByText(/Vandrevala Foundation/i)).toBeTruthy();
      });
    });

    it('shows AASRA helpline in safety modal', async () => {
      renderChat();
      const input = screen.getByPlaceholderText(/Tell Mitra what's stressing you/i);

      fireEvent.change(input, { target: { value: 'better off dead' } });
      fireEvent.keyDown(input, { key: 'Enter', code: 'Enter' });

      await waitFor(() => {
        expect(screen.getByText(/AASRA Helpline/i)).toBeTruthy();
      });
    });

    it('dismisses safety modal on close button click', async () => {
      renderChat();
      const input = screen.getByPlaceholderText(/Tell Mitra what's stressing you/i);

      fireEvent.change(input, { target: { value: 'give up on everything' } });
      fireEvent.keyDown(input, { key: 'Enter', code: 'Enter' });

      await waitFor(() => {
        expect(screen.getByText(/Emergency Support Available/i)).toBeTruthy();
      });

      const closeBtn = screen.getByText(/I understand, close guide/i);
      fireEvent.click(closeBtn);

      await waitFor(() => {
        expect(screen.queryByText(/Emergency Support Available/i)).toBeNull();
      });
    });

    it('sets stress level to overwhelmed on safety trigger', async () => {
      renderChat();
      const input = screen.getByPlaceholderText(/Tell Mitra what's stressing you/i);

      fireEvent.change(input, { target: { value: 'I want to kill myself' } });
      fireEvent.keyDown(input, { key: 'Enter', code: 'Enter' });

      await waitFor(() => {
        expect(mockSetStressLevel).toHaveBeenCalledWith('overwhelmed');
      });
    });
  });

  // ── 4. Widget Trigger Tokens ────────────────────────────────────────────────

  describe('Breathing pacer widget', () => {
    it('renders BreathingPacerWidget when TRIGGER_BREATHING token is in message', async () => {
      (global.fetch as any).mockResolvedValueOnce({
        ok: true,
        headers: { get: vi.fn().mockReturnValue('overwhelmed') },
        body: {
          getReader: () => ({
            read: vi.fn()
              .mockResolvedValueOnce({
                done: false,
                value: new TextEncoder().encode("Let's breathe together. [TRIGGER_BREATHING]"),
              })
              .mockResolvedValueOnce({ done: true, value: undefined }),
          }),
        },
      });

      renderChat();
      const input = screen.getByPlaceholderText(/Tell Mitra what's stressing you/i);
      fireEvent.change(input, { target: { value: 'I am panicking' } });
      fireEvent.keyDown(input, { key: 'Enter', code: 'Enter' });

      await waitFor(() => {
        expect(screen.getByText(/Deep Focus Breathing/i)).toBeTruthy();
      }, { timeout: 5000 });
    });
  });

  // ── 5. Hold-to-Talk Button State ────────────────────────────────────────────

  describe('Hold-to-talk microphone button', () => {
    it('renders hold-to-talk button in the input area', () => {
      renderChat();
      const micBtn = screen.getByTitle(/Hold to talk/i);
      expect(micBtn).toBeDefined();
    });

    it('mic button is disabled while streaming is active', async () => {
      (global.fetch as any).mockImplementation(() =>
        new Promise(() => {}) // never resolves, keeps streaming state active
      );

      renderChat();
      const input = screen.getByPlaceholderText(/Tell Mitra what's stressing you/i);
      fireEvent.change(input, { target: { value: 'I feel stressed' } });
      fireEvent.keyDown(input, { key: 'Enter', code: 'Enter' });

      await waitFor(() => {
        const micBtn = screen.getByTitle(/Hold to talk/i);
        expect(micBtn).toHaveAttribute('disabled');
      });
    });
  });

  // ── 6. Suggested Prompts ────────────────────────────────────────────────────

  describe('Suggested prompt chips', () => {
    it('renders suggested prompt chips on initial load (≤3 messages)', () => {
      renderChat();
      expect(screen.getByText(/Mock Test:/i)).toBeTruthy();
      expect(screen.getByText(/Backlog:/i)).toBeTruthy();
      expect(screen.getByText(/Exhaustion:/i)).toBeTruthy();
    });
  });

});
