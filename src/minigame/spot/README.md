# Latihan Mata Ninja (cari perbezaan) — Dojo Teka-Teki

Satu permainan mini, banyak tahap. Enjin tidak perlu diubah untuk menambah tahap: hanya **data + imej**.

## Fail

| Fail | Peranan |
| --- | --- |
| `levels.ts` | Definisi tahap (tajuk, imej A/B, kawasan perbezaan, petunjuk, ambang bintang). **Tambah tahap di sini.** |
| `engine.ts` | Logik tulen: koordinat ketikan → 0–1 (termasuk letterbox), ujian ketikan, bintang, susun atur. |
| `SpotGame.tsx` / `spot.css` | Antara muka: pengenalan → main → keputusan. |
| `assets.ts` | Pemuat imej (malas, cache). |
| `proto-scenes.ts` | ⚠️ Seni **prototaip** dilukis dengan kod. Buang bila semua tahap guna imej sebenar. |
| `../mall/save.ts` | Simpanan tunggal akademi (`localStorage['mall:save']`): tahap selesai, bintang terbaik, ganjaran dituntut. |
| `../mall/rewards.ts` | Penyesuai ganjaran sementara (syiling/XP). Tukar di sini bila ekonomi bersama siap. |
| `../mall/training.ts` | Menyambung dojo → permainan (`DOJO_LEVELS.puzzle`) dan peraturan buka kunci. |

## Menambah / menggantikan imej tahap

1. Sediakan **dua imej sama saiz** (cadangan 960×720, nisbah 4:3, `.webp`): A = asal, B = dengan perubahan.
   Bingkai, sudut kamera dan saiz mesti sama; jangan bergantung pada perbezaan akibat mampatan/ubah saiz.
2. Letak dalam `public/minigame/mata-ninja/`, contoh `tahap-6-a.webp`, `tahap-6-b.webp`.
3. Tambah objek dalam `SPOT_LEVELS` (`levels.ts`):

```ts
{
  id: 'mata-ninja-6',
  n: 6,
  titleKey: 'spot.l6',            // tambah teks dalam mall/strings.ts
  width: 960, height: 720,        // saiz asli imej
  imageA: '/minigame/mata-ninja/tahap-6-a.webp',
  imageB: '/minigame/mata-ninja/tahap-6-b.webp',
  hints: 1,
  difficulty: 'sederhana',
  starRules: { three: 3, two: 8 },
  placeholderArt: false,
  differences: [
    // koordinat TERNORMAL 0–1: x/lebar, y/tinggi. Bulatan: r = pecahan LEBAR imej.
    { id: 'pasu', shape: { type: 'circle', cx: 0.25, cy: 0.40, r: 0.05 }, note: 'Pasu biru → merah' },
    { id: 'pintu', shape: { type: 'rect', x: 0.60, y: 0.10, w: 0.12, h: 0.30 }, note: 'Pintu terbuka' },
    { id: 'pokok', shape: { type: 'poly', points: [[0.1, 0.8], [0.2, 0.7], [0.3, 0.8]] }, note: 'Daun hilang' },
  ],
},
```

4. Tahap baharu muncul automatik dalam pemilihan tahap Dojo Teka-Teki dan dibuka bila tahap sebelumnya selesai.

### Tukar piksel → koordinat ternormal
`cx = x_piksel / lebar`, `cy = y_piksel / tinggi`, `r = jejari_piksel / lebar`.
Pastikan setiap kawasan meliputi **seluruh** perubahan (termasuk bayang) dan kawasan tidak bertindih.
Elakkan perbezaan kecil pada tahap awal (cadangan r ≥ 0.04 untuk tahap 1–3).

## Semakan wajib sebelum menerbitkan tahap
- Setiap `differences[i]` sepadan dengan **satu** perubahan sebenar yang jelas, dan tiada perubahan lain di luar kawasan.
  Untuk seni prototaip ini disahkan secara automatik dengan perbandingan piksel A/B.
- Uji pada telefon (bertindan) dan desktop (sebelah-menyebelah).

## Kemajuan & ganjaran
- Tahap 1 sentiasa dibuka; tahap N dibuka bila tahap N−1 pernah selesai.
- Main semula hanya boleh **menaikkan** bintang terbaik; status selesai/buka kunci tidak pernah dipadam.
- Ganjaran penyelesaian pertama (10/20/30 syiling ikut bintang + 20 XP) diberi **sekali** setiap tahap.
