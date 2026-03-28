import { type ApiResponse, type RequestMessage } from './data/commands'
import {
  handleAuthRequest,
  handleCreateGameRequest,
  handleJoinGameRequest, handleLeaveGameRequest,
  handleStartGameRequest, handleSubmitAnswerRequest,
} from './handlers/handlers'
import {
  isAuthRequest,
  isCreateGameRequest,
  isJoinGameRequest, isLeaveGameRequest,
  isStartGameRequest, isSubmitAnswerRequest,
} from './request-guards/request-guards'
import type { ClientContext } from './data/types'

export const handle = (client: ClientContext, request: RequestMessage, respond: (responses: Array<ApiResponse>) => void) => {
  if (isAuthRequest(request)) {
    handleAuthRequest(client, request, respond)
  } else if (isCreateGameRequest(request)) {
    handleCreateGameRequest(client, request, respond)
  } else if (isJoinGameRequest(request)) {
    handleJoinGameRequest(client, request, respond)
  } else if (isStartGameRequest(request)) {
    handleStartGameRequest(client, request, respond)
  } else if (isSubmitAnswerRequest(request)) {
    handleSubmitAnswerRequest(client, request, respond)
  } else if (isLeaveGameRequest(request)) {
    handleLeaveGameRequest (client, request, respond)
  } else {
    throw Error(`Unknown ${request}`)
  }
}
