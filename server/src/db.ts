import type { Game, User } from './data/types'

export type Username = string;
export type GameCode = string;

export const db: {
  userIdCounter: number
  users: Map<Username, User>,
  rooms: Map<GameCode, Game>
} = {
  userIdCounter: 1,
  users: new Map(),
  rooms: new Map()
}
