import net from 'net';
import path from 'path';
import http from 'http';
import express from 'express';
import winston from 'winston';
import socketio from 'socket.io';

import logger from './logger';

const app = express();
app.set('port', process.env.PORT || 3000);

app.set('view engine', 'pug');
app.set('views', path.join(__dirname, 'views'));

app.use('/static', express.static(path.join(__dirname, 'static')));

const server = http.createServer(app);
const io = socketio(server);

const rooms = new Map();

io.on('connection', (socket) => {
  socket.on('join', (room) => {
    logger.info(`join ${room}`);
    if (rooms.has(room)) {
      socket.emit(`${room}/shape`, rooms.get(room).shape);
    }
    socket.join(room);
  });
});

app.get('/', (req, res) => {
  res.sendFile(path.join(__dirname, 'static/index.html'));
});

app.use((err, req, res, next) => {
  logger.error(err.stack);
  next(err);
});

server.listen(app.get('port'), () => {
  logger.info(`Server started at: http://localhost:${app.get('port')}`);
});

const socksrv = net.createServer((socket) => {
  logger.info('socket connected');
  let name = null;
  let shape = null;
  const getData = (data) => {
    io.to(name).emit(`${name}/data`, data);
  };
  socket.once('data', (data) => {
    name = data.toString().trim();
    logger.info(`room name: ${name}`);
    if (!rooms.has(name))
      rooms.set(name, { shape: [0, 0] });
    socket.once('data', (data) => {
      shape = JSON.parse(data);
      logger.info(`shape: ${shape}`);
      rooms.get(name).shape = shape;
      io.to(name).emit(`${name}/shape`, shape);
      socket.on('data', getData);
    });
  });
  socket.on('end', () => {
    logger.info('socket closed');
  });
});

const ENVPORT = process.env.ENVPORT || 12345;
socksrv.listen(ENVPORT, () => {
  logger.info(`Env Server started at: http://localhost:${ENVPORT}`);
});

process.on('SIGTERM', () => {
  logger.info('exiting...');
  server.close(() => {
    logger.info('done.');
  });
  socksrv.close();
  process.exit();
});
