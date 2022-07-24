const socket = io();

const myFace = document.getElementById("myFace");
const muteBtn = document.getElementById("mute");
const cameraBtn = document.getElementById("camera");
const cameraSelect = document.getElementById("cameras");
const welcome = document.getElementById("welcome");
const call = document.getElementById("call");

call.hidden = true;

let myStream;
let mute = false;
let cameraOff = false;
let roomName;
let myPeerCon;

const getCamera = async () => {
  try {
    const devices = await navigator.mediaDevices.enumerateDevices();
    const cameras = devices.filter((device) => device.kind === "videoinput");
    const currentCamera = myStream.getVideoTracks()[0];
    cameras.forEach((camera) => {
      const option = document.createElement("option");
      option.value = camera.deviceId;
      option.innerText = camera.label;
      if (currentCamera.label === camera.label) {
        camera.seleted = true;
      }
      cameraSelect.appendChild(option);
    });
  } catch (e) {
    console.log(e);
  }
};

const getMedia = async (deviceID) => {
  try {
    const initialConstrains = { audio: true, video: { facingMode: "user" } };
    const cameraConstrains = {
      audio: true,
      video: { deviceId: { exact: deviceID } },
    };
    myStream = await navigator.mediaDevices.getUserMedia(
      deviceID ? cameraConstrains : initialConstrains
    );
    !deviceID && (await getCamera());
    myFace.srcObject = myStream;
  } catch (e) {
    console.log(e);
  }
};

const handleMuteClick = () => {
  myStream.getAudioTracks().forEach((track) => {
    track.enabled = !track.enabled;
  });
  if (!mute) {
    muteBtn.innerText = "음소거 해제";
    mute = true;
  } else {
    muteBtn.innerText = "음소거";
    mute = false;
  }
};

const handleCameraClick = () => {
  myStream.getVideoTracks().forEach((track) => {
    track.enabled = !track.enabled;
  });
  if (!cameraOff) {
    cameraBtn.innerText = "카메라 ON ";
    cameraOff = true;
  } else {
    cameraBtn.innerText = "카메라 OFF";
    cameraOff = false;
  }
};

const handleCameraChange = async () => {
  await getMedia(cameraSelect.value);
  if (myPeerCon) {
    const videoTrack = myStream.getVideoTracks()[0];
    const videoSender = myPeerCon.getSdenders().find((sender) => {
      sender.track.kine === "video";
    });
    videoSender.replaceTrack(videoTrack);
  }
};

muteBtn.addEventListener("click", handleMuteClick);
cameraBtn.addEventListener("click", handleCameraClick);
cameraSelect.addEventListener("input", handleCameraChange);

// welcomForm

const welcomeForm = welcome.querySelector("form");

const initCall = async () => {
  welcome.hidden = true;
  call.hidden = false;
  await getMedia();
  makeConnection();
};

const handelWelcomSubmit = async (e) => {
  e.preventDefault();
  const input = welcomeForm.querySelector("input");
  await initCall();
  socket.emit("join_room", input.value);
  roomName = input.value;
  input.value = "";
};

welcomeForm.addEventListener("submit", handelWelcomSubmit);

// 소켓
socket.on("welcome", async () => {
  const offer = await myPeerCon.createOffer();
  myPeerCon.setLocalDescription(offer);
  socket.emit("offer", offer, roomName);
});

socket.on("offer", async (offer) => {
  myPeerCon.setRemoteDescription(offer);
  const answer = await myPeerCon.createAnswer();
  myPeerCon.setLocalDescription(answer);
  socket.emit("answer", answer, roomName);
});

socket.on("answer", (answer) => {
  myPeerCon.setRemoteDescription(answer);
});
socket.on("ice", (ice) => {
  myPeerCon.addIceCandidate(ice);
  console.log("얼음 받았다");
});

// RTC code

const makeConnection = () => {
  myPeerCon = new RTCPeerConnection();
  myPeerCon.addEventListener("icecandidate", handleIce);
  myPeerCon.addEventListener("addstream", handleAddStream);
  myStream.getTracks().forEach((track) => myPeerCon.addTrack(track, myStream));
};

const handleIce = (data) => {
  socket.emit("ice", data.candidate, roomName);
  console.log("얼음보냈다");
};
const handleAddStream = (data) => {
  const peerFace = document.getElementById("peerFace");
  console.log("애드스트림");
  console.log(data.stream);
  peerFace.srcObject = data.stream;
};
