import { GameManagementCommand, GamePlayCommand, PlayerCommand, type RequestMessage } from '../data/commands'

export const isAuthRequest = (request: RequestMessage): request is PlayerCommand.Register.Request => request.type === 'reg'
export const isCreateGameRequest = (request: RequestMessage): request is GameManagementCommand.CreateGame.Request => request.type === 'create_game'
export const isJoinGameRequest = (request: RequestMessage): request is GameManagementCommand.JoinGame.Request => request.type === 'join_game'
export const isStartGameRequest = (request: RequestMessage): request is GamePlayCommand.StartGame.Request => request.type === 'start_game'
export const isSubmitAnswerRequest = (request: RequestMessage): request is GamePlayCommand.SubmitAnswer.Request => request.type === 'answer'
