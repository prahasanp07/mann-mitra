import { describe, it, expect } from 'vitest';
import { detectStressLevel, generateFallbackResponse } from './mitra-agent';

describe('Mitra Agent Utilities', () => {
  describe('detectStressLevel', () => {
    it('should detect overwhelmed state for self-harm or giving up phrases', () => {
      expect(detectStressLevel('I want to give up this race', 'calm')).toBe('overwhelmed');
      expect(detectStressLevel('feeling hopeless and panicking', 'stressed')).toBe('overwhelmed');
      expect(detectStressLevel('I failed my exam', 'calm')).toBe('overwhelmed');
    });

    it('should detect stressed state for syllabus, mock tests, and exams', () => {
      expect(detectStressLevel('I have a physics backlog to cover', 'calm')).toBe('stressed');
      expect(detectStressLevel('mock test marks are bad', 'calm')).toBe('stressed');
      expect(detectStressLevel('math syllabus is scary', 'calm')).toBe('stressed');
    });

    it('should detect tired state for sleeplessness and fatigue', () => {
      expect(detectStressLevel('I am so tired and exhausted', 'calm')).toBe('tired');
      expect(detectStressLevel('insomnia is killing me, no sleep', 'calm')).toBe('tired');
      expect(detectStressLevel('burnout is high', 'calm')).toBe('tired');
    });

    it('should downgrade to calm on positive triggers', () => {
      expect(detectStressLevel('thanks, I feel better now', 'stressed')).toBe('calm');
      expect(detectStressLevel('okay, thank you', 'tired')).toBe('calm');
    });

    it('should maintain current level if no keywords match', () => {
      expect(detectStressLevel('just reading a normal book', 'stressed')).toBe('stressed');
      expect(detectStressLevel('hello there', 'calm')).toBe('calm');
    });
  });

  describe('generateFallbackResponse', () => {
    it('should return responses matching rotation physics keyword', () => {
      const response = generateFallbackResponse('I am struggling with rotation mechanics', 'overwhelmed');
      expect(response).toContain('rotation');
      expect(response).toContain('[TRIGGER_BREATHING]');
    });

    it('should trigger NSDR on tiredness with backlog keywords', () => {
      const response = generateFallbackResponse('syllabus backlog is huge', 'tired');
      expect(response).toContain('[TRIGGER_NSDR]');
    });

    it('should return general responses if no keywords match', () => {
      const response = generateFallbackResponse('just chatting', 'calm');
      expect(response).toBeDefined();
      expect(response.length).toBeGreaterThan(0);
    });
  });
});
