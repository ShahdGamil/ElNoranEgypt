import { useEffect, useState } from 'react';
import { useReducedMotion } from 'framer-motion';

/** Types and deletes a list of words in a loop. */
export default function Typewriter({ words, typeSpeed = 85, deleteSpeed = 45, pause = 1600, className = '' }) {
  const reduce = useReducedMotion();
  const [index, setIndex] = useState(0);
  const [text, setText] = useState('');
  const [deleting, setDeleting] = useState(false);

  useEffect(() => {
    if (reduce) return undefined;
    const word = words[index % words.length];
    let delay = deleting ? deleteSpeed : typeSpeed;
    if (!deleting && text === word) delay = pause;
    const t = setTimeout(() => {
      if (!deleting && text === word) setDeleting(true);
      else if (deleting && text === '') { setDeleting(false); setIndex((i) => i + 1); }
      else setText(word.slice(0, text.length + (deleting ? -1 : 1)));
    }, delay);
    return () => clearTimeout(t);
  }, [text, deleting, index, words, typeSpeed, deleteSpeed, pause, reduce]);

  const shown = reduce ? words[0] : text;
  return (
    <span className={`typewriter ${className}`}>
      <span className="sr-only">{words.join(', ')}</span>
      <span aria-hidden="true">{shown}</span>
      <span className="typewriter-caret" aria-hidden="true" />
    </span>
  );
}
