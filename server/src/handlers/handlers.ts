import { db } from '../db'
import {
  type ApiResponse, type BroadcastApiResponse,
  type BroadcastMessage,
  GameManagementCommand,
  GamePlayCommand,
  PlayerCommand, type ResponseApiResponse,
  type ResponseMessage,
} from '../data/commands'
import { basePoints, requiredLength } from '../data/constants'
import type { ClientContext, Game, Player } from '../data/types'
import { clearTimeout } from 'node:timers'

export const required = <T>(value: T, error?: string): NonNullable<T> => {
  if (value == null) {
    throw new Error(error)
  }
  return value
}

const response = (message: ResponseMessage): ResponseApiResponse => ({
  kind: 'response',
  message,
})

const broadcast = (message: BroadcastMessage): BroadcastApiResponse => ({
  kind: 'broadcast',
  message,
})

const wait = async (millis: number) => {
  await new Promise(resolve => setTimeout(resolve, millis));
}

const finishRound = async (game: Game, respond: (responses: Array<ApiResponse>) => void) => {
  clearTimeout(game.questionTimerId);

  const question = game.questions[game.currentQuestion]
  const earned: Map<string, number> = new Map();
  for (const player of game.players) {
    const answer = game.playerAnswers.get(player.name);
    const earnedPoints = !answer ? 0 : Math.floor(player.answeredCorrectly ? basePoints * (answer.timestamp - required(game.questionStartTs)) / (question.timeLimitSec * 1000) : 0)
    player.score += earnedPoints
    earned.set(player.name, earnedPoints)
  }
  game.playerAnswers.clear();

  respond([
    broadcast({
      type: 'question_result',
      data: {
        questionIndex: game.currentQuestion,
        correctIndex: game.questions[game.currentQuestion].correctIndex,
        playerResults: game.players.map(player => ({
          name: player.name,
          answered: true,
          correct: player.answeredCorrectly === true,
          pointsEarned: earned.get(player.name) ?? 0,
          totalScore: player.score,
        })),
      },
      id: 0,
    })
  ]);

  await wait(5000);

  game.currentQuestion += 1;
  if (game.currentQuestion < game.questions.length) {
    game.questionTimerId = setTimeout(() => finishRound(game, respond), game.questions[game.currentQuestion].timeLimitSec * 1000)
    game.questionStartTs = Date.now()

    respond([
      broadcast({
        type: 'question',
        data: {
          questionNumber: game.currentQuestion + 1,
          totalQuestions: game.questions.length,
          text: game.questions[game.currentQuestion].text,
          options: game.questions[game.currentQuestion].options,
          timeLimitSec: game.questions[game.currentQuestion].timeLimitSec,
        },
        id: 0,
      })
    ]);
  } else {
    const gameResult = finishGame(game);
    respond([gameResult]);
  }
}

const finishGame = (game: Game): BroadcastApiResponse => {
  return broadcast({
    type: 'game_finished',
    data: {
      scoreboard: game.players.sort((a, b) => a.score - b.score).map((player, i) => ({
        name: player.name,
        score: player.score,
        rank: i + 1,
      })),
    },
    id: 0,
  })
}

export const handleAuthRequest = (
  client: ClientContext, request: PlayerCommand.Register.Request, respond: (responses: Array<ApiResponse>) => void) => {
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
      respond([response(createResponseMessage())])
    } else {
      respond([response(createResponseMessage('Wrong password'))])
    }
  } else {
    db.users.set(name, {password, index: db.userIdCounter++})
    client.username = name
    respond([response(createResponseMessage())])
  }
}

export const handleCreateGameRequest = (
  client: ClientContext, request: GameManagementCommand.CreateGame.Request, respond: (responses: Array<ApiResponse>) => void) => {
  const generateCode = () => {
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

  client.game = game

  respond([response({
    type: 'game_created',
    data: {
      gameId: game.id,
      code: game.code,
    },
    id: 0,
  })])
}

export const handleJoinGameRequest = (
  client: ClientContext, request: GameManagementCommand.JoinGame.Request, respond: (responses: Array<ApiResponse>) => void) => {
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

  const allPlayersData = game.players.map(player => {
    return {
      name: player.name,
      index: player.index.toString(),
      score: player.score,
    }
  })

  respond([
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
    broadcast({
      type: 'update_players',
      data: allPlayersData,
      id: 0,
    }),
  ])
}

export const handleStartGameRequest = (
  client: ClientContext, request: GamePlayCommand.StartGame.Request, respond: (responses: Array<ApiResponse>) => void) => {
  const game = required(client.game)
  game.status = 'in_progress'
  game.questionStartTs = Date.now()
  game.questionTimerId = setTimeout(() => finishRound(game, respond), game.questions[game.currentQuestion].timeLimitSec * 1000)

  const payloadData = {
    questionNumber: game.currentQuestion + 1,
    totalQuestions: game.questions.length,
    text: game.questions[game.currentQuestion].text,
    options: game.questions[game.currentQuestion].options,
    timeLimitSec: game.questions[game.currentQuestion].timeLimitSec,
  }

  respond([
    broadcast({
      type: 'question',
      data: payloadData,
      id: 0,
    }),
  ])
}

export const handleSubmitAnswerRequest = (
  client: ClientContext, request: GamePlayCommand.SubmitAnswer.Request, respond: (responses: Array<ApiResponse>) => void) => {
  const game = required(client.game)
  const question = game.questions[game.currentQuestion]

  const answers = game.playerAnswers
  const answer = {
    answerIndex: request.data.answerIndex,
    timestamp: Date.now(),
  }
  answers.set(required(client.username), answer)

  const player = required(game.players.find(player => player.client === client.id))
  player.hasAnswered = true
  player.answerTime = Date.now()
  player.answeredCorrectly = request.data.answerIndex === question.correctIndex

  const answerResult = response({
    type: 'answer_accepted',
    data: {
      questionIndex: request.data.questionIndex,
    },
    id: 0,
  });

  respond([answerResult]);

  if (game.players.every(player => player.hasAnswered)) {
    finishRound(game, respond);
  }
}
