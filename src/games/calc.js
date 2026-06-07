import runGame from '../index.js';

const DESCRIPTION = 'What is the result of the expression?';

const OPERATORS = ['+', '-', '*'];

const getRandomNumber = () => Math.floor(Math.random() * 100);

const getRandomOperator = () => {
  const index = Math.floor(Math.random() * OPERATORS.length);
  return OPERATORS[index];
};

const calculate = (firstNumber, secondNumber, operator) => {
  switch (operator) {
    case '+':
      return firstNumber + secondNumber;
    case '-':
      return firstNumber - secondNumber;
    case '*':
      return firstNumber * secondNumber;
    default:
      throw new Error(`Unknown operator: ${operator}`);
  }
};

const getRoundData = () => {
  const firstNumber = getRandomNumber();
  const secondNumber = getRandomNumber();
  const operator = getRandomOperator();

  const question = `${firstNumber} ${operator} ${secondNumber}`;
  const correctAnswer = String(
    calculate(firstNumber, secondNumber, operator),
  );

  return [question, correctAnswer];
};

const runCalcGame = () => runGame(DESCRIPTION, getRoundData);

export default runCalcGame;