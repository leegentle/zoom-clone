const socket = io();

const welcome = document.getElementById("welcome");
const form = welcome.querySelector("form");

const room = document.getElementById("room");

room.hidden = true;

let roomName;

// 메세지 삽입 (ul태그에 li태그 삽입)
const addMsg = (msg) => {
  const ul = room.querySelector("ul");
  const li = document.createElement("li");
  li.innerText = msg;
  ul.appendChild(li);
};

// 메세지 전송
// 방에있는 다른 유저들에게 전송하고
// 나한테는 (너 : 메세지) 방식으로 보여줌
const handleMsgSubmit = (e) => {
  e.preventDefault();
  const input = room.querySelector("#msg input");
  const value = input.value;
  socket.emit("msg", roomName, input.value, () => addMsg(`너 : ${value}`));
  input.value = "";
};
const handleNickSubmit = (e) => {
  e.preventDefault();
  const input = room.querySelector("#nick input");
  console.log(input.value);
  socket.emit("nick", input.value);
};

// 방 입장 성공 함수
// 방번호입력 및 입장버튼 숨기고
// 방 렌더링
// 메세지전송 이벤트를 걸어둠
const showRoom = () => {
  welcome.hidden = true; // 초기화면 숨김
  room.hidden = false; // 방 렌더링

  const h3 = room.querySelector("h3"); // 방이름 접근
  h3.innerText = `Room ${roomName}`; // 방이름 수정

  const msgForm = room.querySelector("#msg"); // 메세지 form 접근
  const nickForm = room.querySelector("#nick"); // 닉네임 form 접근
  msgForm.addEventListener("submit", handleMsgSubmit); // 메세지 전송이벤트 걸어둠
  nickForm.addEventListener("submit", handleNickSubmit); // 메세지 전송이벤트 걸어둠
};

// 방 입장버튼 함수
const handelRoomSubmit = (e) => {
  e.preventDefault();
  const input = form.querySelector("input"); // 입력한 방이름
  socket.emit("enter_room", input.value, showRoom); // enter_room이벤트로 입력한 방 이름 전송 및 성공함수 실행
  roomName = input.value; // 방 이름 변수에 할당
  input.value = ""; // 값 초기화
};

form.addEventListener("submit", handelRoomSubmit); // 방입장버튼 이벤트리스너

// welcome이벤트 받으면 실행됨
socket.on("welcome", (nick, newCount) => {
  const h3 = room.querySelector("h3"); // 방이름 접근
  h3.innerText = `Room ${roomName} (${newCount})`; // 방이름 수정

  addMsg(`${nick} : 형 왔다`);
});

// bye이벤트 받으면 실행됨
socket.on("bye", (nick, newCount) => {
  const h3 = room.querySelector("h3"); // 방이름 접근
  h3.innerText = `Room ${roomName} (${newCount})`; // 방이름 수정
  addMsg(`${nick} : 형 간다`);
});

// msg이벤트 받으면 실행됨
socket.on("msg", addMsg);

socket.on("room_change", (rooms) => {
  const roomList = welcome.querySelector("ul");
  roomList.innerHTML = "";
  rooms.forEach((room) => {
    const li = document.createElement("li");
    li.innerText = room;
    roomList.append(li);
  });
});
