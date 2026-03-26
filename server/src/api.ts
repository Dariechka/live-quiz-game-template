import { type ApiResponse, type RequestMessage } from './data/commands'
import {
  handleAuthRequest,
  handleCreateGameRequest,
  handleJoinGameRequest,
  handleStartGameRequest,
} from './handlers/handlers'
import {
  isAuthRequest,
  isCreateGameRequest,
  isJoinGameRequest,
  isStartGameRequest,
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
  } else {
    throw Error(`Unknown type ${request.type}`)
  }
}
