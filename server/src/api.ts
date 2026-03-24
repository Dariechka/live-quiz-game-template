import { PlayerCommand, type RequestMessage, type ResponseMessage } from './commands'
import { db } from './db'

export const handle = (request: RequestMessage): ResponseMessage => {
  if (isAuthRequest(request)) {
    return handleAuthRequest(request)
  } else {
    throw Error(`Unknown type ${request.type}`)
  }
}

const isAuthRequest = (request: RequestMessage): request is PlayerCommand.Register.Request => request.type === 'reg'
const handleAuthRequest = (request: PlayerCommand.Register.Request): PlayerCommand.Register.Response => {
  const {name, password} = request.data

  const createResponseMessage = (error?: string): PlayerCommand.Register.Response => ({
    type: 'reg',
    id: 0,
    data: {
      name,
      index: 1,
      error: !!error,
      errorText: error,
    },
  })

  if (db.credentials.has(name)) {
    if (db.credentials.get(name) === password) {
      return createResponseMessage();
    } else {
      return createResponseMessage('Wrong password');
    }
  } else {
    db.credentials.set(name, password);
    return createResponseMessage();
  }
}
