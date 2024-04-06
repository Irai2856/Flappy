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

        context.fillStyle = "black"; // Set text color to black
        context.font = "bold 20px sans-serif"; // Adjusted font size and bold font
        context.textAlign = "center";
        context.fillText("Score: " + score, boardWidth / 2, 25); // Adjusted vertical position
        
        // Display highest score under the current score
        context.fillText("High Score: " + highScore, boardWidth / 2, 55); // Adjusted vertical position
        
        if (gameOver) {
            // Sky blue frame background covering the text
            context.fillStyle = "skyblue";
            context.fillRect(boardWidth / 2 - 150, 150, 300, 160); // Adjusted height
            
            // "Game Over" message
            context.fillStyle = "red"; // Set text color to red for "Game Over"
            context.font = "bold 24px sans-serif"; // Adjusted font size for "Game Over" and bold font
            context.fillText("Game Over", boardWidth / 2, 180); // Adjusted vertical position
            
            context.fillStyle = "black"; // Reset text color to black
            context.font = "bold 20px sans-serif"; // Reset font size and bold font
            context.fillText("Quest 1 Completed", boardWidth / 2, 220); // Adjusted vertical position
            context.fillText("Now you can look for Quest 2", boardWidth / 2, 260); // Adjusted vertical position
            context.fillText("Tap to Restart", boardWidth / 2, 300); // Adjusted vertical position
        }
    } else {
        context.fillStyle = "black"; // Set text color to black
        context.font = "bold 20px sans-serif"; // Adjusted font size and bold font
        context.textAlign = "center";
        context.fillText("Tap to start", boardWidth / 2, 70); // Adjusted vertical position
        // Display highest score
        context.fillText("High Score: " + highScore, boardWidth / 2, 105); // Adjusted vertical position
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
    try {
        if (score > highScore) {
            highScore = score;
            localStorage.setItem("flappybird_highscore", highScore);
        }
    } catch (error) {
        // Handle errors related to local storage access
        console.error("Error updating high score:", error);
        // Fallback: Use cookies or other storage mechanism
        document.cookie = "flappybird_highscore=" + highScore + ";expires=Fri, 31 Dec 9999 23:59:59 GMT;path=/";
    }
}

// Function to retrieve the high score with error handling
function getHighScore() {
    let storedHighScore = 0;
    try {
        storedHighScore = parseInt(localStorage.getItem("flappybird_highscore")) || 0;
    } catch (error) {
        // Handle errors related to local storage access
        console.error("Error retrieving high score:", error);
        // Fallback: Try to retrieve high score from cookies or other storage mechanism
        let cookie = document.cookie.match('(^|[^;]+)\\s*flappybird_highscore\\s*=\\s*([^;]+)');
        storedHighScore = cookie ? parseInt(cookie.pop()) : 0;
    }
    return storedHighScore; // Return the retrieved high score
}

