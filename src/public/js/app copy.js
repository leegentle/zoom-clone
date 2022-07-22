const socket = new WebSocket(`ws://${window.location.host}`);
const msgList = document.querySelector("ul");
const msgForm = document.querySelector("#msg");
const nickForm = document.querySelector("#nick");

socket.addEventListener("open", (a) => console.log(a));

socket.addEventListener("message", ({ data }) => {
  const li = document.createElement("li");
  li.innerText = data;
  msgList.append(li);
});

socket.addEventListener("close", (a) => console.log(a));

//json을 문자열로
const makeMsg = (type, payload) => {
  const msg = { type, payload };
  return JSON.stringify(msg);
};
// 메세지 보내기
const handleSumbit = (e) => {
  e.preventDefault();
  const input = msgForm.querySelector("input");
  socket.send(makeMsg("msg", input.value));
  input.value = "";
};
// 닉네임 저장하기
const handleNickSumbit = (e) => {
  e.preventDefault();
  const input = nickForm.querySelector("input");
  socket.send(makeMsg("nick", input.value));
};
msgForm.addEventListener("submit", handleSumbit);
nickForm.addEventListener("submit", handleNickSumbit);
