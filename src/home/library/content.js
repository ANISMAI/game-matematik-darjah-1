// Perpustakaan Ilmu Ninja — KANDUNGAN (satu-satunya tempat untuk menambah bahan pembelajaran).
//
// Cara menambah bahan sebenar:
//   • Topik baharu      → TOPICS (subject + grade mesti sama dengan pilihan Subjek/Darjah di homepage)
//   • Nota              → NOTES   (sections: tajuk + perenggan + contoh/visual pilihan)
//   • Video             → VIDEOS  (src: fail dalam public/learning/videos/ atau URL yang dibenarkan; captions: fail .vtt pilihan)
//   • Kertas peperiksaan→ PAPERS  (fileUrl: PDF dalam public/learning/papers/; verified:true HANYA untuk kertas tahun lepas
//                                  sebenar yang dibekalkan secara sah — sertakan source/rights)
//   • Latih Tubi        → PRACTICE (soalan + penerangan; status 'sample' sehingga bank soalan sebenar disambung)
// status: 'ready' (bahan sebenar) | 'sample' (ditanda "Contoh") | 'soon' (ditanda "Akan Datang", tidak boleh dibuka)
// Bahan 'sample' sentiasa dipaparkan dengan label "Contoh" dan tidak boleh ditanda sebagai bahan rasmi.

export const SUBJECTS = ['Matematik', 'Sains', 'Bahasa Melayu'];
export const GRADES = ['Darjah 1', 'Darjah 2', 'Darjah 3', 'Darjah 4', 'Darjah 5', 'Darjah 6'];

export const CATEGORIES = [
  { id: 'nota', title: 'Nota Pembelajaran', short: 'Nota', desc: 'Baca nota ringkas dan contoh mengikut topik.', tone: '#2f7fd6' },
  { id: 'video', title: 'Video Pembelajaran', short: 'Video', desc: 'Tonton video pelajaran mengikut topik.', tone: '#e5432d' },
  { id: 'kertas', title: 'Kertas Peperiksaan', short: 'Peperiksaan', desc: 'Kertas tahun lepas dan kertas latihan.', tone: '#8a55d6' },
  { id: 'latih', title: 'Latih Tubi', short: 'Latih Tubi', desc: 'Latihan berpandu dengan penerangan jawapan.', tone: '#2f9a4a' },
];

/* ───────────── TOPIK ───────────── */
export const TOPICS = [
  { id: 'm1-nombor', subject: 'Matematik', grade: 'Darjah 1', title: 'Nombor hingga 100', order: 1 },
  { id: 'm1-tambah', subject: 'Matematik', grade: 'Darjah 1', title: 'Tambah', order: 2 },
  { id: 'm1-tolak', subject: 'Matematik', grade: 'Darjah 1', title: 'Tolak', order: 3 },
];

/* ───────────── NOTA ───────────── */
// visual: { kind: 'tens', tens, ones } → blok puluh & sa (dengan teks alternatif automatik)
export const NOTES = [
  {
    id: 'nota-m1-nombor',
    topicId: 'm1-nombor',
    status: 'sample',
    title: 'Mengenal Nombor hingga 100',
    desc: 'Membilang, nilai tempat puluh dan sa, serta membanding nombor.',
    sections: [
      {
        title: 'Membilang dalam puluh',
        body: ['Kita boleh membilang dengan cepat menggunakan kumpulan sepuluh.', '10, 20, 30, 40, 50, 60, 70, 80, 90, 100 — setiap kali bertambah 10.'],
        example: { label: 'Cuba bilang', lines: ['3 kumpulan sepuluh = 30', '7 kumpulan sepuluh = 70'] },
        visual: { kind: 'tens', tens: 3, ones: 0 },
      },
      {
        title: 'Nilai tempat: puluh dan sa',
        body: ['Nombor dua digit ada dua tempat: puluh dan sa.', 'Dalam nombor 47, digit 4 bernilai 4 puluh (40) dan digit 7 bernilai 7 sa (7).'],
        example: { label: 'Contoh', lines: ['47 = 40 + 7', '62 = 60 + 2'] },
        visual: { kind: 'tens', tens: 4, ones: 7 },
      },
      {
        title: 'Membanding nombor',
        body: ['Bandingkan digit puluh dahulu. Nombor yang puluhnya lebih besar ialah nombor yang lebih besar.', 'Jika puluh sama, bandingkan digit sa.'],
        example: { label: 'Contoh', lines: ['58 lebih besar daripada 39 (5 puluh > 3 puluh)', '74 lebih kecil daripada 76 (4 sa < 6 sa)'] },
      },
    ],
  },
  {
    id: 'nota-m1-tambah',
    topicId: 'm1-tambah',
    status: 'sample',
    title: 'Tambah Tanpa Mengumpul Semula',
    desc: 'Menambah sa dengan sa, dan puluh dengan puluh.',
    sections: [
      {
        title: 'Maksud tambah',
        body: ['Tambah bermaksud menggabungkan dua kumpulan menjadi satu.', 'Simbol tambah ialah + dan jawapannya dipanggil hasil tambah.'],
        example: { label: 'Contoh', lines: ['3 epal + 4 epal = 7 epal'] },
      },
      {
        title: 'Tambah sa dengan sa, puluh dengan puluh',
        body: ['Tulis nombor mengikut tempat. Tambah sa dahulu, kemudian puluh.'],
        example: { label: 'Contoh: 23 + 15', lines: ['Sa: 3 + 5 = 8', 'Puluh: 2 + 1 = 3', 'Jawapan: 38'] },
        visual: { kind: 'tens', tens: 3, ones: 8 },
      },
      {
        title: 'Semak jawapan',
        body: ['Anggarkan dahulu: 23 + 15 lebih kurang 20 + 20 = 40.', 'Jawapan 38 dekat dengan 40, jadi jawapan itu munasabah.'],
      },
    ],
  },
  { id: 'nota-m1-tolak', topicId: 'm1-tolak', status: 'soon', title: 'Tolak Tanpa Mengumpul Semula', desc: 'Mengambil sa daripada sa, puluh daripada puluh.', sections: [] },
];

/* ───────────── VIDEO ───────────── */
// src: '/learning/videos/nama.mp4' atau URL yang dibenarkan sahaja. captions: '/learning/videos/nama.vtt' (pilihan).
export const VIDEOS = [
  { id: 'video-m1-bilang', topicId: 'm1-nombor', status: 'soon', title: 'Membilang hingga 100', desc: 'Membilang dalam satu dan dalam puluh.', duration: null, src: null, captions: null, thumb: null },
  { id: 'video-m1-tambah', topicId: 'm1-tambah', status: 'soon', title: 'Tambah dengan Blok Puluh', desc: 'Menambah menggunakan blok puluh dan sa.', duration: null, src: null, captions: null, thumb: null },
  { id: 'video-m1-tolak', topicId: 'm1-tolak', status: 'soon', title: 'Tolak dengan Garis Nombor', desc: 'Menolak dengan melompat ke belakang.', duration: null, src: null, captions: null, thumb: null },
];

/* ───────────── KERTAS PEPERIKSAAN ───────────── */
// verified:true = Kertas Tahun Lepas (sebenar, sumber sah). verified:false = Kertas Contoh / Latihan.
export const PAPERS = [
  {
    id: 'kertas-m1-contoh-a',
    subject: 'Matematik',
    grade: 'Darjah 1',
    status: 'sample',
    verified: false,
    year: null,
    paperType: 'Latihan',
    title: 'Kertas Latihan Matematik Darjah 1 — Set A',
    desc: '10 soalan: nombor hingga 100, tambah dan tolak.',
    fileUrl: '/learning/papers/contoh-matematik-d1-set-a.pdf',
    answerSchemeUrl: '/learning/papers/contoh-matematik-d1-set-a-jawapan.pdf',
    source: 'Disediakan oleh pasukan YOU EDU MATH sebagai contoh. Bukan kertas peperiksaan rasmi.',
  },
];

/* ───────────── LATIH TUBI ───────────── */
// type: 'mcq' (choices + answer) | 'number' (answer nombor). explain: penerangan selepas menjawab.
export const PRACTICE = [
  {
    id: 'latih-m1-nombor',
    topicId: 'm1-nombor',
    status: 'sample',
    title: 'Nilai Tempat & Membanding',
    instructions: 'Jawab setiap soalan. Selepas menjawab, baca penerangan sebelum ke soalan seterusnya.',
    questions: [
      { id: 'n1', type: 'mcq', text: 'Berapakah nilai digit 6 dalam nombor 64?', choices: ['6', '60', '64', '4'], answer: '60', explain: '6 berada di tempat puluh, jadi nilainya 6 puluh = 60.' },
      { id: 'n2', type: 'number', text: '5 puluh dan 3 sa ialah nombor…', answer: 53, explain: '5 puluh = 50, 3 sa = 3. 50 + 3 = 53.' },
      { id: 'n3', type: 'mcq', text: 'Nombor manakah paling besar?', choices: ['48', '84', '79', '58'], answer: '84', explain: 'Bandingkan puluh: 8 puluh adalah paling besar, jadi 84 paling besar.' },
      { id: 'n4', type: 'number', text: 'Apakah nombor selepas 69?', answer: 70, explain: 'Selepas 69 ialah 70 — 6 puluh 9 sa tambah 1 menjadi 7 puluh.' },
      { id: 'n5', type: 'mcq', text: 'Bilang dalam puluh: 20, 30, __, 50', choices: ['35', '40', '45', '60'], answer: '40', explain: 'Setiap langkah bertambah 10. 30 + 10 = 40.' },
    ],
  },
  {
    id: 'latih-m1-tambah',
    topicId: 'm1-tambah',
    status: 'sample',
    title: 'Tambah Tanpa Mengumpul Semula',
    instructions: 'Tambah sa dahulu, kemudian puluh. Tulis atau pilih jawapan.',
    questions: [
      { id: 't1', type: 'number', text: '4 + 5 = ?', answer: 9, explain: 'Mula dari 4, bilang 5 lagi: 5, 6, 7, 8, 9.' },
      { id: 't2', type: 'number', text: '21 + 6 = ?', answer: 27, explain: 'Sa: 1 + 6 = 7. Puluh: 2. Jawapan 27.' },
      { id: 't3', type: 'mcq', text: '32 + 15 = ?', choices: ['47', '45', '57', '37'], answer: '47', explain: 'Sa: 2 + 5 = 7. Puluh: 3 + 1 = 4. Jawapan 47.' },
      { id: 't4', type: 'number', text: '40 + 30 = ?', answer: 70, explain: '4 puluh + 3 puluh = 7 puluh = 70.' },
      { id: 't5', type: 'mcq', text: 'Ali ada 12 guli. Abu beri 6 lagi. Berapa guli Ali sekarang?', choices: ['16', '18', '19', '6'], answer: '18', explain: '12 + 6: sa 2 + 6 = 8, puluh 1. Jawapan 18 guli.' },
    ],
  },
  { id: 'latih-m1-tolak', topicId: 'm1-tolak', status: 'soon', title: 'Tolak Tanpa Mengumpul Semula', instructions: '', questions: [] },
];

/* ───────────── pembantu ───────────── */
const byOrder = (a, b) => a.order - b.order;
export const topicsFor = (subject, grade) => TOPICS.filter((t) => t.subject === subject && t.grade === grade).sort(byOrder);
export const topicById = (id) => TOPICS.find((t) => t.id === id) ?? null;

const LISTS = { nota: NOTES, video: VIDEOS, latih: PRACTICE };
/** Senarai bahan bagi kategori + Subjek/Darjah (+ topik pilihan). Kertas ditapis terus ikut subject/grade. */
export function resourcesFor(cat, subject, grade, topicId = 'all') {
  if (cat === 'kertas') return PAPERS.filter((p) => p.subject === subject && p.grade === grade);
  const topics = new Set(topicsFor(subject, grade).map((t) => t.id));
  return (LISTS[cat] ?? []).filter((r) => topics.has(r.topicId) && (topicId === 'all' || r.topicId === topicId));
}
/** Cari bahan mengikut id (untuk "Sambung Pembelajaran"). Pulangkan { cat, item } atau null jika sudah dipadam. */
export function findResource(id) {
  for (const [cat, list] of Object.entries({ ...LISTS, kertas: PAPERS })) {
    const item = list.find((r) => r.id === id);
    if (item) return { cat, item };
  }
  return null;
}
/** Subjek/Darjah bagi sesuatu bahan. */
export function contextOf(cat, item) {
  if (cat === 'kertas') return { subject: item.subject, grade: item.grade };
  const t = topicById(item.topicId);
  return t ? { subject: t.subject, grade: t.grade } : null;
}
