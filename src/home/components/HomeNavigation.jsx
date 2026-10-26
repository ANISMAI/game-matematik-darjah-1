import { useState } from 'react';
import { MoreHorizontal } from 'lucide-react';

const items = [
  { key: 'mini', label: 'Mini Permainan', short: 'Main', emoji: '🎮' },
  { key: 'battlepass', label: 'Battle Pass', emoji: '🥷' },
  { key: 'belajar', label: 'Pembelajaran', short: 'Belajar', emoji: '📚' },
  { key: 'kuiz', label: 'Kuiz Harian', short: 'Kuiz', emoji: '📝', badge: 1 },
  { key: 'papan', label: 'Papan Markah', short: 'Skor', emoji: '🏆' },
  { key: 'tuisyen', label: 'Tuisyen', emoji: '🎓' },
  { key: 'inventori', label: 'Inventori', emoji: '🎒' },
  { key: 'tetapan', label: 'Tetapan', emoji: '⚙️' },
];

export function HomeSidebar({ onSelect }) {
  return (
    <aside className="relative z-30 hidden h-full w-64 shrink-0 md:flex md:flex-col">
      <div
        className="relative m-3 flex min-h-0 flex-1 flex-col overflow-y-auto rounded-3xl border-[3px] p-4 shadow-[var(--shadow-game)]"
        style={{ background: 'var(--sidebar-solid)', borderColor: 'var(--sidebar-border)' }}
      >
        <div className="mb-6 flex items-center gap-2 px-2 pt-1">
          <div
            className="grid h-10 w-10 place-items-center rounded-xl text-lg font-black text-white shadow-md"
            style={{ background: 'var(--gradient-orange)' }}
          >
            Y
          </div>
          <span className="font-display text-xl font-bold tracking-wide text-white text-shadow-strong">YOUEDU</span>
        </div>
        <nav className="flex flex-1 flex-col gap-1.5" aria-label="Menu utama">
          {items.map((item) => (
            <button
              key={item.key}
              onClick={() => onSelect(item)}
              className="group relative flex items-center gap-3 rounded-2xl px-3 py-3 text-left text-sm font-bold text-white transition-colors hover:bg-white/15"
              style={
                item.key === 'mini'
                  ? { background: 'var(--gradient-orange)', boxShadow: 'var(--shadow-glow-orange)' }
                  : undefined
              }
            >
              <span
                className="grid h-9 w-9 shrink-0 place-items-center rounded-xl bg-white/10 text-xl"
                aria-hidden="true"
              >
                {item.emoji}
              </span>
              <span className="flex-1 text-shadow-readable">{item.label}</span>
              {item.badge && (
                <span className="grid h-5 min-w-5 place-items-center rounded-full bg-red-500 px-1.5 text-[10px] font-black">
                  {item.badge}
                </span>
              )}
            </button>
          ))}
        </nav>
        <div className="mt-3 rounded-2xl border border-white/15 bg-black/20 p-3 text-xs text-white/90">
          <p className="font-bold text-ninja-yellow">Ninja Tip</p>
          <p className="mt-1 leading-snug">Selesaikan kuiz harian untuk +50 mata!</p>
        </div>
      </div>
    </aside>
  );
}

// Bar bawah gaya "game" (Brawl Stars): semua menu jadi tab berbaris di bawah.
// Dipakai untuk semua saiz skrin; menggantikan sidebar kiri.
export function HomeBottomBar({ onSelect, active = 'mini' }) {
  return (
    <nav
      className="home-bottombar fixed inset-x-0 bottom-0 z-40 flex items-stretch justify-around gap-1 border-t-2 px-3 pb-2 pt-2"
      style={{ background: 'var(--sidebar-solid)', borderColor: 'var(--sidebar-border)' }}
      aria-label="Menu utama"
    >
      {items.map((item) => {
        const isActive = item.key === active;
        return (
          <button
            key={item.key}
            onClick={() => onSelect(item)}
            aria-current={isActive || undefined}
            className="group relative flex min-w-0 flex-1 flex-col items-center justify-center gap-0.5 rounded-xl px-1 py-2 text-xs font-bold text-white/85 transition-colors hover:bg-white/10"
            style={isActive ? { background: 'var(--gradient-orange)', color: '#fff' } : undefined}
          >
            <span className="grid h-8 w-8 place-items-center text-2xl" aria-hidden="true">
              {item.emoji}
            </span>
            <span className="w-full truncate text-center text-shadow-readable">{item.short ?? item.label}</span>
            {item.badge && (
              <span className="absolute right-2 top-1 grid h-4 min-w-4 place-items-center rounded-full bg-red-500 px-1 text-[9px] font-black">
                {item.badge}
              </span>
            )}
          </button>
        );
      })}
    </nav>
  );
}

export function HomeMobileNav({ onSelect }) {
  const [showMore, setShowMore] = useState(false);
  const main = items.filter((item) => item.short);
  const more = items.filter((item) => !item.short);
  const select = (item) => {
    setShowMore(false);
    onSelect(item);
  };

  return (
    <>
      {showMore && (
        <nav
          className="fixed bottom-24 right-3 z-40 w-48 rounded-2xl border-2 p-1.5 shadow-[var(--shadow-game)] md:hidden"
          style={{ background: 'var(--sidebar-solid)', borderColor: 'var(--sidebar-border)' }}
          aria-label="Menu tambahan"
        >
          {more.map((item) => (
            <button
              key={item.key}
              onClick={() => select(item)}
              className="flex w-full items-center gap-3 rounded-xl px-3 py-2.5 text-left text-sm font-bold text-white hover:bg-white/15"
            >
              <span aria-hidden="true">{item.emoji}</span>
              {item.label}
            </button>
          ))}
        </nav>
      )}
      <nav
        className="fixed inset-x-3 bottom-3 z-40 flex items-center justify-between gap-1 rounded-2xl border-2 p-1.5 shadow-[var(--shadow-game)] md:hidden"
        style={{ background: 'var(--sidebar-solid)', borderColor: 'var(--sidebar-border)' }}
        aria-label="Menu utama telefon"
      >
        {main.map((item) => (
          <button
            key={item.key}
            onClick={() => select(item)}
            className="flex min-h-14 flex-1 flex-col items-center gap-0.5 rounded-xl py-2 text-[10px] font-bold text-white/90"
            style={item.key === 'mini' ? { background: 'var(--gradient-orange)' } : undefined}
          >
            <span className="text-xl" aria-hidden="true">
              {item.emoji}
            </span>
            {item.short}
          </button>
        ))}
        <button
          onClick={() => setShowMore((value) => !value)}
          aria-expanded={showMore}
          className="flex min-h-14 flex-1 flex-col items-center gap-0.5 rounded-xl py-2 text-[10px] font-bold text-white/90"
        >
          <MoreHorizontal className="h-7 w-7" />
          Lagi
        </button>
      </nav>
    </>
  );
}
