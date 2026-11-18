// Generates a static dotted world map SVG + pin coordinates for the Global Presence section.
// Run: node scripts/generate-map.mjs
import DottedMap from 'dotted-map';
import { writeFileSync } from 'node:fs';

const map = new DottedMap({ height: 60, grid: 'diagonal' });
// Approximate geographic centres used only to place region markers (no specific countries are claimed).
const points = {
  egypt: { lat: 30.04, lng: 31.24 },     // Cairo
  europe: { lat: 50.5, lng: 10.5 },
  africa: { lat: 2.0, lng: 21.0 },
  asia: { lat: 33.0, lng: 95.0 },
  arab: { lat: 24.0, lng: 47.0 },
};
const pins = {};
for (const [k, p] of Object.entries(points)) pins[k] = map.getPin(p);
const svg = map.getSVG({ radius: 0.22, color: '#78A900', shape: 'circle', backgroundColor: 'transparent' });
const { width, height } = svg.match(/viewBox="0 0 (?<width>[\d.]+) (?<height>[\d.]+)"/).groups;
writeFileSync('public/images/backgrounds/world-dots.svg', svg);
writeFileSync('src/data/mapPins.json', JSON.stringify({ width: +width, height: +height, pins }, null, 2));
console.log('ok', width, height, pins);
