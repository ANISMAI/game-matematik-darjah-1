// Jom Kira! — mockup permainan matematik Darjah 1
const TOTAL_ROUNDS = 10;
const OBJECTS = ["🍎", "🐟", "⭐", "🎈", "🐥", "🍌", "🚗", "🌸"];
const PRAISE = ["Betul! 🎉", "Hebat! 🌟", "Pandai! 👏", "Syabas! 🥳"];
const TRY_AGAIN = ["Cuba lagi! 💪", "Hampir! 🙂"];

const state = { mode: null, round: 0, score: 0, current: null };

const $ = (id) => document.getElementById(id);
const rand = (min, max) => Math.floor(Math.random() * (max - min + 1)) + min;
const pick = (arr) => arr[rand(0, arr.length - 1)];
const shuffle = (arr) => arr.sort(() => Math.random() - 0.5);

function showScreen(id) {
  document.querySelectorAll(".screen").forEach((s) => s.classList.remove("active"));
  $(id).classList.add("active");
}

function getStars() {
  try { return Number(localStorage.getItem("jomkira-stars")) || 0; } catch { return 0; }
}
function addStars(n) {
  const total = getStars() + n;
  try { localStorage.setItem("jomkira-stars", total); } catch {}
  $("total-stars").textContent = total;
}

// Pilihan jawapan: jawapan betul + 2 jawapan salah yang berdekatan
function makeChoices(answer, min = 0, max = 20) {
  const set = new Set([answer]);
  while (set.size < 3) {
    const n = answer + rand(-3, 3);
    if (n >= min && n <= max) set.add(n);
  }
  return shuffle([...set]);
}

function objects(n, emoji) {
  return `<div class="group">${emoji.repeat(n).match(/./gu).map((e) => `<span>${e}</span>`).join("")}</div>`;
}

// ---------- Penjana soalan ----------
const generators = {
  kira() {
    const n = rand(1, 10);
    const emoji = pick(OBJECTS);
    return {
      title: `Berapa banyak ${emoji}?`,
      html: objects(n, emoji),
      answer: n,
      choices: makeChoices(n, 1, 10),
    };
  },
  tambah() {
    const a = rand(0, 9);
    const b = rand(0, 10 - a);
    const emoji = pick(OBJECTS);
    const visual = a + b > 0 ? `${a ? objects(a, emoji) : ""}${a && b ? '<span class="op">+</span>' : ""}${b ? objects(b, emoji) : ""}` : "";
    return {
      title: "Berapakah jumlahnya?",
      html: `<div class="equation">${a} + ${b} = ?</div><div style="width:100%"></div>${visual}`,
      answer: a + b,
      choices: makeChoices(a + b, 0, 10),
    };
  },
  tolak() {
    const a = rand(1, 10);
    const b = rand(0, a);
    return {
      title: "Berapakah bakinya?",
      html: `<div class="equation">${a} − ${b} = ?</div>`,
      answer: a - b,
      choices: makeChoices(a - b, 0, 10),
    };
  },
  banding() {
    let a = rand(1, 20);
    let b = rand(1, 20);
    while (a === b) b = rand(1, 20);
    return {
      title: "Nombor mana lebih besar?",
      html: `<div class="equation">${a} &nbsp;atau&nbsp; ${b}</div>`,
      answer: Math.max(a, b),
      choices: [a, b],
    };
  },
};

// ---------- Aliran permainan ----------
function startGame(mode) {
  Object.assign(state, { mode, round: 0, score: 0 });
  showScreen("screen-game");
  nextRound();
}

function nextRound() {
  if (state.round >= TOTAL_ROUNDS) return showResult();
  state.round++;
  const q = generators[state.mode]();
  state.current = q;

  $("round-label").textContent = `${state.round}/${TOTAL_ROUNDS}`;
  $("progress-fill").style.width = `${((state.round - 1) / TOTAL_ROUNDS) * 100}%`;
  $("question-title").textContent = q.title;
  $("question").innerHTML = q.html;
  $("feedback").textContent = "";
  $("feedback").className = "feedback";

  const answers = $("answers");
  answers.className = "answers" + (q.choices.length === 2 ? " two" : "");
  answers.innerHTML = "";
  q.choices.forEach((c) => {
    const btn = document.createElement("button");
    btn.className = "answer";
    btn.textContent = c;
    btn.onclick = () => checkAnswer(btn, c);
    answers.appendChild(btn);
  });
}

function checkAnswer(btn, value) {
  const fb = $("feedback");
  const all = $("answers").querySelectorAll(".answer");
  if (value === state.current.answer) {
    state.score += btn.dataset.tried ? 0 : 1; // markah hanya untuk cubaan pertama
    btn.classList.add("correct");
    all.forEach((b) => (b.disabled = true));
    fb.textContent = pick(PRAISE);
    fb.className = "feedback good";
    setTimeout(nextRound, 1100);
  } else {
    all.forEach((b) => (b.dataset.tried = "1"));
    btn.classList.add("wrong");
    btn.disabled = true;
    fb.textContent = pick(TRY_AGAIN);
    fb.className = "feedback bad";
  }
}

function showResult() {
  $("progress-fill").style.width = "100%";
  const s = state.score;
  const stars = s >= 9 ? 3 : s >= 6 ? 2 : s >= 3 ? 1 : 0;
  addStars(stars);

  $("result-score").textContent = s;
  $("result-stars").textContent = "⭐".repeat(stars) + "☆".repeat(3 - stars);
  $("result-emoji").textContent = stars === 3 ? "🏆" : stars >= 1 ? "🎉" : "💪";
  $("result-title").textContent = stars === 3 ? "Cemerlang!" : stars >= 1 ? "Syabas!" : "Jangan putus asa!";
  showScreen("screen-result");
}

// ---------- Event ----------
document.querySelectorAll(".card").forEach((c) => (c.onclick = () => startGame(c.dataset.mode)));
$("btn-back").onclick = () => showScreen("screen-home");
$("btn-home").onclick = () => showScreen("screen-home");
$("btn-again").onclick = () => startGame(state.mode);
$("total-stars").textContent = getStars();
