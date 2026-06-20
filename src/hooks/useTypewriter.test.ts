import { renderHook, act } from '@testing-library/react';
import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest';
import { useTypewriter } from './useTypewriter';

describe('useTypewriter Hook', () => {
  beforeEach(() => {
    vi.useFakeTimers();
  });

  afterEach(() => {
    vi.useRealTimers();
  });

  it('should initialize with empty text and not typing', () => {
    const { result } = renderHook(() => useTypewriter('', false));
    expect(result.current.displayedText).toBe('');
    expect(result.current.isTyping).toBe(false);
  });

  it('should type characters sequentially when streamedText is updated', () => {
    const { result, rerender } = renderHook(
      ({ text, streaming }) => useTypewriter(text, streaming),
      {
        initialProps: { text: '', streaming: true },
      }
    );

    rerender({ text: 'Hello', streaming: true });

    expect(result.current.isTyping).toBe(true);

    // Advance enough for at least 1 character but not all
    act(() => {
      vi.advanceTimersByTime(18);
    });
    expect(result.current.displayedText.length).toBeGreaterThanOrEqual(1);

    // Advance enough to finish typing all 5 chars
    act(() => {
      vi.advanceTimersByTime(18 * 10);
    });
    expect(result.current.displayedText).toBe('Hello');
  });

  it('should speed up when backlog is high', () => {
    const { result, rerender } = renderHook(
      ({ text, streaming }) => useTypewriter(text, streaming),
      {
        initialProps: { text: '', streaming: true },
      }
    );

    // Provide a long backlog (backlog > 40 should use delay = 2)
    rerender({
      text: 'This is a very long text that exceeds forty characters and will speed up typing speed significantly.',
      streaming: true,
    });

    act(() => {
      vi.advanceTimersByTime(2);
    });
    expect(result.current.displayedText.length).toBeGreaterThanOrEqual(1);

    act(() => {
      vi.advanceTimersByTime(200); // 100 characters typed at 2ms each
    });
    expect(result.current.displayedText.length).toBeGreaterThan(40);
  });

  it('should reset state correctly', () => {
    const { result, rerender } = renderHook(
      ({ text, streaming }) => useTypewriter(text, streaming),
      {
        initialProps: { text: '', streaming: true },
      }
    );

    rerender({ text: 'Testing', streaming: true });
    act(() => {
      vi.advanceTimersByTime(100);
    });

    expect(result.current.displayedText).toBe('Testing');

    act(() => {
      result.current.reset();
    });

    expect(result.current.displayedText).toBe('');
    expect(result.current.isTyping).toBe(false);
  });
});
