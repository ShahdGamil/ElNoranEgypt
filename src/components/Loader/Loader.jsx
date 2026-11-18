import { useEffect, useState } from 'react';
import { AnimatePresence, motion } from 'framer-motion';
import { asset } from '../../utils/asset.js';
import './Loader.css';

/** Brief branded intro — hides as soon as the page has loaded (max ~2.2s). */
export default function Loader() {
  const [show, setShow] = useState(true);
  useEffect(() => {
    let t;
    const done = () => { t = setTimeout(() => setShow(false), 700); };
    if (document.readyState === 'complete') done();
    else window.addEventListener('load', done, { once: true });
    const failsafe = setTimeout(() => setShow(false), 2200);
    return () => { clearTimeout(t); clearTimeout(failsafe); window.removeEventListener('load', done); };
  }, []);

  return (
    <AnimatePresence>
      {show && (
        <motion.div
          className="loader"
          role="status"
          aria-label="Loading EL NORAN"
          initial={{ clipPath: 'circle(150% at 50% 50%)' }}
          exit={{ clipPath: 'circle(0% at 50% 50%)', opacity: 0.6 }}
          transition={{ duration: 0.8, ease: [0.76, 0, 0.24, 1] }}
        >
          <motion.img
            src={asset('images/logo/elnoran-logo.png')}
            alt=""
            className="loader-logo"
            initial={{ scale: 0.4, rotate: -40, opacity: 0 }}
            animate={{ scale: 1, rotate: 0, opacity: 1 }}
            transition={{ type: 'spring', stiffness: 160, damping: 12 }}
          />
          <div className="loader-word" aria-hidden="true">
            {'EL NORAN'.split('').map((ch, i) => (
              <motion.span key={i} initial={{ y: 30, opacity: 0 }} animate={{ y: 0, opacity: 1 }} transition={{ delay: 0.25 + i * 0.05 }}>
                {ch === ' ' ? ' ' : ch}
              </motion.span>
            ))}
          </div>
          <div className="loader-bar"><span /></div>
        </motion.div>
      )}
    </AnimatePresence>
  );
}
