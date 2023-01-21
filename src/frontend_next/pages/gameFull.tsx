
import { Button, Spinner } from "flowbite-react";
import { useEffect, useRef, useState } from "react";
import io from "socket.io-client";
import game from "./game";

const PADDLE_MOVE_DISTANCE = 0.8;

const gameFull = () => {
    let gameStarted = false;
    let keyState = {}; // this object keeps track of the state of keys when they are held
    let mySide = "left"; // a string whether this client is left or right, It is set to Left by default unless receiving a rightSide event
    
    const initGameState = {
        leftPaddle: 50,
        rightPaddle: 50,
        ball: { x: 50, y: 50 },
        leftScore: 0,
        rightScore: 0,
    }
    const [gameState, setGameState] = useState(initGameState);
    // const gameState = initGameState;
    // DOM
    const { leftPaddle, rightPaddle, ball, leftScore, rightScore } = gameState;
    const ballRef = useRef();
    const leftPaddleRef = useRef();
    const rightPaddleRef = useRef();
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
    const [initsocket, setInitSocket] = useState(false);
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
    
    function HandleInput() {
      if (gameStarted === false) return;
          if (keyState.ArrowUp) {
            // console.log("UPDATE GAME: ARROWUP");
            socket.emit("updateGame", {
              PressedKeysObj: {
                direction: "up",
                side: mySide,
              },
              room,
            });
          } else if (keyState.ArrowDown) {
            // console.log("UPDATE GAME: ARROWDOWN");
            socket.emit("updateGame", {
              PressedKeysObj: {
                direction: "down",
                side: mySide,
              },
              room,
            });
          } 
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
            if (mySide !== "spectator") {
              socket.emit("updateGameStart", s);
              // window.requestAnimationFrame(update);
            }
          });
          socket.on("UA", (data) => {
            // setGameState((gameState)=>({
            //     ...gameState,
            //     // leftPaddle: data.lp,
            //     // rightPaddle: data.rp,
            //     ball: { x: data.x, y: data.y },
            //     // leftScore: data.l,
            //     // rightScore: data.r,

            // }));
            // HandleInput()
            ballRef.current.style.setProperty("--x", data.x);
            ballRef.current.style.setProperty("--y", data.y);
            // leftPaddleRef.current.style.setProperty("--y", data.lp);
            // rightPaddleRef.current.style.setProperty("--y", data.rp);
            // leftScoreRef.current.innerText = data.l;
            // rightScoreRef.current.innerText = data.r;
            window.requestAnimationFrame(HandleInput);
          }
          );
          setInitSocket(true);
        return () => {
            socket.emit("disconnect", room);
            socket.off("initGame");
            socket.off("rightSide");
            socket.off("startGame");
            setInitSocket(false);
            // socket.off("setLeftPaddlePosition");
            // socket.off("setRightPaddlePosition");
            // socket.off("updateRightScore");
            // socket.off("updateLeftScore");
            // socket.off("setBall");
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
        <div ref={leftScoreRef} id="left-score">{leftScore}</div>
        <div ref={rightScoreRef} id="right-score">{rightScore}</div>
      </div>
      <div ref={ballRef}className="ball" id="ball" ></div>
      <div ref={leftPaddleRef}className="paddle" id="left-paddle" ></div>
      <div ref={rightPaddleRef}className="paddle" id="right-paddle" ></div>
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