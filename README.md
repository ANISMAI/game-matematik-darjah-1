# YouEdu Math — Pulau Ninja (Fasa 1)

Prototaip navigasi interaktif untuk permainan matematik murid Tahun 1. Dibina dengan React + CSS + SVG, dan semua teks antara muka dalam Bahasa Melayu.

## Cara jalankan

```
npm install
npm run dev
```

Browser akan terbuka sendiri. Untuk versi produksi: `npm run build`, kemudian `npm run preview`.

## Aliran

Halaman Utama YouEdu Math → Mula main → Peta Dunia → Kawasan Topik → Subtopik → Pratonton Misi → Permainan → Keputusan → Kembali ke Kawasan

Halaman utama diadaptasi daripada repo `ninja-math-dojo` dan disimpan dalam `src/home/`, bersama komponen, aset dan gaya asal yang diperlukan. `game-matematik-darjah-1` ialah aplikasi utama dan tidak memerlukan repo sumber untuk dijalankan.

- Pilihan awal ialah **Matematik · Darjah 1**. Butang **Mula main** dan menu **Pembelajaran** membuka peta sedia ada.
- Butang rumah di penjuru kanan atas peta/permainan membawa pemain kembali ke halaman utama. Kemajuan permainan dan tetapan bunyi terus menggunakan storan sedia ada.
- Kedai dan profil ialah mockup daripada halaman asal; menu Mini Permainan, Battle Pass, Kuiz Harian, Papan Markah dan Tuisyen memaparkan makluman aktiviti akan datang. Subjek dan darjah lain belum mempunyai peta.
- Tailwind dan tema halaman utama dihadkan kepada `.dojo-home` melalui konfigurasi Vite supaya gaya peta sedia ada kekal berasingan.

- 8 kawasan boleh dibuka. Hanya **Nombor Bulat → Bilang Objek** boleh dimainkan (5 soalan, kira objek 1–10).
- Kawasan lain memaparkan "Pratonton Latihan" (aktiviti akan datang).
- Kemajuan, lokasi terakhir dan tetapan bunyi disimpan dalam `localStorage` (`youedu-pulau-ninja-v1`). Untuk mula semula, padam kunci ini dalam DevTools.

## Struktur

| Fail | Kandungan |
|---|---|
| `src/data/topics.js` | Kawasan, topik, subtopik (boleh disunting; `available` untuk peraturan buka kunci) |
| `src/lib/storage.js` | Simpanan kemajuan dan status misi |
| `src/lib/questions.js` | Penjana soalan Bilang Objek |
| `src/lib/sound.js` | Bunyi lembut (Web Audio) |
| `src/lib/usePanZoom.js` | Muat peta, zum dan geseran peta |
| `src/components/` | `WorldMap`, `RegionMap`, `TopicMarker`, `MissionPreview`, `CountingGame`, `ResultsScreen`, `NinjaCharacter`, `Art` (seni SVG) |
| `src/styles.css` | Warna, butang, panel dan animasi dikongsi |
| `legacy/` | Mockup lama "Jom Kira!" (HTML biasa) |

Label topik dan subtopik ialah kandungan cadangan prototaip, bukan kurikulum rasmi.
