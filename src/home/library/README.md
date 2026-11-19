# Perpustakaan Ilmu Ninja (Belajar)

Homepage → **Belajar** → pusat pembelajaran skrin penuh. MULA MAIN tidak berubah (terus ke permainan).

## Fail
| Fail | Tugas |
|---|---|
| `content.js` | **Semua kandungan** — topik, nota, video, kertas, latih tubi + pembantu penapis |
| `progress.js` | Kemajuan & "Sambung Pembelajaran" dalam `localStorage['library:v1']` (tidak menyentuh simpanan lain) |
| `LibraryPage.jsx` | Hub, skrin kategori, pembaca nota, pemain video, pemapar kertas, aliran latih tubi |
| `library.css` | Gaya (rak buku, papan tanda tergantung, parchment) |

## Menambah kandungan sebenar
Status setiap bahan: `ready` (sebenar) · `sample` (label **Contoh**) · `soon` (label **Akan Datang**, tidak boleh dibuka).

1. **Topik** — tambah dalam `TOPICS` dengan `subject` + `grade` sama seperti pilihan homepage (cth. `'Sains'`, `'Darjah 3'`).
2. **Nota** — `NOTES`: `{ id, topicId, status:'ready', title, desc, sections:[{ title, body:[...], example?, visual? }] }`.
3. **Video** — letak fail dalam `public/learning/videos/` (atau URL yang dibenarkan), kemudian `VIDEOS`: `src`, `duration` (saat), `captions` (.vtt pilihan), `thumb` (pilihan), `status:'ready'`. Tiada autoplay; tanda selesai hanya selepas ≥90% ditonton.
4. **Kertas** — letak PDF dalam `public/learning/papers/`, kemudian `PAPERS`.
   - Kertas tahun lepas sebenar: `verified:true`, `year`, `paperType`, `source` (sumber/hak cipta). **Hanya** untuk fail yang dibekalkan secara sah.
   - Kertas latihan/contoh: `verified:false` → sentiasa dilabel "Kertas Contoh / Latihan — bukan kertas peperiksaan rasmi".
5. **Latih Tubi** — `PRACTICE`: soalan `mcq` (`choices`, `answer`) atau `number` (`answer` nombor), setiap satu dengan `explain`. Sambung ke bank soalan sebenar dengan menjana entri ini daripada data soalan.

Bahan yang dipadam dari `content.js` tidak akan muncul dalam "Sambung Pembelajaran" (disemak setiap kali).

## Contoh sedia ada (semua berlabel)
- Nota: 2 contoh (Nombor hingga 100, Tambah) + 1 Akan Datang — Matematik Darjah 1
- Video: 3 Akan Datang (tiada fail video lagi)
- Kertas: 1 Kertas Contoh/Latihan + skema jawapan (`public/learning/papers/contoh-matematik-d1-set-a*.pdf`)
- Latih Tubi: 2 set contoh (5 soalan setiap satu) + 1 Akan Datang
