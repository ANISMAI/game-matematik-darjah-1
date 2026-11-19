// Perpustakaan Ilmu Ninja — pusat pembelajaran skrin penuh (Belajar).
// Navigasi dalaman berasaskan tindanan: hub → kategori → bahan. "Kembali" sentiasa ke halaman sebelumnya.
// Kandungan: content.js · Kemajuan & "Sambung Pembelajaran": progress.js ('library:v1').
import { useEffect, useRef, useState } from 'react';
import { ArrowLeft, Bookmark, BookmarkCheck, Check, ChevronLeft, ChevronRight, Download, ExternalLink, Lightbulb, Play, RotateCcw, X } from 'lucide-react';
import { CATEGORIES, GRADES, SUBJECTS, contextOf, findResource, resourcesFor, topicById, topicsFor } from './content.js';
import { lastValid, loadLibrary, recordProgress, toggleBookmark } from './progress.js';
import './library.css';

const catOf = (id) => CATEGORIES.find((c) => c.id === id);
const mmss = (s) => `${Math.floor(s / 60)}:${String(Math.floor(s % 60)).padStart(2, '0')}`;

/* ───────────── komponen kecil boleh guna semula ───────────── */

/** Ilustrasi kategori (SVG, garis navy tebal). */
export function CategoryArt({ id }) {
  const ink = '#26324d';
  const art = {
    nota: (
      <>
        <path d="M10 18 Q32 10 50 18 V58 Q32 50 10 58 Z" fill="#fff6e0" stroke={ink} strokeWidth="4" strokeLinejoin="round" />
        <path d="M90 18 Q68 10 50 18 V58 Q68 50 90 58 Z" fill="#fff6e0" stroke={ink} strokeWidth="4" strokeLinejoin="round" />
        <path d="M8 22 V62 Q30 54 50 62 Q70 54 92 62 V22" fill="none" stroke="#2f7fd6" strokeWidth="6" strokeLinejoin="round" />
        <path d="M18 26h22M18 34h22M18 42h16M60 26h22M60 34h22M60 42h16" stroke="#c9a26a" strokeWidth="3.5" strokeLinecap="round" />
        <path d="M70 6 l5 10 10 2-8 6 2 10-9-5-9 5 2-10-8-6 10-2z" fill="#ffd24d" stroke={ink} strokeWidth="3" strokeLinejoin="round" />
      </>
    ),
    video: (
      <>
        <rect x="8" y="10" width="84" height="54" rx="10" fill="#e5432d" stroke={ink} strokeWidth="4" />
        <rect x="16" y="17" width="68" height="40" rx="6" fill="#ffe9d6" stroke={ink} strokeWidth="3" />
        <path d="M43 27 L60 37 L43 47 Z" fill="#e5432d" stroke={ink} strokeWidth="3.5" strokeLinejoin="round" />
        <path d="M34 64 l-6 8 M66 64 l6 8 M24 72h52" stroke={ink} strokeWidth="4" strokeLinecap="round" />
      </>
    ),
    kertas: (
      <>
        <path d="M22 6 H66 L80 20 V72 H22 Z" fill="#fffdf3" stroke={ink} strokeWidth="4" strokeLinejoin="round" />
        <path d="M66 6 V20 H80" fill="#e6dcf7" stroke={ink} strokeWidth="4" strokeLinejoin="round" />
        <path d="M31 30h30M31 40h36M31 50h24" stroke="#b9a6dd" strokeWidth="4" strokeLinecap="round" />
        <circle cx="64" cy="56" r="14" fill="#8a55d6" stroke={ink} strokeWidth="3.5" />
        <text x="64" y="61.5" textAnchor="middle" fontSize="14" fontWeight="900" fill="#fff">A+</text>
        <path d="M82 40 L92 30 L96 34 L86 44 Z" fill="#ffd24d" stroke={ink} strokeWidth="3" strokeLinejoin="round" />
      </>
    ),
    latih: (
      <>
        <circle cx="46" cy="40" r="32" fill="#fff" stroke={ink} strokeWidth="4" />
        <circle cx="46" cy="40" r="22" fill="#2f9a4a" stroke={ink} strokeWidth="3.5" />
        <circle cx="46" cy="40" r="12" fill="#fff" stroke={ink} strokeWidth="3.5" />
        <circle cx="46" cy="40" r="4" fill="#e5432d" />
        <path d="M84 6 l3 9 9 3-9 3-3 9-3-9-9-3 9-3z" fill="#c9d3e6" stroke={ink} strokeWidth="2.5" strokeLinejoin="round" />
        <path d="M80 10 L50 38" stroke={ink} strokeWidth="4" strokeLinecap="round" />
      </>
    ),
  };
  return (
    <svg className="lb-art" viewBox="0 0 100 78" aria-hidden="true">
      {art[id]}
    </svg>
  );
}

/** Label status: Contoh / Akan Datang / Tahun Lepas. */
export function StatusTag({ status, verified }) {
  if (verified) return <span className="lb-tag verified">Kertas Tahun Lepas</span>;
  if (status === 'sample') return <span className="lb-tag sample">Contoh</span>;
  if (status === 'soon') return <span className="lb-tag soon">Akan Datang</span>;
  return null;
}

/** Keadaan kosong / ralat yang mesra — tidak pernah panel kosong tanpa penerangan. */
export function EmptyState({ title, text, children, tone = 'empty' }) {
  return (
    <div className={`lb-empty ${tone}`} role={tone === 'error' ? 'alert' : 'status'}>
      <span className="lb-empty-ico" aria-hidden="true">
        {tone === 'error' ? '!' : '?'}
      </span>
      <h3>{title}</h3>
      {text && <p>{text}</p>}
      {children}
    </div>
  );
}

/** Pemilih Subjek & Darjah (disegerakkan dengan homepage). */
function ContextBar({ subject, grade, onSubject, onGrade }) {
  return (
    <div className="lb-context">
      <label>
        <span>Subjek</span>
        <select value={subject} onChange={(e) => onSubject(e.target.value)}>
          {SUBJECTS.map((s) => (
            <option key={s}>{s}</option>
          ))}
        </select>
      </label>
      <label>
        <span>Darjah</span>
        <select value={grade} onChange={(e) => onGrade(e.target.value)}>
          {GRADES.map((g) => (
            <option key={g}>{g}</option>
          ))}
        </select>
      </label>
    </div>
  );
}

function Chips({ label, value, options, onChange }) {
  return (
    <div className="lb-chips" role="group" aria-label={label}>
      <span className="lb-chips-label">{label}</span>
      {options.map(([id, text]) => (
        <button key={id} type="button" className={value === id ? 'on' : ''} aria-pressed={value === id} onClick={() => onChange(id)}>
          {text}
        </button>
      ))}
    </div>
  );
}

/** Ringkasan kemajuan satu bahan (teks pendek). */
function progressText(cat, item, p) {
  if (!p) return null;
  if (cat === 'nota') return p.completed ? 'Selesai dibaca' : p.pos != null ? `Bahagian ${p.pos + 1}/${item.sections.length}` : null;
  if (cat === 'video') return p.completed ? 'Selesai ditonton' : p.pos ? `Berhenti pada ${mmss(p.pos)}` : null;
  if (cat === 'latih') return p.completed ? `Selesai · ${p.score ?? 0}/${item.questions.length} betul` : p.pos != null ? `Soalan ${p.pos + 1}/${item.questions.length}` : null;
  if (cat === 'kertas') return 'Pernah dibuka';
  return null;
}

function ResourceCard({ cat, item, progress, onOpen }) {
  const soon = item.status === 'soon';
  const topic = item.topicId ? topicById(item.topicId) : null;
  const meta =
    cat === 'nota'
      ? `${item.sections.length || '—'} bahagian`
      : cat === 'video'
        ? item.duration
          ? mmss(item.duration)
          : 'Tempoh belum ada'
        : cat === 'latih'
          ? `${item.questions.length || '—'} soalan`
          : item.verified
            ? `Tahun ${item.year} · ${item.paperType}`
            : `Kertas ${item.paperType}`;
  const action = { nota: 'Baca', video: 'Tonton', kertas: 'Lihat', latih: 'Mula' }[cat];
  const p = progressText(cat, item, progress);
  return (
    <li className={`lb-res ${soon ? 'soon' : ''} ${progress?.completed ? 'done' : ''}`}>
      <span className={`lb-thumb ${cat}`} aria-hidden="true">
        {item.thumb ? <img src={item.thumb} alt="" /> : <CategoryArt id={cat} />}
        {cat === 'video' && !soon && (
          <i className="lb-thumb-play">
            <Play />
          </i>
        )}
      </span>
      <div className="lb-res-main">
        <div className="lb-res-tags">
          {topic && <span className="lb-topic">{topic.title}</span>}
          <StatusTag status={item.status} verified={item.verified} />
        </div>
        <h3>{item.title}</h3>
        <p>{item.desc}</p>
        <small>
          {meta}
          {p && (
            <b className="lb-res-prog">
              {progress?.completed && <Check aria-hidden="true" />} {p}
            </b>
          )}
        </small>
      </div>
      <button type="button" className="lb-btn go" onClick={onOpen} disabled={soon} aria-label={soon ? `${item.title} — akan datang` : `${action}: ${item.title}`}>
        {soon ? 'Akan Datang' : action}
        {!soon && <ChevronRight aria-hidden="true" />}
      </button>
    </li>
  );
}

/* ───────────── PEMBACA NOTA ───────────── */
function TensVisual({ tens, ones }) {
  const label = `${tens} blok puluh dan ${ones} kiub sa, iaitu ${tens * 10 + ones}`;
  return (
    <figure className="lb-tens" role="img" aria-label={label}>
      <div className="lb-tens-row">
        {Array.from({ length: tens }, (_, i) => (
          <i key={`t${i}`} className="rod" />
        ))}
        {Array.from({ length: ones }, (_, i) => (
          <i key={`o${i}`} className="cube" />
        ))}
      </div>
      <figcaption>
        {tens} puluh {ones ? `+ ${ones} sa ` : ''}= <b>{tens * 10 + ones}</b>
      </figcaption>
    </figure>
  );
}

function NoteReader({ note, start = 0, bookmarks, onBookmark, onDone }) {
  const [i, setI] = useState(Math.min(start, note.sections.length - 1));
  const s = note.sections[i];
  const last = i === note.sections.length - 1;
  useEffect(() => {
    recordProgress('nota', note.id, { pos: i, total: note.sections.length });
  }, [i, note]);
  const marked = bookmarks[note.id] === i;
  return (
    <article className="lb-reader">
      <div className="lb-reader-top">
        <span className="lb-step">
          Bahagian {i + 1} / {note.sections.length}
        </span>
        <span className="lb-bar" role="progressbar" aria-valuemin={1} aria-valuemax={note.sections.length} aria-valuenow={i + 1} aria-label="Kemajuan bacaan">
          <i style={{ width: `${((i + 1) / note.sections.length) * 100}%` }} />
        </span>
        <button type="button" className={`lb-icon-btn ${marked ? 'on' : ''}`} onClick={() => onBookmark(i)} aria-pressed={marked} aria-label={marked ? 'Buang penanda buku' : 'Tanda bahagian ini'}>
          {marked ? <BookmarkCheck /> : <Bookmark />}
        </button>
      </div>
      <div className="lb-page" key={i}>
        <h3>{s.title}</h3>
        {s.body.map((t, k) => (
          <p key={k}>{t}</p>
        ))}
        {s.visual?.kind === 'tens' && <TensVisual tens={s.visual.tens} ones={s.visual.ones} />}
        {s.example && (
          <div className="lb-example">
            <b>
              <Lightbulb aria-hidden="true" /> {s.example.label}
            </b>
            {s.example.lines.map((l, k) => (
              <span key={k}>{l}</span>
            ))}
          </div>
        )}
      </div>
      <div className="lb-pager">
        <button type="button" className="lb-btn ghost" onClick={() => setI(i - 1)} disabled={i === 0}>
          <ChevronLeft aria-hidden="true" /> Sebelum
        </button>
        {last ? (
          <button
            type="button"
            className="lb-btn ok"
            onClick={() => {
              recordProgress('nota', note.id, { pos: i, total: note.sections.length, completed: true });
              onDone();
            }}
          >
            <Check aria-hidden="true" /> Selesai
          </button>
        ) : (
          <button type="button" className="lb-btn go" onClick={() => setI(i + 1)}>
            Seterusnya <ChevronRight aria-hidden="true" />
          </button>
        )}
      </div>
    </article>
  );
}

/* ───────────── VIDEO ───────────── */
function VideoView({ video, start = 0 }) {
  const [err, setErr] = useState(false);
  const [attempt, setAttempt] = useState(0);
  const lastSave = useRef(0);
  if (video.status === 'soon' || !video.src) {
    return (
      <div className="lb-video-wrap">
        <div className="lb-video-soon">
          <CategoryArt id="video" />
          <EmptyState title="Video ini akan datang" text="Video pelajaran ini sedang disediakan. Sementara itu, cuba baca Nota atau buat Latih Tubi untuk topik yang sama." />
        </div>
      </div>
    );
  }
  return (
    <div className="lb-video-wrap">
      {err ? (
        <EmptyState tone="error" title="Video tidak dapat dimainkan" text="Fail video tidak ditemui atau sambungan terputus. Semak sambungan internet dan cuba lagi.">
          <button
            type="button"
            className="lb-btn go"
            onClick={() => {
              setErr(false);
              setAttempt((a) => a + 1);
            }}
          >
            <RotateCcw aria-hidden="true" /> Cuba Lagi
          </button>
        </EmptyState>
      ) : (
        <video
          key={attempt}
          className="lb-video"
          controls
          preload="metadata"
          playsInline
          poster={video.thumb || undefined}
          onError={() => setErr(true)}
          onLoadedMetadata={(e) => {
            if (start > 0 && start < e.currentTarget.duration - 2) e.currentTarget.currentTime = start;
          }}
          onTimeUpdate={(e) => {
            const v = e.currentTarget;
            if (Math.abs(v.currentTime - lastSave.current) < 5) return; // simpan setiap ~5 saat
            lastSave.current = v.currentTime;
            recordProgress('video', video.id, { pos: Math.floor(v.currentTime), total: Math.floor(v.duration || 0), completed: v.duration > 0 && v.currentTime / v.duration >= 0.9 });
          }}
          onEnded={(e) => recordProgress('video', video.id, { pos: 0, total: Math.floor(e.currentTarget.duration || 0), completed: true })}
        >
          <source src={video.src} onError={() => setErr(true)} />
          {video.captions && <track kind="captions" src={video.captions} srcLang="ms" label="Bahasa Melayu" default />}
          Pelayar anda tidak menyokong video.
        </video>
      )}
      <p className="lb-note">{video.desc}</p>
    </div>
  );
}

/* ───────────── KERTAS ───────────── */
function PaperView({ paper }) {
  const [which, setWhich] = useState('paper');
  const [state, setState] = useState('loading'); // loading | ok | error
  const [attempt, setAttempt] = useState(0);
  const url = which === 'paper' ? paper.fileUrl : paper.answerSchemeUrl;
  useEffect(() => {
    recordProgress('kertas', paper.id, {});
  }, [paper]);
  useEffect(() => {
    let live = true;
    setState('loading');
    fetch(url, { method: 'HEAD', cache: 'no-store' })
      .then((r) => live && setState(r.ok && !(r.headers.get('content-type') || '').includes('text/html') ? 'ok' : 'error'))
      .catch(() => live && setState('error'));
    return () => {
      live = false;
    };
  }, [url, attempt]);
  return (
    <div className="lb-paper">
      <div className={`lb-paper-label ${paper.verified ? 'verified' : 'sample'}`}>
        <StatusTag status={paper.status} verified={paper.verified} />
        <span>{paper.verified ? `Kertas Tahun Lepas ${paper.year}` : 'Kertas Contoh / Latihan — bukan kertas peperiksaan rasmi.'}</span>
        {paper.source && <small>{paper.source}</small>}
      </div>
      <div className="lb-paper-actions">
        {paper.answerSchemeUrl && (
          <Chips
            label="Paparan"
            value={which}
            onChange={setWhich}
            options={[
              ['paper', 'Kertas Soalan'],
              ['answer', 'Skema Jawapan'],
            ]}
          />
        )}
        {state === 'ok' && (
          <>
            <a className="lb-btn ghost" href={url} target="_blank" rel="noreferrer">
              <ExternalLink aria-hidden="true" /> Buka Tab Baharu
            </a>
            <a className="lb-btn go" href={url} download>
              <Download aria-hidden="true" /> Muat Turun
            </a>
          </>
        )}
      </div>
      {state === 'loading' && <div className="lb-loading" role="status">Memuatkan dokumen…</div>}
      {state === 'error' && (
        <EmptyState tone="error" title="Dokumen tidak dapat dibuka" text="Fail kertas ini belum dimuat naik atau tidak ditemui.">
          <button type="button" className="lb-btn go" onClick={() => setAttempt((a) => a + 1)}>
            <RotateCcw aria-hidden="true" /> Cuba Lagi
          </button>
        </EmptyState>
      )}
      {state === 'ok' && <iframe className="lb-doc" src={url} title={which === 'paper' ? paper.title : `Skema jawapan: ${paper.title}`} />}
    </div>
  );
}

/* ───────────── LATIH TUBI ───────────── */
function PracticeRun({ set, resume, onExit }) {
  const total = set.questions.length;
  const [phase, setPhase] = useState(resume?.pos != null && !resume.completed ? 'q' : 'intro');
  const [i, setI] = useState(resume?.completed ? 0 : (resume?.pos ?? 0));
  const [results, setResults] = useState(resume?.completed ? [] : (resume?.results ?? [])); // true = betul pada cubaan pertama
  const [input, setInput] = useState('');
  const [fb, setFb] = useState(null); // null | 'right' | 'wrong' | 'reveal'
  const [tries, setTries] = useState(0);
  const q = set.questions[i];
  const score = results.filter(Boolean).length;

  const check = (val) => {
    const ok = q.type === 'number' ? Number(String(val).trim()) === q.answer : val === q.answer;
    if (ok) {
      setFb('right');
      if (tries === 0) setResults((r) => Object.assign([...r], { [i]: true }));
    } else {
      setFb('wrong');
      setResults((r) => Object.assign([...r], { [i]: false }));
    }
    setTries((t) => t + 1);
  };
  const next = () => {
    const res = [...results];
    if (res[i] === undefined) res[i] = fb === 'right';
    if (i + 1 >= total) {
      const sc = res.filter(Boolean).length;
      recordProgress('latih', set.id, { pos: total - 1, results: res, score: sc, completed: true });
      setPhase('done');
    } else {
      recordProgress('latih', set.id, { pos: i + 1, results: res });
      setI(i + 1);
    }
    setResults(res);
    setInput('');
    setFb(null);
    setTries(0);
  };
  const restart = () => {
    setI(0);
    setResults([]);
    setFb(null);
    setTries(0);
    setInput('');
    setPhase('q');
    recordProgress('latih', set.id, { pos: 0, results: [] });
  };

  if (phase === 'intro') {
    return (
      <div className="lb-practice">
        <div className="lb-intro">
          <CategoryArt id="latih" />
          <h3>{set.title}</h3>
          <p>{set.instructions}</p>
          <ul>
            <li>{total} soalan</li>
            <li>Penerangan selepas setiap jawapan</li>
            <li>Tiada had masa — buat ikut rentak sendiri</li>
          </ul>
          <button
            type="button"
            className="lb-btn go big"
            onClick={() => {
              setPhase('q');
              recordProgress('latih', set.id, { pos: i, results });
            }}
          >
            Mula Latihan <ChevronRight aria-hidden="true" />
          </button>
        </div>
      </div>
    );
  }
  if (phase === 'done') {
    return (
      <div className="lb-practice">
        <div className="lb-summary">
          <h3>Latihan Selesai!</h3>
          <p className="lb-score">
            <b>{score}</b>/{total} betul pada cubaan pertama
          </p>
          <p>{score === total ? 'Hebat! Semua betul.' : score >= total / 2 ? 'Bagus! Baca semula penerangan untuk soalan yang tersilap.' : 'Teruskan berlatih — setiap ninja bermula di sini.'}</p>
          <ol className="lb-review">
            {set.questions.map((qq, k) => (
              <li key={qq.id} className={results[k] ? 'ok' : 'no'}>
                <span aria-hidden="true">{results[k] ? '✓' : '✗'}</span> {qq.text}
                <small>Jawapan: {String(qq.answer)}</small>
              </li>
            ))}
          </ol>
          <div className="lb-pager">
            <button type="button" className="lb-btn ghost" onClick={onExit}>
              <ArrowLeft aria-hidden="true" /> Kembali
            </button>
            <button type="button" className="lb-btn go" onClick={restart}>
              <RotateCcw aria-hidden="true" /> Cuba Lagi
            </button>
          </div>
        </div>
      </div>
    );
  }
  const answered = fb === 'right' || fb === 'reveal';
  return (
    <div className="lb-practice">
      <div className="lb-reader-top">
        <span className="lb-step">
          Soalan {i + 1} / {total}
        </span>
        <span className="lb-bar" role="progressbar" aria-valuemin={0} aria-valuemax={total} aria-valuenow={i} aria-label="Kemajuan latihan">
          <i style={{ width: `${(i / total) * 100}%` }} />
        </span>
      </div>
      <div className="lb-question" key={q.id}>
        <h3>{q.text}</h3>
        {q.type === 'mcq' ? (
          <div className="lb-choices" role="group" aria-label="Pilihan jawapan">
            {q.choices.map((c) => (
              <button
                key={c}
                type="button"
                disabled={answered}
                className={answered && c === q.answer ? 'right' : fb === 'wrong' && input === c ? 'wrong' : ''}
                onClick={() => {
                  setInput(c);
                  check(c);
                }}
              >
                {c}
              </button>
            ))}
          </div>
        ) : (
          <form
            className="lb-num"
            onSubmit={(e) => {
              e.preventDefault();
              if (input.trim() !== '' && !answered) check(input);
            }}
          >
            <label htmlFor="lb-ans">Jawapan:</label>
            <input id="lb-ans" inputMode="numeric" pattern="[0-9]*" value={input} disabled={answered} onChange={(e) => setInput(e.target.value.replace(/[^0-9]/g, '').slice(0, 4))} autoComplete="off" />
            <button type="submit" className="lb-btn go" disabled={answered || input.trim() === ''}>
              Semak
            </button>
          </form>
        )}
        <div className="lb-feedback" aria-live="polite">
          {fb === 'right' && (
            <div className="lb-fb right">
              <b>Betul! 🎉</b>
              <p>{q.explain}</p>
            </div>
          )}
          {fb === 'wrong' && (
            <div className="lb-fb wrong">
              <b>Belum tepat. Cuba fikir semula!</b>
              <div className="lb-fb-actions">
                <button
                  type="button"
                  className="lb-btn ghost"
                  onClick={() => {
                    setFb(null);
                    setInput('');
                  }}
                >
                  <RotateCcw aria-hidden="true" /> Cuba Lagi
                </button>
                <button type="button" className="lb-btn go" onClick={() => setFb('reveal')}>
                  Lihat Jawapan
                </button>
              </div>
            </div>
          )}
          {fb === 'reveal' && (
            <div className="lb-fb reveal">
              <b>Jawapan: {String(q.answer)}</b>
              <p>{q.explain}</p>
            </div>
          )}
        </div>
      </div>
      {answered && (
        <div className="lb-pager end">
          <button type="button" className="lb-btn ok" onClick={next}>
            {i + 1 >= total ? 'Selesai' : 'Seterusnya'} <ChevronRight aria-hidden="true" />
          </button>
        </div>
      )}
    </div>
  );
}

/* ───────────── skrin utama ───────────── */
export default function LibraryPage({ open, onClose, subject, grade, onSubjectChange, onGradeChange }) {
  const [stack, setStack] = useState([{ v: 'hub' }]);
  const [lib, setLib] = useState(loadLibrary);
  const [topic, setTopic] = useState('all');
  const [paperType, setPaperType] = useState('all');
  const [year, setYear] = useState('all');
  const headRef = useRef(null);
  const homeRef = useRef(null);
  const view = stack[stack.length - 1];

  const push = (v) => setStack((s) => [...s, v]);
  const back = () => setStack((s) => (s.length > 1 ? s.slice(0, -1) : s));
  const refresh = () => setLib(loadLibrary());

  useEffect(() => {
    if (!open) return undefined;
    const opener = document.activeElement;
    setStack([{ v: 'hub' }]);
    refresh();
    homeRef.current?.focus();
    const prev = document.body.style.overflow;
    document.body.style.overflow = 'hidden';
    return () => {
      document.body.style.overflow = prev;
      if (opener instanceof HTMLElement) opener.focus();
    };
  }, [open]);

  // Esc: kembali satu langkah; di hub → tutup
  const keyRef = useRef(null);
  keyRef.current = (e) => {
    if (e.key !== 'Escape') return;
    if (stack.length > 1) back();
    else onClose();
  };
  useEffect(() => {
    if (!open) return undefined;
    const h = (e) => keyRef.current(e);
    window.addEventListener('keydown', h);
    return () => window.removeEventListener('keydown', h);
  }, [open]);

  // fokus pada tajuk setiap kali halaman bertukar (pembaca skrin & papan kekunci)
  useEffect(() => {
    if (open && stack.length > 1) headRef.current?.focus();
    refresh();
    window.scrollTo?.(0, 0);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [stack.length, view.v, view.id, view.cat]);

  // tukar Subjek/Darjah → set semula penapis topik
  useEffect(() => {
    setTopic('all');
    setYear('all');
  }, [subject, grade]);

  if (!open) return null;

  const openItem = (cat, item) => push({ v: 'item', cat, id: item.id });
  const resume = (r) => {
    const ctx = contextOf(r.cat, r.item);
    if (ctx) {
      if (ctx.subject !== subject) onSubjectChange?.(ctx.subject);
      if (ctx.grade !== grade) onGradeChange?.(ctx.grade);
    }
    setStack([{ v: 'hub' }, { v: 'cat', cat: r.cat }, { v: 'item', cat: r.cat, id: r.item.id }]);
  };

  /* ── hub ── */
  const renderHub = () => {
    const last = lastValid(lib);
    const lastCat = last && catOf(last.cat);
    return (
      <div className="lb-hub">
        <ContextBar subject={subject} grade={grade} onSubject={onSubjectChange} onGrade={onGradeChange} />
        <ul className="lb-cats">
          {CATEGORIES.map((c) => {
            const n = resourcesFor(c.id, subject, grade).filter((r) => r.status !== 'soon').length;
            return (
              <li key={c.id}>
                <button type="button" className={`lb-cat ${c.id}`} style={{ '--tone': c.tone }} onClick={() => push({ v: 'cat', cat: c.id })}>
                  <span className="lb-cat-art">
                    <CategoryArt id={c.id} />
                  </span>
                  <b>{c.short.toUpperCase()}</b>
                  <span className="lb-cat-desc">{c.desc}</span>
                  <span className="lb-cat-count">{n ? `${n} bahan` : 'Belum ada kandungan'}</span>
                </button>
              </li>
            );
          })}
        </ul>
        <section className="lb-continue" aria-label="Sambung Pembelajaran">
          <h2>Sambung Pembelajaran</h2>
          {last ? (
            <div className="lb-continue-row">
              <span className={`lb-thumb ${last.cat}`} aria-hidden="true">
                <CategoryArt id={last.cat} />
              </span>
              <div className="lb-res-main">
                <div className="lb-res-tags">
                  <span className="lb-topic">{lastCat?.title}</span>
                  <StatusTag status={last.item.status} verified={last.item.verified} />
                </div>
                <h3>{last.item.title}</h3>
                <small>{progressText(last.cat, last.item, last.progress) || 'Baru dibuka'}</small>
              </div>
              <button type="button" className="lb-btn ok" onClick={() => resume(last)}>
                Sambung <ChevronRight aria-hidden="true" />
              </button>
            </div>
          ) : (
            <p className="lb-continue-empty">Belum ada pembelajaran lagi. Pilih satu kategori di atas untuk bermula — kemajuan awak akan disimpan di sini!</p>
          )}
        </section>
      </div>
    );
  };

  /* ── kategori ── */
  const renderCat = (catId) => {
    const c = catOf(catId);
    const topics = topicsFor(subject, grade);
    let list = resourcesFor(catId, subject, grade, catId === 'kertas' ? 'all' : topic);
    const years = [...new Set(resourcesFor('kertas', subject, grade).filter((p) => p.year).map((p) => p.year))].sort((a, b) => b - a);
    if (catId === 'kertas') {
      if (paperType !== 'all') list = list.filter((p) => (paperType === 'verified' ? p.verified : !p.verified));
      if (year !== 'all') list = list.filter((p) => String(p.year) === String(year));
    }
    // bahan sebenar dahulu, kemudian Contoh, kemudian Akan Datang (tidak bercampur)
    const rank = (r) => (r.status === 'ready' ? 0 : r.status === 'sample' ? 1 : 2);
    list = [...list].sort((a, b) => rank(a) - rank(b));
    return (
      <div className="lb-catview">
        <ContextBar subject={subject} grade={grade} onSubject={onSubjectChange} onGrade={onGradeChange} />
        {catId !== 'kertas' && topics.length > 0 && (
          <Chips label="Pilih Topik" value={topic} onChange={setTopic} options={[['all', 'Semua'], ...topics.map((t) => [t.id, t.title])]} />
        )}
        {catId === 'kertas' && (
          <div className="lb-filters">
            <Chips
              label="Jenis"
              value={paperType}
              onChange={setPaperType}
              options={[
                ['all', 'Semua'],
                ['verified', 'Tahun Lepas'],
                ['sample', 'Contoh / Latihan'],
              ]}
            />
            {years.length > 0 && (
              <label className="lb-year">
                <span>Tahun</span>
                <select value={year} onChange={(e) => setYear(e.target.value)}>
                  <option value="all">Semua</option>
                  {years.map((y) => (
                    <option key={y}>{y}</option>
                  ))}
                </select>
              </label>
            )}
          </div>
        )}
        {list.length ? (
          <ul className="lb-list">
            {list.map((r) => (
              <ResourceCard key={r.id} cat={catId} item={r} progress={lib.items[r.id]} onOpen={() => openItem(catId, r)} />
            ))}
          </ul>
        ) : (
          <EmptyState
            title="Belum Ada Kandungan"
            text={
              catId === 'kertas' && paperType === 'verified'
                ? `Tiada Kertas Tahun Lepas untuk ${subject} ${grade} lagi. Kertas sebenar akan ditambah bila dibekalkan.`
                : `${c.title} untuk ${subject} ${grade} sedang disediakan. Cuba pilih Subjek atau Darjah lain.`
            }
          />
        )}
      </div>
    );
  };

  /* ── bahan ── */
  const renderItem = (catId, id) => {
    const found = findResource(id);
    if (!found || (found.item.status === 'soon' && catId !== 'video')) {
      return <EmptyState tone="error" title="Bahan tidak ditemui" text="Bahan ini telah dialihkan atau belum tersedia." />;
    }
    const { item } = found;
    const p = lib.items[id];
    if (catId === 'nota')
      return (
        <NoteReader
          note={item}
          start={p && !p.completed ? (p.pos ?? 0) : 0}
          bookmarks={lib.bookmarks}
          onBookmark={(sec) => setLib(toggleBookmark(item.id, sec))}
          onDone={back}
        />
      );
    if (catId === 'video') return <VideoView video={item} start={p && !p.completed ? (p.pos ?? 0) : 0} />;
    if (catId === 'kertas') return <PaperView paper={item} />;
    if (catId === 'latih') return <PracticeRun set={item} resume={p} onExit={back} />;
    return null;
  };

  const item = view.v === 'item' ? findResource(view.id)?.item : null;
  const title = view.v === 'hub' ? null : view.v === 'cat' ? catOf(view.cat).title : (item?.title ?? 'Bahan');
  const crumb = view.v === 'item' ? catOf(view.cat).title : null;

  return (
    <div className="lb-screen" role="dialog" aria-modal="true" aria-labelledby="lb-title">
      <div className="lb-room" aria-hidden="true" />
      <div className="lb-wrap">
        <header className="lb-head">
          <button ref={homeRef} type="button" className="lb-home" onClick={onClose} aria-label="Kembali ke Laman Utama">
            <i className="lb-rope l" aria-hidden="true" />
            <i className="lb-rope r" aria-hidden="true" />
            <svg viewBox="0 0 32 32" aria-hidden="true">
              <rect x="7" y="14" width="18" height="14" rx="2" fill="#fff3d6" stroke="#5a1f12" strokeWidth="2.4" />
              <path d="M3 16 16 4l13 12" fill="#2f7fd6" stroke="#5a1f12" strokeWidth="2.6" strokeLinejoin="round" strokeLinecap="round" />
              <rect x="13" y="19" width="6" height="9" rx="1.5" fill="#a8622c" stroke="#5a1f12" strokeWidth="2" />
            </svg>
            <span>Utama</span>
          </button>
          <div className="lb-sign">
            <i className="lb-rope l" aria-hidden="true" />
            <i className="lb-rope r" aria-hidden="true" />
            <h1 id="lb-title">Perpustakaan Ilmu Ninja</h1>
            <p>Terokai ilmu dan tingkatkan kemahiran ninja awak!</p>
          </div>
        </header>

        <main className="lb-panel">
          {view.v !== 'hub' && (
            <div className="lb-crumbs">
              <button type="button" className="lb-btn ghost" onClick={back}>
                <ArrowLeft aria-hidden="true" /> Kembali
              </button>
              <div className="lb-crumb-title">
                {crumb && <small>{crumb}</small>}
                <h2 ref={headRef} tabIndex={-1}>
                  {view.v === 'cat' && (
                    <span className="lb-crumb-art" aria-hidden="true">
                      <CategoryArt id={view.cat} />
                    </span>
                  )}
                  {title}
                </h2>
              </div>
              {view.v === 'item' && (
                <button type="button" className="lb-icon-btn" onClick={() => setStack([{ v: 'hub' }])} aria-label="Ke halaman utama perpustakaan" title="Perpustakaan">
                  <X />
                </button>
              )}
            </div>
          )}
          {view.v === 'hub' && renderHub()}
          {view.v === 'cat' && renderCat(view.cat)}
          {view.v === 'item' && renderItem(view.cat, view.id)}
        </main>
      </div>
    </div>
  );
}

