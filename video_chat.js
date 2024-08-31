let peer;
let localStream;
let currentPeer;
let conn;

// Function to create a new room for video chat and messaging
function createRoom() {
  room_id = uuidv4();
  document.getElementById("room-input").value = room_id;
  peer = new Peer(room_id);

  peer.on('open', () => {
    console.log(`Room created with ID: ${room_id}`);
  });

  peer.on('call', (call) => {
    call.answer(localStream);
    call.on('stream', (remoteStream) => {
      setRemoteStream(remoteStream);
    });
    currentPeer = call;
  });

  peer.on('connection', (connection) => {
    conn = connection;
    conn.on('data', (data) => {
      displayMessage(data, 'remote');
    });
  });

  getLocalStream();
}

// Function to join an existing room for video chat and messaging
function joinRoom() {
  const room = document.getElementById("room-input").value;
  if (room === "") {
    alert("Please enter room number");
    return;
  }

  peer = new Peer();
  peer.on('open', () => {
    conn = peer.connect(room);
    conn.on('open', () => {
      console.log('Connected to room: ' + room);
    });
    conn.on('data', (data) => {
      displayMessage(data, 'remote');
    });

    const call = peer.call(room, localStream);
    call.on('stream', (remoteStream) => {
      setRemoteStream(remoteStream);
    });
    currentPeer = call;
  });

  getLocalStream();
}

// Function to get local video stream
function getLocalStream() {
  navigator.mediaDevices.getUserMedia({ video: true, audio: true })
    .then((stream) => {
      localStream = stream;
      setLocalStream(localStream);
    })
    .catch((err) => {
      console.error('Failed to get local stream', err);
    });
}

// Function to display local video stream
function setLocalStream(stream) {
  const videoElement = document.getElementById("local-video");
  videoElement.srcObject = stream;
  videoElement.play();
}

// Function to display remote video stream
function setRemoteStream(stream) {
  const videoElement = document.getElementById("remote-video");
  videoElement.srcObject = stream;
  videoElement.play();
}

// Function to send a chat message
function sendMessage() {
  const message = document.getElementById("message-input").value;
  displayMessage(message, 'local');
  if (conn && conn.open) {
    conn.send(message);
  }
  document.getElementById("message-input").value = '';
}

// Function to display a chat message
function displayMessage(message, sender) {
  const messageContainer = document.getElementById('messages');
  const newMessage = document.createElement('div');
  newMessage.className = sender === 'local' ? 'message local' : 'message remote';
  newMessage.textContent = message;
  messageContainer.appendChild(newMessage);
  messageContainer.scrollTop = messageContainer.scrollHeight;
}

// Helper function to generate a unique room ID
function uuidv4() {
  return ([1e7] + -1e3 + -4e3 + -8e3 + -1e11).replace(/[018]/g, (c) =>
    (c ^ (crypto.getRandomValues(new Uint8Array(1))[0] & (15 >> (c / 4)))).toString(16)
  );
}
