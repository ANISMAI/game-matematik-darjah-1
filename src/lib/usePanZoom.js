import { useCallback, useEffect, useLayoutEffect, useRef, useState } from 'react';

// Muat peta dalam bekas; pada skrin kecil kekalkan saiz minimum dan benarkan geseran (pan).
export function usePanZoom({ aspect, minWidth = 880, maxZoom = 2 }) {
  const ref = useRef(null);
  const [box, setBox] = useState({ w: 1200, h: 800 });
  const [zoom, setZoom] = useState(1);
  const drag = useRef(null);

  useLayoutEffect(() => {
    const el = ref.current;
    if (!el) return;
    const measure = () => setBox({ w: el.clientWidth, h: el.clientHeight });
    measure();
    const ro = new ResizeObserver(measure);
    ro.observe(el);
    return () => ro.disconnect();
  }, []);

  const base = Math.max(Math.min(box.w, box.h * aspect), Math.min(minWidth, box.w * 2));
  const width = Math.round(base * zoom);

  const center = useCallback(() => {
    const el = ref.current;
    if (!el) return;
    el.scrollLeft = (el.scrollWidth - el.clientWidth) / 2;
    el.scrollTop = (el.scrollHeight - el.clientHeight) / 2;
  }, []);

  useEffect(() => {
    requestAnimationFrame(center);
  }, [width, center]);

  const resetView = useCallback(() => {
    setZoom(1);
    requestAnimationFrame(center);
  }, [center]);

  const zoomBy = (d) => setZoom((z) => Math.min(maxZoom, Math.max(1, +(z + d).toFixed(2))));

  // Geseran dengan tetikus (sentuhan sudah ditatal secara asli)
  const handlers = {
    onPointerDown: (e) => {
      if (e.pointerType !== 'mouse') return;
      drag.current = { x: e.clientX, y: e.clientY, moved: false };
    },
    onPointerMove: (e) => {
      const d = drag.current;
      if (!d || !(e.buttons & 1)) return;
      const dx = e.clientX - d.x;
      const dy = e.clientY - d.y;
      if (!d.moved && Math.hypot(dx, dy) < 6) return;
      d.moved = true;
      ref.current.scrollLeft -= dx;
      ref.current.scrollTop -= dy;
      d.x = e.clientX;
      d.y = e.clientY;
    },
    onPointerUp: () => {
      setTimeout(() => (drag.current = null), 0);
    },
    onClickCapture: (e) => {
      if (drag.current?.moved) {
        e.stopPropagation();
        e.preventDefault();
      }
    },
  };

  return { ref, width, zoom, zoomBy, resetView, handlers, canZoomIn: zoom < maxZoom, canZoomOut: zoom > 1 };
}
