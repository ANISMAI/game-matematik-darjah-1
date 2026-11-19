# Ninja Mask Designer (Studio Seni Shinobi)

Fasa 6 Akademi Ninja. Guru Seni Shinobi → MULA LATIHAN → pilih tahap → siapkan misi → hias bebas → simpan ke galeri.

## Fail
| Fail | Tugas |
|---|---|
| `data.ts` | Warna, pelekat/simbol, corak, ikat kepala, titik letak (anchor), templat (`basic`, `twotone`) |
| `levels.ts` | 5 tahap: objektif, alat dibenarkan, item, tutorial mikro, had bintang |
| `model.ts` | Model reka bentuk (tulen): baldi cat (`recolor`), berus (`addStroke`, `coverage`), pelekat, sejarah undur/buat semula, pengesah misi, bintang, tajuk selamat |
| `art.ts` | Lukisan topeng dengan kod (kanvas) + ikon item + lakaran kecil galeri |
| `gallery.ts` | Galeri peribadi dalam `mall:save` (`gallery[]`): senarai / simpan / nama baharu / padam |
| `results.ts` | Rekod misi lulus → dompet akademi (polisi `bestDelta`, tiada ganjaran berganda) |
| `MaskGame.tsx`, `mask.css` | Editor, galeri, dialog, susun atur responsif |

## Mewarna
1. Pilih warna (belum diwarnakan).
2. Pilih **Berus** (lukis sendiri, saiz Kecil/Besar) atau **Baldi Cat** (ketik topeng → seluruh bahagian jadi warna itu; menimpa lakaran berus di bahagian tersebut).
3. Objektif warna lulus bila warna itu menutup ≥ 80% bahagian (`COVER_OK`), jadi berus pun dikira.

Lakaran berus disimpan sebagai titik (had 8000 titik per topeng) supaya galeri kekal kecil.

## Aset seni
Semua lapisan topeng, pelekat, corak dan ikat kepala **dilukis dengan kod** buat masa ini — tiada fail imej diperlukan.
Jika mahu guna aset sebenar (PNG/WebP lutsinar, ruang 400×460), ganti fungsi berkaitan dalam `art.ts`:
badan topeng (`maskPath`/`drawMask`), `drawSymbol` (7 pelekat), `drawPattern` (4 corak), `drawHeadband` (4 warna).

## Dev
`#mall/mask/1` … `#mall/mask/5` membuka terus tahap (mod pembangunan sahaja). `window.__mask` mendedahkan keadaan untuk ujian.
