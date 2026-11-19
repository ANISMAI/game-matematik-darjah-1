// Bilik Harta Karun Ninja — skrin penuh ganjaran: peti, rak hadiah & dinding lencana.
// Logik & data dalam vault.js; fail ini hanya paparan + aliran tuntut (buka peti → dedah hadiah → terbang ke koleksi).
import { useEffect, useRef, useState } from 'react';
import { BookOpen, Check, ChevronRight, Eye, Fish, Flame, Gem, Gift, Lock, Paintbrush, ScrollText, Sparkles, Star, Trophy } from 'lucide-react';
import { BADGES, CHESTS, GIFTS, badgeGot, chestStatus, markGiftsSeen, openChest, readStats } from './vault.js';
import { playSound } from '../../lib/sound.js';
import './treasure-room.css';

const reduceMotion = () => window.matchMedia?.('(prefers-reduced-motion: reduce)').matches;

/* ───────────── komponen boleh guna semula ───────────── */
export const Coin = () => <i className="tr-coin" aria-hidden="true" />;
export const GemIcon = () => <Gem className="tr-gem" aria-hidden="true" />;

/**
 * Peti harta — sprite 8 frame (public/home/vault/chest-sheet.webp).
 * Frame: 1 tertutup · 2-3 bergoyang + kilauan · 4 renggang · 5 separuh buka · 6-7 buka + syiling melompat · 8 terbuka penuh.
 * Keadaan: locked | ready (goyang berkala) | opening (main frame 2→8) | opened (frame 8) | soon.
 * `variant` disimpan sebagai data-variant (sedia untuk sprite warna lain kelak).
 */
export function TreasureChest({ variant = 'harian', state = 'locked' }) {
  return (
    <span className={`tr-chest ${state}`} data-variant={variant} aria-hidden="true">
      <span className="tr-chest-img" />
      {(state === 'locked' || state === 'soon') && <span className="tr-chest-lock">{state === 'soon' ? '?' : <Lock />}</span>}
    </span>
  );
}

/** Lukisan hadiah koleksi (SVG kecil, garis navy tebal). */
export function RewardArt({ art, tone = '#e5432d' }) {
  const ink = '#26324d';
  const body = {
    headband: (
      <>
        <path d="M8 30 Q32 18 56 30 L54 40 Q32 29 10 40 Z" fill={tone} stroke={ink} strokeWidth="3.5" strokeLinejoin="round" />
        <path d="M50 34 l10 14 -6 2 -7-11 M50 34 l4 17" fill={tone} stroke={ink} strokeWidth="3" strokeLinejoin="round" />
        <circle cx="32" cy="31" r="5" fill="#fff" stroke={ink} strokeWidth="2.5" />
      </>
    ),
    scroll: (
      <>
        <rect x="14" y="16" width="36" height="32" rx="3" fill="#fbe7b5" stroke={ink} strokeWidth="3.5" />
        <rect x="9" y="12" width="46" height="9" rx="4.5" fill={tone} stroke={ink} strokeWidth="3.5" />
        <rect x="9" y="44" width="46" height="9" rx="4.5" fill={tone} stroke={ink} strokeWidth="3.5" />
        <path d="M21 28h22M21 35h16" stroke="#b07c40" strokeWidth="3" strokeLinecap="round" />
        <path d="M30 48 l-4 12 6-3 6 3-4-12" fill="#e5432d" stroke={ink} strokeWidth="2.5" strokeLinejoin="round" />
      </>
    ),
    trophy: (
      <>
        <path d="M18 12h28v10a14 14 0 0 1-28 0Z" fill={tone} stroke={ink} strokeWidth="3.5" strokeLinejoin="round" />
        <path d="M18 16H9a8 8 0 0 0 10 12M46 16h9a8 8 0 0 1-10 12" fill="none" stroke={ink} strokeWidth="3.5" />
        <path d="M28 36h8v8h-8z" fill={tone} stroke={ink} strokeWidth="3" />
        <rect x="18" y="44" width="28" height="9" rx="3" fill="#8a5428" stroke={ink} strokeWidth="3.5" />
        <path d="M24 16v8" stroke="#fff" strokeWidth="3" strokeLinecap="round" opacity=".55" />
      </>
    ),
    mask: (
      <>
        <path d="M10 22 Q32 6 54 22 Q58 42 32 56 Q6 42 10 22Z" fill={tone} stroke={ink} strokeWidth="3.5" strokeLinejoin="round" />
        <rect x="14" y="24" width="36" height="11" rx="5.5" fill="#fde2c4" stroke={ink} strokeWidth="3" />
        <circle cx="25" cy="29.5" r="2.6" fill={ink} />
        <circle cx="39" cy="29.5" r="2.6" fill={ink} />
        <path d="M32 42l3 5-3 3-3-3z" fill="#ffd24d" stroke={ink} strokeWidth="2" />
      </>
    ),
    frame: (
      <>
        <rect x="10" y="10" width="44" height="44" rx="6" fill="#fff6e8" stroke={ink} strokeWidth="3.5" />
        <rect x="18" y="18" width="28" height="28" rx="3" fill="#cfe7ff" stroke={ink} strokeWidth="2.5" />
        {[
          [12, 12],
          [52, 12],
          [12, 52],
          [52, 52],
        ].map(([x, y]) => (
          <g key={`${x}${y}`} transform={`translate(${x} ${y})`}>
            {[0, 72, 144, 216, 288].map((a) => (
              <circle key={a} cx={Math.cos((a * Math.PI) / 180) * 4} cy={Math.sin((a * Math.PI) / 180) * 4} r="3.4" fill={tone} stroke={ink} strokeWidth="1.2" />
            ))}
            <circle r="2" fill="#ffd24d" />
          </g>
        ))}
      </>
    ),
    sticker: (
      <>
        <circle cx="32" cy="32" r="24" fill="#fff" stroke={ink} strokeWidth="3.5" />
        <path d="M32 12l5 15 15 5-15 5-5 15-5-15-15-5 15-5z" fill={tone} stroke={ink} strokeWidth="3" strokeLinejoin="round" />
        <circle cx="32" cy="32" r="4" fill="#fff" stroke={ink} strokeWidth="2.5" />
      </>
    ),
    pattern: (
      <>
        <rect x="10" y="10" width="44" height="44" rx="8" fill="#fff3c4" stroke={ink} strokeWidth="3.5" />
        <path d="M21 14l7 9-7 9-7-9zM43 14l7 9-7 9-7-9zM32 32l7 9-7 9-7-9z" fill={tone} stroke={ink} strokeWidth="2.5" strokeLinejoin="round" />
      </>
    ),
    sparkle: (
      <>
        <path d="M32 6l6 18 18 6-18 6-6 18-6-18-18-6 18-6z" fill={tone} stroke={ink} strokeWidth="3.5" strokeLinejoin="round" />
        <path d="M52 44l2.5 6 6 2.5-6 2.5-2.5 6-2.5-6-6-2.5 6-2.5z" fill="#ffd24d" stroke={ink} strokeWidth="2" />
      </>
    ),
  };
  return (
    <svg className="tr-art" viewBox="0 0 64 64" aria-hidden="true">
      {body[art] ?? body.sparkle}
    </svg>
  );
}

const ShurikenIcon = () => (
  <svg viewBox="-20 -20 40 40" aria-hidden="true">
    <path d="M0-17 5-5 17 0 5 5 0 17-5 5-17 0-5-5Z" fill="currentColor" stroke="none" />
    <circle r="4" fill="rgba(0,0,0,.35)" />
  </svg>
);
const BADGE_ICONS = { book: BookOpen, flame: Flame, scroll: ScrollText, eye: Eye, sushi: Fish, brush: Paintbrush, star: Star, shuriken: ShurikenIcon };

/** Lencana ninja (pingat bulat + reben). */
export function BadgeTile({ badge, stats }) {
  const [have, need] = badge.prog(stats);
  const got = have >= need;
  const Ico = BADGE_ICONS[badge.icon] ?? Star;
  return (
    <li className={`tr-badge ${got ? 'got' : 'locked'}`} style={{ '--tone': badge.tone }}>
      <span className="tr-medal" aria-hidden="true">
        <i className="tr-ribbon l" />
        <i className="tr-ribbon r" />
        <span className="tr-medal-face">
          <Ico />
        </span>
        {!got && (
          <span className="tr-lock-dot">
            <Lock />
          </span>
        )}
      </span>
      <b>{badge.name}</b>
      {got ? (
        <small className="tr-got">
          <Check aria-hidden="true" /> Diperoleh
        </small>
      ) : (
        <>
          <small>{badge.hint}</small>
          <span className="tr-mini-bar" role="progressbar" aria-valuemin={0} aria-valuemax={need} aria-valuenow={Math.min(have, need)} aria-label={`${badge.name}: ${Math.min(have, need)} daripada ${need}`}>
            <i style={{ width: `${(Math.min(have, need) / need) * 100}%` }} />
          </span>
        </>
      )}
    </li>
  );
}

/** Item hadiah di atas rak. */
export function GiftItem({ gift, got, isNew }) {
  return (
    <li className={`tr-gift ${got ? 'got' : 'locked'} ${gift.soon ? 'soon' : ''}`}>
      <span className="tr-stand">
        <RewardArt art={gift.art} tone={gift.tone} />
        {!got && (
          <span className="tr-lock-dot">
            <Lock />
          </span>
        )}
        {isNew && <em className="tr-new">Baru!</em>}
      </span>
      <b>{got ? gift.name : gift.soon ? 'Akan Datang' : gift.name}</b>
      {!got && <small>{gift.hint}</small>}
    </li>
  );
}

function RewardChips({ reward }) {
  if (!reward) return null;
  const gift = reward.gift && GIFTS.find((g) => g.id === reward.gift);
  return (
    <span className="tr-reward-chips">
      {reward.coins > 0 && (
        <span className="tr-chip-s">
          <Coin /> {reward.coins}
        </span>
      )}
      {reward.gems > 0 && (
        <span className="tr-chip-s">
          <GemIcon /> {reward.gems}
        </span>
      )}
      {gift && (
        <span className="tr-chip-s gift" title={gift.name}>
          <Gift aria-hidden="true" /> {gift.name}
        </span>
      )}
    </span>
  );
}

const STATE_LABEL = { locked: 'Terkunci', ready: 'Boleh Dituntut', opened: 'Sudah Dibuka', opening: 'Membuka…', soon: 'Akan Datang' };

/** Kad peti sokongan (Mini Game / Pencapaian / Istimewa). */
export function ChestCard({ chest, status, opening, replaying, onOpen, onReplay }) {
  const state = opening ? 'opening' : status.state;
  const opened = status.state === 'opened';
  return (
    <li className={`tr-card ${state} ${chest.variant}`}>
      <button
        type="button"
        className="tr-card-chest"
        onClick={opened ? onReplay : onOpen}
        disabled={!(status.state === 'ready' || opened) || opening}
        title={opened ? 'Tekan untuk tengok peti dibuka semula' : undefined}
        aria-label={opened ? `${chest.name}: tengok animasi buka semula` : `${chest.name}: ${STATE_LABEL[state]}`}
      >
        <TreasureChest variant={chest.variant} state={replaying ? 'opening' : state} />
      </button>
      <div className="tr-card-main">
        <h3>
          {chest.name} <span className={`tr-state ${state}`}>{STATE_LABEL[state]}</span>
        </h3>
        <p>{chest.info}</p>
        {status.need ? (
          <div className="tr-prog">
            <span className="tr-bar" role="progressbar" aria-valuemin={0} aria-valuemax={status.need} aria-valuenow={status.have} aria-label={`${chest.name}: ${status.have} daripada ${status.need}`}>
              <i style={{ width: `${(status.have / status.need) * 100}%` }} />
            </span>
            <b>
              {status.have}/{status.need}
            </b>
            {status.tiers && <small>Peringkat {Math.min(status.tier, status.tiers)}/{status.tiers}</small>}
          </div>
        ) : null}
        <p className="tr-next">{status.next}</p>
        {status.state !== 'opened' && <RewardChips reward={status.reward} />}
      </div>
      {status.state === 'ready' && (
        <button type="button" className="tr-btn claim small" onClick={onOpen} disabled={opening}>
          Buka!
        </button>
      )}
    </li>
  );
}

/* ───────────── skrin utama ───────────── */
export default function TreasureRoom({ open, onClose, sound, profile, latihanDone = 0, onReward, onOpenMissions }) {
  const [stats, setStats] = useState(() => readStats({ latihanDone }));
  const [tab, setTab] = useState('peti');
  const [opening, setOpening] = useState(null);
  const [replay, setReplay] = useState(null); // main semula animasi buka (tiada ganjaran)
  const [reveal, setReveal] = useState(null); // { chest, reward }
  const [flyers, setFlyers] = useState([]);
  const [bump, setBump] = useState({});
  const [newGifts, setNewGifts] = useState(() => new Set());
  const closeRef = useRef(null);
  const chipRefs = useRef({});
  const tabRefs = useRef({});
  const revealRefs = useRef({});
  const timers = useRef([]);
  const later = (fn, ms) => timers.current.push(window.setTimeout(fn, ms));

  const refresh = () => setStats(readStats({ latihanDone }));

  useEffect(() => {
    if (!open) return undefined;
    const opener = document.activeElement;
    refresh();
    setTab('peti');
    setReveal(null);
    setOpening(null);
    closeRef.current?.focus();
    const prev = document.body.style.overflow;
    document.body.style.overflow = 'hidden';
    return () => {
      timers.current.forEach(clearTimeout);
      timers.current = [];
      document.body.style.overflow = prev;
      if (opener instanceof HTMLElement) opener.focus();
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [open]);

  const collectRef = useRef(null);
  useEffect(() => {
    if (!open) return undefined;
    const key = (e) => {
      if (e.key !== 'Escape') return;
      if (collectRef.current) collectRef.current();
      else onClose();
    };
    window.addEventListener('keydown', key);
    return () => window.removeEventListener('keydown', key);
  }, [open, onClose]);

  if (!open) return null;

  const statuses = Object.fromEntries(CHESTS.map((c) => [c.id, chestStatus(c, stats)]));
  const readyN = CHESTS.filter((c) => statuses[c.id].state === 'ready').length;
  const giftGot = GIFTS.filter((g) => g.got(stats));
  const hero = CHESTS.find((c) => c.hero);
  const heroSt = statuses[hero.id];
  const heroState = opening === hero.id ? 'opening' : heroSt.state;
  const heroVisual = replay === hero.id ? 'opening' : heroState;
  const replayChest = (id) => {
    if (opening || replay || reduceMotion()) return;
    setReplay(id);
    later(() => setReplay(null), 700);
  };

  const startOpen = (chest) => {
    if (opening || statuses[chest.id].state !== 'ready') return;
    const r = openChest(chest.id, stats); // disimpan dahulu — ganjaran diberi sekali sahaja
    if (!r) return;
    onReward?.({ coins: r.coins || 0, gems: r.gems || 0 });
    playSound('done', sound);
    setOpening(chest.id);
    later(
      () => {
        setOpening(null);
        refresh();
        setReveal({ chest, reward: r });
      },
      reduceMotion() ? 0 : 650,
    );
  };

  // dedah → simpan: setiap ganjaran terbang ke kaunter / tab koleksi
  const collect = () => {
    if (!reveal) return;
    const { reward } = reveal;
    const targets = [];
    if (reward.coins) targets.push(['coins', chipRefs.current.coins, { kind: 'coin' }]);
    if (reward.gems) targets.push(['gems', chipRefs.current.gems, { kind: 'gem' }]);
    const gift = reward.gift && GIFTS.find((g) => g.id === reward.gift);
    if (gift) targets.push(['gift', tabRefs.current.hadiah, { kind: 'gift', gift }]);
    if (gift) setNewGifts((s) => new Set(s).add(gift.id));
    if (!reduceMotion()) {
      const fl = [];
      for (const [k, el, data] of targets) {
        const from = revealRefs.current[k]?.getBoundingClientRect();
        const to = el?.getBoundingClientRect();
        if (!from || !to) continue;
        const x = from.left + from.width / 2;
        const y = from.top + from.height / 2;
        fl.push({ id: `${k}${Date.now()}`, k, x, y, dx: to.left + to.width / 2 - x, dy: to.top + to.height / 2 - y, ...data });
      }
      setFlyers(fl);
      later(() => {
        setFlyers([]);
        setBump(Object.fromEntries(targets.map(([k]) => [k, true])));
        later(() => setBump({}), 700);
        playSound('correct', sound);
      }, 750);
    }
    setReveal(null);
    closeRef.current?.focus();
  };
  collectRef.current = reveal ? collect : null;

  const goTab = (t) => {
    setTab(t);
    if (t === 'hadiah') {
      const unseen = giftGot.filter((g) => !stats.vault.seen[g.id]).map((g) => g.id);
      if (unseen.length) {
        setNewGifts((s) => new Set([...s, ...unseen]));
        markGiftsSeen(unseen);
      }
    }
  };

  const heroAction = () => {
    if (heroSt.state === 'ready') startOpen(hero);
    else if (heroSt.state === 'locked') onOpenMissions?.();
  };
  const revealGift = reveal?.reward.gift && GIFTS.find((g) => g.id === reveal.reward.gift);

  return (
    <div className="tr-screen" role="dialog" aria-modal="true" aria-labelledby="tr-title">
      <div className="tr-room" aria-hidden="true" />


      <div className="tr-wrap">
        {/* A. Sepanduk + kaunter ganjaran */}
        <header className="tr-head">
          <div className="tr-title-row">
          {/* butang Utama — papan kayu kecil yang tergantung di sebelah tajuk */}
          <button ref={closeRef} type="button" className="tr-home" onClick={onClose} aria-label="Kembali ke Laman Utama">
            <i className="tr-rope l" aria-hidden="true" />
            <i className="tr-rope r" aria-hidden="true" />
            <svg className="tr-house" viewBox="0 0 32 32" aria-hidden="true">
              <rect x="7" y="14" width="18" height="14" rx="2" fill="#fff3d6" stroke="#145c45" strokeWidth="2.4" />
              <path d="M3 16 16 4l13 12" fill="#e5432d" stroke="#145c45" strokeWidth="2.6" strokeLinejoin="round" strokeLinecap="round" />
              <rect x="13" y="19" width="6" height="9" rx="1.5" fill="#a8622c" stroke="#145c45" strokeWidth="2" />
              <circle cx="17.3" cy="23.8" r=".9" fill="#ffd24d" />
            </svg>
            <span>Utama</span>
          </button>
          <div className="tr-sign">
            <i className="tr-rope l" aria-hidden="true" />
            <i className="tr-rope r" aria-hidden="true" />
            <h1 id="tr-title">Bilik Harta Karun Ninja</h1>
            <p>Semua ganjaran dan hadiah hebat awak disimpan di sini!</p>
          </div>
          </div>
          <ul className="tr-counters" aria-label="Ringkasan ganjaran">
            <li ref={(el) => (chipRefs.current.coins = el)} className={bump.coins ? 'bump' : ''}>
              <Coin /> <b>{profile?.coins || 0}</b> <span>Syiling</span>
            </li>
            <li ref={(el) => (chipRefs.current.gems = el)} className={bump.gems ? 'bump' : ''}>
              <GemIcon /> <b>{profile?.gems || 0}</b> <span>Berlian</span>
            </li>
            <li>
              <Star className="tr-star" aria-hidden="true" /> <b>{stats.stars}</b> <span>Bintang</span>
            </li>
            <li>
              <Gift className="tr-giftico" aria-hidden="true" /> <b>{giftGot.length}</b>
              <small>/{GIFTS.length}</small> <span>Hadiah</span>
            </li>
          </ul>
        </header>

        {/* Tab bahagian */}
        <nav className="tr-tabs" role="tablist" aria-label="Bahagian bilik harta">
          {[
            ['peti', 'Peti', readyN],
            ['hadiah', 'Hadiah Saya', 0],
            ['lencana', 'Lencana', 0],
          ].map(([id, label, n]) => (
            <button
              key={id}
              ref={(el) => (tabRefs.current[id] = el)}
              type="button"
              role="tab"
              id={`tr-tab-${id}`}
              aria-selected={tab === id}
              aria-controls={`tr-panel-${id}`}
              className={`tr-tab ${tab === id ? 'on' : ''} ${id === 'hadiah' && bump.gift ? 'bump' : ''}`}
              onClick={() => goTab(id)}
            >
              {label}
              {n > 0 && <em>{n}</em>}
            </button>
          ))}
        </nav>

        {/* B + C. Peti */}
        {tab === 'peti' && (
          <section className="tr-panel tr-chests" id="tr-panel-peti" role="tabpanel" aria-labelledby="tr-tab-peti">
            <div className={`tr-hero ${heroState}`}>
              <span className="tr-hero-tag">Peti Utama</span>
              <button
                type="button"
                className="tr-hero-chest"
                onClick={heroSt.state === 'opened' ? () => replayChest(hero.id) : heroAction}
                disabled={!!opening}
                title={heroSt.state === 'opened' ? 'Tekan untuk tengok peti dibuka semula' : undefined}
                aria-label={heroSt.state === 'opened' ? `${hero.name}: tengok animasi buka semula` : `${hero.name}: ${STATE_LABEL[heroState]}`}
              >
                <span className="tr-pedestal" aria-hidden="true" />
                <TreasureChest variant={hero.variant} state={heroVisual} />
              </button>
              <h2>
                {hero.name} <span className={`tr-state ${heroState}`}>{STATE_LABEL[heroState]}</span>
              </h2>
              <p className="tr-info">{hero.info}</p>
              <div className="tr-prog">
                <span className="tr-bar" role="progressbar" aria-valuemin={0} aria-valuemax={heroSt.need} aria-valuenow={heroSt.have} aria-label={`Misi harian dituntut: ${heroSt.have} daripada ${heroSt.need}`}>
                  <i style={{ width: `${(heroSt.have / heroSt.need) * 100}%` }} />
                </span>
                <b>
                  {heroSt.have}/{heroSt.need}
                </b>
                <small>misi</small>
              </div>
              <p className="tr-next">{heroSt.next}</p>
              {heroSt.state !== 'opened' && <RewardChips reward={heroSt.reward} />}
              {heroSt.state === 'ready' && (
                <button type="button" className="tr-btn claim" onClick={heroAction} disabled={!!opening}>
                  Buka Peti!
                </button>
              )}
              {heroSt.state === 'locked' && (
                <button type="button" className="tr-btn go" onClick={heroAction}>
                  Ke Misi Harian <ChevronRight aria-hidden="true" />
                </button>
              )}
              {heroSt.state === 'opened' && (
                <span className="tr-btn done">
                  <Check aria-hidden="true" /> Sudah Dibuka
                </span>
              )}
            </div>
            <ul className="tr-cards">
              {CHESTS.filter((c) => !c.hero).map((c) => (
                <ChestCard key={c.id} chest={c} status={statuses[c.id]} opening={opening === c.id} replaying={replay === c.id} onOpen={() => startOpen(c)} onReplay={() => replayChest(c.id)} />
              ))}
            </ul>
          </section>
        )}

        {/* D. Rak hadiah */}
        {tab === 'hadiah' && (
          <section className="tr-panel tr-shelves" id="tr-panel-hadiah" role="tabpanel" aria-labelledby="tr-tab-hadiah">
            <p className="tr-panel-intro">
              <Sparkles aria-hidden="true" /> Hadiah yang dibuka dari peti dipamerkan di sini. Yang berkunci menunjukkan cara mendapatkannya.
            </p>
            <ul className="tr-shelf">
              {GIFTS.map((g) => (
                <GiftItem key={g.id} gift={g} got={g.got(stats)} isNew={newGifts.has(g.id) && g.got(stats)} />
              ))}
            </ul>
          </section>
        )}

        {/* E. Dinding lencana */}
        {tab === 'lencana' && (
          <section className="tr-panel tr-wall" id="tr-panel-lencana" role="tabpanel" aria-labelledby="tr-tab-lencana">
            <p className="tr-panel-intro">
              <Trophy aria-hidden="true" /> Lencana Ninja: {BADGES.filter((b) => badgeGot(b, stats)).length}/{BADGES.length} diperoleh
            </p>
            <ul className="tr-badges">
              {BADGES.map((b) => (
                <BadgeTile key={b.id} badge={b} stats={stats} />
              ))}
            </ul>
          </section>
        )}
      </div>

      {/* Dedah ganjaran */}
      {reveal && (
        <div className="tr-reveal" role="alertdialog" aria-modal="true" aria-labelledby="tr-reveal-h">
          <div className="tr-reveal-card">
            <i className="tr-rays" aria-hidden="true" />
            <i className="tr-confetti" aria-hidden="true">
              {Array.from({ length: 14 }, (_, i) => (
                <b key={i} style={{ '--i': i }} />
              ))}
            </i>
            <div className="tr-reveal-chest">
              <TreasureChest variant={reveal.chest.variant} state="opened" />
            </div>
            <h2 id="tr-reveal-h">Tahniah, Ninja!</h2>
            <p>{reveal.chest.name} dibuka. Inilah hadiah awak:</p>
            <ul className="tr-loot">
              {reveal.reward.coins > 0 && (
                <li ref={(el) => (revealRefs.current.coins = el)} style={{ '--d': '0s' }}>
                  <span className="tr-loot-ico">
                    <Coin />
                  </span>
                  <b>+{reveal.reward.coins}</b> Syiling
                </li>
              )}
              {reveal.reward.gems > 0 && (
                <li ref={(el) => (revealRefs.current.gems = el)} style={{ '--d': '.12s' }}>
                  <span className="tr-loot-ico">
                    <GemIcon />
                  </span>
                  <b>+{reveal.reward.gems}</b> Berlian
                </li>
              )}
              {revealGift && (
                <li ref={(el) => (revealRefs.current.gift = el)} className="gift" style={{ '--d': '.24s' }}>
                  <span className="tr-loot-ico">
                    <RewardArt art={revealGift.art} tone={revealGift.tone} />
                  </span>
                  <b>{revealGift.name}</b> Hadiah baharu!
                </li>
              )}
            </ul>
            <button type="button" className="tr-btn claim" onClick={collect} autoFocus>
              Simpan ke Bilik Harta
            </button>
          </div>
        </div>
      )}

      {/* ganjaran terbang ke kaunter / tab */}
      {flyers.map((f) => (
        <span key={f.id} className="tr-fly" style={{ left: f.x, top: f.y, '--dx': `${f.dx}px`, '--dy': `${f.dy}px` }} aria-hidden="true">
          {f.kind === 'coin' && <Coin />}
          {f.kind === 'gem' && <GemIcon />}
          {f.kind === 'gift' && <RewardArt art={f.gift.art} tone={f.gift.tone} />}
        </span>
      ))}
    </div>
  );
}
