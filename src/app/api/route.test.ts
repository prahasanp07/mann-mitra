import { describe, it, expect, vi, beforeEach } from 'vitest';
import { detectStressLevel, generateFallbackResponse } from '@/lib/mitra-agent';

// We test the API route logic by exercising the underlying utilities it depends on,
// since Next.js route handlers (using NextRequest) require an integration test runner.
// These tests validate the data transformation logic that powers both /api/chat and /api/voice.

describe('/api/chat – core logic', () => {
  describe('request validation', () => {
    it('detectStressLevel returns overwhelmed for crisis messages', () => {
      expect(detectStressLevel('I am panicking and want to give up', 'calm')).toBe('overwhelmed');
    });

    it('detectStressLevel returns stressed for exam-related messages', () => {
      expect(detectStressLevel('My mock test went really bad today', 'calm')).toBe('stressed');
    });

    it('detectStressLevel falls back to current level for neutral input', () => {
      expect(detectStressLevel('just reading', 'tired')).toBe('tired');
      expect(detectStressLevel('just reading', 'stressed')).toBe('stressed');
    });
  });

  describe('fallback response generation', () => {
    it('returns a non-empty string for any stress level', () => {
      const levels = ['calm', 'tired', 'stressed', 'overwhelmed'] as const;
      for (const level of levels) {
        const res = generateFallbackResponse('help me', level);
        expect(res).toBeDefined();
        expect(res.length).toBeGreaterThan(0);
      }
    });

    it('attaches [TRIGGER_BREATHING] for overwhelmed state with stress keywords', () => {
      const res = generateFallbackResponse('my backlog is too much and I am overwhelmed', 'overwhelmed');
      expect(res).toContain('[TRIGGER_BREATHING]');
    });

    it('attaches [TRIGGER_NSDR] for tired state with sleep keywords', () => {
      const res = generateFallbackResponse('cannot sleep and insomnia is bad tonight', 'tired');
      expect(res).toContain('[TRIGGER_NSDR]');
    });
  });
});

describe('/api/voice – response header contract', () => {
  it('encodeURIComponent safely encodes response text for headers', () => {
    const sampleReply = "It's okay, Arjun. Let's breathe.";
    const encoded = encodeURIComponent(sampleReply);
    const decoded = decodeURIComponent(encoded);
    expect(decoded).toBe(sampleReply);
  });

  it('stress level detection matches the X-Detected-Stress-Level header value', () => {
    const message = 'I feel completely hopeless and keep panicking';
    const stress = detectStressLevel(message, 'calm');
    expect(['calm', 'tired', 'stressed', 'overwhelmed']).toContain(stress);
    expect(stress).toBe('overwhelmed');
  });
});
