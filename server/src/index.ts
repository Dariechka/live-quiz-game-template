import { WebSocketServer } from 'ws'
import { randomUUID } from 'node:crypto'
import type { RequestMessage } from './commands'
import { handle } from './api'

const PORT = process.env.PORT ? parseInt(process.env.PORT) : 3000;

// WebSocket server
const wss = new WebSocketServer({ port: PORT });
console.log(`Server started on address ${JSON.stringify(wss.address())} and port ${PORT}`);

wss.on('connection', (ws) => {
  const client = {
    id: randomUUID(),
  };
  console.log(`connected: ${client.id}`);

  ws.on('message', (msg) => {
    console.log(`message: ${client.id} ` + msg);
    const message: RequestMessage = JSON.parse(msg.toString());
    const response = handle(message);
    ws.send(JSON.stringify(response));
  })

  ws.on('error', (msg) => {
    console.log(`error: ${client.id} ` + msg);
  })

  ws.on('close', () => {
    console.log(`close: ${client.id}`);
  })
})

wss.on('wsClientError', (ws) => {
  console.log('wsClientError: ' + ws);
})
