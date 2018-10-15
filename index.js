/**
 * http://usejsdoc.org/
 */
const express = require('express');
const bodyParser = require("body-parser");
const morgan = require("morgan");
const session = require("express-session");
const path = require("path");

const http = require("http");

//서버 생성
const app = express();

// express와 http 연동
const server = http.createServer(app);

app.set('view engine', 'ejs');
app.set('views', path.join(__dirname, 'view'));

//Session 사용 설정
app.use(session({
  secret: "hello blog",
  resave: false,
  saveUninitialized: true
}));

// Http request logger
app.use(morgan("combined"));

// body-parser Middleware
app.use(bodyParser.urlencoded({extended: false}));

// Static Middleware
app.use("/static", express.static(__dirname + "/static"));
app.use("/jquery", express.static(__dirname + "/node_modules/jquery/dist"));

app.use((req, res, next) => {
  res.locals.session = req.session.USER;
  next();
});

app.use("/chat", require("./routes/chat.route.js").router);

app.use((req, res) => {
  res.type("text/html");
  res.sendStatus(404);
});

// 서버 실행
server.listen(3000, () => {
  console.log("http://localhost:3000 번에서 실행 중");
});

// socket 서버 생성
const socket = require("socket.io");
const io = socket.listen(server);

const connectMember = {
  rooms: []
};
app.set("connectMember", connectMember);

// socket ==> Socket.io 에 접속한 객체
io.sockets.on("connection", (socket) => {
  // 1. 접속자를 채팅방에 포함시키기
  socket.on("enter_room", (data) => {
    socket.join(data.roomName);
    io.sockets.in(data.roomName).emit("welcome", {
      message: `${data.me.name}님이 입장하셨습니다.`
    });
    let existsRoom = false;
    for ( let room of connectMember.rooms ) {
      if ( room.roomName == data.roomName ) {
        existsRoom = true;
        room.members.push({
          socketId: socket.id,
          user: data.me
        });
      }
    }

    if( !existsRoom ) {
      connectMember.rooms.push({
        roomName: data.roomName,
        members: [{
          socketId: socket.id,
          user: data.me
        }]
      });
    }

    let roomMembers = [];
    for ( let room of connectMember.rooms ) {
      if ( room.roomName == data.roomName ) {
        roomMembers = room.members;
      }
    }

    io.sockets.in(data.roomName)
              .emit("getMemberList", {members: roomMembers});

  });
  
//사용자가 채팅방을 나갔을 때 실행됨.
  // (새로고침, 브라우저 종료, 다른 URL로 이동)
  socket.on("disconnect", () => {
    console.log("로그아웃!");
    for ( let room of connectMember.rooms ) {
      for ( let member of room.members ) {
        if ( member.socketId == socket.id ) {
          let roomName = room.roomName;
          const user = member.user;

          io.sockets.in(roomName)
            .emit("welcome", {
              message: `${user.name}님이 나가셨습니다.`
            });
          room.members.splice(room.members.indexOf(member), 1);

          io.sockets.in(roomName)
                    .emit("getMemberList", {members: room.members});
          break;
        }


      }
    }

  });

  // 2. 채팅 전송 받고, 모두에게 전달하기
  socket.on("send", (data) => {
    if(!data.to) {      // 단체 채팅
      io.sockets.in(data.roomName).emit("receive", data);
    }
    else {              // 1대1 채팅
      io.sockets.in(data.roomName).sockets[data.to].emit("receive", data);    // 상대방
      socket.emit("receive", data);       // 나
    }
  });
});