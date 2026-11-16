// ─── Tile color palette (index 1–11) ─────────────────────────────────────────
const COLORS = [
  null, // index 0 unused
  { bg: "bg-green-100", text: "text-green-500" }, // 1
  { bg: "bg-red-100", text: "text-red-500" }, // 2
  { bg: "bg-blue-100", text: "text-blue-500" }, // 3
  { bg: "bg-purple-100", text: "text-purple-500" }, // 4
  { bg: "bg-yellow-100", text: "text-yellow-500" }, // 5
  { bg: "bg-pink-100", text: "text-pink-500" }, // 6
  { bg: "bg-indigo-100", text: "text-indigo-500" }, // 7
  { bg: "bg-gray-100", text: "text-gray-500" }, // 8
  { bg: "bg-emerald-100", text: "text-emerald-500" }, // 9
  { bg: "bg-amber-100", text: "text-amber-500" }, // 10
  { bg: "bg-lime-100", text: "text-lime-500" }, // 11
];

// ─── State ───────────────────────────────────────────────────────────────────
// Board: 12 slots (4 cols × 3 rows), value 0 = black tile
const GOAL = [1, 2, 3, 4, 5, 6, 7, 8, 9, 10, 11, 0];
let board = [...GOAL];
let gameActive = false;
let timerInterval = null;
let seconds = 0;
let steps = 0;
let historyCount = 0;

// ─── Board rendering ──────────────────────────────────────────────────────────
function renderBoard() {
  const container = document.getElementById("board");
  container.innerHTML = "";
  board.forEach((val) => {
    const div = document.createElement("div");
    if (val === 0) {
      div.className = "tile tile-black";
    } else {
      const c = COLORS[val];
      div.className = `tile ${c.bg} ${c.text}`;
      div.textContent = val;
    }
    container.appendChild(div);
  });
}

// ─── Shuffle ──────────────────────────────────────────────────────────────────
function shuffle(times = 100) {
  const dirs = ["up", "down", "left", "right"];
  for (let i = 0; i < times; i++) {
    const valid = dirs.filter((d) => canMove(d));
    const dir = valid[Math.floor(Math.random() * valid.length)];
    doMove(dir);
  }
}

// ─── Movement ─────────────────────────────────────────────────────────────────
function blankIndex() {
  return board.indexOf(0);
}

function canMove(dir) {
  const idx = blankIndex();
  const col = idx % 4;
  const row = Math.floor(idx / 4);
  if (dir === "up")    return row > 0;  // còn hàng phía trên
  if (dir === "down")  return row < 2;  // còn hàng phía dưới
  if (dir === "left")  return col > 0;  // còn cột phía trái
  if (dir === "right") return col < 3;  // còn cột phía phải
}

// Phím bấm → ô đen di chuyển ĐÚNG hướng đó
// W / ↑  → ô đen lên    → đổi chỗ ô PHÍA TRÊN  (idx - 4)
// S / ↓  → ô đen xuống  → đổi chỗ ô PHÍA DƯỚI  (idx + 4)
// A / ←  → ô đen trái   → đổi chỗ ô PHÍA TRÁI  (idx - 1)
// D / →  → ô đen phải   → đổi chỗ ô PHÍA PHẢI  (idx + 1)
function doMove(dir) {
  const idx = blankIndex();
  let swapIdx;
  if (dir === "up")    swapIdx = idx - 4;
  if (dir === "down")  swapIdx = idx + 4;
  if (dir === "left")  swapIdx = idx - 1;
  if (dir === "right") swapIdx = idx + 1;
  if (swapIdx === undefined || swapIdx < 0 || swapIdx > 11) return;
  [board[idx], board[swapIdx]] = [board[swapIdx], board[idx]];
}

// ─── Key handler ──────────────────────────────────────────────────────────────
document.addEventListener("keydown", (e) => {
  if (!gameActive) return;
  let dir = null;
  if (e.key === "ArrowUp" || e.key === "w" || e.key === "W") dir = "up";
  else if (e.key === "ArrowDown" || e.key === "s" || e.key === "S") dir = "down";
  else if (e.key === "ArrowLeft" || e.key === "a" || e.key === "A") dir = "left";
  else if (e.key === "ArrowRight" || e.key === "d" || e.key === "D") dir = "right";
  if (!dir) return;
  if (!canMove(dir)) return;
  e.preventDefault();
  doMove(dir);
  steps++;
  renderBoard();
  checkWin();
});

// ─── Timer ────────────────────────────────────────────────────────────────────
function startTimer() {
  seconds = 0;
  updateClock();
  timerInterval = setInterval(() => {
    seconds++;
    updateClock();
  }, 1000);
}

function stopTimer() {
  clearInterval(timerInterval);
  timerInterval = null;
}

function updateClock() {
  const mm = String(Math.floor(seconds / 60)).padStart(2, "0");
  const ss = String(seconds % 60).padStart(2, "0");
  document.getElementById("clock").textContent = `${mm}:${ss}`;
}

// ─── Toggle game ──────────────────────────────────────────────────────────────
function toggleGame() {
  const btn = document.getElementById("btn-start");
  if (!gameActive) {
    // Bắt đầu
    gameActive = true;
    steps = 0;
    board = [...GOAL];
    shuffle(100);
    renderBoard();
    startTimer();
    btn.textContent = "Kết thúc";
    btn.className =
      "bg-red-400 hover:bg-red-500 text-white font-bold py-2 px-8 rounded-lg text-base transition";
  } else {
    // Kết thúc thủ công
    gameActive = false;
    stopTimer();
    board = [...GOAL];
    renderBoard();
    seconds = 0;
    updateClock();
    btn.textContent = "Bắt đầu";
    btn.className =
      "bg-green-400 hover:bg-green-500 text-white font-bold py-2 px-8 rounded-lg text-base transition";
  }
}

// ─── Win check ────────────────────────────────────────────────────────────────
function checkWin() {
  if (board.every((v, i) => v === GOAL[i])) {
    gameActive = false;
    stopTimer();
    addHistory();
    document.getElementById("win-banner").classList.add("show");
    const btn = document.getElementById("btn-start");
    btn.textContent = "Bắt đầu";
    btn.className =
      "bg-green-400 hover:bg-green-500 text-white font-bold py-2 px-8 rounded-lg text-base transition";
  }
}

// ─── Play again (từ overlay) ──────────────────────────────────────────────────
function playAgain() {
  document.getElementById("win-banner").classList.remove("show");
  toggleGame();
}

// ─── History ──────────────────────────────────────────────────────────────────
function addHistory() {
  historyCount++;
  const mm = String(Math.floor(seconds / 60)).padStart(2, "0");
  const ss = String(seconds % 60).padStart(2, "0");
  const timeStr = `${mm}:${ss}`;
  const tbody = document.getElementById("history-body");
  const tr = document.createElement("tr");
  tr.className = "hover:bg-gray-50";
  tr.innerHTML = `
    <td class="border border-gray-200 py-2 px-3">${historyCount}</td>
    <td class="border border-gray-200 py-2 px-3">${steps}</td>
    <td class="border border-gray-200 py-2 px-3">${timeStr}</td>
  `;
  tbody.appendChild(tr);
}

// ─── Init ─────────────────────────────────────────────────────────────────────
renderBoard();
