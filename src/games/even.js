import runGame from '../index.js';

const DESCRIPTION = 'Answer "yes" if the number is even, otherwise answer "no".';

const isEven = (number) => number % 2 === 0;

const getRoundData = () => {
  const number = Math.floor(Math.random() * 100);

  const question = String(number);
  const correctAnswer = isEven(number) ? 'yes' : 'no';

  return [question, correctAnswer];
};

const runEvenGame = () => runGame(DESCRIPTION, getRoundData);

export default runEvenGame;