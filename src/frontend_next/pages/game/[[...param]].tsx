import { Avatar, Badge, Button, Modal, Spinner, Tabs } from "flowbite-react";
import { LegacyRef, SetStateAction, useContext, useEffect, useRef, useState } from "react";
import { useRouter } from "next/router";
import loading from "../../components/icons/loader.json";

import io from "socket.io-client";
import Lottie from "lottie-react";
import axios from "axios";

const PADDLE_MOVE_DISTANCE = 0.8;

const Game = (props: any) => {
  const router = useRouter();
  // const { id } = router.query
  useEffect(() => {
    const fetchData = async () => {
      axios
        .get("/api/users/me/fullprofile")
        .then((response:any) => {
        })
        .catch((e:any) => {
          router.replace("/");
        });
    };
    fetchData();
  }, []);
  let gameStarted = false;
  let keyState: any = {}; // this object keeps track of the state of keys when they are held
  let mySide = "left"; // a string whether this client is left or right, It is set to Left by default unless receiving a rightSide event

  const [leftScore, setLeftScore] = useState<number>(0);
  const [rightScore, setRightScore] = useState<number>(0);
  const ballRef = useRef<any>(null);
  const leftPaddleRef = useRef<any>(null);
  const rightPaddleRef = useRef<any>(null);
  const gameScreen = useRef<any>(null);
  const roomScreen = useRef<any>(null);
  const leftScoreRef = useRef<any>(null);
  const rightScoreRef = useRef<any>(null);
  const waitingForGame = useRef<any>(null);
  const roomId = useRef<any>(null);
  const map: string[] = ["Normal", "Pool", "Retro", "Space"];
  let [rounds, setRounds] = useState<number>(5);
  const [PlayersPics, setPlayersPics] = useState<string[]>([]);
  const [PlayersUNs, setPlayersUN] = useState<string[]>([]);
  const [winner, setWinner] = useState<number>(5);
  const [mapsel, setMapsel] = useState<number>(0);
  let mapSel = 0;
  const [winnerModal, setWinnerModal] = useState<boolean>(false);
  const [roomFallback, setRoom] = useState<string>("");
  const [mySideFallback, setMyside] = useState<string>("");
  const [playerFallback, setPlayer] = useState<number>(100);
  let room = "";

  const [socket, setSocket] = useState<any>(null);

  const [init, setInit] = useState<boolean>(false);

  function joinGame(r = 0, l: number = mapsel, rds = rounds) {
    //// HERE IS THE PROBLEM
    if (roomId.current?.value !== "") room = roomId.current.value;

    socket.emit("joinGame", {
      room: room === "" ? roomFallback : room, //was roomFallback
      rounds: rds, // rounds
      map: map[l],
      login: props.profile.login42,
      UN: props.profile.username,
      avatar: props.profile.avatar,
      player: playerFallback,
    });
    roomScreen.current.style.display = "none";
    waitingForGame.current.style.display = "block";
  }
  //game

  function HandleInput() {
    if (gameStarted === false || mySide === "spectator") return;
    if (keyState.ArrowUp) {
      socket.emit("updateGame", {
        PressedKeysObj: {
          direction: "up",
          side: mySide,
        },
        room,
      });
    } else if (keyState.ArrowDown) {
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
    socket.on("initGame", (data: any) => {
      socket.off("initGame");

      gameScreen.current.style.display = "block";
      waitingForGame.current.style.display = "none";
      // add count down
      let bgColor = "";
      let bgImage = "";
      room = data.room;
      setRoom(data.room);
      setPlayersPics([data.avatars.left, data.avatars.right]);
      setPlayersUN([data.UNs.left, data.UNs.right]);
      if (data.map !== "Normal") {
        if (data.map === "Pool") {
          bgColor = "#168200";
          bgImage = "url('/public/Game_bg/pool.png')";
        } else if (data.map === "Retro") {
          bgColor = "#4d3100";
          bgImage = "url('/public/Game_bg/retro.png')";
        } else if (data.map === "Space") {
          bgColor = "#1a1a1a";
          bgImage = "url('/public/Game_bg/space.png')";
        }
        document.body.style.setProperty("--bg-color", bgColor);
        document.body.style.setProperty("--bg-image", bgImage);
      }
      document.body.style.overflow = "hidden";
    });
    socket.on("setRoomId", (data: string) => {
      room = data;
    });
    socket.on("leftSide", () => {
      mySide = "left";
      setPlayer(0);
    });
    socket.on("rightSide", () => {
      mySide = "right";
      setPlayer(1);
    });

    socket.on("spectatorSide", () => {
      mySide = "spectator";
      setMyside("spectator");
    });

    socket.on("startGame", (s: string) => {
      if (mySide === "left" && !gameStarted) {
        socket.emit("updateGameStart", s);
      }
      gameStarted = true;
      waitingForGame.current.style.display = "none";
      setLeftScore(0);
      setRightScore(0);
      document.getElementById("Navbar")?.style.setProperty("--opacity", "0");
    });

    socket.on("updateRightScore", (rightS: any) => {
      setRightScore(rightS);
    });

    socket.on("updateLeftScore", (leftS: any) => {
      setLeftScore(leftS);
    });

    socket.on("UB", (data: any) => {
      //update ball HERE
      if (ballRef.current) {
        ballRef.current.style.setProperty("--x", data.x);
        ballRef.current.style.setProperty("--y", data.y);
        window.requestAnimationFrame(HandleInput);
      }
    });

    socket.on("setLeftPaddlePosition", (newPos: number) => {
      leftPaddleRef.current.style.setProperty("--position", newPos);
    });

    socket.on("setRightPaddlePosition", (newPos: number) => {
      rightPaddleRef.current.style.setProperty("--position", newPos);
    });

    socket.on("connect", () => {});

    socket.on("Won", (side: number) => {
      if (gameStarted) {
        setWinner(side);
        setWinnerModal(true);

        if (
          (side === 0 && mySide === "left") ||
          (side === 1 && mySide === "right")
        )
          socket.emit("saveScoreToDB", room);
      } else {
        joinGame();
      }
      gameStarted = false;
      // socket.close();
    });

    // add event listeners for key presses
    document.addEventListener("keydown", (e) => {
      keyState[e.key] = true;
    });
    document.addEventListener("keyup", (e) => {
      keyState[e.key] = false;
    });

    if (router.query.param) {
      if (router.query.param[0]) room = router.query.param[0];
      if (router.query.param[1]) mapSel = parseInt(router.query.param[1]);
      else mapSel = mapsel;
      if (router.query.param[2]) setRounds(parseInt(router.query.param[2]));

      joinGame(0, mapSel, rounds);
    }
    return () => {
      socket.off("Won");

      document.body.style.setProperty(
        "--bg-color",
        document.body.style.getPropertyValue("--Default-color")
      );
      document.body.style.setProperty("--bg-image", "");
      document.getElementById("Navbar")?.style.setProperty("--opacity", "1");
      document.body.style.overflow = "";
      document.removeEventListener("keydown", (e) => {});
      document.removeEventListener("keyup", (e) => {});
      props.gameSocket.emit("setUserStatus", {
        login42: props.profile.username,
        status: 1,
      });
      socket.close();
    };
  }, [socket]);

  let m = false;
  useEffect(() => {
    // initialize game after the page is loaded then start the game
    if (!m) {
      props.gameSocket.emit("setUserStatus", {
        login42: props.profile.username,
        status: 2,
      });
      m = true;
      setSocket(io("/game"));
    }
  }, [init]);

  return (
    <>
      <div ref={gameScreen} className="no_thing" id="game-screen">
        <div className="score mx-2">
          <Avatar img={PlayersPics[0]} rounded={true} />
          <div className="flex">
            <div ref={leftScoreRef} id="left-score">
              {leftScore}
            </div>
            <div ref={rightScoreRef} id="right-score">
              {rightScore}
            </div>
          </div>
          <Avatar img={PlayersPics[1]} rounded={true} />
        </div>
        <div ref={ballRef} className="ball" id="ball"></div>
        <div ref={leftPaddleRef} className="paddle" id="left-paddle"></div>
        <div ref={rightPaddleRef} className="paddle" id="right-paddle"></div>
      </div>
      <div className="flex flex-row items-center justify-center h-auto m-[5vh]">
        <div
          ref={roomScreen}
          id="room-screen"
          className="aero p-6 flex-col rounded-lg shadow-lg w-[300px]"
        >
          <h1 className="text-2xl font-bold">Rounds</h1>
          <div className="flex flex-row items-center justify-center bg-white rounded-lg">
            <Button
              onClick={() => setRounds((prev) => (prev > 5 ? prev - 5 : prev))}
            >
              -
            </Button>
            <h2 className="m-2">{rounds}</h2>
            <Button
              onClick={() => setRounds((prev) => (prev < 15 ? prev + 5 : prev))}
            >
              +
            </Button>
          </div>
          <h1 className="text-2xl font-bold mt-5">Map</h1>
          <div className="w-full flex flex-row  bg-white rounded-lg place-content-between">
            <Button
              onClick={() => setMapsel((prev) => (prev > 0 ? prev - 1 : prev))}
            >
              {"<"}
            </Button>
            <h2 className="m-2">{map[mapsel]}</h2>
            <Button
              onClick={() =>
                setMapsel((prev) => (prev < map.length - 1 ? prev + 1 : prev))
              }
            >
              {">"}
            </Button>
          </div>
          <div className="flex flex-row items-center justify-center ">
            <div className="hidden form-group">
              <input
                ref={roomId}
                type="text"
                placeholder="Enter Room"
                id="room-id"
                className="rounded-l"
              />
            </div>
            <Button
              className="btn text-2xl font-bold btn-success rounded-lg mt-6"
              id="join-button"
              onClick={() => {
                joinGame();
              }}
            >
              Start matching
            </Button>
          </div>
        </div>
        <div
          ref={waitingForGame}
          className="aero content-center p-6 rounded-lg shadow-lg bg-gray-50"
          style={{ display: "none" }}
        >
          <div className="text-center">
            <h1 className="font-bold">Waiting for your opponent...</h1>
            <p>Move paddle: key up and down </p>
            {/* <p>Share this room ID with your friend: <span ref={roomIdspan}></span></p> */}
            <div className="w-[100px] m-auto">
              <Lottie animationData={loading} />
            </div>
          </div>
        </div>
        <Modal size={"sm"} show={winnerModal}>
          <Modal.Body>
            <div className="space-y-6">
              <div className="flex flex-col items-center justify-center">
                <h1 className="text-2xl font-bold">Winner</h1>
                <Avatar img={PlayersPics[winner]} rounded={true} />
                <h1 className="text-2xl font-bold">{PlayersUNs[winner]}</h1>
                <h2 className="text-2xl font-bold">
                  {winner === 0
                    ? leftScore + " - " + rightScore
                    : rightScore + " - " + leftScore}
                </h2>
              </div>
            </div>
          </Modal.Body>
          <Modal.Footer>
            <div className="flex flex-row w-full place-content-between">
              {mySideFallback !== "spectator" && (
                <>
                  <Button
                    onClick={() => {
                      setWinnerModal(false);
                      joinGame();
                    }}
                  >
                    Re-match !
                  </Button>
                  <Button
                    onClick={() => {
                      router.reload();
                    }}
                  >
                    Play again !
                  </Button>
                </>
              )}
              <Button
                color="gray"
                onClick={() => {
                  router.push("/");
                }}
              >
                Quit
              </Button>
            </div>
          </Modal.Footer>
        </Modal>
      </div>
    </>
  );
};

export default Game;
