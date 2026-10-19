const Icon = ({ d }) => (
  <svg width="20" height="20" viewBox="0 0 24 24" aria-hidden="true" fill="none" stroke="currentColor" strokeWidth="2.4" strokeLinecap="round" strokeLinejoin="round">
    <path d={d} />
  </svg>
);

export default function MapControls({ pz }) {
  return (
    <div className="map-controls glass-stack" role="group" aria-label="Kawalan peta">
      <button className="glass-btn" onClick={() => pz.zoomBy(0.25)} disabled={!pz.canZoomIn} aria-label="Zum masuk" title="Zum masuk">
        <Icon d="M12 5v14M5 12h14" />
      </button>
      <button className="glass-btn" onClick={() => pz.zoomBy(-0.25)} disabled={!pz.canZoomOut} aria-label="Zum keluar" title="Zum keluar">
        <Icon d="M5 12h14" />
      </button>
      <span className="glass-divider" aria-hidden="true" />
      <button className="glass-btn" onClick={pz.resetView} aria-label="Lihat semua" title="Lihat semua">
        <Icon d="M4 9V4h5M20 9V4h-5M4 15v5h5M20 15v5h-5" />
      </button>
    </div>
  );
}
