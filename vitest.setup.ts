import '@testing-library/jest-dom';
import { vi } from 'vitest';

// Mock SpeechRecognition
if (typeof window !== 'undefined') {
  class MockSpeechRecognition {
    continuous = false;
    interimResults = false;
    lang = '';
    start = vi.fn();
    stop = vi.fn();
    onresult = null;
    onerror = null;
  }
  (window as any).SpeechRecognition = (window as any).SpeechRecognition || MockSpeechRecognition;
  (window as any).webkitSpeechRecognition = (window as any).webkitSpeechRecognition || MockSpeechRecognition;
}

// Mock MediaRecorder
if (typeof window !== 'undefined') {
  class MockMediaRecorder {
    state = 'inactive';
    stream: any;
    ondataavailable: ((e: any) => void) | null = null;
    onstop: (() => void) | null = null;

    static isTypeSupported = vi.fn().mockReturnValue(true);

    constructor(stream: any) {
      this.stream = stream;
    }

    start = vi.fn().mockImplementation(() => {
      this.state = 'recording';
    });

    stop = vi.fn().mockImplementation(() => {
      this.state = 'inactive';
      if (this.onstop) {
        this.onstop();
      }
    });
  }
  (window as any).MediaRecorder = (window as any).MediaRecorder || MockMediaRecorder;
}

// Mock Audio (HTMLAudioElement)
if (typeof window !== 'undefined') {
  class MockAudio {
    src = '';
    play = vi.fn().mockResolvedValue(undefined);
    pause = vi.fn();
  }
  (window as any).Audio = (window as any).Audio || MockAudio;
}

// Mock getUserMedia
if (typeof navigator !== 'undefined' && navigator.mediaDevices) {
  navigator.mediaDevices.getUserMedia = vi.fn().mockResolvedValue({
    getTracks: () => [
      {
        stop: vi.fn(),
      },
    ],
  });
}

// Mock scrollIntoView (not implemented in jsdom)
if (typeof window !== 'undefined') {
  window.HTMLElement.prototype.scrollIntoView = vi.fn();
}
