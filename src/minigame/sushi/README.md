# Sushi Master Ninja — Dapur Bento Ninja

Satu permainan mini, banyak tahap. Tambah kandungan melalui **data**; enjin tidak perlu diubah.

## Modul

| Fail | Peranan |
| --- | --- |
| `recipes.ts` | Bahan (`INGREDIENTS`) & resipi (`RECIPES`: id, nama, jenis `nigiri`/`roll`, turutan langkah). |
| `levels.ts` | Konfigurasi tahap: turutan pesanan, tempat duduk, pesanan aktif maksimum, bahan di meja, berpandu, ambang bintang, petunjuk. |
| `layout.ts` | Geometri pentas: trek tali sawat segi empat, kedudukan chef, titik muat, tempat duduk pelanggan (ID stabil). |
| `conveyor.ts` | Trek 4 sisi bucu bulat (`SquareTrack`): kedudukan mengikut panjang lengkok, arah ikut jam. |
| `builder.ts` | Pembina bahan (tikar penyediaan): ketikan betul/salah, Undur, Semula, kunci semasa menggulung. |
| `session.ts` | Pengurus pesanan + pinggan + tempat duduk. Tulen & deterministik, dimajukan dengan `tick(dt)`. |
| `results.ts` | Bintang + simpanan melalui `mall/save.ts` & dompet `mall/rewards.ts` (polisi `bestDelta`). |
| `art.ts` | Seni dilukis dengan kod (bahan, sushi, pinggan, tali sawat, tikar). |
| `SushiGame.tsx` / `sushi.css` | Antara muka dua zon: pentas (atas) + meja bahan berasingan (bawah). |

## Menambah resipi
```ts
// recipes.ts
tuna: { id: 'tuna', nameKey: 'sushi.r.tuna', kind: 'nigiri', steps: ['rice', 'tuna'] },
```
Bahan baharu: tambah ID pada `IngredientId` + `INGREDIENTS`, lukisan ikon dalam `art.ts › drawIngredient`, warna isian dalam `FILL`, dan teks dalam `mall/strings.ts`.

## Menambah tahap
```ts
// levels.ts
{ n: 6, titleKey: 'sushi.l6', orders: ['tuna', 'mixed', 'ebi'], seats: ['L1', 'R1', 'L2', 'R2'], maxActive: 3,
  ingredients: ['rice', 'nori', 'egg', 'cucumber', 'salmon', 'shrimp', 'tuna'], guided: false,
  starRules: { three: 1, two: 4 }, hints: 2 },
```
Tahap muncul automatik dalam pemilihan tahap Dapur Bento dan dibuka bila tahap sebelumnya selesai.

## Menambah tempat duduk
Tambah entri dalam `layout.ts › SEATS` (kedudukan kaki, arah, titik pada tali sawat, tempat pinggan) dan rujuk ID-nya dalam `levels.ts`.

## Ganjaran
XP (20) sekali pada penyelesaian pertama; syiling = beza nilai bintang terbaik (10/20/30). Main semula tanpa
bintang lebih tinggi tidak memberi apa-apa. Dompet sama dengan Latihan Mata Ninja (`mall:save`).
