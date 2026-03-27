import { type ApiResponse, type RequestMessage } from './data/commands'
import {
  handleAuthRequest,
  handleCreateGameRequest,
  handleJoinGameRequest,
  handleStartGameRequest, handleSubmitAnswerRequest,
} from './handlers/handlers'
import {
  isAuthRequest,
  isCreateGameRequest,
  isJoinGameRequest,
  isStartGameRequest, isSubmitAnswerRequest,
} from './request-guards/request-guards'
import type { ClientContext } from './data/types'

export const handle = (client: ClientContext, request: RequestMessage): Array<ApiResponse> => {
  if (isAuthRequest(request)) {
    return handleAuthRequest(client, request)
  } else if (isCreateGameRequest(request)) {
    return handleCreateGameRequest(client, request)
  } else if (isJoinGameRequest(request)) {
    return handleJoinGameRequest(client, request)
  } else if (isStartGameRequest(request)) {
    return handleStartGameRequest(client, request)
  } else if (isSubmitAnswerRequest(request)) {
    return handleSubmitAnswerRequest(client, request)
  } else {
    throw Error(`Unknown ${request}`)
  }
}
