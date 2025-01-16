// HTML要素の取得
const titleScreen = document.getElementById("title-screen");
const gameScreen = document.getElementById("game-screen");
const resultScreen = document.getElementById("result-screen");
const canvas = document.getElementById("game-canvas");
const ctx = canvas.getContext("2d");
const scoreSpan = document.getElementById("score");
const livesSpan = document.getElementById("lives");
const finalScoreSpan = document.getElementById("final-score");
const restartButton = document.getElementById("restart-button");

// キャンバス設定
canvas.width = 700;
canvas.height = 400;

// ゲーム変数
let score = 0;
let lives = 3;
let ball, paddle, blocks;
let ballSpeed = 5;
let isRunning = false;

// ブロック設定
const blockWidth = 80;
const blockHeight = 20;
const blockPadding = 10;
const blockOffsetTop = 50;
const blockOffsetLeft = 50;

// ボールとバーの初期設定
function initGame(difficulty) {
  ball = {
    x: canvas.width / 2,
    y: canvas.height - 30,
    radius: 10,
    dx: ballSpeed,
    dy: -ballSpeed,
  };

  let paddleWidth;
  if (difficulty === "easy") {
    paddleWidth = 120;
    lives = 5;
  } else if (difficulty === "normal") {
    paddleWidth = 100;
    lives = 3;
  } else if (difficulty === "hard") {
    paddleWidth = 80;
    lives = 1;
  }

  paddle = {
    width: paddleWidth,
    height: 10,
    x: (canvas.width - paddleWidth) / 2,
    speed: 7,
    isMovingLeft: false,
    isMovingRight: false,
  };

  score = 0;

  createBlocks(difficulty); // ブロックを生成
  updateUI(); // UIを更新
}

// UI更新
function updateUI() {
  scoreSpan.textContent = score;
  livesSpan.textContent = lives;
}

// 画面遷移
document.querySelectorAll(".difficulty").forEach((button) => {
  button.addEventListener("click", (e) => {
    const difficulty = e.target.dataset.difficulty;
    if (difficulty === "easy") ballSpeed = 3;
    else if (difficulty === "normal") ballSpeed = 3;
    else if (difficulty === "hard") ballSpeed = 3;

    titleScreen.classList.add("hidden");
    gameScreen.classList.remove("hidden");

    startCountdown(difficulty); // カウントダウンを開始
  });
});

restartButton.addEventListener("click", () => {
  resultScreen.classList.add("hidden");
  titleScreen.classList.remove("hidden");
});

// カウントダウン処理
function startCountdown(difficulty) {
  let count = 3; // 3秒カウントダウン
  countdownElement.textContent = count; // 初期値を表示
  countdownElement.style.display = "block"; // カウントダウン表示

  const countdownInterval = setInterval(() => {
    count -= 1; // カウントを減らす
    if (count > 0) {
      countdownElement.textContent = count; // カウント更新
    } else {
      clearInterval(countdownInterval); // カウント終了
      countdownElement.style.display = "none"; // カウントダウンを非表示
      initGame(difficulty); // ゲーム初期化
      startGame(); // ゲーム開始
    }
  }, 1000); // 1秒ごとに実行
}

// ブロック描画
function drawBlocks() {
  for (let r = 0; r < blocks.length; r++) {
    for (let c = 0; c < blocks[r].length; c++) {
      const block = blocks[r][c];
      if (!block.isHit) {
        ctx.beginPath();
        ctx.rect(block.x, block.y, blockWidth, blockHeight);
        ctx.fillStyle = "#0095DD";
        ctx.fill();
        ctx.closePath();
      }
    }
  }
}

// ゲーム開始
function startGame() {
  isRunning = true;
  requestAnimationFrame(gameLoop);
}

// ゲームループ
function gameLoop() {
  if (!isRunning) return;

  ctx.clearRect(0, 0, canvas.width, canvas.height);

  drawBall();
  drawPaddle();
  drawBlocks();

  moveBall();
  movePaddle();
  checkCollision();

  requestAnimationFrame(gameLoop);
}

// ボールの描画と移動
function drawBall() {
  ctx.beginPath();
  ctx.arc(ball.x, ball.y, ball.radius, 0, Math.PI * 2);
  ctx.fillStyle = "#FF5733";
  ctx.fill();
  ctx.closePath();
}

function moveBall() {
  ball.x += ball.dx;
  ball.y += ball.dy;

  // 壁の反射
  if (ball.x + ball.radius > canvas.width || ball.x - ball.radius < 0) {
    ball.dx = -ball.dx;
  }
  if (ball.y - ball.radius < 0) {
    ball.dy = -ball.dy;
  }

  // 底に落ちた場合
  if (ball.y + ball.radius > canvas.height) {
    lives--;
    updateUI();
    if (lives <= 0) {
      gameOver();
    } else {
      resetBall();
    }
  }
}

// ボールのリセット
function resetBall() {
  ball.x = canvas.width / 2;
  ball.y = canvas.height - 30;
  ball.dx = ballSpeed;
  ball.dy = -ballSpeed;
}

// パドルの描画と移動
function drawPaddle() {
  ctx.beginPath();
  ctx.rect(paddle.x, canvas.height - paddle.height - 10, paddle.width, paddle.height);
  ctx.fillStyle = "#0095DD";
  ctx.fill();
  ctx.closePath();
}

function movePaddle() {
  if (paddle.isMovingLeft && paddle.x > 0) {
    paddle.x -= paddle.speed;
  }
  if (paddle.isMovingRight && paddle.x + paddle.width < canvas.width) {
    paddle.x += paddle.speed;
  }
}

// ブロックの生成
function createBlocks(difficulty) {
  blocks = [];
  let rows, columns;
  if (difficulty === "easy") {
    rows = 3;
    columns = 5;
  } else if (difficulty === "normal") {
    rows = 5;
    columns = 8;
  } else if (difficulty === "hard") {
    rows = 7;
    columns = 10;
  }

  const blockOffsetLeft = (canvas.width - (columns * (blockWidth + blockPadding) - blockPadding)) / 2;

  for (let r = 0; r < rows; r++) {
    blocks[r] = [];
    for (let c = 0; c < columns; c++) {
      const blockX = c * (blockWidth + blockPadding) + blockOffsetLeft;
      const blockY = r * (blockHeight + blockPadding) + blockOffsetTop;
      blocks[r][c] = { x: blockX, y: blockY, isHit: false };
    }
  }
}

// 衝突判定
function checkCollision() {
  // パドルとの衝突
  if (
    ball.y + ball.radius > canvas.height - paddle.height - 10 &&
    ball.x > paddle.x &&
    ball.x < paddle.x + paddle.width
  ) {
    // パドルの中央からの距離を計算
    let collidePoint = ball.x - (paddle.x + paddle.width / 2);
    // パドルの幅の半分で正規化
    collidePoint = collidePoint / (paddle.width / 2);
    // 最大反射角度を設定（例：75度）
    let angle = collidePoint * (Math.PI / 3);

    // 新しいボールの速度を計算
    ball.dx = ballSpeed * Math.sin(angle);
    ball.dy = -ballSpeed * Math.cos(angle);
  }

  // ブロックとの衝突
  for (let r = 0; r < blocks.length; r++) {
    for (let c = 0; c < blocks[r].length; c++) {
      const block = blocks[r][c];
      if (!block.isHit) {
        if (
          ball.x > block.x &&
          ball.x < block.x + blockWidth &&
          ball.y > block.y &&
          ball.y < block.y + blockHeight
        ) {
          ball.dy = -ball.dy;
          block.isHit = true;
          score++;
          updateUI();

          // すべてのブロックが壊れたかチェック
          if (checkAllBlocksDestroyed()) {
            gameClear();
          }
        }
      }
    }
  }
}

// ゲームオーバー
function gameOver() {
  isRunning = false;
  resultScreen.classList.remove("hidden");
  gameScreen.classList.add("hidden");
  finalScoreSpan.textContent = score;
}

function checkAllBlocksDestroyed() {
  for (let r = 0; r < blocks.length; r++) {
    for (let c = 0; c < blocks[r].length; c++) {
      if (!blocks[r][c].isHit) {
        return false; // 壊れていないブロックがある場合
      }
    }
  }
  return true; // すべてのブロックが壊れた場合
}

function gameClear() {
  isRunning = false;
  resultScreen.classList.remove("hidden");
  gameScreen.classList.add("hidden");
  finalScoreSpan.textContent = score;
  finalScoreSpan.textContent += " - Congratulations! You cleared the game!";
}

// キーボード入力
document.addEventListener("keydown", (e) => {
  if (e.key === "ArrowLeft") paddle.isMovingLeft = true;
  if (e.key === "ArrowRight") paddle.isMovingRight = true;
});

document.addEventListener("keyup", (e) => {
  if (e.key === "ArrowLeft") paddle.isMovingLeft = false;
  if (e.key === "ArrowRight") paddle.isMovingRight = false;
});

// カウントダウン用の要素を作成
const countdownElement = document.createElement("div");
countdownElement.id = "countdown";
countdownElement.style.position = "absolute";
countdownElement.style.top = "50%";
countdownElement.style.left = "50%";
countdownElement.style.transform = "translate(-50%, -50%)";
countdownElement.style.fontSize = "3em";
countdownElement.style.color = "white";
countdownElement.style.display = "none"; // 初期は非表示
gameScreen.appendChild(countdownElement);