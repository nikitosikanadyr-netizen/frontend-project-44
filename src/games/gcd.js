import runGame from '../index.js';

const DESCRIPTION = 'Find the greatest common divisor of given numbers.';

const getRandomNumber = () => Math.floor(Math.random() * 100) + 1;

const getGcd = (a, b) => {
  let x = a;
  let y = b;

  while (y !== 0) {
    const temp = y;
    y = x % y;
    x = temp;
  }

  return x;
};

const getRoundData = () => {
  const firstNumber = getRandomNumber();
  const secondNumber = getRandomNumber();

  const question = `${firstNumber} ${secondNumber}`;
  const correctAnswer = String(getGcd(firstNumber, secondNumber));

  return [question, correctAnswer];
};

const runGcdGame = () => runGame(DESCRIPTION, getRoundData);

export default runGcdGame;