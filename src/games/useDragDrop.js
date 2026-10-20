import { useRef, useState } from 'react';

const MOVE_THRESHOLD = 8; // unit viewBox sebelum tekan dikira sebagai seret

export function activate(e, fn) {
  if (e.key === 'Enter' || e.key === ' ') {
    e.preventDefault();
    fn();
  }
}

// Seret-dan-letak untuk pentas SVG yang berskala.
// - Pointer events + pointer capture (sentuh, pen, tetikus), koordinat ditukar ke viewBox SVG.
// - Ketik objek tanpa seret = onPick(id); papan kekunci Enter/Space juga onPick(id).
// - Lepas di atas sasaran = onDrop(id, target); lepas di luar sasaran tidak mengubah apa-apa (objek kembali).
// hitTest(x, y, id) memulangkan id sasaran pada titik viewBox itu, atau null.
export function useDragDrop({ disabled, hitTest, onDrop, onPick }) {
  const svgRef = useRef(null);
  const live = useRef(null);
  const [drag, setDrag] = useState(null); // { id, dx, dy, over }

  const toSvg = (e) => {
    const svg = svgRef.current;
    const m = svg?.getScreenCTM();
    if (!m) return { x: 0, y: 0 };
    const p = new DOMPoint(e.clientX, e.clientY).matrixTransform(m.inverse());
    return { x: p.x, y: p.y };
  };

  const end = () => {
    live.current = null;
    setDrag(null);
  };

  const bindItem = (id, label, { inactive = false, selected = false } = {}) => {
    const off = disabled || inactive;
    return {
      role: 'button',
      tabIndex: off ? -1 : 0,
      'aria-label': label,
      'aria-pressed': off ? undefined : selected,
      'aria-disabled': off || undefined,
      'data-drag': off ? undefined : 'item',
      onPointerDown(e) {
        if (off || (e.pointerType === 'mouse' && e.button !== 0)) return;
        try {
          e.currentTarget.setPointerCapture(e.pointerId);
        } catch {
          // sesetengah pelayar tidak menyokong tangkapan pada SVG; seret masih berfungsi dalam elemen
        }
        const p = toSvg(e);
        live.current = { id, pointer: e.pointerId, x0: p.x, y0: p.y, moved: false };
      },
      onPointerMove(e) {
        const s = live.current;
        if (!s || s.id !== id || s.pointer !== e.pointerId) return;
        const p = toSvg(e);
        const dx = p.x - s.x0;
        const dy = p.y - s.y0;
        if (!s.moved && Math.hypot(dx, dy) < MOVE_THRESHOLD) return;
        s.moved = true;
        setDrag({ id, dx, dy, over: hitTest(p.x, p.y, id) });
      },
      onPointerUp(e) {
        const s = live.current;
        if (!s || s.id !== id || s.pointer !== e.pointerId) return;
        end();
        if (!s.moved) {
          onPick(id);
          return;
        }
        const p = toSvg(e);
        const target = hitTest(p.x, p.y, id);
        if (target) onDrop(id, target);
      },
      onPointerCancel: end,
      onKeyDown(e) {
        if (!off) activate(e, () => onPick(id));
      },
      onClick(e) {
        // klik maya daripada pembaca skrin (detail 0); klik tetikus/sentuh sudah dikendalikan oleh pointerup
        if (!off && e.detail === 0) onPick(id);
      },
    };
  };

  // Sasaran: boleh diketik/ditekan selepas objek dipilih.
  const bindTarget = (label, fn, { inactive = false } = {}) => {
    const off = disabled || inactive;
    return {
      role: 'button',
      tabIndex: off ? -1 : 0,
      'aria-label': label,
      'aria-disabled': off || undefined,
      onClick: off ? undefined : fn,
      onKeyDown: off ? undefined : (e) => activate(e, fn),
    };
  };

  return { svgRef, drag, bindItem, bindTarget };
}

export const inRect = (x, y, r) => x >= r.x && x <= r.x + r.w && y >= r.y && y <= r.y + r.h;
