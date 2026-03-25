// import type { Game, Player } from '../data/types'
//
// export const joinGameBroadcast = (game: Game, player: Player) => {
//   const payload = {
//     type: 'player_joined',
//     data: {
//       playerName: player.name,
//       playerCount: player.score,
//     },
//     id: 0
//   }
//   game.players.forEach((player) => {
//     player.ws?.send(JSON.stringify(payload))
//   })
// }
