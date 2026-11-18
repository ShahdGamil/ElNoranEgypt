import { useCallback, useEffect, useMemo, useRef, useState } from 'react';
import { AnimatePresence, motion } from 'framer-motion';
import { ChevronLeft, ChevronRight, Expand, Plus, X } from 'lucide-react';
import SectionHead from '../common/SectionHead.jsx';
import Reveal from '../common/Reveal.jsx';
import useLockBody from '../../hooks/useLockBody.js';
import { gallery, galleryTags } from '../../data/gallery.js';
import { asset } from '../../utils/asset.js';
import './Gallery.css';

const PAGE = 12;

export default function Gallery() {
  const [tag, setTag] = useState('All');
  const [limit, setLimit] = useState(PAGE);
  const [index, setIndex] = useState(-1);
  const [dir, setDir] = useState(0);
  const closeRef = useRef(null);

  const items = useMemo(() => (tag === 'All' ? gallery : gallery.filter((g) => g.tag === tag)), [tag]);
  const shown = items.slice(0, limit);
  const open = index >= 0;

  const close = useCallback(() => setIndex(-1), []);
  const go = useCallback((d) => { setDir(d); setIndex((i) => (i + d + items.length) % items.length); }, [items.length]);
  useLockBody(open, close);

  useEffect(() => {
    if (!open) return undefined;
    closeRef.current?.focus();
    const onKey = (e) => { if (e.key === 'ArrowLeft') go(-1); if (e.key === 'ArrowRight') go(1); };
    window.addEventListener('keydown', onKey);
    return () => window.removeEventListener('keydown', onKey);
  }, [open, go]);

  const current = open ? items[index] : null;

  return (
    <section id="gallery" className="section gallery" aria-labelledby="gallery-title">
      <div className="container">
        <div className="gallery-head">
          <SectionHead
            id="gallery-title"
            eyebrow="Our Gallery"
            title={<>Real produce, <em>real</em> shipments.</>}
            lead="Genuine photographs of EL NORAN produce — from carefully packed citrus and strawberries to palletised export preparation."
          />
          <Reveal className="gallery-tags" role="group" aria-label="Filter gallery">
            {galleryTags.map((t) => (
              <button key={t} className={tag === t ? 'active' : ''} aria-pressed={tag === t} onClick={() => { setTag(t); setLimit(PAGE); }}>
                {t}
              </button>
            ))}
          </Reveal>
        </div>

        <motion.div layout className="masonry">
          <AnimatePresence mode="popLayout">
            {shown.map((g, i) => (
              <motion.button
                layout
                key={g.src}
                className="masonry-item"
                onClick={() => { setDir(0); setIndex(i); }}
                aria-label={`Open photo: ${g.caption}`}
                initial={{ opacity: 0, y: 30 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, scale: 0.9 }}
                transition={{ duration: 0.5, delay: (i % PAGE) * 0.03 }}
              >
                <img src={asset(g.src)} alt={g.caption} loading="lazy" decoding="async" width={g.width} height={g.height} />
                <span className="masonry-overlay">
                  <span className="masonry-tag">{g.tag}</span>
                  <span className="masonry-caption">{g.caption}</span>
                  <Expand size={20} className="masonry-icon" />
                </span>
              </motion.button>
            ))}
          </AnimatePresence>
        </motion.div>

        {items.length > limit && (
          <div className="gallery-more">
            <button className="btn btn-outline" onClick={() => setLimit((l) => l + PAGE)}>
              <Plus size={18} /> Show more photos ({items.length - limit})
            </button>
          </div>
        )}
      </div>

      <AnimatePresence>
        {open && current && (
          <motion.div
            className="lightbox"
            role="dialog"
            aria-modal="true"
            aria-label="Photo viewer"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onClick={close}
          >
            <button ref={closeRef} className="lb-btn lb-close" onClick={close} aria-label="Close photo viewer"><X size={24} /></button>
            <button className="lb-btn lb-prev" onClick={(e) => { e.stopPropagation(); go(-1); }} aria-label="Previous photo"><ChevronLeft size={28} /></button>
            <button className="lb-btn lb-next" onClick={(e) => { e.stopPropagation(); go(1); }} aria-label="Next photo"><ChevronRight size={28} /></button>

            <figure className="lb-figure" onClick={(e) => e.stopPropagation()}>
              <AnimatePresence mode="popLayout" initial={false} custom={dir}>
                <motion.img
                  key={current.src}
                  src={asset(current.src)}
                  alt={current.caption}
                  custom={dir}
                  initial={{ opacity: 0, x: dir * 80, scale: 0.96 }}
                  animate={{ opacity: 1, x: 0, scale: 1 }}
                  exit={{ opacity: 0, x: dir * -80, scale: 0.96 }}
                  transition={{ duration: 0.35, ease: [0.22, 1, 0.36, 1] }}
                  drag="x"
                  dragConstraints={{ left: 0, right: 0 }}
                  dragElastic={0.6}
                  onDragEnd={(_, info) => { if (info.offset.x < -70) go(1); else if (info.offset.x > 70) go(-1); }}
                />
              </AnimatePresence>
              <figcaption>
                <span className="lb-count">{index + 1} / {items.length}</span>
                <span>{current.caption}</span>
              </figcaption>
            </figure>
          </motion.div>
        )}
      </AnimatePresence>
    </section>
  );
}
