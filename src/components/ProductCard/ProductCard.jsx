import { motion } from 'framer-motion';
import { Eye, Snowflake } from 'lucide-react';
import { categoryById } from '../../data/products.js';
import { asset } from '../../utils/asset.js';
import './ProductCard.css';

export default function ProductCard({ product, index, onOpen }) {
  const cat = categoryById[product.category];
  const frozen = product.category === 'frozen';

  // Subtle 3D tilt on pointer move (desktop only)
  const onMove = (e) => {
    if (e.pointerType !== 'mouse') return;
    const el = e.currentTarget;
    const r = el.getBoundingClientRect();
    el.style.setProperty('--rx', `${((e.clientY - r.top) / r.height - 0.5) * -6}deg`);
    el.style.setProperty('--ry', `${((e.clientX - r.left) / r.width - 0.5) * 8}deg`);
  };
  const onLeave = (e) => { e.currentTarget.style.setProperty('--rx', '0deg'); e.currentTarget.style.setProperty('--ry', '0deg'); };

  return (
    <motion.article
      layout
      className={`pcard${frozen ? ' is-frozen' : ''}`}
      style={{ '--accent': product.accent, '--cat': cat.color }}
      initial={{ opacity: 0, y: 30, scale: 0.96 }}
      whileInView={{ opacity: 1, y: 0, scale: 1 }}
      viewport={{ once: true, amount: 0.15 }}
      transition={{ duration: 0.55, delay: (index % 4) * 0.06, ease: [0.22, 1, 0.36, 1] }}
      onPointerMove={onMove}
      onPointerLeave={onLeave}
    >
      <button className="pcard-hit" onClick={onOpen} aria-label={`View details for ${product.name}`} />
      <div className="pcard-media">
        <img src={asset(product.image)} alt={product.name} loading="lazy" decoding="async" width="600" height="450" />
        {frozen && <span className="pcard-frost" aria-hidden="true" />}
        <span className="pcard-chip">
          {frozen && <Snowflake size={12} />} {cat.short}
        </span>
      </div>
      <div className="pcard-body">
        <h3>{product.name}</h3>
        <span className="pcard-more"><Eye size={16} /> View details</span>
      </div>
      <span className="pcard-glow" aria-hidden="true" />
    </motion.article>
  );
}
