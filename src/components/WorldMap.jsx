import { useState } from 'react';
import { REGIONS } from '../data/topics.js';
import { completedInRegion } from '../lib/storage.js';
import { usePanZoom } from '../lib/usePanZoom.js';
import { blobPath, Cloud, Landmark, Tree, Bamboo } from './Art.jsx';
import { NinjaMarker } from './NinjaCharacter.jsx';
import MapControls from './MapControls.jsx';

const W = 1200;
const H = 840;
const RX = 168;
const RY = 116;

function activate(e, fn) {
  if (e.key === 'Enter' || e.key === ' ') {
    e.preventDefault();
    fn();
  }
}

function RegionShape({ region, index, done, selected, hover, onHover, onOpen }) {
  const { cx, cy } = region.map;
  const d = blobPath(cx, cy, RX, RY, index + 3, 11, 0.09);
  const open = () => region.available && onOpen(region.id);
  return (
    <g
      className={`region${selected ? ' is-selected' : ''}${hover ? ' is-hover' : ''}${region.available ? '' : ' is-locked'}`}
      role="button"
      tabIndex={0}
      aria-label={`${region.topic}, ${region.name}${done ? `, ${done} aktiviti selesai` : ''}`}
      onClick={open}
      onKeyDown={(e) => activate(e, open)}
      onMouseEnter={() => onHover(region.id)}
      onMouseLeave={() => onHover(null)}
      onFocus={() => onHover(region.id)}
      onBlur={() => onHover(null)}
    >
      <g className="region-lift">
        <path d={d} transform="translate(0 24)" fill="#8a5a33" />
        <path d={d} transform="translate(0 12)" fill="#b07a45" />
        <path className="region-top" d={d} fill={region.color} stroke={region.edge} strokeWidth="5" />
        <path className="region-focus" d={d} fill="none" />
        <g transform={`translate(${cx} ${cy - 22})`}>
          <Landmark type={region.landmark} />
        </g>
      </g>
    </g>
  );
}

// Label dilukis dalam lapisan atas supaya tidak ditutup oleh kawasan jiran.
function RegionLabel({ region, done, hover, onHover, onOpen }) {
  const { cx, cy } = region.map;
  const labelW = Math.max(region.topic.length * 14 + 44, 170);
  return (
    <g
      className={`region-label-wrap${hover ? ' is-hover' : ''}`}
      aria-hidden="true"
      onClick={() => region.available && onOpen(region.id)}
      onMouseEnter={() => onHover(region.id)}
      onMouseLeave={() => onHover(null)}
    >
      <g className="region-lift">
        <g transform={`translate(${cx} ${cy + 50})`}>
          <rect x={-labelW / 2} y="0" width={labelW} height="58" rx="18" fill="#fffdf6" stroke="#3b2a1a" strokeWidth="3" />
          <text x="0" y="29" textAnchor="middle" className="label-topic">
            {region.topic}
          </text>
          <text x="0" y="48" textAnchor="middle" className="label-name">
            {region.name}
          </text>
          {done > 0 && (
            <g transform={`translate(${labelW / 2 - 4} 2)`}>
              <circle r="15" fill="#2a9d8f" stroke="#fff" strokeWidth="3" />
              <path d="M-6 0 l4 5 l8 -10" stroke="#fff" strokeWidth="3.5" fill="none" strokeLinecap="round" strokeLinejoin="round" />
            </g>
          )}
        </g>
      </g>
    </g>
  );
}

export default function WorldMap({ progress, onOpenRegion, onContinue }) {
  const pz = usePanZoom({ aspect: W / H });
  const [hover, setHover] = useState(null);
  const hasMission = Boolean(progress.lastMission);
  const ordered = [...REGIONS].map((r, i) => ({ r, i })).sort((a, b) => a.r.map.cy - b.r.map.cy);
  const sel = REGIONS.find((r) => r.id === progress.lastRegion);

  return (
    <main className="screen world-screen">
      <div className="map-bar">
        <h2 className="map-heading">Pilih kawasan pengembaraan!</h2>
        <button className="btn btn-primary btn-cta" onClick={onContinue}>
          <span aria-hidden="true">▶</span> {hasMission ? 'Sambung Misi' : 'Mula Pengembaraan'}
        </button>
      </div>

      <div className="map-scroll" ref={pz.ref} {...pz.handlers}>
        <svg className="map-svg" viewBox={`0 0 ${W} ${H}`} style={{ width: pz.width }} role="group" aria-label="Peta Pulau Ninja">
          {/* pulau asas */}
          <path d={blobPath(590, 450, 540, 360, 7, 14, 0.06)} fill="#ffffff" opacity=".35" className="surf" />
          <path d={blobPath(590, 450, 505, 340, 7, 14, 0.06)} transform="translate(0 26)" fill="#8a5a33" />
          <path d={blobPath(590, 450, 505, 340, 7, 14, 0.06)} fill="#f3d99b" stroke="#d6b26a" strokeWidth="5" />

          {/* laluan berliku */}
          <path
            d="M330 300 C420 330 520 260 610 270 S800 320 885 300 M610 270 C600 340 590 380 585 430 M330 300 C300 360 260 400 250 450 M585 470 C700 470 820 470 925 470 M250 470 C300 560 360 600 400 650 M585 470 C640 560 720 600 785 650 M400 690 C520 720 660 720 785 690"
            stroke="#fff3cf"
            strokeWidth="14"
            strokeDasharray="2 20"
            strokeLinecap="round"
            fill="none"
            opacity=".9"
          />

          {/* hiasan pantai */}
          <Tree x={110} y={470} s={0.9} />
          <Tree x={1070} y={380} s={0.9} />
          <Bamboo x={1080} y={600} h={70} />
          <Bamboo x={1095} y={610} h={56} />
          <Tree x={590} y={805} s={0.8} />

          {ordered.map(({ r, i }) => (
            <RegionShape
              key={r.id}
              region={r}
              index={i}
              done={completedInRegion(progress, r)}
              selected={progress.lastRegion === r.id}
              hover={hover === r.id}
              onHover={setHover}
              onOpen={onOpenRegion}
            />
          ))}
          {ordered.map(({ r }) => (
            <RegionLabel
              key={r.id}
              region={r}
              done={completedInRegion(progress, r)}
              hover={hover === r.id}
              onHover={setHover}
              onOpen={onOpenRegion}
            />
          ))}

          {sel && <NinjaMarker x={sel.map.cx + 112} y={sel.map.cy + 6} scale={0.5} />}

          {/* skrol nama pulau */}
          <g transform="translate(1040 90)" aria-hidden="true">
            <rect x="-90" y="-36" width="180" height="72" rx="8" fill="#fdf0d5" stroke="#3b2a1a" strokeWidth="3" />
            <rect x="-100" y="-44" width="14" height="88" rx="7" fill="#c1121f" stroke="#3b2a1a" strokeWidth="3" />
            <rect x="86" y="-44" width="14" height="88" rx="7" fill="#c1121f" stroke="#3b2a1a" strokeWidth="3" />
            <text x="0" y="-4" textAnchor="middle" className="scroll-title">Pulau</text>
            <text x="0" y="24" textAnchor="middle" className="scroll-title">Ninja</text>
          </g>

          <Cloud x={120} y={90} s={1.1} className="drift-a" />
          <Cloud x={760} y={60} s={0.9} className="drift-b" />
          <Cloud x={1110} y={760} s={1.2} className="drift-a" />
          <Cloud x={90} y={770} s={0.8} className="drift-b" />
        </svg>
      </div>

      <MapControls pz={pz} />
    </main>
  );
}
