
import { Button, Spinner } from "flowbite-react";
import { useEffect, useRef, useState } from "react";
import io from "socket.io-client";

const PADDLE_MOVE_DISTANCE = 0.8;

const gameFull = () => {
    let gameStarted = false;
    let keyState = {}; // this object keeps track of the state of keys when they are held
    let mySide = "left"; // a string whether this client is left or right, It is set to Left by default unless receiving a rightSide event
    
    // DOM
    const ballElement = useRef();
    const leftPaddle = useRef();
    const rightPaddle = useRef();
    const gameScreen = useRef();
    const roomScreen = useRef();  
    const joinGameBtn = useRef();
    const leftScoreRef = useRef();
    const rightScoreRef = useRef();
    const waitingForGame = useRef();
    const roomIdspan = useRef();
    const roomId = useRef();
    let room;


    //socket events
    let socket = null;
    const [init, setInit] = useState(false);
    // old events

    function joinGame() {
      room = roomId.current.value;
      console.log('joinGame ', room)
      if (room !== "") {
        socket.emit("joinGame", room);
        roomScreen.current.style.display = "none";
        waitingForGame.current.style.display = "block";
        roomIdspan.current.innerText = room;
      }
    }
    //game

    let lastTime = null;
    function update(time) {
      if (gameStarted === false) return;
      if (lastTime) {
        const delta = time - lastTime;
        if (keyState.ArrowUp && mySide !== "spectator") {
          // console.log("UPDATE GAME: ARROWUP");
          socket.emit("updateGame", {
            delta,
            PressedKeysObj: {
              direction: "up",
              side: mySide,
            },
            room,
          });
        } else if (keyState.ArrowDown &&  mySide !== "spectator") {
          // console.log("UPDATE GAME: ARROWDOWN");
          socket.emit("updateGame", {
            delta,
            PressedKeysObj: {
              direction: "down",
              side: mySide,
            },
            room,
          });
        } else if (mySide !== "spectator") {
          socket.emit("updateGame", {
            delta,
            room,
          });
        }
      }
      lastTime = time;
      window.requestAnimationFrame(update);
    }

    useEffect(() => {
        if (!socket) return;
        socket.on("initGame", () => {
            // console.log("initGame");
            gameScreen.current.style.display = "block";
            // roomScreen.current.style.display = "none";
            waitingForGame.current.style.display = "none";
          });
      
          socket.on("rightSide", () => {
            mySide = "right";
      
            console.log("Changed my side to", mySide);
          });
          socket.on("spectatorSide", () => {
            mySide = "spectator";
      
            console.log("Changed my side to", mySide);
          });
      
          socket.on("startGame", (s) => {
            console.log("on startGame event: ", s);
            room = s;
            gameStarted = true;
            window.requestAnimationFrame(update);
          });
          // console.log("GAME ",gameStarted);
          socket.on("setLeftPaddlePosition", (newPos) => {
            leftPaddle.current.style.setProperty("--position", newPos);
            // console.log("setleftPaddle.currentPosition event");
          });
        
          socket.on("setRightPaddlePosition", (newPos) => {
            rightPaddle.current.style.setProperty("--position", newPos);
            // console.log("setrightPaddle.currentPosition event");
          });
        
          socket.on("updateRightScore", (rightScore) => {
            rightScoreRef.current.innerText = rightScore;
          });
        
          socket.on("updateLeftScore", (leftScore) => {
            leftScoreRef.current.innerText = leftScore;
          });
        
          socket.on("setBall", ({ x, y }) => {
            ballElement.current.style.setProperty("--x", x);
            ballElement.current.style.setProperty("--y", y);
          });
        return () => {
            socket.emit("disconnect", room, mySide);
            socket.off("initGame");
            socket.off("rightSide");
            socket.off("startGame");
            socket.off("setLeftPaddlePosition");
            socket.off("setRightPaddlePosition");
            socket.off("updateRightScore");
            socket.off("updateLeftScore");
            socket.off("setBall");
        }
    }, [socket]);

    useEffect(() => { // initialize game after the page is loaded then start the game
        if (!init) {
            if (!socket){
                joinGameBtn.current.addEventListener("click", joinGame);
                console.log("socket is null")
                socket = io();
            }
            else {
                socket.on("connect", () => {
                    console.log("Connected with id: ", socket.id);
                  });
                // add event listeners for key presses
                document.addEventListener("keydown", (e) => {
                    keyState[e.key] = true;
                  });
                  
                  document.addEventListener("keyup", (e) => {
                    keyState[e.key] = false;
                  });
                setInit(true);
            }
        }
    }
    ,);
  return(
  <>
    <div ref={gameScreen} id="game-screen">
      <div className="score">
        <div ref={leftScoreRef} id="left-score">0</div>
        <div ref={rightScoreRef} id="right-score">0</div>
      </div>
      <div ref={ballElement} className="ball" id="ball"></div>
      <div ref={leftPaddle} className="paddle" id="left-paddle"></div>
      <div ref={rightPaddle} className="paddle" id="right-paddle"></div>
    </div>
  <div className="flex flex-col items-center justify-center h-screen">
    <div ref={roomScreen} id="room-screen" className="aero p-6 rounded-lg shadow-lg">
      <div className="form-group">
        <input ref={roomId} type="text" placeholder="Enter Room" id="room-id" className="rounded-l"/>
      </div>
      <Button ref={joinGameBtn} className="btn btn-success rounded-none rounded-r" id="join-button">
        Join Game
      </Button>
    </div>
    <div ref={waitingForGame} className="aero content-center p-6 rounded-lg shadow-lg bg-gray-50" style={{display: "none"}}>
      <div className="text-center">
        <h1>Waiting for another player...</h1>
        <p>Share this room ID with your friend: <span ref={roomIdspan}></span></p>
        <Spinner
          aria-label="loading"
          size="xl"
        />
      </div>
    </div>
  </div>
  </>)
}


export default gameFull