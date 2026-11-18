import { motion, useScroll, useTransform } from 'framer-motion';
import { useRef } from 'react';
import { Eye, Target } from 'lucide-react';
import Reveal from '../common/Reveal.jsx';
import { asset } from '../../utils/asset.js';
import './MissionVision.css';

export default function MissionVision() {
  const ref = useRef(null);
  const { scrollYProgress } = useScroll({ target: ref, offset: ['start end', 'end start'] });
  const imgY = useTransform(scrollYProgress, [0, 1], ['-8%', '8%']);

  return (
    <section id="mission" className="mv" ref={ref} aria-label="Our vision and mission">
      <div className="mv-panel mv-vision">
        <motion.div className="mv-bg" style={{ y: imgY }} aria-hidden="true">
          <img src={asset('images/backgrounds/orange-orchard.webp')} alt="" loading="lazy" />
        </motion.div>
        <div className="mv-content">
          <Reveal>
            <span className="mv-label"><Eye size={18} /> Company Vision</span>
            <h2 className="mv-title">Continuous strive<br />for <em>growth</em>.</h2>
          </Reveal>
          <Reveal delay={0.15}>
            <p className="mv-text">
              EL NORAN aspires to become one of the most reliable and trusted producers and exporters in Egypt&rsquo;s
              fresh produce industry by providing high-quality products, maintaining international quality standards,
              and promoting food safety, sustainability, and environmental protection.
            </p>
          </Reveal>
        </div>
        <span className="mv-ring r1" aria-hidden="true" />
      </div>

      <div className="mv-panel mv-mission">
        <motion.div className="mv-bg" style={{ y: imgY }} aria-hidden="true">
          <img src={asset('images/gallery/gallery-06.webp')} alt="" loading="lazy" />
        </motion.div>
        <div className="mv-content">
          <Reveal>
            <span className="mv-label"><Target size={18} /> Company Mission</span>
            <h2 className="mv-title">Exceeding customer &amp; consumer <em>expectations</em>.</h2>
          </Reveal>
          <Reveal delay={0.15}>
            <p className="mv-text">
              In a highly professional manner, EL NORAN always offers top-quality products and services that exceed
              customers&rsquo; expectations. Customer focus, quality assurance, and sustainability are integral parts of
              our business.
            </p>
          </Reveal>
          <Reveal delay={0.25} className="mv-pillars">
            <span>Customer focus</span>
            <span>Quality assurance</span>
            <span>Sustainability</span>
          </Reveal>
        </div>
        <span className="mv-ring r2" aria-hidden="true" />
      </div>
    </section>
  );
}
