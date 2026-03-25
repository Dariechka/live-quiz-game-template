import type { Question } from './data/types'

const questions: Array<Question> = [
    {
      text: 'Which planet is known as the Red Planet?',
      options: ['Earth', 'Mars', 'Jupiter', 'Venus'],
      correctIndex: 1,
      timeLimitSec: 20
    },
  {
    text: 'Who wrote the play \'Romeo and Juliet\'?',
    options: ['William Shakespeare', 'Charles Dickens', 'Jane Austen', 'Mark Twain'],
    correctIndex: 0,
    timeLimitSec: 25,
  },
  {
    text: 'What is the largest mammal on Earth?',
    options: ['Elephant', 'Blue Whale', 'Giraffe', 'Hippopotamus'],
    correctIndex: 1,
    timeLimitSec: 15,
  },
  {
    text: 'Which element has the chemical symbol \'O\'?',
    options: ['Gold', 'Oxygen', 'Osmium', 'Iron'],
    correctIndex: 1,
    timeLimitSec: 10,
  },
  {
    text: 'In which country is the Great Pyramid of Giza located?',
    options: ['Mexico', 'Egypt', 'Peru', 'India'],
    correctIndex: 1,
    timeLimitSec: 20,
  }
]
