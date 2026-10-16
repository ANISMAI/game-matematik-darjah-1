export default function MapControls({ pz }) {
  return (
    <div className="map-controls">
      <button className="btn btn-round" onClick={() => pz.zoomBy(0.25)} disabled={!pz.canZoomIn} aria-label="Zum masuk">
        +
      </button>
      <button className="btn btn-round" onClick={() => pz.zoomBy(-0.25)} disabled={!pz.canZoomOut} aria-label="Zum keluar">
        −
      </button>
      <button className="btn btn-light" onClick={pz.resetView}>
        <span aria-hidden="true">🗺️</span> Lihat Semua
      </button>
    </div>
  );
}
