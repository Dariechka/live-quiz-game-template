import { WebSocket, WebSocketServer } from 'ws'
import { randomUUID } from 'node:crypto'
import type { ApiResponse, RequestMessage } from './data/commands'
import { handle } from './api'
import type { ClientContext } from './data/types'
import { required } from './handlers/handlers'

const PORT = process.env.PORT ? parseInt(process.env.PORT) : 3000;

// WebSocket server
const wss = new WebSocketServer({ port: PORT });
console.log(`Server started on address ${JSON.stringify(wss.address())} and port ${PORT}`);

const registry: Map<string, WebSocket> = new Map();

wss.on('connection', (ws: WebSocket) => {
  const client: ClientContext = {
    id: randomUUID(),
  };

  const respond = (responses: Array<ApiResponse>) => {
    for (const response of responses) {
      switch (response.kind) {
        case 'response': {
          ws.send(JSON.stringify(response.message));
          break;
        }
        case 'broadcast': {
          registry.get(required(client.game?.hostId))?.send(JSON.stringify(response.message));
          for (const player of (client.game?.players ?? [])) {
            registry.get(player.client)?.send(JSON.stringify(response.message));
          }
          break;
        }
      }
    }
  }

  console.log(`connected: ${client.id}`);
  registry.set(client.id, ws);

  ws.on('message', (msg) => {
    console.log(`message: ${client.id} ` + msg);
    const message: RequestMessage = JSON.parse(msg.toString());
    handle(client, message, respond);
  })

  ws.on('error', (msg) => {
    console.log(`error: ${client.id} ` + msg);
  })

  ws.on('close', () => {
    console.log(`close: ${client.id}`);
    registry.delete(client.id);
  })
})

wss.on('wsClientError', (ws) => {
  console.log('wsClientError: ' + ws);
})
