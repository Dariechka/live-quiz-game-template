import type { BroadcastApiResponse, BroadcastMessage, ResponseApiResponse, ResponseMessage } from './data/commands'

export const required = <T>(value: T, error?: string): NonNullable<T> => {
  if (value == null) {
    throw new Error(error)
  }
  return value
}

export const response = (message: ResponseMessage): ResponseApiResponse => ({
  kind: 'response',
  message,
})

export const broadcast = (message: BroadcastMessage): BroadcastApiResponse => ({
  kind: 'broadcast',
  message,
})

export const wait = async (millis: number) => {
  await new Promise(resolve => setTimeout(resolve, millis))
}
