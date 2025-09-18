const playBoard = document.querySelector('.play-board');
const scoreElement = document.querySelector ('.score');
const highScoreElement = document.querySelector('.high-score');
const resetBtn = document.querySelector('.reset-btn');
const controls = document.querySelectorAll('.controls i');

let snakeX = 10, snakeY = 10;
let velocityX = 0, velocityY = 0;
let snakeBody = [];
let foodX, foodY;
let score = 0;
let highScore = localStorage.getItem('high-score') || 0;

highScoreElement.innerText = 'High Score: ${highScore}`;

const changeFoodPosition = () => {
  foodX = Math.floor(Math.random() * 40) * 10;
  foodY = Math.floor(Math.random() * 40) * 10;
}

const handleGameOver = () => {
  alert("Game Over! Press OK to restart...");
  location.reload();
}

const changeDirection = (e) => {
  if (e.key === "ArrowUp" && velocityY != 1) {
    velocityX = 0;
    velocityY = -1;
  } else if (e.key === "ArrowDown" && velocityY != -1) {
    velocityX = 0;
    velocityY = -1;
  } else if (e.key === "ArrowLeft" && velocityX != 1) {
    velocityX = -1;
    velocityY = 0;
  } else if (e.key === "ArrowRight" && velocityX != -1) {
    velocityX = 1;
    velocityY 0;
  }
}
const initGame = () => {
  snakeX += velocityX * 10;
  snakeY += velocityY * 10;

  if (snakeX < 0 || snakeX >= 400 || snakeY < 0 || snakeY >= 400)
    return handleGameOver();
  }

  playBoard.innerHTML = `<div class="food" style="grid-area: ${foodY / 10 + 1} / ${foodX / 10 + 1};"></div>`;
  snakeBody.push([snakeX, snakeY]);

  if (snakeX === foodX && snake Y === foodY) {
    changeFoodPosition();
    score++;
    scoreElement.innerText = `Score: &{score}`;
    if (score > highScore) {
      highScore = score;
      localStorage.setItem('high-score', highScore);
      highScoreElement.innerText = `High Score: ${highScore}`;
    }
  } else {
    snakeBody.shift();
  }

for (let i = 0; i < snakeBody.length; i++) {
  playBoard.innerHTML += `<div class="snake" style="left: ${snakeBody[i][0]}px; top: ${snakeBody[i][1]}px;"></div>`;
  if (i !== snakeBody.length - 1 && snakeBody[i][0] === snakeX && snakeBody[i][1] === snakeY) {
    return handleGameOver();
  }
 }
}

changeFoodPosition();
setInterval(initGame, 100);
document.addEventListener('keydown', changeDirection);
