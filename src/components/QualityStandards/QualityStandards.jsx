import { CheckCircle2, ClipboardCheck, Leaf, Scale, ShieldCheck, Sprout, Users } from 'lucide-react';
import SectionHead from '../common/SectionHead.jsx';
import Reveal from '../common/Reveal.jsx';
import './QualityStandards.css';

// General descriptions of each standard (not certificate claims).
const standards = [
  {
    id: 'globalgap', name: 'GlobalG.A.P.', mark: 'G.A.P.', icon: Sprout, color: '#4E8A00', grad: 'linear-gradient(135deg, #A5C900, #285900)',
    text: 'A globally recognised farm assurance standard for Good Agricultural Practice, covering food safety, traceability, environmental care and worker welfare at farm level.',
    tags: ['Food safety', 'Traceability', 'Good agricultural practice'],
  },
  {
    id: 'smeta', name: 'SMETA', mark: 'SMETA', icon: Users, color: '#2F7FB0', grad: 'linear-gradient(135deg, #8FD3F0, #2F7FB0)',
    text: 'The Sedex Members Ethical Trade Audit — a widely used ethical audit methodology assessing labour standards, health & safety, the environment and business ethics.',
    tags: ['Ethical trade', 'Labour standards', 'Health & safety'],
  },
  {
    id: 'fairtrade', name: 'Fairtrade', mark: 'FAIR', icon: Scale, color: '#E5821A', grad: 'linear-gradient(135deg, #F5A623, #E84B45)',
    text: 'An international system that promotes fairer trading conditions and sustainable livelihoods for farmers and workers, together with responsible production.',
    tags: ['Fair trading', 'Sustainable livelihoods', 'Responsible sourcing'],
  },
];

const pillars = [
  { icon: ClipboardCheck, title: 'Quality assurance', text: 'Products of prime quality, selected and handled with care.' },
  { icon: ShieldCheck, title: 'Food safety', text: 'Food safety is promoted throughout our operations.' },
  { icon: Leaf, title: 'Sustainability', text: 'Committed to sustainability and environmental protection.' },
  { icon: CheckCircle2, title: 'Responsible production', text: 'Supporting responsible, ethical production practices.' },
];

export default function QualityStandards() {
  return (
    <section id="quality" className="section quality" aria-labelledby="quality-title">
      <span className="quality-watermark" aria-hidden="true">QUALITY</span>
      <div className="container">
        <SectionHead
          center
          id="quality-title"
          eyebrow="Quality & Standards"
          title={<>Quality you can <em>trust</em>, standards that matter.</>}
          lead="All our products are subject to international certification and auditing standards, including GlobalG.A.P., SMETA and Fairtrade — ensuring high quality, food safety and responsible production practices."
        />

        <div className="std-grid">
          {standards.map(({ id, name, mark, icon: Icon, color, grad, text, tags }, i) => (
            <Reveal key={id} className="std-card" delay={i * 0.12} style={{ '--c': color, '--g': grad }}>
              <div className="std-seal" aria-hidden="true">
                <svg viewBox="0 0 120 120" className="std-seal-ring">
                  <defs>
                    <path id={`seal-${id}`} d="M60,60 m-46,0 a46,46 0 1,1 92,0 a46,46 0 1,1 -92,0" />
                  </defs>
                  <text><textPath href={`#seal-${id}`}>{`${name.toUpperCase()} • STANDARD • ${name.toUpperCase()} • STANDARD •`}</textPath></text>
                </svg>
                <span className="std-seal-core">
                  <Icon size={26} />
                  <small>{mark}</small>
                </span>
              </div>
              <h3>{name}</h3>
              <p>{text}</p>
              <ul className="std-tags">
                {tags.map((t) => <li key={t}>{t}</li>)}
              </ul>
            </Reveal>
          ))}
        </div>

        <Reveal className="quality-pillars">
          {pillars.map(({ icon: Icon, title, text }) => (
            <div className="qp" key={title}>
              <span className="qp-icon"><Icon size={22} /></span>
              <div>
                <h4>{title}</h4>
                <p>{text}</p>
              </div>
            </div>
          ))}
        </Reveal>
        <p className="quality-note">
          Standards as listed in the EL NORAN company profile. For documentation relating to a specific product or
          shipment, please contact our team.
        </p>
      </div>
    </section>
  );
}
