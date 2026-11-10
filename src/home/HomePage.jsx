import { useEffect, useState } from 'react';
import { X } from 'lucide-react';
import { GELARAN, KedaiModal } from './components/KedaiModal';
import { SakuraFall } from './components/SakuraFall';
import { BirdsFlow } from './components/BirdsFlow';
import './dojo.css';
import './home-layout.css';

function Icon({ name, className = '' }) {
  const common = { fill: 'none', stroke: 'currentColor', strokeWidth: 2.4, strokeLinecap: 'round', strokeLinejoin: 'round' };
  const paths = {
    book: <><path {...common} d="M3.5 5.2c2.9-.8 5.7-.2 8.5 1.7v13c-2.8-1.9-5.6-2.5-8.5-1.7Z"/><path {...common} d="M20.5 5.2c-2.9-.8-5.7-.2-8.5 1.7v13c2.8-1.9 5.6-2.5 8.5-1.7Z"/></>,
    quiz: <><path {...common} d="M5 3h11l3 3v15H5Z"/><path {...common} d="M8 9h7M8 13h5M8 17h3"/><path {...common} d="m15 17 1.5 1.5L20 15"/></>,
    shop: <><path {...common} d="M4 10v10h16V10M3 10l2-6h14l2 6"/><path {...common} d="M3 10c0 2 4 2 4 0 0 2 5 2 5 0 0 2 5 2 5 0 0 2 4 2 4 0M9 20v-5h6v5"/></>,
    more: <><circle cx="5" cy="12" r="1.6" fill="currentColor"/><circle cx="12" cy="12" r="1.6" fill="currentColor"/><circle cx="19" cy="12" r="1.6" fill="currentColor"/></>,
    gear: <><circle {...common} cx="12" cy="12" r="3"/><path {...common} d="M19.4 15a1.7 1.7 0 0 0 .3 1.9l.1.1-2.8 2.8-.1-.1a1.7 1.7 0 0 0-1.9-.3 1.7 1.7 0 0 0-1 1.6v.2h-4V21a1.7 1.7 0 0 0-1-1.6 1.7 1.7 0 0 0-1.9.3l-.1.1L4.2 17l.1-.1a1.7 1.7 0 0 0 .3-1.9A1.7 1.7 0 0 0 3 14H2.8v-4H3a1.7 1.7 0 0 0 1.6-1 1.7 1.7 0 0 0-.3-1.9L4.2 7 7 4.2l.1.1A1.7 1.7 0 0 0 9 4.6 1.7 1.7 0 0 0 10 3v-.2h4V3a1.7 1.7 0 0 0 1 1.6 1.7 1.7 0 0 0 1.9-.3l.1-.1L19.8 7l-.1.1a1.7 1.7 0 0 0-.3 1.9 1.7 1.7 0 0 0 1.6 1h.2v4H21a1.7 1.7 0 0 0-1.6 1Z"/></>,
    cap: <><path {...common} d="m2.5 9 9.5-5 9.5 5-9.5 5Z"/><path {...common} d="M6 11.2v5c3.5 2.7 8.5 2.7 12 0v-5M21.5 9v6"/></>,
    calc: <><rect {...common} x="5" y="2.5" width="14" height="19" rx="2"/><path {...common} d="M8 6h8M8.5 11h1M12 11h1M15.5 11h1M8.5 15h1M12 15h1M15.5 15h1M8.5 18.5h1M12 18.5h4.5"/></>,
    play: <path d="m8 5 11 7-11 7Z" fill="currentColor" stroke="currentColor" strokeLinejoin="round" />,
  };
  return <svg className={className} viewBox="0 0 24 24" aria-hidden="true">{paths[name]}</svg>;
}

function VillageScene() {
  return (
    <svg className="village-scene" viewBox="0 0 1280 720" preserveAspectRatio="xMidYMid slice" aria-hidden="true">
      <defs>
        <linearGradient id="sky" x2="0" y2="1"><stop stopColor="#1aa8ee"/><stop offset=".55" stopColor="#98ddf5"/><stop offset="1" stopColor="#ffe3bd"/></linearGradient>
        <linearGradient id="grass" x2="0" y2="1"><stop stopColor="#77c849"/><stop offset="1" stopColor="#318b3d"/></linearGradient>
        <pattern id="stones" width="150" height="65" patternUnits="userSpaceOnUse"><path d="M-10 28Q25 5 67 19T160 15v46H-10Z" fill="#e8c29b" stroke="#bd8f70" strokeWidth="2"/><path d="M74 20v42M18 29l5 33M132 24l-8 38" stroke="#c99c7b" strokeWidth="2"/></pattern>
        <filter id="soft"><feGaussianBlur stdDeviation="3"/></filter>
      </defs>
      <rect width="1280" height="720" fill="url(#sky)"/>
      <g fill="#fff" opacity=".8" filter="url(#soft)"><path d="M90 158c38-45 89-22 97 15 38-22 91 4 89 42H35c-5-35 24-60 55-57Z"/><path d="M930 120c34-40 82-20 89 14 35-21 81 4 80 37H880c-5-32 22-54 50-51Z"/></g>
      <path d="M410 300 625 120l90 92 88-78 204 166Z" fill="#42a9d1" opacity=".65"/><path d="m516 300 150-128 54 47 74-65 170 146Z" fill="#398ebd" opacity=".68"/>
      <path d="M0 294q120-76 242 0 120-72 244 0 132-72 276 0 130-74 268 0 120-68 250 0v220H0Z" fill="url(#grass)"/>
      <g className="sakura" fill="#f78fb4" stroke="#ea6395" strokeWidth="2">
        <path d="M177 377q18-91 2-174" fill="none" stroke="#77452d" strokeWidth="24"/><path d="m180 260-62-50m61 14 53-50m-62 112-74-10m84-39 77 2" fill="none" stroke="#77452d" strokeWidth="13"/>
        {[[82,194],[117,173],[153,191],[188,163],[221,185],[253,168],[275,213],[227,224],[147,226],[96,237],[61,218],[119,267],[204,267]].map(([x,y],i)=><circle key={i} cx={x} cy={y} r={22+(i%3)*4}/>) }
        <path d="M1050 378q-15-94 2-174" fill="none" stroke="#77452d" strokeWidth="24"/><path d="m1050 260-60-54m60 24 58-49m-56 106-80-8m79-42 77 5" fill="none" stroke="#77452d" strokeWidth="13"/>
        {[[955,190],[989,174],[1025,194],[1061,164],[1097,183],[1132,169],[1155,211],[1105,224],[1024,223],[970,241],[939,217],[993,267],[1082,266]].map(([x,y],i)=><circle key={i} cx={x} cy={y} r={22+(i%3)*4}/>) }
      </g>
      <g transform="translate(92 225)"><path d="M0 106 126 21l126 85Z" fill="#30314a" stroke="#17213b" strokeWidth="8"/><path d="M27 103h198v164H27Z" fill="#b74d29" stroke="#713019" strokeWidth="7"/><path d="M-19 158 126 89l145 69Z" fill="#38384d" stroke="#1e2338" strokeWidth="8"/><path d="M17 165h218v25H17Z" fill="#dc7d2e"/><rect x="89" y="191" width="74" height="76" rx="4" fill="#e7a954" stroke="#773b1f" strokeWidth="6"/><path d="M126 192v74" stroke="#773b1f" strokeWidth="5"/><rect x="45" y="202" width="28" height="34" fill="#ffe26b" stroke="#69391f" strokeWidth="5"/><rect x="180" y="202" width="28" height="34" fill="#ffe26b" stroke="#69391f" strokeWidth="5"/></g>
      <path d="M0 465q118-47 225 4 95-40 193 8 119-51 231-2 123-50 242 3 106-45 213-1 90-39 176-3v118H0Z" fill="#80c94d"/>
      <g fill="#55a938" stroke="#35812f" strokeWidth="4">{[20,70,290,338,895,940,1160,1210].map((x,i)=><circle key={i} cx={x} cy={495-(i%2)*12} r="52"/>)}</g>
      <rect y="520" width="1280" height="200" fill="url(#stones)"/><path d="M0 520q280-30 540 0t740 0" fill="none" stroke="#f4d7b7" strokeWidth="12"/>
      <g className="lantern" transform="translate(333 362)"><path d="M25 0v126" stroke="#3e3025" strokeWidth="10"/><path d="M0 34h50l-8 48H8Z" fill="#ffac17" stroke="#4b2b1c" strokeWidth="7"/><rect x="13" y="42" width="24" height="27" fill="#fff27b"/><path d="m-6 34 31-17 31 17" fill="#3a2d36" stroke="#211d28" strokeWidth="7"/></g>
      <g className="lantern" transform="translate(884 365)"><path d="M25 0v126" stroke="#3e3025" strokeWidth="10"/><path d="M0 34h50l-8 48H8Z" fill="#ffac17" stroke="#4b2b1c" strokeWidth="7"/><rect x="13" y="42" width="24" height="27" fill="#fff27b"/><path d="m-6 34 31-17 31 17" fill="#3a2d36" stroke="#211d28" strokeWidth="7"/></g>
      <g className="corner-leaves" fill="#5caf18" stroke="#286b1d" strokeWidth="4"><path d="M0 0h150q-6 43-52 61 21-44 3-61-8 72-72 103 37-72-29-78Z"/><path d="M1280 0h-150q6 43 52 61-21-44-3-61 8 72 72 103-37-72 29-78Z"/><path d="M0 720v-116q66 2 107 63-55-25-81 9 70-2 99 44Z"/><path d="M1280 720v-116q-66 2-107 63 55-25 81 9-70-2-99 44Z"/></g>
    </svg>
  );
}

function Ninja({ accent = '#ff7a00', small = false }) {
  return <svg className={`ninja-svg ${small ? 'small' : ''}`} viewBox="0 0 270 330" aria-hidden="true"><g className="ninja-bob">
    <ellipse cx="137" cy="310" rx="83" ry="15" fill="#2b1a13" opacity=".25"/><path d="M70 285q-18 17-35 12-13-4-3-15l39-35 31 23Z" fill="#20242e" stroke="#11141b" strokeWidth="8"/><path d="M171 272 202 250l37 34q11 11-3 16-20 6-39-14Z" fill="#20242e" stroke="#11141b" strokeWidth="8"/>
    <path d="M76 174q-16 45-6 101l47 4 20-72 24 72 47-5q9-55-10-101Z" fill="#252a35" stroke="#11151c" strokeWidth="9"/><path d="m71 198 132-8" stroke="#3a414e" strokeWidth="7"/><path d="M91 190q40 20 91 0" fill="none" stroke={accent} strokeWidth="17"/><path d="m137 198-19 57 31-10 22 34 9-87Z" fill={accent} stroke="#572914" strokeWidth="6"/>
    <circle cx="137" cy="102" r="81" fill="#222731" stroke="#11151c" strokeWidth="9"/><path d="M73 82q10-62 64-66 60 1 70 69-61-23-134-3Z" fill="#282e39"/><path d="M62 75q73-34 150 0l-10 32Q136 82 70 108Z" fill={accent} stroke="#5a2d17" strokeWidth="6"/><path d="m195 77 48-19-23 31 22 20-48-4Z" fill={accent} stroke="#5a2d17" strokeWidth="6"/>
    <path d="M75 92q59-30 125 0v36q-2 58-63 61-59-4-62-61Z" fill="#f2b779" stroke="#12161d" strokeWidth="8"/><path d="M75 139q63 17 125 0v37q-67 35-125-2Z" fill="#20242e"/>
    <ellipse cx="108" cy="116" rx="14" ry="19" fill="#fff" stroke="#2b1b13" strokeWidth="5"/><ellipse cx="164" cy="116" rx="14" ry="19" fill="#fff" stroke="#2b1b13" strokeWidth="5"/><circle cx="110" cy="121" r="7" fill="#392315"/><circle cx="166" cy="121" r="7" fill="#392315"/><circle cx="107" cy="116" r="2.5" fill="#fff"/><circle cx="163" cy="116" r="2.5" fill="#fff"/>
    <path d="M119 147q18 19 37 0-3 28-19 28-15-1-18-28Z" fill="#d73935" stroke="#1b1413" strokeWidth="4"/><path d="M123 151h29" stroke="#fff" strokeWidth="5"/>
    <path d="M78 188Q42 202 28 177q-7-15 7-18 9-2 13 9-8-30 7-33 11-1 13 25l25-13Z" fill="#f2b779" stroke="#11151c" strokeWidth="8"/><path d="m197 183 33 36" stroke="#11151c" strokeWidth="25" strokeLinecap="round"/><path d="m229 220 14-41" stroke="#4c7d23" strokeWidth="9"/><path d="m243 180 12-18 7 22 22-1-18 14 7 21-19-12-18 13 5-22-17-13Z" fill="#80bd2d" stroke="#315a1d" strokeWidth="4"/>
  </g></svg>;
}

function SideButton({ type, label, badge, onClick }) {
  const art = type === 'mission' ? '/home/homepage/mission-button.webp' : '/home/homepage/reward-button.webp';
  return <button className="side-action" onClick={onClick} aria-label={label}>
    <span className="side-art"><img className="side-frame-art" src="/home/homepage/frame%20button.webp" alt=""/><img className={`side-object-art ${type}`} src={art} alt=""/></span>
    {badge && <b>{badge}</b>}<span>{label}</span>
  </button>;
}
function HomeNotice({ title, children, onClose }) { return <div className="notice-backdrop" role="presentation" onMouseDown={(e)=>{ if(e.target===e.currentTarget) onClose(); }}><section className="home-notice" role="dialog" aria-modal="true" aria-label={title}><button className="notice-close" onClick={onClose}><X /></button><h2>{title}</h2>{children}</section></div>; }

const PROFILE_AVATARS = {
  'av-1': '/home/character/character1.webp', 'av-2': '/home/character/character2.webp',
  'av-3': '/home/character/character3.webp', 'av-4': '/home/character/character4.webp',
  'av-5': '/home/character/character5.webp', 'av-6': '/home/character/character6.webp',
  'av-7': '/home/character/character7.webp', 'av-8': '/home/character/character8.webp',
  'av-r1': '/home/character/character-R1.webp', 'av-r2': '/home/character/character-R2.webp',
  'av-r3': '/home/character/character-R3.webp', 'av-r4': '/home/character/character-R4.webp',
  'av-l1': '/home/character/character-P1.webp', 'av-l2': '/home/character/character-P2.webp',
  'av-l3': '/home/character/character-P3.webp',
};
const PROFILE_FRAMES = {
  'fr-default': '/home/frame/frame-B1.webp', 'fr-sakura': '/home/frame/frame-B2.webp',
  'fr-fire': '/home/frame/frame-B3.webp', 'fr-ocean': '/home/frame/frame-R1.webp',
  'fr-gold': '/home/frame/frame-R2.webp', 'fr-dragon': '/home/frame/frame-P1.webp',
};

const SUBJECT_THEMES = {
  Matematik: {
    key: 'math', name: 'MATH', tagline: 'Latihan Ninja • Matematik Seronok',
    lesson: 'Nombor', detail: 'hingga 100', prompt: 'Sedia untuk pengembaraan?',
    icon: '＋', background: '/home/homepage/village-bg.webp',
  },
  Sains: {
    key: 'science', name: 'SAINS', tagline: 'Latihan Ninja • Sains Menakjubkan',
    lesson: 'Benda hidup', detail: 'dan habitat', prompt: 'Sedia untuk meneroka?',
    icon: '🔬', background: '/home/homepage/science-bg.webp',
  },
  'Bahasa Melayu': {
    key: 'language', name: 'BAHASA', tagline: 'Latihan Ninja • Bahasa Melayu Ceria',
    lesson: 'Suku kata', detail: 'mudah', prompt: 'Sedia untuk membaca?',
    icon: 'Aa', background: '/home/homepage/bahasa-bg.webp',
  },
};

function ProfilePopup({ open, onClose, profile }) {
  useEffect(() => {
    if (!open) return undefined;
    const close = (event) => { if (event.key === 'Escape') onClose(); };
    window.addEventListener('keydown', close);
    return () => window.removeEventListener('keydown', close);
  }, [open, onClose]);
  if (!open) return null;
  let progress = { stagesCleared: 0, tier: 0 };
  try { progress = JSON.parse(localStorage.getItem('battlepass_progress')) || progress; } catch {}
  const equipped = profile.equipped || {};
  const avatar = PROFILE_AVATARS[equipped.avatar] || PROFILE_AVATARS['av-1'];
  const frame = PROFILE_FRAMES[equipped.bingkai] || PROFILE_FRAMES['fr-default'];
  const title = GELARAN.find((item) => item.id === equipped.gelaran) || GELARAN[0];
  return <div className="profile-popup-backdrop" onMouseDown={(event)=>{ if (event.target === event.currentTarget) onClose(); }}>
    <section className="profile-popup" role="dialog" aria-modal="true" aria-labelledby="profile-popup-title">
      <button className="profile-popup-close" onClick={onClose} aria-label="Tutup profil"><X /></button>
      <div className="profile-popup-head">
        <div className="profile-popup-avatar"><img className="profile-avatar-bg" src="/home/character/bg-character.webp" alt=""/><img className="profile-avatar-character" src={avatar} alt="Avatar mad"/><img className="profile-avatar-frame" src={frame} alt=""/></div>
        <h2 id="profile-popup-title">mad</h2>
        <div className="profile-title"><img src={title.img} alt=""/><span>{title.name}</span></div>
      </div>
      <div className="profile-popup-stats">
        <div><span>🪙</span><b>{profile.coins || 0}</b><small>Mata</small></div>
        <div><span>🔥</span><b>2 hari</b><small>Streak</small></div>
        <div><span>🥷</span><b>{progress.tier || 0}/5</b><small>BP Tier</small></div>
        <div><span>🗺️</span><b>{progress.stagesCleared || 0}/10</b><small>Stage</small></div>
      </div>
      <div className="profile-battlepass">
        <div className="profile-bp-label"><span>Battle Pass · Musim 1</span><b>{progress.stagesCleared || 0}/10</b></div>
        <div className="profile-bp-tiers">{[1,2,3,4,5].map((tier)=><span key={tier} className={(progress.tier || 0) >= tier ? 'done' : ''}>{(progress.tier || 0) >= tier ? '✓' : tier}</span>)}</div>
        <div className="profile-bp-track"><i style={{width:`${Math.min((progress.stagesCleared || 0) * 10, 100)}%`}}/></div>
        <p>Selesaikan latihan untuk membuka ganjaran seterusnya!</p>
      </div>
      <button className="profile-shop-button" onClick={()=>{ onClose(); document.querySelector('[data-open-shop]')?.click(); }}>Ubah Avatar di Kedai</button>
    </section>
  </div>;
}

export default function HomePage({ onPlay, onPlayDarjah4, onOpenMinigame, sound, onToggleSound, profile, onProfileChange }) {
  const [subject, setSubject] = useState('Matematik'); const [grade, setGrade] = useState('Darjah 1'); const [shopOpen, setShopOpen] = useState(false); const [profileOpen, setProfileOpen] = useState(false); const [notice, setNotice] = useState(null); const [reducedMotion, setReducedMotion] = useState(() => window.matchMedia('(prefers-reduced-motion: reduce)').matches);
  const equipped = profile.equipped || {};
  const homeAvatar = PROFILE_AVATARS[equipped.avatar] || PROFILE_AVATARS['av-1'];
  const homeFrame = PROFILE_FRAMES[equipped.bingkai] || PROFILE_FRAMES['fr-default'];
  const theme = SUBJECT_THEMES[subject] || SUBJECT_THEMES.Matematik;
  useEffect(() => {
    const media = window.matchMedia('(prefers-reduced-motion: reduce)');
    const updateMotion = () => setReducedMotion(media.matches);
    media.addEventListener('change', updateMotion);
    return () => media.removeEventListener('change', updateMotion);
  }, []);
  const play = () => { if (subject !== 'Matematik') return setNotice({ title: 'Pengembaraan akan datang', text: `${subject} ${grade} sedang disediakan.` }); if (grade === 'Darjah 1') onPlay(); else if (grade === 'Darjah 4' && onPlayDarjah4) onPlayDarjah4(); else setNotice({ title: 'Pengembaraan akan datang', text: `${subject} ${grade} sedang disediakan.` }); };
  const nav = (key, label) => { if (key === 'utama') return; if (key === 'belajar') return play(); if (key === 'kuiz' && onOpenMinigame) return onOpenMinigame(); if (key === 'kedai') return setShopOpen(true); setNotice({ title: label, text: 'Bahagian ini sedang disediakan. Nantikan kemas kini seterusnya!' }); };
  const patchProfile = (patch) => onProfileChange((previous) => ({ ...previous, ...patch }));
  return <div className="dojo-home ninja-home" data-subject={theme.key}><img className="village-scene-img" src={theme.background} alt=""/><div className="lantern-lights" aria-hidden="true"><i className="lantern-light left"/><i className="lantern-light right"/></div>{!reducedMotion && <><div className="birds-layer" aria-hidden="true"><BirdsFlow /></div><div className="sakura-layer" aria-hidden="true"><SakuraFall /></div></>}
    <header className="home-topbar"><button className="profile-card" onClick={()=>setProfileOpen(true)}><span className="avatar-mini"><img className="mini-avatar-bg" src="/home/character/bg-character.webp" alt=""/><img className="mini-avatar-character" src={homeAvatar} alt="Avatar mad"/><img className="mini-avatar-frame" src={homeFrame} alt=""/></span><span className="profile-copy"><strong>mad</strong><em>Ninja Pelatih</em></span><span className="level-copy"><span>★ <b>Lv.6</b></span><i><u /></i></span></button><div className="currency-row"><span>🪙 <b>{profile.coins || 120}</b></span><span>🗓️ <b>2 hari</b></span></div></header>
    <div className="brand-sign"><img className="brand-board-art" src="/home/homepage/logo-board.webp" alt=""/><div className="brand-board-copy"><h1><b>YOU</b> <em>EDU</em> <b>{theme.name}</b><small>{theme.tagline}</small></h1></div></div>
    <div className="selectors"><label><Icon name="calc"/><select value={subject} onChange={e=>setSubject(e.target.value)}><option>Matematik</option><option>Sains</option><option>Bahasa Melayu</option></select></label><label><Icon name="cap"/><select value={grade} onChange={e=>setGrade(e.target.value)}><option>Darjah 1</option><option>Darjah 2</option><option>Darjah 3</option><option>Darjah 4</option></select></label><button className="settings-button" onClick={()=>setNotice({title:'Tetapan', settings:true})}><Icon name="gear"/></button></div>
    <aside className="side-actions"><SideButton type="mission" label="Misi" badge="3" onClick={()=>setNotice({title:'Misi Harian',text:'Selesaikan latihan nombor hari ini untuk mengumpul 3 bintang!'})}/><SideButton type="reward" label="Ganjaran" onClick={()=>setNotice({title:'Ganjaran',text:'Peti ganjaran seterusnya akan dibuka selepas satu latihan lagi.'})}/></aside>
    <main className="hero-stage"><img className="stone-platform-art" src="/home/homepage/stone-platform.webp" alt=""/><div className="ninja-pair"><img className="hero-ninja orange" src="/home/homepage/ninja-orange.webp" alt="Ninja oren melambai"/><img className="hero-ninja teal" src="/home/homepage/ninja-teal.webp" alt="Ninja hijau memegang buluh"/></div></main>
    <aside className="daily-scroll"><img className="daily-scroll-art" src="/home/homepage/daily-scroll.webp" alt=""/><div className="daily-scroll-content"><span className={`daily-subject-icon ${theme.key}`}>{theme.key === 'math' ? <Icon name="book"/> : theme.icon}</span><h2>LATIHAN<br/>HARI INI</h2><p>{theme.lesson}<br/>{theme.detail}</p><div className="stars">★ ★ ★</div><i><u/></i></div></aside>
    <section className="play-zone"><p>✦ <span>{theme.prompt}</span> ✦</p><button onClick={play}><span><Icon name="play"/></span>MULA MAIN</button></section>
    <nav className="home-dock" aria-label="Menu utama"><img className="footer-icons-art" src="/home/homepage/icon%20footer.webp" alt=""/>{[['kuiz','quiz','Kuiz'],['belajar','book','Belajar'],['utama','shop','Utama'],['kedai','shop','Kedai'],['lagi','more','Lagi']].map(([key,icon,label])=><button key={key} data-open-shop={key==='kedai' ? '' : undefined} className={key==='utama'?'active':''} onClick={()=>nav(key,label)}><span><Icon name={icon}/></span><b>{label}</b></button>)}</nav>
    {notice && <HomeNotice title={notice.title} onClose={()=>setNotice(null)}>{notice.settings ? <div className="sound-setting"><span>Bunyi permainan</span><button onClick={onToggleSound}>{sound?'Hidup':'Mati'}</button></div> : <p>{notice.text}</p>}</HomeNotice>}
    <ProfilePopup open={profileOpen} onClose={()=>setProfileOpen(false)} profile={profile}/>
    <KedaiModal open={shopOpen} onClose={()=>setShopOpen(false)} sound={sound} coins={profile.coins} gems={profile.gems} onCoinsChange={(coins)=>patchProfile({coins})} onGemsChange={(gems)=>patchProfile({gems})} equipped={profile.equipped} onEquippedChange={(equipped)=>patchProfile({equipped})}/>
  </div>;
}
