import { useEffect, useState } from 'react';
import { AnimatePresence, motion } from 'framer-motion';
import { Menu, X, MessageCircle } from 'lucide-react';
import useScrolled from '../../hooks/useScrolled.js';
import useActiveSection from '../../hooks/useActiveSection.js';
import useLockBody from '../../hooks/useLockBody.js';
import { asset } from '../../utils/asset.js';
import './Navbar.css';

export const navLinks = [
  { id: 'home', label: 'Home' },
  { id: 'about', label: 'About Us' },
  { id: 'products', label: 'Our Products' },
  { id: 'quality', label: 'Quality & Standards' },
  { id: 'gallery', label: 'Gallery' },
  { id: 'contact', label: 'Contact Us' },
];
const sectionIds = ['home', 'about', 'products', 'why', 'mission', 'quality', 'gallery', 'markets', 'contact'];
// In-between sections highlight the closest nav item
const alias = { why: 'products', mission: 'about', markets: 'gallery' };
const drawerOrigin = 'calc(100% - 40px) 38px';

export default function Navbar() {
  const scrolled = useScrolled(30);
  const current = useActiveSection(sectionIds);
  const active = alias[current] ?? current;
  const [open, setOpen] = useState(false);
  useLockBody(open, () => setOpen(false));

  useEffect(() => {
    const onResize = () => window.innerWidth > 1080 && setOpen(false);
    window.addEventListener('resize', onResize);
    return () => window.removeEventListener('resize', onResize);
  }, []);

  return (
    <header className={`nav${scrolled ? ' is-scrolled' : ''}${open ? ' is-open' : ''}`}>
      <nav className="nav-inner container" aria-label="Main navigation">
        <a href="#home" className="nav-brand" aria-label="EL NORAN — back to top">
          <img src={asset('images/logo/elnoran-logo.png')} alt="" width="38" height="46" />
          <span className="nav-brand-text">
            <strong>EL NORAN</strong>
            <small>For Trade &amp; Export</small>
          </span>
        </a>

        <ul className="nav-links">
          {navLinks.map((l) => (
            <li key={l.id}>
              <a href={`#${l.id}`} className={active === l.id ? 'active' : ''} aria-current={active === l.id ? 'true' : undefined}>
                {active === l.id && (
                  <motion.span layoutId="nav-pill" className="nav-pill" transition={{ type: 'spring', stiffness: 380, damping: 32 }} />
                )}
                <span className="nav-label">{l.label}</span>
              </a>
            </li>
          ))}
        </ul>

        <a href="#contact" className="btn btn-sun nav-cta">
          <MessageCircle size={18} /> Get a Quote
        </a>

        <button
          className="nav-toggle"
          aria-label={open ? 'Close menu' : 'Open menu'}
          aria-expanded={open}
          aria-controls="mobile-menu"
          onClick={() => setOpen((o) => !o)}
        >
          {open ? <X size={24} /> : <Menu size={24} />}
        </button>
      </nav>

      <AnimatePresence>
        {open && (
          <motion.div
            id="mobile-menu"
            className="nav-drawer"
            initial={{ clipPath: `circle(0% at ${drawerOrigin})` }}
            animate={{ clipPath: `circle(150% at ${drawerOrigin})` }}
            exit={{ clipPath: `circle(0% at ${drawerOrigin})` }}
            transition={{ duration: 0.6, ease: [0.76, 0, 0.24, 1] }}
          >
            <ul>
              {navLinks.map((l, i) => (
                <motion.li key={l.id} initial={{ opacity: 0, x: 40 }} animate={{ opacity: 1, x: 0 }} transition={{ delay: 0.15 + i * 0.06 }}>
                  <a href={`#${l.id}`} className={active === l.id ? 'active' : ''} onClick={() => setOpen(false)}>
                    <span className="num">0{i + 1}</span>
                    {l.label}
                  </a>
                </motion.li>
              ))}
            </ul>
            <motion.a
              href="#contact"
              className="btn btn-sun"
              onClick={() => setOpen(false)}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.6 }}
            >
              <MessageCircle size={18} /> Get a Quote
            </motion.a>
          </motion.div>
        )}
      </AnimatePresence>
    </header>
  );
}
