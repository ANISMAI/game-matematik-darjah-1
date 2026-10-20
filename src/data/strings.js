// Teks antara muka permainan Fasa 2 (Bahasa Melayu), dikumpul di satu tempat untuk terjemahan kelak.

export const T = {
  exit: 'Keluar',
  question: (n, total) => `Soalan ${n} daripada ${total}`,
  howTo: 'Cara Main',
  hint: 'Petunjuk',
  check: 'Semak',
  next: 'Seterusnya',
  correct: 'Bagus! Betul!',
  wrong: 'Cuba lagi. Kamu boleh!',
  incomplete: 'Lengkapkan semua tempat dahulu.',
  skip: 'Langkau',
  start: 'Mula',
  resume: 'Sambung',
  back: 'Kembali',
  close: 'Tutup',
  questions: (n) => `${n} soalan`,

  exitTitle: 'Misi belum selesai.',
  exitText: 'Kemajuan kamu akan disimpan. Mahu teruskan bermain?',
  continue: 'Teruskan',

  demoTitle: 'Cara Main',
  demoExample: 'Contoh',

  resultsTitle: 'Misi Selesai!',
  resultsSub: (n) => `${n} soalan selesai`,
  resultsNewBadge: (title) => `Tahniah! Kamu dapat Lencana ${title}.`,
  resultsOldBadge: (title) => `Lencana ${title} sudah dalam simpanan kamu.`,
  replay: 'Main Semula',
  backToRegion: 'Kembali ke Kawasan',
  backToShortcut: 'Kembali ke Pratonton',

  status: { belum: 'Belum mula', sedang: 'Sedang belajar', selesai: 'Selesai' },

  chooserTitle: 'Pilih aktiviti',
  availableActivities: 'Aktiviti tersedia',
  regionStats: (done, total) => `Aktiviti tersedia: ${done} / ${total} selesai`,

  shortcut: 'Pratonton Gameplay',
  shortcutIntro: 'Buka terus mana-mana misi. Misi ini sama seperti dalam pulau.',

  selected: 'dipilih',
  solved: 'sudah dipadankan',
  locked: 'tetap',
  empty: 'kosong',
  notYet: 'belum betul',
};
