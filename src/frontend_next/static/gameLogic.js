import { io } from "https://cdn.socket.io/4.3.2/socket.io.esm.min.js";

//BALL CLASS
const INITIAL_SPEED = 0.05;
const INCREASE_SPEED = 0.000001;

class Ball {
  constructor(ballElement) {
    this.ballElement = ballElement;
    this.resetPosition();
  }

  get x() {
    console.log("INSIDE X");
    return parseFloat(
      getComputedStyle(this.ballElement).getPropertyValue("--x")
    );
  }

  get y() {
    return parseFloat(
      getComputedStyle(this.ballElement).getPropertyValue("--y")
    );
  }

  set x(newX) {
    this.ballElement.style.setProperty("--x", newX);
  }

  set y(newY) {
    this.ballElement.style.setProperty("--y", newY);
  }

  /* This method returns the position of the ball relative to the window */
  rect() {
    return this.ballElement.getBoundingClientRect();
  }

  updatePosition(delta, paddlesRect) {
    this.x += this.direction.x * this.speed * delta;
    this.y += this.direction.y * this.speed * delta;
    this.speed += INCREASE_SPEED * delta;
    const rect = this.rect();

    // if the ball has crossed upper or lower boundaries
    if (rect.bottom >= window.innerHeight || rect.top <= 0) {
      this.direction.y *= -1;
    }
    // if one of the paddlesRect satisfy the collision test then bounce the ball (by x = -x)
    if (paddlesRect.some((paddle) => isCollided(paddle, rect))) {
      this.direction.x *= -1;
    }
  }

  resetPosition() {
    this.x = 50;
    this.y = 50;
    this.direction = { x: 0 };
    while (
      Math.abs(this.direction.x) <= 0.2 ||
      Math.abs(this.direction.x) >= 0.8
    ) {
      const degree = genRandomBetween(0, 2 * Math.PI);
      this.direction = { x: Math.cos(degree), y: Math.sin(degree) };
    }
    this.speed = INITIAL_SPEED;
  }
}

function genRandomBetween(min, max) {
  return Math.random() * (max - min) + min;
}

function isCollided(paddle, ball) {
  return (
    paddle.right >= ball.left &&
    paddle.left <= ball.right &&
    paddle.top <= ball.bottom &&
    paddle.bottom >= ball.top
  );
}
//END OF BALL CLASS


// PADDLE CLASS

class Paddle {
    constructor(paddleElement) {
      this.paddleElement = paddleElement;
    }
  
    get position() {
      return parseFloat(
        getComputedStyle(this.paddleElement).getPropertyValue("--position")
      );
    }
  
    set position(newPos) {
      this.paddleElement.style.setProperty("--position", newPos);
    }
  
    /* This method returns the position of the ball relative to the window */
    rect() {
      return this.paddleElement.getBoundingClientRect();
    }
  
    resetPosition() {
      this.position = 50;
    }
  }  

// END OF PADDLE CLASS

// Path: src/frontend_next/static/gameLogic/game.js

const PADDLE_MOVE_DISTANCE = 0.8; // speed in which our paddle moves, increase this for faster move

const ball = new Ball(document.getElementById("ball"));
// console.log(ball);
const myPaddle = new Paddle(document.getElementById("my-paddle"));
let myScore = 0;
const opPaddle = new Paddle(document.getElementById("op-paddle"));
let opScore = 0;
let keyState = {}; // this object keeps track of the state of keys when they are held

//socket events

const socket = io("http://localhost:3000");

socket.on("connect", () => { 
  console.log("Connected with id: ", socket.id);
});

// DOM
const gameScreen = document.getElementById("game-screen");
const roomId = document.getElementById("room-id");



function joinGame() {
  console.log("Joining game");
  const room = roomId.value;
  socket.emit("joinGame", room);
  gameScreen.style.display = "block";
  //init game
}
//game

let lastTime;
function update(time) {
  if (lastTime != null) {
    const delta = time - lastTime;
    ball.updatePosition(delta, [myPaddle.rect(), opPaddle.rect()]);

    handleMoves();
    if (isRoundFinished()) {
      startNewRound();
    }
  }
  lastTime = time;
  window.requestAnimationFrame(update);
}

/* the handleMoves() function handles keypresses to make them more smooth instead of just keydown event */

function handleMoves() {
  const myPaddleRect = myPaddle.rect();
  const opPaddleRect = opPaddle.rect();
  // moves my paddle when w or s are pressed
  if (keyState.ArrowUp) {
    if (myPaddleRect.top > 0) {
      socket.emit("moveUp", "move that shit up");
      myPaddle.position -= PADDLE_MOVE_DISTANCE;
    }
  } else if (keyState.ArrowDown) {
    if (myPaddleRect.bottom < window.innerHeight) {
      socket.emit("moveDown", "move that shit down");
      myPaddle.position += PADDLE_MOVE_DISTANCE;
    }
  }
  // moves opponent paddle when up or down arrow are pressed
  if (keyState.w) {
    if (opPaddleRect.top > 0) {
      opPaddle.position -= PADDLE_MOVE_DISTANCE;
    }
  } else if (keyState.s) {
    if (opPaddleRect.bottom < window.innerHeight) {
      opPaddle.position += PADDLE_MOVE_DISTANCE;
    }
  }
}

/* the startNewRound() resets the ball and the paddles */

function startNewRound() {
  const rect = ball.rect();

  ball.resetPosition();
  if (rect.left <= 0) {
    opScore++;
    document.getElementById("op-score").innerText = opScore;
    //this.resetPosition();
  } else if (rect.right >= window.innerWidth) {
    myScore++;
    document.getElementById("my-score").innerText = myScore;
    //this.resetPosition();
  }
}

/* the isRoundFinished() helper function determines if the ball has gone sideways */

function isRoundFinished() {
  const rect = ball.rect();

  return rect.left <= 0 || rect.right >= window.innerWidth;
}

/* event listners for key presses and releases */

document.addEventListener("keydown", (e) => {
  keyState[e.key] = true;
});

document.addEventListener("keyup", (e) => {
  keyState[e.key] = false;
});

window.requestAnimationFrame(update);
