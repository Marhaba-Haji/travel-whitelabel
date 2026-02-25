import { useState, useEffect, useRef } from "react";

interface TypewriterTextProps {
  words: string[];
  className?: string;
  typingSpeed?: number;
  deletingSpeed?: number;
  pauseDuration?: number;
  /** Extra ms per character for longer phrases (e.g. 80 = +80ms per char) */
  pausePerChar?: number;
}

const TypewriterText = ({
  words,
  className = "",
  typingSpeed = 100,
  deletingSpeed = 50,
  pauseDuration = 2000,
  pausePerChar = 80,
}: TypewriterTextProps) => {
  const [currentWordIndex, setCurrentWordIndex] = useState(0);
  const [currentText, setCurrentText] = useState("");
  const [isDeleting, setIsDeleting] = useState(false);
  const pauseTimeoutRef = useRef<ReturnType<typeof setTimeout> | null>(null);
  const isPausedRef = useRef(false);

  useEffect(() => {
    const currentWord = words[currentWordIndex];
    if (!currentWord) return;

    // Clear any existing pause timeout on cleanup or when deps change
    if (pauseTimeoutRef.current) {
      clearTimeout(pauseTimeoutRef.current);
      pauseTimeoutRef.current = null;
    }
    isPausedRef.current = false;

    const timeout = setTimeout(
      () => {
        if (!isDeleting) {
          // Typing
          if (currentText.length < currentWord.length) {
            setCurrentText(currentWord.slice(0, currentText.length + 1));
          } else if (!isPausedRef.current) {
            // Fully typed: pause before deleting (only schedule once)
            isPausedRef.current = true;
            const displayTime = pauseDuration + currentWord.length * pausePerChar;
            pauseTimeoutRef.current = setTimeout(() => {
              pauseTimeoutRef.current = null;
              setIsDeleting(true);
            }, displayTime);
          }
        } else {
          // Deleting
          if (currentText.length > 0) {
            setCurrentText(currentText.slice(0, -1));
          } else {
            setIsDeleting(false);
            setCurrentWordIndex((prev) => (prev + 1) % words.length);
          }
        }
      },
      isDeleting ? deletingSpeed : typingSpeed
    );

    return () => {
      clearTimeout(timeout);
      if (pauseTimeoutRef.current) {
        clearTimeout(pauseTimeoutRef.current);
        pauseTimeoutRef.current = null;
      }
    };
  }, [currentText, isDeleting, currentWordIndex, words[currentWordIndex], typingSpeed, deletingSpeed, pauseDuration, pausePerChar]);

  return (
    <span className={className}>
      {currentText}
      <span className="animate-pulse">|</span>
    </span>
  );
};

export default TypewriterText;
