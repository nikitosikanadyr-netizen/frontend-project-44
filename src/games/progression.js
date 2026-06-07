import runGame from '../index.js';

const DESCRIPTION = 'What number is missing in the progression?';

const PROGRESSION_LENGTH = 10;

const getRandomNumber = (min, max) => (
  Math.floor(Math.random() * (max - min + 1)) + min
);

const generateProgression = (start, step, length) => {
  const progression = [];

  for (let i = 0; i < length; i += 1) {
    progression.push(start + i * step);
  }

  return progression;
};

const getRoundData = () => {
  const start = getRandomNumber(1, 50);
  const step = getRandomNumber(1, 10);

  const progression = generateProgression(
    start,
    step,
    PROGRESSION_LENGTH,
  );

  const hiddenIndex = getRandomNumber(
    0,
    PROGRESSION_LENGTH - 1,
  );

  const correctAnswer = String(progression[hiddenIndex]);

  progression[hiddenIndex] = '..';

  const question = progression.join(' ');

  return [question, correctAnswer];
};

const runProgressionGame = () => runGame(
  DESCRIPTION,
  getRoundData,
);

export default runProgressionGame;