import { useEffect, useRef } from 'react';
import { AnimatePresence, motion } from 'framer-motion';
import { ChevronLeft, ChevronRight, X, Send, Camera, Snowflake } from 'lucide-react';
import useLockBody from '../../hooks/useLockBody.js';
import { categoryById } from '../../data/products.js';
import { asset } from '../../utils/asset.js';
import './ProductModal.css';

export default function ProductModal({ product, onClose, onPrev, onNext, onRequest }) {
  const open = Boolean(product);
  const closeRef = useRef(null);
  const lastFocus = useRef(null);
  useLockBody(open, onClose);

  useEffect(() => {
    if (!open) return undefined;
    lastFocus.current = lastFocus.current || document.activeElement;
    closeRef.current?.focus();
    const onKey = (e) => {
      if (e.key === 'ArrowLeft') onPrev();
      if (e.key === 'ArrowRight') onNext();
    };
    window.addEventListener('keydown', onKey);
    return () => window.removeEventListener('keydown', onKey);
  }, [open, onPrev, onNext]);

  useEffect(() => {
    if (!open && lastFocus.current) { lastFocus.current.focus?.(); lastFocus.current = null; }
  }, [open]);

  const cat = product ? categoryById[product.category] : null;

  return (
    <AnimatePresence>
      {open && (
        <motion.div className="pmodal-backdrop" onClick={onClose} initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}>
          <motion.div
            className="pmodal"
            role="dialog"
            aria-modal="true"
            aria-labelledby="pmodal-title"
            style={{ '--accent': product.accent, '--cat-grad': cat.gradient, '--cat': cat.color }}
            onClick={(e) => e.stopPropagation()}
            initial={{ opacity: 0, y: 60, scale: 0.94 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: 40, scale: 0.96 }}
            transition={{ type: 'spring', stiffness: 260, damping: 26 }}
          >
            <button ref={closeRef} className="pmodal-close" onClick={onClose} aria-label="Close product details">
              <X size={22} />
            </button>

            <div className="pmodal-media">
              <AnimatePresence mode="wait">
                <motion.img
                  key={product.id}
                  src={asset(product.image)}
                  alt={product.name}
                  initial={{ opacity: 0, scale: 1.08 }}
                  animate={{ opacity: 1, scale: 1 }}
                  exit={{ opacity: 0 }}
                  transition={{ duration: 0.45 }}
                />
              </AnimatePresence>
              <span className="pmodal-source">
                <Camera size={13} /> {product.source === 'company' ? 'EL NORAN photograph' : 'Representative image'}
              </span>
            </div>

            <div className="pmodal-body">
              <AnimatePresence mode="wait">
                <motion.div key={product.id} initial={{ opacity: 0, x: 20 }} animate={{ opacity: 1, x: 0 }} exit={{ opacity: 0, x: -20 }} transition={{ duration: 0.3 }}>
                  <span className="pmodal-chip">
                    {product.category === 'frozen' && <Snowflake size={13} />} {cat.label}
                  </span>
                  <h3 id="pmodal-title">{product.name}</h3>
                  <p className="pmodal-desc">{product.description}</p>
                  <p className="pmodal-note">
                    For product specifications, packaging options and availability, please contact our team — we will
                    be happy to discuss your requirements.
                  </p>
                </motion.div>
              </AnimatePresence>

              <div className="pmodal-actions">
                <button className="btn btn-sun" onClick={() => onRequest(product.name)}>
                  <Send size={17} /> Request Information
                </button>
                <div className="pmodal-nav">
                  <button onClick={onPrev} aria-label="Previous product"><ChevronLeft size={20} /></button>
                  <button onClick={onNext} aria-label="Next product"><ChevronRight size={20} /></button>
                </div>
              </div>
            </div>
          </motion.div>
        </motion.div>
      )}
    </AnimatePresence>
  );
}
