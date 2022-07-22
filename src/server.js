import http from "http";
import SocketIO from "socket.io";
import express from "express";
import { isReadable } from "stream";

const app = express();

app.set("view engine", "pug");
app.set("views", __dirname + "/views");

app.use("/public", express.static(__dirname + "/public"));
app.get("/", (req, res) => res.render("home"));
app.get("/*", (req, res) => res.redirect("/"));

const handelListen = () => console.log("켜졌어요 http://localhost:3000");

const server = http.createServer(app); // http 서버
const io = SocketIO(server);

const publicRooms = () => {
  const {
    sockets: {
      adapter: { sids, rooms },
    },
  } = io;

  const publicRooms = [];
  rooms.forEach((_, key) => {
    if (sids.get(key) === undefined) {
      publicRooms.push(key);
    }
  });

  return publicRooms;
};

const countRoom = (roonName) => {
  return io.sockets.adapter.rooms.get(roonName).size;
};

// 연결되면
io.on("connection", (socket) => {
  console.log("연결돼브렀어");
  socket["nick"] = "익명의 사용자";
  // 모든 이벤트발생시 실행됨
  socket.onAny((e) => {
    console.log(`소켓이벤트 : ${e}`);
  });

  // 방 입장이벤트
  // 받은 방이름으로 입장
  // showRoom함수 실행
  // 방안에 사람들한테 welcome이벤트 보냄
  socket.on("enter_room", (roomName, done) => {
    socket.join(roomName);
    done();
    socket.to(roomName).emit("welcome", socket.nick, countRoom(roomName));
    io.sockets.emit("room_change", publicRooms());
  });

  // 연결이 끊어지기 직전에 실행됨
  socket.on("disconnecting", () => {
    // 내가 속해있는 방들에게 나빼고 bye이벤트 보냄
    socket.rooms.forEach((room) =>
      socket.to(room).emit("bye", socket.nick, countRoom(room) - 1)
    );
  });
  // 연결이 끊어진 후 발생함
  socket.on("disconnect", () => {
    io.sockets.emit("room_change", publicRooms());
  });

  // 메세지 보낼때 실행됨
  socket.on("msg", (roomName, msg, done) => {
    console.log(socket.nick);
    socket.to(roomName).emit("msg", `${socket.nick} : ${msg}`);
    done();
  });
  // 닉네임 설정할때 실행됨
  socket.on("nick", (nick) => {
    console.log(nick);
    socket["nick"] = nick;
  });
});

// const wss = new WebSocket.Server({ server }); // 웹소켓 서버
// const sockets = [];
// wss.on("connection", (socket) => {
//   sockets.push(socket);
//   socket["nick"] = "익명의 사용자";
//   console.log("===========================================");
//   console.log("브라우저랑 연결 됐습니다.");
//   socket.on("close", () => console.log("브라우저와의 연결이 끊겼습니다."));
//   socket.on("message", (msg) => {
//     const message = JSON.parse(msg.toString());

//     switch (message.type) {
//       case "msg":
//         sockets.forEach((el) => el.send(`${socket.nick} : ${message.payload}`));
//         break;
//       case "nick":
//         socket["nick"] = message.payload;
//         break;

//       default:
//         break;
//     }
//   });
// });

server.listen(3000, handelListen);
