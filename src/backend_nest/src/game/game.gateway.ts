
import { OnModuleInit } from "@nestjs/common";
import { MessageBody, SubscribeMessage, WebSocketGateway, WebSocketServer } from "@nestjs/websockets";
import { hasSubscribers } from "diagnostics_channel";
import { Server } from "socket.io";
import { Interval } from "@nestjs/schedule";
import {v4 as uuidv4 } from 'uuid';
let rooms = {};
let lastuuid:string = "";

let player;
//ball file
const INITIAL_SPEED = 0.05;
const INCREASE_SPEED = 0.000001;

class Ball {
  io: any;
  room: any;
  x: number;
  y: number;
  lockX: number;
  lockY: number;
  direction: any;
  speed: any;
  constructor(io, room) {
    this.io = io;
    this.room = room;
    this.resetPosition();
    this.x = 50;
    this.y = 50;
    this.lockX = 0;
    this.lockY = 0;
  }

  updatePosition(delta, paddles) {
    this.x += this.direction.x * this.speed * delta;
    this.y += this.direction.y * this.speed * delta;
    // emit the setBall event to client to change the x and y of the ball
    // this.io.to(this.room).emit("setBall", { x: this.x, y: this.y });
    this.speed += INCREASE_SPEED * delta;
    // if the ball has crossed upper or lower boundaries
    // y <= 1.25 means it reached the top (1.25 is the ballHeight/2), 98.75(100-1.25)
    if (this.y <= 2.25 || this.y >= 97.75) {
      this.direction.y *= -1;
    }
    // if one of the paddles satisfy the collision test then bounce the ball (by x = -x)
    if (paddles.some((paddle) => this.isCollided(paddle))) {
      this.direction.x *= -1;
    }
  }

  resetPosition() {
    this.x = 50;
    this.y = 50;
    // this.io.to(this.room).emit("setBall", { x: this.x, y: this.y });
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

  //paddle rect in %:
  //leftPaddle.right = 2.25 [paddleWidth (1) + BallWidth/2 (1.25)]
  //leftPaddle.left = 1.75
  //leftPaddle.top = 41.25 [paddlePosition - PaddleHeight/2 (7.5) - BallHeight (1.25)]
  //leftPaddle.bot = 58.75 [paddlePosition + PaddleHeight/2 (7.5) + BallHeight (1.25)]

  //paddle rect in %:
  //rightPaddle.right = 100 - 4.25
  //rightPaddle.left = 100 - 4.75
  //rightPaddle.top = 41.25 [paddlePosition - PaddleHeight/2 (7.5) - BallHeight (1.25)]
  //rightPaddle.bot = 58.75 [paddlePosition + PaddleHeight/2 (7.5) + BallHeight (1.25)]

  isCollided(paddle) {
    if (paddle.side === "Left") {
      return (
        this.x <= 2.25 &&
        this.x >= 1.75 &&
        this.y >= paddle.position - 7.5 &&
        this.y <= paddle.position + 7.5
      );
    } else if (paddle.side === "Right") {
      return (
        this.x >= 100 - 2.25 &&
        this.x <= 100 - 1.75 &&
        this.y >= paddle.position - 7.5 &&
        this.y <= paddle.position + 7.5
      );
    }
  }
};

function genRandomBetween(min, max) {
  return Math.random() * (max - min) + min;
}

//paddle file

class Paddle {
  io: any;
  room: any;
  side: any;
  position: number;
  constructor(io, room, side) {
    this.io = io;
    this.room = room;
    this.side = side;
    this.position = 50;
  }

  setPaddlePosition() {
    this.io.to(this.room).emit(`set${this.side}PaddlePosition`, this.position);
  }

  resetPosition() {
    this.position = 50;
    this.setPaddlePosition();
  }
};

//game file
const PADDLE_MOVE_DISTANCE = 1.6; // speed in which our paddle moves, increase this for faster move

class Game {
  ball: any;
  room: any;
  leftPaddle: any;
  rightPaddle: any;
  leftScore: number;
  rightScore: number;
  PressedKeysObjGeneral: any;
  maxScore: number;
  speed: number;
  constructor(players, ball, room) {
    this.ball = ball;
    this.room = room;
    this.leftPaddle = players[0].paddle;
    this.rightPaddle = players[1].paddle;
    this.leftScore = 0;
    this.rightScore = 0;
    this.PressedKeysObjGeneral = {};
  }
  // this will be called upon updateGame
  update(io, delta, PressedKeysObj) {
    const paddles = [this.leftPaddle, this.rightPaddle];
    this.ball.updatePosition(delta, paddles);
    if (PressedKeysObj) {
      this.handleMoves(PressedKeysObj);
    }
    if (this.isRoundFinished()) {
      this.startNewRound();
    }
    io.to(this.room).emit("UB", { //UB = updateBall
      x: this.ball.x,
      y: this.ball.y,
      // lp: this.leftPaddle.position,
      // rp: this.rightPaddle.position,
    });
    this.PressedKeysObjGeneral = null;
  }

  handleMoves(obj) {
    if (obj.direction === "up") {
      this.moveUp(obj.side);
    }
    if (obj.direction === "down") {
      this.moveDown(obj.side);
    }
  }

  moveUp(paddleSide) {
    // 7.5 = PaddleHeight / 2
    if (this[paddleSide + "Paddle"].position > 7.5) {
      this[paddleSide + "Paddle"].position -= PADDLE_MOVE_DISTANCE;
      this[paddleSide + "Paddle"].setPaddlePosition();
    }
  }

  moveDown(paddleSide) {
    // (92.5 = 100% - paddleHeight / 2)
    if (this[paddleSide + "Paddle"].position < 92.5) {
      this[paddleSide + "Paddle"].position += PADDLE_MOVE_DISTANCE;
      this[paddleSide + "Paddle"].setPaddlePosition();
    }
  }

  /* the startNewRound() resets the ball and the paddles */

  startNewRound() {
    if (this.ball.x <= 0) {
      this.rightScore++;
      this.ball.io.to(this.room).emit("updateRightScore", this.rightScore);
    } else if (this.ball.x >= 100) {
      this.leftScore++;
      this.ball.io.to(this.room).emit("updateLeftScore", this.leftScore);
    }
    this.ball.resetPosition();
    this.leftPaddle.resetPosition();
    this.rightPaddle.resetPosition();
    if (this.leftScore === rooms[this.room].rounds || this.rightScore === rooms[this.room].rounds) {
      this.gameFinished();
    }
  }

  /* the isRoundFinished() helper function determines if the ball has gone sideways */

  isRoundFinished() {
    return this.ball.x <= 0 || this.ball.x >= 100;
  }

  gameFinished() {
    clearInterval(rooms[this.room].Interval);
    this.ball.io.to(this.room).emit("Won", this.leftScore > this.rightScore ? 0 : 1);
    setTimeout(() => { 
      delete rooms[this.room];
      console.log("gameFinished: room ", this.room, " deleted");
    }, 1500);
  }
};
//end 

function requestedUpdate(io, room, delta) {
  rooms[room].Interval = setInterval(() => {
    if (room in rooms !== false) {
      rooms[room].game.update(io, delta, rooms[room].game.PressedKeysObjGeneral);
    }
  }, delta);

}

@WebSocketGateway({ namespace: 'game' })
// @WebSocketGateway()
export class GameGateway implements OnModuleInit {
  @WebSocketServer()
  server: Server;

  onModuleInit() {
    this.server.on('connection', (socket) => {
      console.log(socket.id);
      try {
        socket.on("joinGame", (data) => {
          let room: string = data.room;
          let rounds: number = data.rounds;
          let map: string = data.map;
          let login: string = data.login;
          // let login : string = socket.id;
          console.log("user ", login, ",join room ", room);
          if (!room) {
            console.log("join without room");
            if (lastuuid === "") {
              console.log("new room uuid")
              lastuuid = uuidv4();
              room = lastuuid;
              console.log("lastuuid", lastuuid);
            }
            else {
              room = lastuuid;
              lastuuid = "";
            }
            console.log(">>> room", room);
          };
          // if there is no room with that name in rooms, create one and initialize it by setting the first player and then make it join the room
          if (room in rooms === false) {
            player = "1";
            socket.join(room);
            rooms[room] = {
              ready: 0,
              map: map,
              rounds: rounds,
              numOfPlayers: 1,
              players: [
                {
                  id: login,
                  socketId: socket.id,
                  avatar: data.avatar,
                  UN: data.UN,
                  paddle: new Paddle(this.server, room, "Left"),
                },
              ],
              spectators: [],
            };
            console.log("1st player");
          } else {
            // if there is only 1 player, add the second player and make it join the room
            if (
              rooms[room].numOfPlayers === 1 &&
              login !== rooms[room].players[0].id
            ) {
              player = "2";
              socket.join(room);
              rooms[room].players.push({
                id: login,
                socketId: socket.id,
                avatar: data.avatar,
                UN: data.UN,
                paddle: new Paddle(this.server, room, "Right"),
              });
              rooms[room].ball = new Ball(this.server, room);
              socket.emit("rightSide");
              rooms[room].game = new Game(
                rooms[room].players,
                rooms[room].ball,
                room
              );
              rooms[room].numOfPlayers = 2;
              console.log("2nd player, game initiated: ");
              // console.log(rooms[room].game);
              this.server.to(room).emit("initGame", {
                room: room,
                map: rooms[room].map,
                rounds: rooms[room].rounds,
                avatars: {
                  left: rooms[room].players[0].avatar,
                  right: rooms[room].players[1].avatar
                },
                UNs: {
                  left: rooms[room].players[0].UN,
                  right: rooms[room].players[1].UN
                }
              });
              this.server.to(room).emit("startGame", room);
            } else if (
              login !== rooms[room]?.players[0]?.id &&
              login !== rooms[room]?.players[1]?.id
            ) {
              // if 2 players are already in room add next joiner as spectator
              socket.join(room);
              rooms[room].spectators.push(login);
              socket.emit("spectatorSide");
              this.server.to(room).emit("initGame", {
                room: room,
                map: rooms[room].map,
                rounds: rooms[room].rounds,
                avatars: {
                  left: rooms[room].players[0].avatar,
                  right: rooms[room].players[1].avatar
                },
                UNs: {
                  left: rooms[room].players[0].UN,
                  right: rooms[room].players[1].UN
                }
              });
              this.server.to(room).emit("startGame", room);
            }
          }
        });
        socket.on("updateGame", ({ PressedKeysObj, room }) => {
            rooms[room].game.PressedKeysObjGeneral = PressedKeysObj;
        });
        socket.on("updateGameStart", (room) => {
          if (room in rooms) {
            rooms[room].ready += 1;
            if (rooms[room].ready === 2) {
              requestedUpdate(this.server, room, 1000 / 75);
            }
          }
        });
        socket.on("disconnecte", () => {
          // let login : string = socket.id;
          // let login : string = data.login;
          console.log(socket.id, "disconnected");
          for (let room in rooms) {
            if (rooms[room]?.spectators?.includes(socket.id)) {
              rooms[room].spectators.splice(
                rooms[room].spectators.indexOf(socket.id),
                1
              );
            }
            else if (rooms[room].players[0]?.socketId === socket.id) {
              clearInterval(rooms[room].Interval);
              this.server.to(room).emit("Won", 1);
              rooms[room].players[0] = null;
              setTimeout(() => { 
                delete rooms[room];
                console.log("room ", room, " deleted");
              }, 1500);
            }
            else if (rooms[room].players[1]?.socketId === socket.id) {
              clearInterval(rooms[room].Interval);
              this.server.to(room).emit("Won", 0);
              rooms[room].players[1] = null;
              setTimeout(() => { 
                delete rooms[room];
                console.log("room ", room, " deleted");
              }, 1500);
            }
          }
        });
      } catch (err) {
        console.log("ERROR CAUGHT: ", err);
      }
    });
  }


  @SubscribeMessage('message')
  onNewMessage(@MessageBody() body: any) {
    console.log(body);
  }
}
