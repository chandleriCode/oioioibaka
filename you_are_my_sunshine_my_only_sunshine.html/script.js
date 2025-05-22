/******************************
 * Flappy Bird – full‑screen  *
 ******************************/

// ===== DOM & canvas =====
const canvas   = document.getElementById("gameCanvas");
const ctx      = canvas.getContext("2d");
const scoreTag = document.getElementById("scoreBoard");
const startScr = document.getElementById("startScreen");
const header   = document.getElementById("mainHeader");

// ===== constants =====
const BIRD_W = 48, BIRD_H = 35;
const GRAV   = 0.5, FLAP  = -8;
const PIPE_W = 70, GAP    = 0.25;   // GAP as fraction of canvas height (25%)
let SPEED    = 2.5;                  // will scale with canvas width

// ===== state =====
let birdX, birdY, vel;
let pipes = [];
let score = 0, frame = 0;
let playing = false, gameOver = false;

// ===== assets =====
const birdImg = new Image(); birdImg.src = "Luka_my_barbie.png";
const pipeImg = new Image(); pipeImg.src = "dallas.png";

// ===== resize canvas to fill window =====
function resizeCanvas(){
  const hHead = header.offsetHeight;
  const w = window.innerWidth;
  const h = window.innerHeight - hHead;
  canvas.style.height = h + "px";
  canvas.width  = w;   // internal pixel buffer
  canvas.height = h;

  // Adapt gameplay speed & gap to new size
  SPEED = w / 320;          // ~2.5 when width ≈ 800
}
window.addEventListener("resize", resizeCanvas);
resizeCanvas();

// ===== helpers =====
function spawnPipe(){
  const gapPx = canvas.height * GAP;
  const topH  = 60 + Math.random() * (canvas.height - gapPx - 160);
  pipes.push({ x: canvas.width + 60, topH, gapPx });
}

function reset(){
  birdX = canvas.width * 0.15;      // 15% from left edge
  birdY = canvas.height * 0.5;
  vel   = 0;
  pipes = [];
  score = 0; frame = 0; gameOver = false;
  scoreTag.textContent = "Score 0";
  spawnPipe();
}

function hitsPipe(p){
  const inX = birdX + BIRD_W > p.x && birdX < p.x + PIPE_W;
  if(!inX) return false;
  return birdY < p.topH || birdY + BIRD_H > p.topH + p.gapPx;
}

function flap(){
  if(!playing) return;
  if(gameOver) reset();
  vel = FLAP;
}

// expose globally for inline onclick
window.startGame = function(){
  startScr.style.display = "none";
  if(!playing){ playing = true; reset(); requestAnimationFrame(loop); }
};

// ===== input =====
document.addEventListener("keydown",e=>{ if(e.code==="Space"){e.preventDefault();flap();} });
canvas.addEventListener("click", flap);
canvas.addEventListener("touchstart", e=>{e.preventDefault();flap();});

// ===== main loop =====
function loop(){
  ctx.clearRect(0,0,canvas.width,canvas.height);

  // physics
  vel += GRAV; birdY += vel;

  // spawn pipes
  if(frame % 90 === 0 && frame !== 0) spawnPipe();

  // pipes
  pipes = pipes.filter(p=>{
    p.x -= SPEED;
    // draw
    if(pipeImg.complete && pipeImg.naturalWidth){
      ctx.drawImage(pipeImg, p.x, p.topH - pipeImg.height, PIPE_W, pipeImg.height);
      ctx.drawImage(pipeImg, p.x, p.topH + p.gapPx, PIPE_W, pipeImg.height);
    }else{
      ctx.fillStyle="#008000";
      ctx.fillRect(p.x,0,PIPE_W,p.topH);
      ctx.fillRect(p.x,p.topH + p.gapPx,PIPE_W,canvas.height - p.topH - p.gapPx);
    }
    if(!p.passed && p.x + PIPE_W < birdX){ p.passed = true; score++; scoreTag.textContent = `Score ${score}`; }
    if(hitsPipe(p)) gameOver = true;
    return p.x + PIPE_W > -20;
  });

  // bird
  if(birdImg.complete && birdImg.naturalWidth){ ctx.drawImage(birdImg,birdX,birdY,BIRD_W,BIRD_H); }
  else { ctx.fillStyle="#ffd700"; ctx.fillRect(birdX,birdY,BIRD_W,BIRD_H); }

  // bounds
  if(birdY + BIRD_H > canvas.height || birdY < 0) gameOver = true;

  // game‑over overlay
  if(gameOver){
    ctx.fillStyle="rgba(0,0,0,0.5)";
    ctx.fillRect(0,0,canvas.width,canvas.height);
    ctx.fillStyle="#fff"; ctx.textAlign="center";
    ctx.font="48px sans-serif";
    ctx.fillText("Game Over", canvas.width/2, canvas.height/2 - 40);
    ctx.font="24px sans-serif";
    ctx.fillText("Tap / space to restart", canvas.width/2, canvas.height/2 + 10);
  }

  frame++;
  if(playing) requestAnimationFrame(loop);
}