export const COUNT_OBJECTS = {
  tanglung: { label: 'tanglung' },
  bakul: { label: 'bakul buluh' },
  epal: { label: 'epal' },
};

export function shuffle(list, rng = Math.random) {
  const a = [...list];
  for (let i = a.length - 1; i > 0; i--) {
    const j = Math.floor(rng() * (i + 1));
    [a[i], a[j]] = [a[j], a[i]];
  }
  return a;
}

function makeOptions(answer, position, rng) {
  const near = [answer - 1, answer + 1, answer - 2, answer + 2, answer - 3, answer + 3].filter(
    (n) => n >= 1 && n <= 10
  );
  const distractors = shuffle(near.slice(0, 4), rng).slice(0, 2);
  const options = [...distractors];
  options.splice(position, 0, answer);
  return options;
}

// Soalan Bilang Objek: kuantiti berbeza 1–10, tiga pilihan unik, satu jawapan betul.
export function generateQuestions(count = 5, rng = Math.random) {
  const quantities = shuffle([1, 2, 3, 4, 5, 6, 7, 8, 9, 10], rng).slice(0, count);
  const types = shuffle(['tanglung', 'bakul', 'epal', 'tanglung', 'epal'], rng);
  // pastikan jawapan betul muncul di kedudukan yang berbeza-beza
  const positions = shuffle([0, 1, 2, 0, 1, 2], rng).slice(0, count);
  return quantities.map((n, i) => ({
    id: i,
    type: types[i % types.length],
    answer: n,
    options: makeOptions(n, positions[i], rng),
  }));
}
