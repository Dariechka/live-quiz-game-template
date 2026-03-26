import { db } from '../db'
import {
  type ApiResponse,
  type BroadcastMessage,
  GameManagementCommand,
  PlayerCommand,
  type ResponseMessage,
} from '../data/commands'
import { requiredLength } from '../data/constants'
import type { ClientContext, Game, Player } from '../data/types'

export const required = <T>(value: T, error?: string): NonNullable<T> => {
  if (value == null) {
    throw new Error('Value is null or undefined')
  }
  return value
}

const response = (message: ResponseMessage): ApiResponse => ({
  kind: 'response',
  message,
})

const broadcast = (message: BroadcastMessage): ApiResponse => ({
  kind: 'broadcast',
  message,
})

export const handleAuthRequest = (client: ClientContext, request: PlayerCommand.Register.Request): Array<ApiResponse> => {
  const {name, password} = request.data

  const createResponseMessage = (error?: string): PlayerCommand.Register.Response => ({
    type: 'reg',
    id: 0,
    data: {
      name,
      index: db.userIdCounter,
      error: !!error,
      errorText: error,
    },
  })

  if (db.users.has(name)) {
    if (db.users.get(name)?.password === password) {
      client.username = name
      return [response(createResponseMessage())]
    } else {
      return [response(createResponseMessage('Wrong password'))]
    }
  } else {
    db.users.set(name, {password, index: db.userIdCounter++})
    client.username = name
    return [response(createResponseMessage())]
  }
}

export const handleCreateGameRequest = (
  client: ClientContext, request: GameManagementCommand.CreateGame.Request): Array<ApiResponse> => {
  function generateCode() {
    const chars = 'ABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789'
    let result = ''

    for (let i = 0; i < requiredLength; i++) {
      result += chars[Math.floor(Math.random() * chars.length)]
    }

    return result
  }

  const game: Game = {
    id: request.id.toString(),
    code: generateCode(),
    hostId: client.id,
    questions: request.data.questions,
    players: [],
    currentQuestion: 0,
    status: 'waiting',
    playerAnswers: new Map(),
  }

  db.rooms.set(game.code, game)

  return [response({
    type: 'game_created',
    data: {
      gameId: game.id,
      code: game.code,
    },
    id: 0,
  })]
}

export const handleJoinGameRequest = (
  client: ClientContext, request: GameManagementCommand.JoinGame.Request): Array<ApiResponse> => {
  console.log(JSON.stringify(client))
  const username = required(client.username, 'no username')

  const {code} = request.data
  const game = required(db.rooms.get(code), `no room ${code}`)
  const user = required(db.users.get(username), `no user ${username}`)

  client.game = game

  const player: Player = {
    client: client.id,
    name: username,
    index: user.index.toString(),
    score: 0,
  }
  game.players.push(player)

  return [
    response({
      type: 'game_joined',
      data: {
        gameId: game.id,
      },
      id: 0,
    }),
    broadcast({
      type: 'player_joined',
      data: {
        playerName: player.name,
        playerCount: game.players.length,
      },
      id: 0,
    }),
  ]
}
