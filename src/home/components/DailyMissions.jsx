// Misi Harian Ninja — skrin penuh "papan skrol ninja" (reka bentuk semula UI sahaja).
// Logik misi, kiraan, tuntutan, peti bonus & set semula harian kekal dalam lib/daily.js (sumber kebenaran tunggal).
import { useEffect, useRef, useState } from 'react';
import { BookOpen, Check, ChevronLeft, ChevronRight, Clock, Gem, Lock, PencilLine, Star, Trophy } from 'lucide-react';
import { DAILY_CHEST, DAILY_MISSIONS, claimChest, claimMission, loadDaily, missionProgress, missionState, secondsToReset } from '../../lib/daily.js';
import { playSound } from '../../lib/sound.js';
import './daily-missions.css';

const ICONS = { book: BookOpen, pencil: PencilLine, star: Star, trophy: Trophy };
const Coin = () => <i className="dm-coin" aria-hidden="true" />;
const GemIcon = () => <Gem className="dm-gem" aria-hidden="true" />;
function MissionIcon({ name }) {
  const Ico = ICONS[name] ?? Star;
  return <Ico />;
}
/** Tempoh animasi tutup: kandungan pudar → gulung ke tengah → ikat tali + cop lilin → hilang. */
const CLOSE_MS = 1530;

/** Tali + cop lilin yang mengikat dua gulungan bila skrol ditutup. */
function WaxSeal() {
  return (
    <svg className="dm-seal" viewBox="0 0 140 90" aria-hidden="true">
      <defs>
        <radialGradient id="dm-wax" cx="40%" cy="35%" r="70%">
          <stop offset="0" stopColor="#c0392b" />
          <stop offset=".55" stopColor="#8e1b22" />
          <stop offset="1" stopColor="#5a0d14" />
        </radialGradient>
      </defs>
      {/* tali berpintal melilit kedua-dua gulungan */}
      <g fill="none" strokeLinecap="round">
        <path d="M4 38 Q70 30 136 38" stroke="#8a6a38" strokeWidth="5" />
        <path d="M4 38 Q70 30 136 38" stroke="#e2c98f" strokeWidth="3" strokeDasharray="4 3" />
        <path d="M4 50 Q70 58 136 50" stroke="#8a6a38" strokeWidth="5" />
        <path d="M4 50 Q70 58 136 50" stroke="#e2c98f" strokeWidth="3" strokeDasharray="4 3" />
        <path d="M78 52 Q86 70 80 86 M84 50 Q98 64 100 80" stroke="#8a6a38" strokeWidth="4" />
        <path d="M78 52 Q86 70 80 86 M84 50 Q98 64 100 80" stroke="#e2c98f" strokeWidth="2.2" strokeDasharray="3 3" />
      </g>
      {/* cop lilin */}
      <path
        d="M70 22c8-3 14 2 18 7 7 0 10 6 8 12 4 6 1 13-5 15-2 7-9 10-16 7-6 4-14 2-17-4-7-1-10-8-7-14-4-6-1-13 5-15 1-6 7-9 14-8z"
        fill="url(#dm-wax)"
        stroke="#4a0a10"
        strokeWidth="2"
      />
      <circle cx="70" cy="44" r="12" fill="none" stroke="#5a0d14" strokeWidth="2.5" opacity=".7" />
      <path d="M70 35l2.6 6.4L79 44l-6.4 2.6L70 53l-2.6-6.4L61 44l6.4-2.6z" fill="#5a0d14" opacity=".75" />
      <ellipse cx="63" cy="31" rx="6" ry="3" fill="#fff" opacity=".22" transform="rotate(-25 63 31)" />
    </svg>
  );
}

const hms =(s) => [Math.floor(s / 3600), Math.floor((s % 3600) / 60), s % 60].map((v) => String(v).padStart(2, '0')).join(':');

/** Label status kad (Belum Mula / Sedang Berjalan / Selesai / Sudah Dituntut). */
function statusOf(daily, m) {
  const st = missionState(daily, m);
  if (st === 'claimed') return { st, label: 'Sudah Dituntut' };
  if (st === 'ready') return { st, label: 'Selesai!' };
  return { st, label: missionProgress(daily, m) > 0 ? 'Sedang Berjalan' : 'Belum Mula' };
}

/** Peti harta (SVG) — penutup boleh terbuka: locked → ready → claimed. */
function Chest({ state }) {
  return (
    <svg className={`dm-chest-svg ${state}`} viewBox="0 0 140 120" aria-hidden="true">
      <ellipse cx="70" cy="110" rx="52" ry="7" fill="rgba(38,50,77,.25)" />
      {state === 'claimed' && (
        <g className="dm-chest-glow">
          <ellipse cx="70" cy="58" rx="40" ry="14" fill="#ffe38a" />
          <circle cx="56" cy="56" r="7" fill="#ffd24d" stroke="#a35d00" strokeWidth="2.5" />
          <circle cx="72" cy="52" r="7" fill="#ffd24d" stroke="#a35d00" strokeWidth="2.5" />
          <circle cx="86" cy="57" r="7" fill="#ffd24d" stroke="#a35d00" strokeWidth="2.5" />
          <path d="M66 40l6-8 6 8-6 9z" fill="#8fd3ff" stroke="#1f7fd6" strokeWidth="2.5" strokeLinejoin="round" />
        </g>
      )}
      {/* badan */}
      <rect x="18" y="58" width="104" height="48" rx="8" fill="#a8622c" stroke="#26324d" strokeWidth="5" />
      <rect x="18" y="58" width="104" height="12" fill="#7a4420" />
      <rect x="34" y="58" width="12" height="48" fill="#f0b43a" stroke="#26324d" strokeWidth="3" />
      <rect x="94" y="58" width="12" height="48" fill="#f0b43a" stroke="#26324d" strokeWidth="3" />
      <rect x="18" y="58" width="104" height="48" rx="8" fill="none" stroke="#26324d" strokeWidth="5" />
      {/* kunci / selak */}
      <rect x="60" y="62" width="20" height="22" rx="4" fill="#ffd24d" stroke="#26324d" strokeWidth="3.5" />
      <circle cx="70" cy="71" r="3" fill="#26324d" />
      {/* penutup */}
      <g className="dm-lid">
        <path d="M18 60 V44 Q18 22 70 22 Q122 22 122 44 V60 Z" fill="#c4783a" stroke="#26324d" strokeWidth="5" strokeLinejoin="round" />
        <path d="M34 60 V30 M106 60 V30" stroke="#f0b43a" strokeWidth="10" />
        <path d="M34 60 V30 M106 60 V30" stroke="#26324d" strokeWidth="3" strokeDasharray="0 0" opacity=".25" />
        <path d="M26 40 Q70 28 114 40" stroke="#fff" strokeWidth="4" strokeLinecap="round" opacity=".3" fill="none" />
      </g>
      {state === 'locked' && (
        <g className="dm-padlock">
          <path d="M60 78 v-8 a10 10 0 0 1 20 0 v8" fill="none" stroke="#26324d" strokeWidth="5" />
          <rect x="55" y="76" width="30" height="24" rx="5" fill="#9aa6bd" stroke="#26324d" strokeWidth="4" />
          <circle cx="70" cy="87" r="3.5" fill="#26324d" />
        </g>
      )}
    </svg>
  );
}

export default function DailyMissions({ open, onClose, onGo, onReward, sound }) {
  const [daily, setDaily] = useState(loadDaily);
  const [left, setLeft] = useState(secondsToReset);
  const [pop, setPop] = useState(null); // { id, coins, gems? }
  const [chestAnim, setChestAnim] = useState(false);
  const [closing, setClosing] = useState(false);
  const rootRef = useRef(null);
  const closingRef = useRef(false);
  const timerRef = useRef(0);

  /** Tutup dengan animasi gulung skrol (terus jika pengguna minta kurang gerakan). */
  const requestClose = () => {
    if (closingRef.current) return;
    if (window.matchMedia?.('(prefers-reduced-motion: reduce)').matches) {
      onClose();
      return;
    }
    // ukur saiz sekarang supaya skrol boleh menggulung dari lebar penuh → dua gulungan rapat di tengah
    const board = rootRef.current?.querySelector('.dm-board');
    const rod = board?.querySelector('.dm-rod');
    if (board && rod) {
      const r = board.getBoundingClientRect();
      board.style.setProperty('--w0', `${r.width}px`);
      board.style.setProperty('--h0', `${r.height}px`);
      board.style.setProperty('--w1', `${rod.getBoundingClientRect().width * 2}px`);
    }
    closingRef.current = true;
    setClosing(true);
    timerRef.current = window.setTimeout(() => {
      closingRef.current = false;
      setClosing(false);
      onClose();
    }, CLOSE_MS);
  };
  const closeFnRef = useRef(requestClose);
  closeFnRef.current = requestClose;

  useEffect(() => {
    if (!open) return undefined;
    const opener = document.activeElement; // fokus kembali ke butang Misi bila ditutup
    setDaily(loadDaily());
    setLeft(secondsToReset());
    closingRef.current = false;
    setClosing(false);
    rootRef.current?.focus();
    const prevOverflow = document.body.style.overflow;
    document.body.style.overflow = 'hidden';
    const id = setInterval(() => {
      setLeft(secondsToReset());
      setDaily((d) => (d.date !== loadDaily().date ? loadDaily() : d)); // hari baharu semasa terbuka
    }, 1000);
    const esc = (e) => e.key === 'Escape' && closeFnRef.current();
    window.addEventListener('keydown', esc);
    return () => {
      clearInterval(id);
      clearTimeout(timerRef.current);
      window.removeEventListener('keydown', esc);
      document.body.style.overflow = prevOverflow;
      if (opener instanceof HTMLElement) opener.focus();
    };
  }, [open, onClose]);

  /* ── karusel misi (bila lebih 3 misi): tatal kiri/kanan ── */
  const trackRef = useRef(null);
  const [nav, setNav] = useState({ prev: false, next: false, active: 0, pages: 1 });
  const syncNav = () => {
    const t = trackRef.current;
    if (!t) return;
    const cards = [...t.children];
    if (!cards.length) return;
    const step = cards.length > 1 ? cards[1].offsetLeft - cards[0].offsetLeft : cards[0].offsetWidth;
    const visible = Math.max(1, Math.round((t.clientWidth + 1) / step));
    const pages = Math.max(1, cards.length - visible + 1);
    const active = Math.min(pages - 1, Math.max(0, Math.round(t.scrollLeft / step)));
    const max = t.scrollWidth - t.clientWidth;
    setNav((n) => {
      const next = { prev: t.scrollLeft > 2, next: t.scrollLeft < max - 2, active, pages };
      return n.prev === next.prev && n.next === next.next && n.active === next.active && n.pages === next.pages ? n : next;
    });
  };
  const scrollToCard = (i, smooth = true) => {
    const t = trackRef.current;
    const card = t?.children[Math.max(0, Math.min(i, t.children.length - 1))];
    if (!card) return;
    const reduce = window.matchMedia?.('(prefers-reduced-motion: reduce)').matches;
    t.scrollTo({ left: card.offsetLeft - t.children[0].offsetLeft, behavior: smooth && !reduce ? 'smooth' : 'auto' });
  };
  useEffect(() => {
    if (!open) return undefined;
    const raf = requestAnimationFrame(() => {
      // tunjuk misi pertama yang sedia dituntut jika ia di luar pandangan
      const d = loadDaily();
      const i = DAILY_MISSIONS.findIndex((m) => missionState(d, m) === 'ready');
      if (i > 0) scrollToCard(i, false);
      syncNav();
    });
    window.addEventListener('resize', syncNav);
    return () => {
      cancelAnimationFrame(raf);
      window.removeEventListener('resize', syncNav);
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [open]);

  if (!open) return null;
  const total = DAILY_MISSIONS.length;
  const carousel = total > 3;
  const doneN = DAILY_MISSIONS.filter((m) => missionState(daily, m) !== 'todo').length;
  const claimedN = DAILY_MISSIONS.filter((m) => daily.claimed[m.id]).length;
  const allClaimed = claimedN === total;
  const chestState = daily.chest ? 'claimed' : allClaimed ? 'ready' : 'locked';
  const coinsTotal = DAILY_MISSIONS.reduce((n, m) => n + m.coins, 0) + DAILY_CHEST.coins;
  const coinsGot = DAILY_MISSIONS.reduce((n, m) => n + (daily.claimed[m.id] ? m.coins : 0), 0) + (daily.chest ? DAILY_CHEST.coins : 0);

  const claim = (m) => {
    const coins = claimMission(m.id); // disimpan dahulu; maklum balas hanya jika berjaya
    if (!coins) return;
    onReward?.({ coins });
    playSound('correct', sound);
    setPop({ id: m.id, coins });
    setDaily(loadDaily());
  };
  const openChest = () => {
    const r = claimChest();
    if (!r) return;
    onReward?.(r);
    playSound('done', sound);
    setChestAnim(true);
    setPop({ id: 'chest', coins: r.coins, gems: r.gems });
    setDaily(loadDaily());
  };

  return (
    <div
      ref={rootRef}
      tabIndex={-1}
      className={`dm-screen ${closing ? 'closing' : ''}`}
      role="dialog"
      aria-modal="true"
      aria-labelledby="dm-title"
      aria-describedby="dm-hint"
      onClick={(e) => {
        if (!e.target.closest('.dm-paper')) requestClose(); // ketik di luar kertas skrol → tutup
      }}
    >
      <div className="dm-scene" aria-hidden="true" />
      <span id="dm-hint" className="dm-sr">
        Ketik di luar skrol atau tekan Escape untuk kembali ke laman utama.
      </span>
      <div className="dm-board">
        <span className="dm-rod l" aria-hidden="true" />
        <div className="dm-paper">
          {/* A. Sepanduk */}
          <header className="dm-hero">
            <div className="dm-banner">
              <img className="dm-hero-scroll" src="/home/homepage/mission-button.webp" alt="" />
              <div className="dm-hero-copy">
                <h1 id="dm-title">Misi Harian Ninja</h1>
                <p>Lengkapkan latihan hari ini dan kumpul ganjaran ninja!</p>
              </div>
              <span className="dm-shuriken" aria-hidden="true" />
            </div>
            <p className="dm-timer">
              <Clock aria-hidden="true" /> Misi baharu dalam <b>{hms(left)}</b>
            </p>
          </header>

          {/* B. Ringkasan kemajuan */}
          <section className="dm-overview" aria-label="Kemajuan hari ini">
            <div className="dm-ov-main">
              <span className="dm-ov-label">Misi selesai</span>
              <b className="dm-ov-count">
                {doneN}
                <small>/{total}</small>
              </b>
            </div>
            <div className="dm-ov-bar" role="progressbar" aria-valuemin={0} aria-valuemax={total} aria-valuenow={doneN} aria-label={`${doneN} daripada ${total} misi selesai`}>
              <i style={{ width: `${(doneN / total) * 100}%` }} />
              {DAILY_MISSIONS.slice(0, -1).map((m, i) => (
                <span key={m.id} className="dm-ov-tick" style={{ left: `${((i + 1) / total) * 100}%` }} />
              ))}
            </div>
            <div className="dm-ov-reward">
              <span className="dm-ov-label">Ganjaran dituntut</span>
              <b>
                <Coin /> {coinsGot}
                <small> / {coinsTotal}</small>
              </b>
            </div>
          </section>

          {/* C. Kad misi — lebih 3 misi: karusel kiri/kanan (anak panah, sapu, roda tetikus) */}
          <div className={`dm-quests-wrap ${carousel ? 'carousel' : ''}`}>
          {carousel && (
            <button type="button" className="dm-nav prev" onClick={() => scrollToCard(nav.active - 1)} disabled={!nav.prev} hidden={nav.pages < 2} aria-label="Misi sebelumnya">
              <ChevronLeft aria-hidden="true" />
            </button>
          )}
          <ol
            ref={trackRef}
            className={`dm-quests ${carousel ? 'carousel' : ''}`}
            onScroll={carousel ? syncNav : undefined}
            onWheel={
              carousel
                ? (e) => {
                    if (Math.abs(e.deltaY) > Math.abs(e.deltaX)) e.currentTarget.scrollLeft += e.deltaY;
                  }
                : undefined
            }
            aria-label="Senarai misi harian"
          >
            {DAILY_MISSIONS.map((m, i) => {
              const have = missionProgress(daily, m);
              const { st, label } = statusOf(daily, m);
              return (
                <li key={m.id} className={`dm-card ${st}`}>
                  <span className="dm-num">Misi {i + 1}</span>
                  {st === 'ready' && (
                    <span className="dm-sparkles" aria-hidden="true">
                      <i />
                      <i />
                      <i />
                    </span>
                  )}
                  {st !== 'todo' && (
                    <span className={`dm-stamp ${st}`} aria-hidden="true">
                      {st === 'claimed' ? 'DITUNTUT' : 'SELESAI'}
                    </span>
                  )}
                  <span className={`dm-icon ${m.icon}`} aria-hidden="true">
                    <MissionIcon name={m.icon} />
                  </span>
                  <div className="dm-main">
                    <h2>{m.title}</h2>
                    <p>{m.desc}</p>
                  </div>
                  <div className="dm-prog">
                    <div className="dm-bar" role="progressbar" aria-valuemin={0} aria-valuemax={m.target} aria-valuenow={have} aria-label={`${m.title}: ${have} daripada ${m.target}`}>
                      <i style={{ width: `${(have / m.target) * 100}%` }} />
                    </div>
                    <b className="dm-bar-num">
                      {have}/{m.target}
                    </b>
                  </div>
                  <div className="dm-foot">
                    <span className="dm-reward" aria-label={`Ganjaran ${m.coins} syiling`}>
                      <Coin /> {m.coins}
                    </span>
                    <span className={`dm-status ${st}`}>{label}</span>
                  </div>
                  {st === 'claimed' && (
                    <button type="button" className="dm-btn done" disabled>
                      <Check aria-hidden="true" /> <span className="dm-btn-long">Sudah </span>Dituntut
                    </button>
                  )}
                  {st === 'ready' && (
                    <button type="button" className="dm-btn claim" onClick={() => claim(m)}>
                      Tuntut <span className="dm-btn-amt"><Coin /> {m.coins}</span>
                    </button>
                  )}
                  {st === 'todo' && (
                    <button type="button" className="dm-btn go" onClick={() => onGo?.(m.go)}>
                      Pergi <ChevronRight aria-hidden="true" />
                    </button>
                  )}
                  {pop?.id === m.id && (
                    <span className="dm-pop" aria-live="polite">
                      +{pop.coins} <Coin />
                    </span>
                  )}
                </li>
              );
            })}
          </ol>
          {carousel && (
            <button type="button" className="dm-nav next" onClick={() => scrollToCard(nav.active + 1)} disabled={!nav.next} hidden={nav.pages < 2} aria-label="Misi seterusnya">
              <ChevronRight aria-hidden="true" />
            </button>
          )}
          {carousel && nav.pages > 1 && (
            <div className="dm-dots" aria-hidden="true">
              {Array.from({ length: nav.pages }, (_, i) => (
                <i key={i} className={i === nav.active ? 'on' : ''} />
              ))}
            </div>
          )}
          </div>

          <div className="dm-lower">
          {/* D. Peti Bonus Ninja */}
          <section className={`dm-bonus ${chestState}`} aria-labelledby="dm-bonus-h">
            <div className="dm-bonus-copy">
              <h2 id="dm-bonus-h">Peti Bonus Ninja</h2>
              <p>
                {chestState === 'claimed'
                  ? 'Peti sudah dibuka hari ini. Hebat, ninja!'
                  : chestState === 'ready'
                    ? 'Semua misi dituntut — buka peti anda!'
                    : 'Tuntut semua misi untuk membuka peti.'}
              </p>
              <span className="dm-bonus-reward">
                <Coin /> {DAILY_CHEST.coins} <span className="dm-plus">+</span> <GemIcon /> {DAILY_CHEST.gems} berlian
              </span>
            </div>
            <div className="dm-path" aria-label={`${claimedN} daripada ${total} misi dituntut`}>
              {DAILY_MISSIONS.map((m, i) => (
                <span key={m.id} className={`dm-cp ${daily.claimed[m.id] ? 'on' : ''}`} style={{ '--d': `${i * 0.15}s` }}>
                  <span className="dm-cp-dot">{daily.claimed[m.id] ? <Check aria-hidden="true" /> : i + 1}</span>
                  <small>Misi {i + 1}</small>
                </span>
              ))}
            </div>
            <div className="dm-chest-wrap">
              <button type="button" className={`dm-chest-btn ${chestAnim ? 'anim' : ''}`} onClick={openChest} disabled={chestState !== 'ready'} aria-label={chestState === 'claimed' ? 'Peti Bonus sudah dibuka' : chestState === 'ready' ? 'Buka Peti Bonus' : 'Peti Bonus berkunci'}>
                <Chest state={chestState} />
                <span className="dm-chest-label">
                  {chestState === 'claimed' ? (
                    <>
                      <Check aria-hidden="true" /> Dibuka
                    </>
                  ) : chestState === 'ready' ? (
                    'Buka Peti!'
                  ) : (
                    <>
                      <Lock aria-hidden="true" /> {claimedN}/{total}
                    </>
                  )}
                </span>
              </button>
              {pop?.id === 'chest' && (
                <span className="dm-pop chest" aria-live="polite">
                  +{pop.coins} <Coin /> +{pop.gems} <GemIcon />
                </span>
              )}
            </div>
          </section>

          </div>
        </div>
        <span className="dm-rod r" aria-hidden="true" />
        {closing && <WaxSeal />}
      </div>
    </div>
  );
}
