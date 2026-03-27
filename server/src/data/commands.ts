export type ApiResponse = { kind: 'response', message: ResponseMessage } | {
  kind: 'broadcast',
  message: BroadcastMessage
};

export type RequestMessage =
  | PlayerCommand.Register.Request
  | GameManagementCommand.CreateGame.Request
  | GameManagementCommand.JoinGame.Request
  | GamePlayCommand.StartGame.Request
  | GamePlayCommand.SubmitAnswer.Request;

export type ResponseMessage =
  | PlayerCommand.Register.Response
  | GameManagementCommand.CreateGame.Response
  | GameManagementCommand.JoinGame.Response
  | GamePlayCommand.SubmitAnswer.Response;

export type BroadcastMessage =
  | GameManagementCommand.JoinGame.Broadcast
  | GameManagementCommand.PlayerList.Broadcast
  | GamePlayCommand.Question.Broadcast
  | GamePlayCommand.QuestionResult.Broadcast
  | GamePlayCommand.GameFinished.Broadcast;

export namespace PlayerCommand {
  export namespace Register {
    export type Request = {
      type: 'reg',
      data: {
        name: string,
        password: string
      },
      id: 0
    }

    export type Response = {
      type: 'reg',
      data: {
        name: string,
        index: number | string,
        error: boolean,
        errorText: string | undefined,
      },
      id: 0
    }
  }
}

export namespace GameManagementCommand {
  export namespace CreateGame {
    export type Request = {
      type: 'create_game',
      data: {
        questions: [
          {
            text: string,
            options: [string, string, string, string],
            correctIndex: number,
            timeLimitSec: number
          }
        ]
      },
      id: 0
    }

    export type Response = {
      type: 'game_created',
      data: {
        gameId: string,
        code: string,
      },
      id: 0
    }
  }

  export namespace JoinGame {
    export type Request = {
      type: 'join_game',
      data: {
        code: string
      },
      id: 0
    }

    export type Response = {
      type: 'game_joined',
      data: {
        gameId: string
      },
      id: 0
    }

    export type Broadcast = {
      type: 'player_joined',
      data: {
        playerName: string,
        playerCount: number,
      },
      id: 0
    }
  }

  export namespace PlayerList {
    export type Broadcast = {
      type: 'update_players',
      data: Array<{
        name: string,
        index: number | string,
        score: number
      }>,
      id: 0
    }
  }
}

export namespace GamePlayCommand {
  export namespace StartGame {
    export type Request = {
      type: 'start_game',
      data: {
        gameId: string
      },
      id: 0
    }
  }

  export namespace Question {
    export type Broadcast = {
      type: 'question',
      data: {
        questionNumber: number,
        totalQuestions: number,
        text: string,
        options: string[],
        timeLimitSec: number
      },
      id: 0
    }
  }

  export namespace SubmitAnswer {
    export type Request = {
      type: 'answer',
      data: {
        gameId: string,
        questionIndex: number,
        answerIndex: number
      },
      id: 0
    }
    export type Response = {
      type: 'answer_accepted',
      data: {
        questionIndex: number
      },
      id: 0
    }
  }

  export namespace QuestionResult {
    export type Broadcast = {
      type: 'question_result',
      data: {
        questionIndex: number,
        correctIndex: number,
        playerResults: {
          name: string,
          answered: boolean,
          correct: boolean,
          pointsEarned: number,
          totalScore: number
        }[]
      },
      id: 0
    }
  }

  export namespace GameFinished {
    export type Broadcast = {
      type: 'game_finished',
      data: {
        scoreboard:
          {
            name: string,
            score: number,
            rank: number
          }[]
      },
      id: 0
    }
  }
}
