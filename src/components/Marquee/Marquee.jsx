import { products, categoryById } from '../../data/products.js';
import './Marquee.css';

/** Infinite ticker of every product in the catalogue. */
export default function Marquee() {
  const items = [...products, ...products];
  return (
    <div className="marquee" aria-label="Product range">
      <div className="marquee-track">
        {items.map((p, i) => (
          <span className="marquee-item" key={`${p.id}-${i}`} aria-hidden={i >= products.length}>
            <span className="marquee-dot" style={{ background: categoryById[p.category].gradient }} />
            {p.name}
          </span>
        ))}
      </div>
    </div>
  );
}
