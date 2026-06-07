import runGame from '../index.js';

const DESCRIPTION = 'Answer "yes" if given number is prime. Otherwise answer "no".';

const getRandomNumber = (min, max) => (
  Math.floor(Math.random() * (max - min + 1)) + min
);

const isPrime = (number) => {
  if (number < 2) {
    return false;
  }

  for (let i = 2; i <= Math.sqrt(number); i += 1) {
    if (number % i === 0) {
      return false;
    }
  }

  return true;
};

const getRoundData = () => {
  const number = getRandomNumber(1, 100);

  return [
    String(number),
    isPrime(number) ? 'yes' : 'no',
  ];
};

export default () => runGame(DESCRIPTION, getRoundData);