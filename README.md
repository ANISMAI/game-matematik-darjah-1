# YouEdu Math — Pulau Ninja (Fasa 1)

Prototaip navigasi interaktif untuk permainan matematik murid Tahun 1. Dibina dengan React + CSS + SVG, dan semua teks antara muka dalam Bahasa Melayu.

## Cara jalankan

```
npm install
npm run dev
```

Browser akan terbuka sendiri. Untuk versi produksi: `npm run build`, kemudian `npm run preview`.

## Aliran

Peta Dunia → Kawasan Topik → Subtopik → Pratonton Misi → Permainan → Keputusan → Kembali ke Kawasan

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
