

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
