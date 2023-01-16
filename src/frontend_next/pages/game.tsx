import { useEffect, useRef, useState } from "react";
import Script from "next/script";
import io from "socket.io-client";
import { Timeline } from "flowbite-react";
import index from ".";
import { Console } from "console";

const PADDLE_MOVE_DISTANCE = 0.8;

const game = () => {
    const INITIAL_SPEED = 0.05;
    const INCREASE_SPEED = 0.000001;

    class Ball {
        constructor(ballElement, offsetTop) {
          this.ballElement = ballElement;
          this.offsetTop = offsetTop;
          this.resetPosition();
        }
      
        get x() {
        //   console.log("INSIDE get X");
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
        //   console.log("INSIDE set X");
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
          if (rect.bottom >= window.innerHeight || rect.top <= this.offsetTop) {
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
    function isRoundFinished() {
        const rect = ball.rect();
        return rect.left <= 0 || rect.right >= window.innerWidth;
    }
    function handleMoves() {
        const myPaddleRect = myPaddle.rect();
        const opPaddleRect = opPaddle.rect();
        // moves my paddle when w or s are pressed
        if (keyState.ArrowUp) {
          if (myPaddleRect.top > screenTopOffset) {
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
          if (opPaddleRect.top > screenTopOffset) {
            opPaddle.position -= PADDLE_MOVE_DISTANCE;
          }
        } else if (keyState.s) {
          if (opPaddleRect.bottom < window.innerHeight) {
            opPaddle.position += PADDLE_MOVE_DISTANCE;
          }
        }
      }
    function startNewRound() {
        const rect = ball.rect();
      
        ball.resetPosition();
        if (init) {
            if (rect.left <= 0) {
                setOpScore(opScore + 1);
              //this.resetPosition();
            } else if (rect.right >= window.innerWidth) {
                setMyScore(myScore + 1);
              //this.resetPosition();
            }
        }
    }

    function joingame(){
        const room = roomIdRef.current.value;
        if (room){
            socket.emit("join", room);
            // ...
            gameDivRef.current.style.display = "block";
            roomDivRef.current.style.display = "none";
            setBall(new Ball(ballRef.current, gameDivRef.current.offsetTop));
            setScreenTopOffset(gameDivRef.current.offsetTop);
            window.requestAnimationFrame(update); // start the game loop
        }
        else {
            alert("Please enter a room id");
        }

    }

    const ballRef = useRef(null);
    const myPaddleRef = useRef(null);
    const opPaddleRef = useRef(null);
    const gameDivRef = useRef(null);
    const roomDivRef = useRef(null);
    const roomIdRef = useRef(null);
    
    const [init, setInit] = useState(false);
    const [ball, setBall] = useState();
    const [myPaddle, setMyPaddle] = useState();
    const [opPaddle, setOpPaddle] = useState();
    const [myScore, setMyScore] = useState(0);
    const [opScore, setOpScore] = useState(0);
    const [keyState, setKeyState] = useState({});
    const [socket, setSocket] = useState();
    const [screenTopOffset, setScreenTopOffset] = useState(0);


    const [lastTime, setLastTime] = useState();
    function update(time) {
        if (lastTime != null) {
            const delta = time - lastTime;
              ball.updatePosition(delta, [myPaddle.rect(), opPaddle.rect()]);
            handleMoves();
            if (isRoundFinished()) {
              startNewRound();
            }
          }
          setLastTime(time);
    }

    useEffect(() => {// game loop, render on lastTime change
        if (init) {
            window.requestAnimationFrame(update);
        }
    }, [lastTime]);

    useEffect(() => { // initialize game after the page is loaded then start the game
        setMyPaddle(new Paddle(myPaddleRef.current));
        setOpPaddle(new Paddle(opPaddleRef.current));
        
        setSocket(io()); // connect to the server

        // add event listeners for key presses
        window.addEventListener("keydown", (e) => {
            setKeyState((state) => ({ ...state, [e.key]: true }));
        });
        window.addEventListener("keyup", (e) => {
            setKeyState((state) => ({ ...state, [e.key]: false }));
        });
        setInit(true);
        // window.requestAnimationFrame(update); // start the game loop
        return () => {
            console.log("unmounting");
            window.removeEventListener("keydown", (e) => {
                setKeyState((state) => ({ ...state, [e.key]: true }));
            });
            window.removeEventListener("keyup", (e) => {
                setKeyState((state) => ({ ...state, [e.key]: false }));
            });
            setInit(false);
        }
    }
    , []);
  return(
  <>
    <div ref={gameDivRef} className='gameDiv flex flex-col h-full bg-black bg-opacity-50'>
        <div className="relative" >
            <div className="score">
              <div id="my-score">{myScore}</div>
              <div id="op-score">{opScore}</div>
              <div ref={ballRef} className="ball" id="ball"
              ></div>
              <div ref={myPaddleRef} className="paddle" id="my-paddle"></div>
              <div ref={opPaddleRef} className="paddle" id="op-paddle"></div>
            </div>
      </div>
    </div>
    <div ref={roomDivRef} id="room-input">
      <div className="form-group">
        <input ref={roomIdRef} type="text" placeholder="Enter Room" id="room-id" />
      </div>
      <button type="submit" className="btn btn-success" id="join-button" onClick={joingame}>
        Join Game
      </button>
    </div>
  </>)
}


export default game