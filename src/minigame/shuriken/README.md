# Shuriken Master — Arena Latihan Ninja

Seret untuk sasarkan, lepaskan untuk baling. Satu permainan mini, banyak tahap — tambah kandungan melalui **data**.

## Modul

| Fail | Peranan |
| --- | --- |
| `levels.ts` | Definisi tahap: sasaran (kedudukan, jejari, gerakan, petanda), objektif, bantuan bidik, ambang bintang, petunjuk, prasyarat buka kunci. |
| `physics.ts` | Fizik & bidikan tulen: arah bidik, sinar kena (`rayHit`), kedudukan sasaran bergerak, ketepatan, bintang, penukaran koordinat. |
| `session.ts` | Sesi permainan: satu shuriken di udara, kunci balingan, kena/tersasar/sasaran salah, skor, petunjuk. Dimajukan dengan `tick(dt)`. |
| `results.ts` | Keputusan + simpanan melalui `mall/save.ts` & dompet `mall/rewards.ts` (polisi `bestDelta`, jadual ganjaran sendiri). |
| `art.ts` | Seni dilukis dengan kod (arena, papan sasaran, shuriken, garisan bidik). Ninja = sprite pemain (pandangan belakang). |
| `ShurikenGame.tsx` / `shuriken.css` | Input seret-lepas, gelung animasi, tutorial dalam babak, panel pengenalan/rehat/keputusan. |

**Pratonton = balingan sebenar:** garisan titik dan balingan sama-sama guna `rayHit()` (sasaran bergerak diramal pada masa shuriken tiba).

## Menambah Tahap 6
```ts
// levels.ts › SHURIKEN_LEVELS
{
  id: 'shuriken-6', n: 6, titleKey: 'shu.l6', introKey: 'shu.l6.intro',
  requiredHits: 5, aimAssist: 6, stars: { three: 85, two: 60 }, hints: 2, unlockAfter: 5,
  targets: [
    { id: 'a', x: 120, y: 300, r: 28, motion: { type: 'slide', amp: 90, speed: 0.9 } },
    { id: 'b', x: 360, y: 300, r: 28, motion: { type: 'static' } },
    // validCue: 'star' + cue pada sasaran untuk tahap "pilih sasaran"
  ],
},
```
Tambah teks `shu.l6` & `shu.l6.intro` dalam `mall/strings.ts`. Tahap muncul automatik dalam pemilihan tahap Arena Latihan.

Panduan koordinat: arena 480 × 640; dinding hingga y≈196; tangan ninja (≈262, 536). Letak sasaran antara y 190–360 (jauh di belakang, dekat dinding) supaya ada jarak membaling yang jelas.

## Ganjaran & simpanan
- Bintang: 3★ ketepatan ≥ 85% tanpa petunjuk; 2★ ≥ 60% (atau ≥ 85% dengan satu petunjuk); 1★ selesai.
- Ganjaran (`SHURIKEN_REWARDS`): 1★ 10🪙+15XP, 2★ 20🪙+25XP, 3★ 30🪙+40XP — hanya **beza** bintang terbaik diberi semasa main semula.
- Disimpan: selesai, bintang terbaik, `stats.bestAccuracy`, `stats.bestScore`, `stats.attempts`.
