import * as parking from './ParkingGame.jsx';
import * as trace from './TraceGame.jsx';

// Kenali Sifar: satu aktiviti, dua jenis soalan.
// q.type === 'trace'   → surih nombor (jalan raya), contohnya { n: 0 } dengan tempat letak kereta kosong.
// selain itu (parking)  → tempat letak kereta: keluarkan kereta, kemudian jawab berapa tinggal.
// ActivityShell memasang semula pentas setiap soalan (key = qIndex), jadi komponen boleh bertukar dengan selamat.

const pick = (q) => (q.type === 'trace' ? trace : parking);

export const init = (q, plan) => pick(q).init(q, plan);
export const restore = (b, q) => pick(q).restore(b, q);
export const prompt = (q, solved) => pick(q).prompt(q, solved);

export default function ZeroGame(props) {
  const Game = pick(props.q).default;
  return <Game {...props} />;
}

export const Demo = parking.Demo;
export const demoText = `${parking.demoText} Untuk soalan surih: letakkan jari pada kereta merah dan pandu ikut jalan nombor 0.`;
