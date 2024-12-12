var dx, dy;       /* displacement at every dt */
var x, y;         /* ball location */
var score = 0;    /* # of walls you have cleaned */
var tries = 0;    /* # of tries to clean the wall */
var started = false;  /* false means ready to kick the ball */
var ball, court, paddle, brick, msg;
var court_height, court_width, paddle_left;
var dt = 1
var vx = 0, vy = 0
var speed = 1
var points = 0
var bricks = new Array(4);  // rows of bricks
var colors = ["red", "blue", "yellow", "green"];
let totalBricks = 80
var triesElement = ""
var scoreElement = ""
var messageElement = ""

/* convert a string with px to an integer, eg "30px" -> 30 */
function pixels(pix) {
    pix = pix.replace("px", "");
    num = Number(pix);
    return num;
}

/* place the ball on top of the paddle */
function readyToKick() {
    x = pixels(paddle.style.left) + paddle.width / 2.0 - ball.width / 2.0;
    y = pixels(paddle.style.top) - 2 * ball.height;
    ball.style.left = x + "px";
    ball.style.top = y + "px";
}

/* paddle follows the mouse movement left-right */
function movePaddle(e) {
    var ox = e.pageX - court.getBoundingClientRect().left;
    paddle.style.left = (ox < 0) ? "0px"
        : ((ox > court_width - paddle.width)
            ? court_width - paddle.width + "px"
            : ox + "px");
    if (!started)
        readyToKick();
}

function initialize() {
    function id(s) { return document.getElementById(s); }
    court = id("court");
    ball = id("ball");
    paddle = id("paddle");
    wall = id("wall");
    msg = id("messages");
    brick = id("red");
    court_height = pixels(court.style.height);
    court_width = pixels(court.style.width);
    x = pixels(paddle.style.left) + paddle.width / 2.0 - ball.width / 2.0;
    y = pixels(paddle.style.top) - 2 * ball.height;
    ball.style.left = x + "px";
    ball.style.top = y + "px";
    for (i = 0; i < 4; i++) {
        // each row has 20 bricks
        bricks[i] = new Array(20);
        var b = id(colors[i]);
        for (j = 0; j < 20; j++) {
            var x = b.cloneNode(true);
            bricks[i][j] = x;
            wall.appendChild(x);
        }
        b.style.visibility = "hidden";
    }
    updateLevel() // updates speed level
    messageElement = document.getElementById('messages');
    messageElement.innerText = "Ready to start!"
}

// update speed level and adding eventlistener to monitor level changes
function updateLevel() {
    const level = parseInt(document.getElementById("level").value, 10);
    const angle = Math.random() * (Math.PI / 4 - 3 * Math.PI / 4) + 3 * Math.PI / 4
    speed = level * 1.5;
    vx = speed * Math.cos(angle)
    vy = speed * Math.sin(angle)
    messageElement = document.getElementById('messages');
    messageElement.innerText = "Level updated to " + level
}

document.getElementById("level").addEventListener("change", updateLevel);

/* true if the ball at (x,y) hits the brick[i][j] */
function hits_a_brick(x, y, i, j) {
    let brickElement = bricks[i][j];
    let brickRect = brickElement.getBoundingClientRect();
    let ballRect = ball.getBoundingClientRect();

    return (ballRect.right > brickRect.left &&
        ballRect.left < brickRect.right &&
        ballRect.bottom > brickRect.top &&
        ballRect.top < brickRect.bottom);
}

function startGame() {
    if (!started) {
        started = true
        let ballInterval;
        ballInterval = setInterval(moveBall, 5);
        messageElement = document.getElementById('messages');
        messageElement.innerText = "Game started!"
        function moveBall() {
            y = y + vy * dt
            x = x + vx * dt
            if (y >= court_height - ball.height) {
                vy = -vy
                y = 2 * court_height - y;
            }
            const paddleLeft = pixels(paddle.style.left);
            const paddleRight = paddleLeft + paddle.width;
            // check if ball is on paddle - x axis
            const isBallOnPaddleX = x + ball.width >= paddleLeft && x <= paddleRight;
            // Check for bottom border collision
            if (y < 0) {
                if (isBallOnPaddleX) {
                    vy = -vy
                    y = -y + 5
                } else {
                    messageElement = document.getElementById('messages');
                    messageElement.innerText = "Oops ball hit the bottom of court!"
                    started = false
                    tries++;
                    clearInterval(ballInterval);
                    y = pixels(paddle.style.top) + ball.height;
                    x = pixels(paddle.style.left) + paddle.width / 2.0 - ball.width / 2.0;
                    document.addEventListener('mousemove', movePaddle);
                }
                ball.style.left = x + "px";
                ball.style.top = y + "px";
                triesElement = document.getElementById('tries');
                triesElement.innerText = tries;
            }
            // checks if ball goes out of court in x axis- top
            if (x > court_width) {
                vx = -vx
                x = 2 * court_width - x;
            }
            // checks if ball goes out of court in x axis- bottom
            if (x < 0) {
                vx = -vx
                x = - x
            }
            // checks if ball hits the bricks, if it hits all the 80 bricks then new bricks will be added, score would be incremented by 1
            for (let i = 0; i < 4; i++) {
                for (let j = 0; j < 20; j++) {
                    let brickElement = bricks[i][j];
                    if (brickElement.style.visibility !== "hidden") {
                        if (hits_a_brick(x, y, i, j)) {
                            brickElement.style.visibility = "hidden";
                            vy = -vy;
                            totalBricks--;
                            if (totalBricks == 0) {
                                points++
                                messageElement = document.getElementById('messages');
                                messageElement.innerText = "Congrats! Score increased by 1 point"
                                clearInterval(ballInterval);
                                y = pixels(paddle.style.top) + ball.height;
                                x = pixels(paddle.style.left) + paddle.width / 2.0 - ball.width / 2.0;
                                document.addEventListener('mousemove', movePaddle);
                                started = false
                                for (let k = 0; k < 4; k++) {
                                    for (let l = 0; l < 20; l++) {
                                        bricks[k][l].style.visibility = "visible";
                                    }
                                }
                                ball.style.left = x + "px";
                                ball.style.top = y + "px";
                                totalBricks = 80;
                            }
                        }
                    }
                }
            }
            // updating the score
            scoreElement = document.getElementById('score');
            scoreElement.innerText = points;
            ball.style.top = -y + 'px'
            ball.style.left = x + 'px'
        }
    }
}

// reset game on clicking the reset button, score remains same but the tries would be cleared.
function resetGame() {
    for (let i = 0; i < 4; i++) {
        for (let j = 0; j < 20; j++) {
            let brickElement = bricks[i][j];
            if (brickElement.style.visibility === "hidden") {
                brickElement.style.visibility = "visible";
            }
        }
    }
    // reset totalbricks and tries
    totalBricks = 80;
    tries = 0
    triesElement.innerText = tries;
    scoreElement.innerText = points;
    document.addEventListener('click', startGame);
    messageElement = document.getElementById('messages');
    messageElement.innerText = "Game reset!"
}