import Reveal from './Reveal.jsx';

export default function SectionHead({ eyebrow, title, lead, center = false, light = false, id }) {
  return (
    <Reveal className={`section-head${center ? ' center' : ''}${light ? ' light' : ''}`}>
      <span className="eyebrow">{eyebrow}</span>
      <h2 className="title" id={id}>{title}</h2>
      {lead && <p className="lead">{lead}</p>}
    </Reveal>
  );
}
