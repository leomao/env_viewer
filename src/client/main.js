const socket = io.connect();

rooms = new Map();

const roomsNode = document.getElementById('rooms');

const SCALE = 4;

function setupCanvas(room) {
  const shape = rooms.get(room).shape;
  const canvas = rooms.get(room).canvas;
  const ctx = rooms.get(room).ctx;
  const width = shape[0];
  const height = shape[1];
  ctx.width = canvas.width = width * SCALE;
  ctx.height = canvas.height = height * SCALE;
}

function render(room, arr) {
  const shape = rooms.get(room).shape;
  const canvas = rooms.get(room).canvas;
  const ctx = rooms.get(room).ctx;
  const width = shape[0];
  const height = shape[1];

  const imgData = ctx.createImageData(width, height);
  for (let i = 0, len = width * height; i < len; ++i) {
    imgData.data[4 * i] = arr[3 * i];
    imgData.data[4 * i + 1] = arr[3 * i + 1];
    imgData.data[4 * i + 2] = arr[3 * i + 2];
    imgData.data[4 * i + 3] = 255;
  }
  ctx.putImageData(imgData, 0, 0);
  ctx.drawImage(canvas, 0, 0, width, height, 0, 0, width*SCALE, height*SCALE);
}

function leave(room) {
  if (!rooms.has(room))
    return;
  roomsNode.removeChild(rooms.get(room).node);
  rooms.delete(room);
  socket.emit('leave', room);
  socket.off(`${room}/shape`);
  socket.off(`${room}/data`);
  console.log('leave:', room);
};

function createRoomNode(room) {
  const node = document.createElement('div');
  const canvas = document.createElement('canvas');
  const btn = document.createElement('button');
  node.setAttribute('id', `room-${room}`);
  node.classList.add('room');
  canvas.setAttribute('id', `canvas-${room}`);
  btn.innerText = 'remove';
  btn.addEventListener('click', (evt) => {
    leave(room);
  });
  node.appendChild(btn);
  node.appendChild(canvas);
  const ctx = canvas.getContext('2d');
  roomsNode.appendChild(node);
  rooms.set(room, {shape: [0, 0], node: node, canvas: canvas, ctx: ctx});
}

function join(room) {
  if (rooms.has(room))
    return;
  createRoomNode(room);
  socket.emit('join', room);
  socket.on(`${room}/shape`, (shape) => {
    console.log('shape: ', shape);
    rooms.get(room).shape = shape;
    setupCanvas(room);
  });
  socket.on(`${room}/data`, (data) => {
    let arr = new Uint8ClampedArray(data);
    render(room, arr);
  });
  console.log('join:', room);
};

const name = document.getElementById('name');
name.addEventListener('keypress', (evt) => {
  if (evt) {
    if (evt.keyCode == '13')
      join(name.value);
  }
});
