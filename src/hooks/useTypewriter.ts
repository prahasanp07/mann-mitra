import { useState, useEffect, useRef } from 'react';

/**
 * A custom hook to render text character-by-character from a stream.
 * Automatically speeds up typing if the stream is significantly ahead.
 */
export function useTypewriter(streamedText: string, isStreaming: boolean, defaultSpeed: number = 18) {
  const [displayedText, setDisplayedText] = useState('');
  const [isTyping, setIsTyping] = useState(false);
  
  const textBufferRef = useRef('');
  const displayedLengthRef = useRef(0);
  const timerRef = useRef<NodeJS.Timeout | null>(null);
  const isStreamingRef = useRef(isStreaming);

  // Sync isStreaming to ref to avoid stale closure
  useEffect(() => {
    isStreamingRef.current = isStreaming;
  }, [isStreaming]);

  // Sync with incoming stream text
  useEffect(() => {
    textBufferRef.current = streamedText;
    if (streamedText.length > displayedLengthRef.current && !timerRef.current) {
      setIsTyping(true);
      tick();
    }
  }, [streamedText]);

  // Adjust isTyping when streaming ends and we finish catching up
  useEffect(() => {
    if (!isStreaming && textBufferRef.current.length === displayedLengthRef.current) {
      setIsTyping(false);
    }
  }, [isStreaming]);

  // Clean up timer on component unmount
  useEffect(() => {
    return () => {
      if (timerRef.current) {
        clearTimeout(timerRef.current);
      }
    };
  }, []);

  const tick = () => {
    const totalText = textBufferRef.current;
    const currentLength = displayedLengthRef.current;

    if (currentLength < totalText.length) {
      const nextChar = totalText[currentLength];
      setDisplayedText((prev) => prev + nextChar);
      displayedLengthRef.current += 1;

      // Adjust speed dynamically based on how many characters are buffered (backlog)
      const backlog = totalText.length - currentLength;
      let delay = defaultSpeed;
      
      if (backlog > 40) {
        delay = 2; // Type extremely fast to catch up
      } else if (backlog > 15) {
        delay = 6; // Speed up typing
      } else if (backlog > 5) {
        delay = 12; // Slightly faster typing
      }

      timerRef.current = setTimeout(tick, delay);
    } else {
      timerRef.current = null;
      if (!isStreamingRef.current) {
        setIsTyping(false);
      }
    }
  };

  const reset = () => {
    if (timerRef.current) {
      clearTimeout(timerRef.current);
    }
    timerRef.current = null;
    setDisplayedText('');
    displayedLengthRef.current = 0;
    textBufferRef.current = '';
    setIsTyping(false);
  };

  return { displayedText, isTyping, reset };
}
export default useTypewriter;
