const socket = io();

const myFace = document.getElementById("myFace");
const muteBtn = document.getElementById("mute");
const cameraBtn = document.getElementById("camera");
const cameraSelect = document.getElementById("cameras");
console.log(myFace);

let myStream;
let mute = false;
let cameraOff = false;

const getCamera = async () => {
  try {
    const devices = await navigator.mediaDevices.enumerateDevices();
    const camers = devices.filter((device) => device.kind === "videoinput");
    const currentCamera = myStream.getVideoTracks()[0];
    console.log(camers);
    camers.forEach((camera) => {
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

getMedia();

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
    cameraBtn.innerText = "카메라 OFF ";
    cameraOff = true;
  } else {
    cameraBtn.innerText = "카메라 ON";
    cameraOff = false;
  }
};

const handleCameraChange = async () => {
  await getMedia(cameraSelect.value);
};
muteBtn.addEventListener("click", handleMuteClick);
cameraBtn.addEventListener("click", handleCameraClick);
cameraSelect.addEventListener("input", handleCameraChange);
