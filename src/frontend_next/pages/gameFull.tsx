
import { Badge, Button, Spinner, Tabs } from "flowbite-react";
import { useEffect, useRef, useState } from "react";


import io from "socket.io-client";
import game from "./game";

const PADDLE_MOVE_DISTANCE = 0.8;


const Tabsc: FC = () => {
  const [activeTab, setActiveTab] = useState(0);
  const tabsRef = useRef(null);
console.log("active tab ========",activeTab)
  return (
    <>
      <Tabs.Group
        aria-label="Default tabs"
        style="default"
        ref={tabsRef}
        onActiveTabChange={tab => setActiveTab(tab)}
      >
        <Tabs.Item active title="Profile">
          Profile content
        </Tabs.Item>
        <Tabs.Item title="Dashboard">Dashboard content</Tabs.Item>
        <Tabs.Item title="Settings">Settings content</Tabs.Item>
        <Tabs.Item title="Contacts">Contacts content</Tabs.Item>
      </Tabs.Group>
      <div>Active tab: {activeTab}</div>
      <Button.Group>
        <Button color="gray" onClick={() => setActiveTab(0)}>
          Profile
        </Button>
        <Button color="gray" onClick={() =>setActiveTab(1)}>
          Dashboard
        </Button>
        <Button color="gray" onClick={() => setActiveTab(2)}>
          Settings
        </Button>
        <Button color="gray" onClick={() => setActiveTab(3)}>
          Contacts
        </Button>
      </Button.Group>
    </>
  );
};

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
    const winner = useRef();
    const winnerText = useRef();
    const mapTabsRef = useRef<TabsRef>();
    const roundsTabsRef = useRef<TabsRef>();
    let room;
    const [rounds, setRounds] = useState(5);
    const [map, setMap] = useState(0);
    const [l, setL] = useState<number>(0);

    // function setRounds(e) {
    //   rounds = e.target.value;
    //   console.log("rounds", e);
    // }
    // function setMap(e) {
    //   map = e.target.value;
    //   console.log("map", e);
    // }

    function test() {
      // winnerText.current.style.color = "red";
      // winnerText.current.innerText = "You Won!";
      // gameScreen.current.classList.add("blur-sm");
      console.log(roundsTabsRef)
      console.log(mapTabsRef)
    }
    //socket events
    let socket = null;
    const [init, setInit] = useState(false);
    const [initsocket, setInitSocket] = useState(false);
    // old events

    function joinGame() {
      room = roomId.current.value;
      console.log('joinGame ', room)
      if (room !== "") {
        socket.emit("joinGame", {
          room,
          rounds,
          map
        });
        roomScreen.current.style.display = "none";
        waitingForGame.current.style.display = "block";
        roomIdspan.current.innerText = room;
      }
    }
    //game
    
    function HandleInput() {
      if (gameStarted === false || mySide === "spectator") return;
          if (keyState.ArrowUp) {
            console.log("UPDATE GAME: ARROWUP");
            socket.emit("updateGame", {
              PressedKeysObj: {
                direction: "up",
                side: mySide,
              },
              room,
            });
          } else if (keyState.ArrowDown) {
            console.log("UPDATE GAME: ARROWDOWN");
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
          socket.on("updateRightScore", (rightScore) => {
            rightScoreRef.current.innerText = rightScore;
          });
        
          socket.on("updateLeftScore", (leftScore) => {
            leftScoreRef.current.innerText = leftScore;
          });
          socket.on("UA", (data) => {
            // setGameState((gameState)=>({
            //     ...gameState,
            //     // leftPaddle: data.lp,
            //     // rightPaddle: data.rp,
            //     ball: { x: data.x, y: data.y },
            // }));
            // HandleInput()
            ballRef.current.style.setProperty("--x", data.x);
            ballRef.current.style.setProperty("--y", data.y);
            leftPaddleRef.current.style.setProperty("--position", data.lp);
            rightPaddleRef.current.style.setProperty("--position", data.rp);
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
    , [init]);
  
  return(
  <>
    <div ref={gameScreen} className="no_thing" id="game-screen">
      <div className="score">
        <div ref={leftScoreRef} id="left-score">{leftScore}</div>
        <div ref={rightScoreRef} id="right-score">{rightScore}</div>
      </div>
      <div ref={ballRef}className="ball" id="ball" ></div>
      <div ref={leftPaddleRef}className="paddle" id="left-paddle" ></div>
      <div ref={rightPaddleRef}className="paddle" id="right-paddle" ></div>
    </div>
    <div ref={winner} className="aero p-1 m-auto flex-col rounded-md justify-center w-40 items-center" id="winner" style={{display: "none"}}>
      <h1 ref={winnerText} id="winner-text"></h1>
      <Button  className="btn btn-success" id="restart-button" onClick={test}>
        Play Again
      </Button>
    </div>
  <div className="flex flex-row items-center justify-center h-screen">
    <div ref={roomScreen} id="room-screen" className="aero p-6 flex-col rounded-lg shadow-lg">
    <h1 className="text-2xl font-bold">Rounds</h1>
    <div className="flex flex-row items-center justify-center bg-white rounded-lg">
    <Button onClick={()=>setRounds((prev)=>prev-1)}>-</Button>
    <h2 className="m-2">
      {rounds}
    </h2>
    <Button onClick={()=>setRounds((prev)=>prev+1)}>+</Button>
    </div>
    <h1 className="text-2xl font-bold">Map</h1>
    <Button.Group>
      <Button title="Normal">Normal</Button>
      <Button title="Retro">Retro</Button>
      <Button title="Cyberpunk">Cyberpunk</Button>
    </Button.Group>
    <div className="flex flex-row items-center justify-center">
      <div className="form-group">
        <input ref={roomId} type="text" placeholder="Enter Room" id="room-id" className="rounded-l"/>
      </div>
      <Button ref={joinGameBtn} className="btn btn-success rounded-none rounded-r" id="join-button">
        Join Game
      </Button>
    </div>
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