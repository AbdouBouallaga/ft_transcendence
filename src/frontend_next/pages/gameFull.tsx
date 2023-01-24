
import { Avatar, Badge, Button, Modal, Spinner, Tabs } from "flowbite-react";
import { useEffect, useRef, useState } from "react";


import io from "socket.io-client";
import game from "./game";

const PADDLE_MOVE_DISTANCE = 0.8;


const gameFull = (props) => {
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
    const winnerText = useRef();
    const [map, setMap] = useState<string[]>(['Normal', 'Pool', 'Retro', 'Space']);
    const [rounds, setRounds] = useState<number>(5);
    const [PlayersPics, setPlayersPics] = useState<string[]>([]);
    const [PlayersUNs, setPlayersUN] = useState<string[]>([]);
    const [winner, setWinner] = useState<number>();
    // const [mapsel, setMapsel] = useState<boolean[]>([true,false,false]);
    const [mapsel, setMapsel] = useState<number>(0);
    const [winnerModal, setWinnerModal] = useState<boolean>(false);

    let room;

    const [socket, setSocket] = useState<SocketIOClient.Socket>(null);
    const [init, setInit] = useState<boolean>(false);
    const [initsocket, setInitSocket] = useState(false);

    function test() {
      console.log("rounds ",rounds)
      console.log("map ",map[mapsel])
      console.log(socket.id);
      console.log(props.profile);
    }

    function joinGame() {
      room = roomId.current.value;
      console.log('joinGame ', room)
      if (room !== "") {
        socket.emit("joinGame", {
          room,
          rounds,
          map : map[mapsel],
          login : props.profile.login42,
          UN : props.profile.username,
          avatar : props.profile.avatar,
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
      if (winner !== undefined) {
        setWinnerModal(true);
      }
    }, [winner]);
    useEffect(() => {
        if (!socket) return;
        socket.on("initGame", (data) => {
          console.log("on initGame event: ", data);
          gameScreen.current.style.display = "block";
          // roomScreen.current.style.display = "none";
          waitingForGame.current.style.display = "none";
          // add count down
          let bgColor = "";
          let bgImage = "";
          setPlayersPics([data.avatars.left, data.avatars.right]);
          setPlayersUN([data.UNs.left, data.UNs.right]);
          if (data.map !==  'Normal') {
            if (data.map === 'Pool') {
              bgColor = "#168200";
              bgImage = "url('/static/pool.png')";
            }
            else if (data.map === 'Retro') {
              bgColor = "#4d3100";
              bgImage = "url('/static/retro.png')";
            }
            else if (data.map === 'Space') {
              bgColor = "#1a1a1a";
              bgImage = "url('/static/space.png')";
            }
            document.body.style.setProperty("--bg-color", bgColor);
            document.body.style.setProperty("--bg-image", bgImage);
          }
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

        socket.on("UB", (data) => { //update ball
          ballRef.current.style.setProperty("--x", data.x);
          ballRef.current.style.setProperty("--y", data.y);
          window.requestAnimationFrame(HandleInput);
        });

        socket.on("setLeftPaddlePosition", (newPos) => {
          leftPaddleRef.current.style.setProperty("--position", newPos);
        });
      
        socket.on("setRightPaddlePosition", (newPos) => {
          rightPaddleRef.current.style.setProperty("--position", newPos);
        });

        socket.on("connect", () => {
          console.log("Connected with id: ", socket.id);
        });

        socket.on("Won", (side) => {
          console.log("Won: ", side);
          setWinner(side);
        });

        // add event listeners for key presses
        document.addEventListener("keydown", (e) => {
            keyState[e.key] = true;
          });
        document.addEventListener("keyup", (e) => {
          keyState[e.key] = false;
        });
        setInitSocket(true);
        return () => {
            socket.emit("disconnect");
            // socket.emit("disconnect", {login : props.profile.login42});
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
      let m = false;
      useEffect(() => { // initialize game after the page is loaded then start the game
        if (!m){
            m = true;
            setSocket(io("/game"));
        }
      }
      , [init]);
  
  return(
  <>
    <div ref={gameScreen} className="no_thing" id="game-screen">
      <div className="score mx-2">
        <Avatar img={PlayersPics[0]} rounded={true}/>
        <div className="flex">
          <div ref={leftScoreRef} id="left-score">{leftScore}</div>
          <div ref={rightScoreRef} id="right-score">{rightScore}</div>
        </div>
        <Avatar img={PlayersPics[1]} rounded={true}/>
      </div>
      <div ref={ballRef}className="ball" id="ball" ></div>
      <div ref={leftPaddleRef}className="paddle" id="left-paddle" ></div>
      <div ref={rightPaddleRef}className="paddle" id="right-paddle" ></div>
    </div>
  <div className="flex flex-row items-center justify-center h-screen">
    <div ref={roomScreen} id="room-screen" className="aero p-6 flex-col rounded-lg shadow-lg">
    <h1 className="text-2xl font-bold">Rounds</h1>
    <div className="flex flex-row items-center justify-center bg-white rounded-lg">
    <Button onClick={()=>setRounds((prev)=>prev>5?prev-5:prev)}>-</Button>
    <h2 className="m-2">
      {rounds}
    </h2>
    <Button onClick={()=>setRounds((prev)=>prev<15?prev+5:prev)}>+</Button>
    </div>
    <h1 className="text-2xl font-bold mt-5">Map</h1>
    <div className="w-full flex flex-row  bg-white rounded-lg place-content-between">
    <Button onClick={()=>setMapsel((prev)=>prev>0?prev-1:prev)}>{"<"}</Button>
    <h2 className="m-2">{map[mapsel]}</h2>
    <Button onClick={()=>setMapsel((prev)=>prev<map.length-1?prev+1:prev)}>{">"}</Button>
    </div>
    {/* <Button className="btn btn-success" id="create-button" onClick={test}>
      Test
    </Button> */}
    <div className="flex flex-row items-center justify-center ">
      <div className="form-group">
        <input ref={roomId} type="text" placeholder="Enter Room" id="room-id" className="rounded-l"/>
      </div>
      <Button className="btn btn-success rounded-none rounded-r" id="join-button" onClick={joinGame}>
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
    <Modal
      size={"sm"}
      show={winnerModal}
      // show={true}
      >
      <Modal.Body>
        <div className="space-y-6">
          <div className="flex flex-col items-center justify-center">
            <h1 className="text-2xl font-bold">Winner</h1>
            <Avatar img={PlayersPics[winner]} rounded={true}/>
            <h1 className="text-2xl font-bold">{PlayersUNs[winner]}</h1>
            <h2 className="text-2xl font-bold">{winner === 0 ?
              leftScore +' - '+ rightScore : rightScore +' - '+ leftScore }
            </h2>
          </div>
        </div>
      </Modal.Body>
    </Modal>
  </div>
  </>)
}

export default gameFull