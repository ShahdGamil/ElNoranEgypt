import { useCallback, useMemo, useState } from 'react';
import { AnimatePresence, LayoutGroup, motion } from 'framer-motion';
import { Apple, Carrot, LayoutGrid, MessageCircle, Snowflake, ArrowRight } from 'lucide-react';
import SectionHead from '../common/SectionHead.jsx';
import Reveal from '../common/Reveal.jsx';
import ProductCard from '../ProductCard/ProductCard.jsx';
import ProductModal from '../ProductModal/ProductModal.jsx';
import { categories, products } from '../../data/products.js';
import { asset } from '../../utils/asset.js';
import './ProductCatalog.css';

const filters = [
  { id: 'all', label: 'All Products', icon: LayoutGrid },
  { id: 'fruits', label: 'Fresh Fruits', icon: Apple },
  { id: 'vegetables', label: 'Fresh Vegetables', icon: Carrot },
  { id: 'frozen', label: 'Frozen Products', icon: Snowflake },
];
const bannerImage = {
  fruits: 'images/backgrounds/orange-tree.webp',
  vegetables: 'images/backgrounds/tractor-field.webp',
  frozen: 'images/backgrounds/frozen-selection.webp',
};
const categoryIcon = { fruits: Apple, vegetables: Carrot, frozen: Snowflake };

export default function ProductCatalog({ onRequest }) {
  const [filter, setFilter] = useState('all');
  const [selectedId, setSelectedId] = useState(null);

  const visible = useMemo(() => (filter === 'all' ? products : products.filter((p) => p.category === filter)), [filter]);
  const shownCategories = filter === 'all' ? categories : categories.filter((c) => c.id === filter);
  const count = (id) => (id === 'all' ? products.length : products.filter((p) => p.category === id).length);

  const selectedIndex = visible.findIndex((p) => p.id === selectedId);
  const close = useCallback(() => setSelectedId(null), []);
  const step = useCallback(
    (dir) => setSelectedId(visible[(selectedIndex + dir + visible.length) % visible.length].id),
    [visible, selectedIndex]
  );

  return (
    <section id="products" className="section catalog" aria-labelledby="products-title">
      <div className="catalog-deco" aria-hidden="true" />
      <div className="container">
        <SectionHead
          center
          id="products-title"
          eyebrow="Our Products"
          title={<>A harvest of <em>colour</em>, fresh &amp; frozen.</>}
          lead={`Explore our complete range of ${products.length} products across fresh fruits, fresh vegetables and frozen fruits & vegetables. Select any product to learn more.`}
        />

        <Reveal className="filters" role="tablist" aria-label="Filter products by category">
          <LayoutGroup id="filters">
            {filters.map(({ id, label, icon: Icon }) => (
              <button
                key={id}
                role="tab"
                aria-selected={filter === id}
                aria-controls="product-grid"
                className={`filter-btn${filter === id ? ' active' : ''}`}
                data-cat={id}
                onClick={() => setFilter(id)}
              >
                {filter === id && <motion.span layoutId="filter-bg" className="filter-bg" transition={{ type: 'spring', stiffness: 400, damping: 34 }} />}
                <Icon size={17} />
                <span>{label}</span>
                <span className="filter-count">{count(id)}</span>
              </button>
            ))}
          </LayoutGroup>
        </Reveal>

        <div id="product-grid" className="catalog-groups" role="tabpanel" aria-live="polite">
          <AnimatePresence mode="popLayout">
            {shownCategories.map((cat) => {
              const Icon = categoryIcon[cat.id];
              const items = visible.filter((p) => p.category === cat.id);
              return (
                <motion.div
                  key={cat.id}
                  className="cat-group"
                  layout
                  initial={{ opacity: 0, y: 40 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, y: -20, transition: { duration: 0.2 } }}
                  transition={{ duration: 0.5, ease: [0.22, 1, 0.36, 1] }}
                  style={{ '--cat': cat.color, '--cat-grad': cat.gradient, '--cat-tint': cat.tint }}
                >
                  <div className="product-grid">
                    <article className={`cat-banner cat-${cat.id}`}>
                      <img src={asset(bannerImage[cat.id])} alt="" loading="lazy" />
                      <div className="cat-banner-body">
                        <span className="cat-banner-icon"><Icon size={22} /></span>
                        <h3>{cat.label}</h3>
                        <p>{cat.tagline}</p>
                        <span className="cat-banner-count">{items.length} products</span>
                      </div>
                    </article>
                    {items.map((p, i) => (
                      <ProductCard key={p.id} product={p} index={i} onOpen={() => setSelectedId(p.id)} />
                    ))}
                  </div>
                </motion.div>
              );
            })}
          </AnimatePresence>
        </div>

        <Reveal className="catalog-cta">
          <div className="catalog-cta-text">
            <h3>Interested in Our Products?</h3>
            <p>Contact our team to discuss your requirements, product selection and export options.</p>
          </div>
          <a href="#contact" className="btn btn-sun">
            <MessageCircle size={18} /> Contact Our Team <ArrowRight size={18} className="arrow" />
          </a>
        </Reveal>
      </div>

      <ProductModal
        product={selectedIndex >= 0 ? visible[selectedIndex] : null}
        onClose={close}
        onPrev={() => step(-1)}
        onNext={() => step(1)}
        onRequest={(name) => { close(); onRequest(name); }}
      />
    </section>
  );
}
