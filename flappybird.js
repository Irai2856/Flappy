// Define game state variables
let gameStarted = false;

//board
let board;
let boardWidth = 360;
let boardHeight = 640;
let context;

//bird
let birdWidth = 34; //width/height ratio = 408/228 = 17/12
let birdHeight = 24;
let birdX = boardWidth / 8;
let birdY = boardHeight / 2;
let birdImg;

let bird = {
    x: birdX,
    y: birdY,
    width: birdWidth,
    height: birdHeight
}

//pipes
let pipeArray = [];
let pipeWidth = 64; //width/height ratio = 384/3072 = 1/8
let pipeHeight = 512;
let pipeX = boardWidth;
let pipeY = 0;

let topPipeImg;
let bottomPipeImg;

//physics
let velocityX = -2; //pipes moving left speed
let velocityY = 0; //bird jump speed
let gravity = 0.4;

let gameOver = false;
let score = 0;
let highScore = localStorage.getItem("flappybird_highscore") || 0; // Retrieve high score from local storage

window.onload = function () {
    board = document.getElementById("board");
    board.height = boardHeight;
    board.width = boardWidth;
    context = board.getContext("2d");

    birdImg = new Image();
    birdImg.src = "./flappybird.png";
    birdImg.onload = function () {
        context.drawImage(birdImg, bird.x, bird.y, bird.width, bird.height);
    }

    topPipeImg = new Image();
    topPipeImg.src = "./toppipe.png";

    bottomPipeImg = new Image();
    bottomPipeImg.src = "./bottompipe.png";

    requestAnimationFrame(update);
    setInterval(placePipes, 1500);

    // Event listeners for tap-to-start and restart
    document.addEventListener("keydown", handleKeyPress);
    board.addEventListener("touchstart", handleTap);
    board.addEventListener("click", handleRestart);
}

function update() {
    requestAnimationFrame(update);
    if (gameOver) {
        return;
    }
    context.clearRect(0, 0, board.width, board.height);

    if (gameStarted) {
        velocityY += gravity;
        bird.y = Math.max(bird.y + velocityY, 0);
        context.drawImage(birdImg, bird.x, bird.y, bird.width, bird.height);

        if (bird.y > board.height) {
            endGame();
        }

        for (let i = 0; i < pipeArray.length; i++) {
            let pipe = pipeArray[i];
            pipe.x += velocityX;
            context.drawImage(pipe.img, pipe.x, pipe.y, pipe.width, pipe.height);

            if (!pipe.passed && bird.x > pipe.x + pipe.width) {
                score += 0.5;
                pipe.passed = true;
            }

            if (detectCollision(bird, pipe)) {
                endGame();
            }
        }

        while (pipeArray.length > 0 && pipeArray[0].x < -pipeWidth) {
            pipeArray.shift();
        }

        context.fillStyle = "white";
        context.font = "30px sans-serif";
        context.fillText("Score: " + score, 5, 35);
        
        // Display highest score
        context.fillText("Highest Score: " + highScore, 5, 70);

        if (gameOver) {
            updateHighScore(); // Update high score
            context.fillText("GAME OVER", 100, 200);
            context.fillText("Score: " + score, 100, 240);
            context.fillText("Highest Score: " + highScore, 100, 280);
            context.fillText("Tap to restart", 100, 320);
        }
    } else {
        context.fillStyle = "white";
        context.font = "30px sans-serif";
        context.fillText("Tap to start", 5, 90);
        // Display highest score
        context.fillText("Highest Score: " + highScore, 5, 125);
    }
}

function placePipes() {
    if (gameOver || !gameStarted) {
        return;
    }

    let randomPipeY = pipeY - pipeHeight / 4 - Math.random() * (pipeHeight / 2);
    let openingSpace = board.height / 4;

    let topPipe = {
        img: topPipeImg,
        x: pipeX,
        y: randomPipeY,
        width: pipeWidth,
        height: pipeHeight,
        passed: false
    }
    pipeArray.push(topPipe);

    let bottomPipe = {
        img: bottomPipeImg,
        x: pipeX,
        y: randomPipeY + pipeHeight + openingSpace,
        width: pipeWidth,
        height: pipeHeight,
        passed: false
    }
    pipeArray.push(bottomPipe);
}

function handleKeyPress(e) {
    if ((e.code == "Space" || e.code == "ArrowUp" || e.code == "KeyX") && gameStarted) {
        jump();
    } else if (!gameStarted) {
        startGame();
    }
}

function handleTap() {
    if (!gameStarted) {
        startGame();
    } else {
        jump();
    }
}

function jump() {
    velocityY = -6;
}

function handleRestart() {
    if (gameOver) {
        resetGame();
    }
}

function startGame() {
    gameStarted = true;
    velocityY = -6;
}

function endGame() {
    gameOver = true;
}

function resetGame() {
    bird.y = birdY;
    pipeArray = [];
    score = 0;
    gameOver = false;
    gameStarted = false;
}

function detectCollision(a, b) {
    return a.x < b.x + b.width &&
        a.x + a.width > b.x &&
        a.y < b.y + b.height &&
        a.y + a.height > b.y;
}

// Function to update the high score
function updateHighScore() {
    if (score > highScore) {
        highestScore = score;
        localStorage.setItem("flappybird_highestscore", highestScore);
    }
}
