/* Flappy Bird – Suns Edition with Start Menu */

// ===== Canvas & DOM =====
const canvas   = document.getElementById("gameCanvas");
const ctx      = canvas.getContext("2d");
const scoreTag = document.getElementById("scoreBoard");
const startScr = document.getElementById("startScreen");
const startBtn = document.getElementById("startBtn");

// ===== Game constants =====
const BIRD_W   = 48;
const BIRD_H   = 35;
const GRAVITY  = 0.5;
const FLAP     = -8;

const PIPE_W   = 70;
const GAP      = 160;
const SPEED    = 2.5;

// ===== Game state (init) =====
let birdX  = 80;
let birdY  = canvas.height / 2;
let vel    = 0;
let pipes  = [];  // each {x, topH, passed}
let score  = 0;
let frame  = 0;
let playing = false; // starts false until menu clicked
let gameOver = false;

// ===== Assets =====
const birdImg = new Image();
birdImg.src = "Luka_my_barbie.png";

const pipeImg = new Image();
pipeImg.src = "dallas.png";

// ===== Helper functions =====
function spawnPipe() {
  const topH = 80 + Math.random() * (canvas.height - GAP - 200);
  pipes.push({ x: canvas.width + 60, topH });
}

function reset() {
  birdY   = canvas.height / 2;
  vel     = 0;
  pipes   = [];
  score   = 0;
  frame   = 0;
  gameOver= false;
  scoreTag.textContent = "Score 0";
  spawnPipe();
}

function hitsPipe(px, py, topH) {
  const hitX = birdX + BIRD_W > px && birdX < px + PIPE_W;
  if (!hitX) return false;
  const hitY = py < topH || py + BIRD_H > topH + GAP;
  return hitY;
}

function flap() {
  if (!playing) return;          // ignore before game starts
  if (gameOver) {
    reset();
  } else {
    vel = FLAP;
  }
}

// ===== Input =====
document.addEventListener("keydown", e => {
  if (e.code === "Space") {
    e.preventDefault();
    flap();
  }
});
canvas.addEventListener("click", flap);
canvas.addEventListener("touchstart", e => { e.preventDefault(); flap(); });

// ===== Main loop =====
function loop() {
  ctx.clearRect(0, 0, canvas.width, canvas.height);

  // Physics
  vel += GRAVITY;
  birdY += vel;

  // Spawn pipes
  if (frame % 90 === 0) spawnPipe();

  // Pipes logic & draw
  for (let i = pipes.length - 1; i >= 0; i--) {
    const p = pipes[i];
    p.x -= SPEED;

    // Draw
    if (pipeImg.complete && pipeImg.naturalWidth) {
      ctx.drawImage(pipeImg, p.x, p.topH - pipeImg.height, PIPE_W, pipeImg.height); // top
      ctx.drawImage(pipeImg, p.x, p.topH + GAP,        PIPE_W, pipeImg.height);     // bottom
    } else {
      ctx.fillStyle = "#008000";
      ctx.fillRect(p.x, 0, PIPE_W, p.topH);
      ctx.fillRect(p.x, p.topH + GAP, PIPE_W, canvas.height - p.topH - GAP);
    }

    // Score
    if (!p.passed && p.x + PIPE_W < birdX) {
      p.passed = true;
      score++;
      scoreTag.textContent = `Score ${score}`;
    }

    // Remove off‑screen
    if (p.x + PIPE_W < -20) pipes.splice(i, 1);

    // Collision
    if (hitsPipe(p.x, birdY, p.topH)) gameOver = true;
  }

  // Bird draw
  if (birdImg.complete && birdImg.naturalWidth) {
    ctx.drawImage(birdImg, birdX, birdY, BIRD_W, BIRD_H);
  } else {
    ctx.fillStyle = "#ffd700";
    ctx.fillRect(birdX, birdY, BIRD_W, BIRD_H);
  }

  // World bounds
  if (birdY + BIRD_H > canvas.height || birdY < 0) gameOver = true;

  // Game‑over overlay
  if (gameOver) {
    ctx.fillStyle = "rgba(0,0,0,0.5)";
    ctx.fillRect(0, 0, canvas.width, canvas.height);
    ctx.fillStyle = "#fff";
    ctx.font = "48px sans-serif";
    ctx.textAlign = "center";
    ctx.fillText("Game Over", canvas.width / 2, canvas.height / 2 - 40);
    ctx.font = "24px sans-serif";
    ctx.fillText("Tap / space to restart", canvas.width / 2, canvas.height / 2 + 10);
  }

  frame++;
  if (playing) requestAnimationFrame(loop);
}

// ===== Start button =====
startBtn.addEventListener("click", () => {
  startScr.style.display = "none"; // hide overlay
  if (!playing) {
    reset();
    playing = true;
    requestAnimationFrame(loop);
  }
});