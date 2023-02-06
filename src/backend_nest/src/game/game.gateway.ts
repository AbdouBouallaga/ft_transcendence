import { Injectable, OnModuleInit } from '@nestjs/common';
import {
  MessageBody,
  SubscribeMessage,
  WebSocketGateway,
  WebSocketServer,
} from '@nestjs/websockets';
import { hasSubscribers } from 'diagnostics_channel';
import { Server } from 'socket.io';
import { Interval } from '@nestjs/schedule';
import { v4 as uuidv4 } from 'uuid';
import { GameService } from './game.service';
import { last } from 'rxjs';

let rooms = [];
let lastuuid: any = [];

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
    if (paddle.side === 'Left') {
      return (
        this.x <= 2.25 &&
        this.x >= 1.75 &&
        this.y >= paddle.position - 7.5 &&
        this.y <= paddle.position + 7.5
      );
    } else if (paddle.side === 'Right') {
      return (
        this.x >= 100 - 2.25 &&
        this.x <= 100 - 1.75 &&
        this.y >= paddle.position - 7.5 &&
        this.y <= paddle.position + 7.5
      );
    }
  }
}

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
}

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
    io.to(this.room).emit('UB', {
      //UB = updateBall
      x: this.ball.x,
      y: this.ball.y,
      // lp: this.leftPaddle.position,
      // rp: this.rightPaddle.position,
    });
    this.PressedKeysObjGeneral = null;
  }

  handleMoves(obj) {
    if (obj.direction === 'up') {
      this.moveUp(obj.side);
    }
    if (obj.direction === 'down') {
      this.moveDown(obj.side);
    }
  }

  moveUp(paddleSide) {
    // 7.5 = PaddleHeight / 2
    if (this[paddleSide + 'Paddle'].position > 7.5) {
      this[paddleSide + 'Paddle'].position -= PADDLE_MOVE_DISTANCE;
      this[paddleSide + 'Paddle'].setPaddlePosition();
    }
  }

  moveDown(paddleSide) {
    // (92.5 = 100% - paddleHeight / 2)
    if (this[paddleSide + 'Paddle'].position < 92.5) {
      this[paddleSide + 'Paddle'].position += PADDLE_MOVE_DISTANCE;
      this[paddleSide + 'Paddle'].setPaddlePosition();
    }
  }

  /* the startNewRound() resets the ball and the paddles */

  startNewRound() {
    if (this.ball.x <= 0) {
      this.rightScore++;
      this.ball.io.to(this.room).emit('updateRightScore', this.rightScore);
    } else if (this.ball.x >= 100) {
      this.leftScore++;
      this.ball.io.to(this.room).emit('updateLeftScore', this.leftScore);
    }
    this.ball.resetPosition();
    this.leftPaddle.resetPosition();
    this.rightPaddle.resetPosition();
    if (
      this.leftScore === rooms[this.room].rounds ||
      this.rightScore === rooms[this.room].rounds
    ) {
      this.gameFinished();
    }
  }

  /* the isRoundFinished() helper function determines if the ball has gone sideways */

  isRoundFinished() {
    return this.ball.x <= 0 || this.ball.x >= 100;
  }

  gameFinished(winner: number = 100) {
    // console.log('game finished');
    if (winner !== 100) {
      if (winner === 0) {
        this.leftScore = 1337;
        this.rightScore = 0;
      } else {
        this.leftScore = 0;
        this.rightScore = 1337;
      }
    }
    // // console.log('STOP room', this.room,'interval ID: ', rooms[this.room].Interval);
    clearInterval(rooms[this.room].Interval);
    this.ball.io
      .to(this.room)
      .emit('Won', this.leftScore > this.rightScore ? 0 : 1);
    setTimeout(() => {
      clearInterval(rooms[this.room]?.Interval);
      delete rooms[this.room];
      // console.log('room ', this.room, ' deleted');
    }, 300);
    console.log("rooms fg", rooms)

  }

}
//end

function requestedUpdate(io, room, delta) {
  rooms[room].Interval = setInterval(() => {
    // // console.log('update');
    if (room in rooms !== false && rooms[room].game !== null) {
      rooms[room]?.game.update(
        io,
        delta,
        rooms[room].game.PressedKeysObjGeneral,
      );
    }
  }, delta);
  // // console.log('room', room,'set interval ID: ', rooms[room].Interval);
}
let users: any = {};
@Injectable()
@WebSocketGateway({ namespace: 'game' })
export class GameGateway implements OnModuleInit {
  constructor(private readonly gameService: GameService) { }

  @WebSocketServer()
  server: Server;
  // private users: {login42:string, socketId:string, status:number}[] = [];

  onModuleInit() {
    this.server.on('connection', (socket) => {
      // console.log(socket.id);
      try {
        // USERS STATUS MANAGEMENT
        socket.on('initUser', (data) => {
          users[data] = { login42: data, socketId: socket.id, status: 1, life: 20 };
          users[data].life = 20;
          console.log('initUser', users[data]);
          this.server.emit("updateUserStatus", users);
          let interval = setInterval(() => {
            console.log('initUser', users[data]);
            if (users[data].life > 0) {
              users[data].life--;
            } else {
              clearInterval(interval);
              users[data].status = 0;
              this.server.emit("updateUserStatus", users);
            }
          }, 60000);
        });
        // console.log("status on init", users);
        socket.on("setUserStatus", (data: any) => {
          if (data.login42 in users) {
            users[data.login42].status = data.status;
            users[data.login42].life = 20;
            // console.log("status", users);
            this.server.emit("updateUserStatus", users);
          }
        });
        socket.on("getUsersStatus", () => {
          socket.emit("updateUserStatus", users);
        });
        ///////////////////////////
        socket.on("sendInviteToPlay", (data: any) => {
          console.log(data);
          let from: string = data.from;
          let to: string = data.to;
          let onRoom: string = data.Room;
          console.log("sendInviteToPlay", from, to, onRoom);
          console.log("sendInviteToPlay", users);
          if (users[to])
            this.server.to(users[to].socketId).emit("inviteToPlay", data);
        });
        socket.on('joinGame', (data) => {
          console.log(rooms);
          let found = false;
          let room: string = data.room;
          let rounds: number = data.rounds;
          let map: string = data.map;
          let login: string = data.login;
          let player: number = data.player;
          // let login : string = socket.id;
          // console.log('user ', login, ',join room ', room);
          if (room === '') {
            // console.log('join without room');
            // console.log('lastuuid', lastuuid);
            // console.log('lastuuid length', lastuuid.length);

            if (lastuuid.length) {
              for (let i = 0; i < lastuuid.length; i++) {
                if (lastuuid[i].map === map && lastuuid[i].rounds === rounds) {
                  // console.log('match found');
                  found = true;
                  room = lastuuid[i].id;
                  lastuuid.splice(i, 1);
                  break;
                }
              }
            }
            if (!found) {
              // console.log('new room uuid');
              lastuuid.push({
                id: uuidv4(),
                map: map,
                rounds: rounds,
              });
              // console.log('lastuuid', lastuuid);
              // console.log('lastuuid length', lastuuid.length);
              room = lastuuid[lastuuid.length - 1].id;
              // console.log('lastuuid', lastuuid.length);
            }
            // else {
            //   room = lastuuid[lastuuid.length-1].id;
            //   lastuuid[lastuuid.length - 1].delete();
            // }
            // console.log('>>> room', room);
          }
          // if there is no room with that name in rooms, create one and initialize it
          if (room in rooms === false) {
            socket.join(room);
            rooms[room] = {
              id: room,
              ready: 0,
              map: map,
              rounds: rounds,
              numOfPlayers: 0,
              players: [],
              spectators: [],
            };
            // console.log('init room ', room);
          }
          // else {
          // if there is no player id specified, join as player
          if (player === 100) {
            // console.log("player not specified: ");
            player = rooms[room].numOfPlayers;
          }
          if (rooms[room].numOfPlayers !== 2) {
            // console.log("player ", player, " joining room ", room, " as player");
            socket.join(room);
            rooms[room].players[player] = ({
              id: login,
              socketId: socket.id,
              avatar: data.avatar,
              UN: data.UN,
              paddle: new Paddle(this.server, room, player === 0 ? 'Left' : 'Right'),
            });
            console.log("DEBUG ", rooms[room].players[player].id);
            if (player === 0)
              socket.emit('leftSide');
            else
              socket.emit('rightSide');
            socket.emit('setRoomId', room);
            rooms[room].numOfPlayers += 1;
            rooms[room].ready += 1;
            // console.log("player,", rooms[room].players[player].id, " joined");
            if (rooms[room].ready === 2) {
              // console.log('room ', room, ' is ready');
              rooms[room].ball = new Ball(this.server, room);
              rooms[room].game = new Game(
                rooms[room].players,
                rooms[room].ball,
                room,
              );
              setTimeout(() => {
                if (room in rooms) {
                  this.server.to(room).emit('initGame', {
                    room: room,
                    map: rooms[room].map,
                    rounds: rooms[room].rounds,
                    avatars: {
                      left: rooms[room].players[0].avatar,
                      right: rooms[room].players[1].avatar,
                    },
                    UNs: {
                      left: rooms[room].players[0].UN,
                      right: rooms[room].players[1].UN,
                    },
                  });
                  this.server.to(room).emit('startGame', room);
                }
              }, 1500);

            }
          } else {
            // if 2 players are already in room add next joiner as spectator
            socket.join(room);
            rooms[room].spectators.push(login);
            socket.emit('spectatorSide');
            this.server.to(room).emit('initGame', {
              room: room,
              map: rooms[room].map,
              rounds: rooms[room].rounds,
              avatars: {
                left: rooms[room].players[0]?.avatar,
                right: rooms[room].players[1]?.avatar,
              },
              UNs: {
                left: rooms[room].players[0].UN,
                right: rooms[room].players[1].UN,
              },
            });
            this.server.to(room).emit('startGame', room);
          }
          // }
        });
        socket.on('updateGame', ({ PressedKeysObj, room }) => {
          if (room in rooms)
            rooms[room].game.PressedKeysObjGeneral = PressedKeysObj;
        });
        socket.on('updateGameStart', (room) => {
          if (room in rooms) {
            // if (rooms[room].ready === 2) {
            requestedUpdate(this.server, room, 1000 / 90);
            // }
          }
        });
        socket.on('saveScoreToDB', (room) => {
          this.gameService.recordGameResults({
            login42_1: rooms[room]?.players[0].id,
            login42_2: rooms[room]?.players[1].id,
            score1: rooms[room]?.game.leftScore,
            score2: rooms[room]?.game.rightScore,
          });
        });
        socket.on('disconnect', () => {
          let sid = socket.id;
          // console.log(socket.id, 'disconnected');
          // // console.log("rooms >", rooms)
          for (let r in rooms) {
            if (rooms[r]?.spectators?.includes(socket.id)) {
              // console.log("spectator ", sid, " left room ", r);
              rooms[r].spectators.splice(
                rooms[r].spectators.indexOf(socket.id),
                1,
              );
            } else if (rooms[r]?.players[0]?.socketId === sid) {
              // console.log("player ", rooms[r].players[0].id, rooms[r].players[0].socketId, " left room ", r);
              if (rooms[r]?.players[1]) {
                clearInterval(rooms[r]?.Interval);
                rooms[r]?.game?.gameFinished(1); //if no game yet the next line will delete the room
              }
              setTimeout(() => {
                console.log("del room ", r)
                delete rooms[r];
              }, 100);
            } else if (rooms[r]?.players[1]?.socketId === sid) {
              // console.log("player ", rooms[r].players[1].id, rooms[r].players[1].socketId, " left room ", r);
              clearInterval(rooms[r]?.Interval);
              rooms[r]?.game?.gameFinished(0); //if no game yet the next line will delete the room
              setTimeout(() => {
                console.log("del room ", r)
                delete rooms[r];
              }, 100);
            }
          }
          console.log("rooms >", rooms)
        });
        socket.on('getRooms', () => {
          let r: any[] = [];
          let tR: any = rooms;
          for (let room in rooms) {
            if (rooms[room].ready === 2)
              r.push({ id: tR[room].id, players: { a: tR[room].players[0].id, b: tR[room].players[1].id } });
          };
          socket.emit('rooms', { rooms: r });
        });
      } catch (err) {
        // console.log('ERROR CAUGHT: ', err);
      }
    });
  }


}
