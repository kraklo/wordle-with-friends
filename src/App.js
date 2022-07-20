import './App.css';
import React, { useState, useRef, useEffect } from 'react';
import { dictionary } from './dictionary.js';

const alphabet = [..."abcdefghijklmnopqrstuvwxyzABCDEFGHIJKLMNOPQRSTUVWXYZ"];

function inAlphabet(character) {
  return alphabet.includes(character);
}

function createBox() {
  return {
    letter: '',
    colour: 'unused'
  };
}

function createBoxRow(length) {
  const boxes = [];
  for (let i = 0; i < length; i++) {
    boxes.push(createBox());
  }

  return boxes;
}

function createAllBoxRows(length) {
  const rows = [];
  for (let i = 0; i < 6; i++) {
    rows.push(createBoxRow(length));
  }

  return rows;
}

function SetForm(props) {
  if (!props.settableState) {
    return null;
  }

  return (
    <>
      <input type="text" ref={props.inputRef} />
      <button onClick={() => props.handleSetWord(props.inputRef.current.value)}>Set</button>
    </>
  );
}

function displayWord(word, winCondition, loseCondition, handlePlayAgain) {
  if (winCondition) {
    return (
      <>
        Correct! The word was <em>{word}</em>!
        <button onClick={() => handlePlayAgain()}>Play Again</button>
      </>
    );
  } else if (loseCondition) {
    return (
      <>
        Uh oh, you ran out of guesses! The word was <em>{word}</em>!
        <button onClick={() => handlePlayAgain()}>Play Again</button>
      </>
    );
  } else if (word === '') {
    return "There is no word set"
  } else if (!dictionary[`length${word.length}`].includes(word)) {
    return `${word} is not a valid English word`;
  }
}

function renderBox(box, colNum) {
  let classes = "box " + box.colour;
  classes = box.colour !== "unused" ? classes + " used" : classes;

  return (
    <div key={colNum} className={classes}>
      <p className="letter">{box.letter}</p>
    </div>
  )
}

function renderBoxRow(row, rowNum) {
  const boxes = [];

  row.forEach((box, colNum) => boxes.push(renderBox(box, colNum)));

  return (
    <div key={rowNum} className="row">{boxes}</div>
  );
}

function renderBoxes(boxes) {
  if (!boxes) {
    return;
  }

  const boxRows = []

  boxes.forEach((boxRow, rowNum) => {
    boxRows.push(renderBoxRow(boxRow, rowNum))
  });

  return boxRows;
}

function useEventListener(eventName, handler, element = document) {
  const savedHandler = useRef();

  useEffect(() => {
    savedHandler.current = handler;
  }, [handler]);

  useEffect(() => {
    const eventListener = (event) => savedHandler.current(event);
    element.addEventListener(eventName, eventListener);
    return () => {
      element.removeEventListener(eventName, eventListener);
    };
  }, [eventName, element]);
};

function checkGuess(guess, word) {
  const successArray = new Array(guess.length).fill(0);
  const guessArr = [...guess];
  const wordArr = [...word];
  const wordFreq = {};
  const guessFreq = {};

  wordArr.forEach(letter => wordFreq[letter] = wordFreq[letter] ? wordFreq[letter] + 1 : 1);

  guessArr.forEach((letter, i) => {
    if (letter === wordArr[i]) {
      successArray[i] = 2;
    } else if (wordArr.includes(letter) && (!guessFreq[letter] || guessFreq[letter] < wordFreq[letter])) {
      successArray[i] = 1;
    }

    guessFreq[letter] = guessFreq[letter] ? guessFreq[letter] + 1 : 1;
  });

  return successArray;
}

function checkedGuessBoxes(boxes, successArray) {
  const newBoxes = [];
  successArray.forEach((success, i) => {
    let colour;

    switch (success) {
      case 0:
        colour = "incorrect";
        break;
      case 1:
        colour = "almost";
        break;
      case 2:
        colour = "correct";
        break;
      default:
        colour = "unused";
        break;
    }

    const newBox = {
      letter: boxes[i].letter,
      colour: colour
    }

    newBoxes.push(newBox);
  });

  return newBoxes;
}

function getRowWord(row) {
  let guess = "";

  row.forEach((box) => guess += box.letter);

  return guess.toLowerCase();
}

function App() {
  const [word, setWord] = useState('');
  const [settableState, setSettableState] = useState(true);
  const [boxes, setBoxes] = useState(null);
  const [row, setRow] = useState(0);
  const [column, setColumn] = useState(0);
  const [winCondition, setWinCondition] = useState(false);
  const [loseCondition, setLoseCondition] = useState(false);
  const inputRef = useRef(null);

  const changeBox = (box, rowNum, colNum) => {
    const boxesCopy = boxes.slice();

    boxesCopy[rowNum][colNum] = box;

    setBoxes(boxesCopy);
  };

  const handleSetWord = newWord => {
    setWord(newWord.toLowerCase());
    if (dictionary[`length${newWord.length}`].includes(newWord) && settableState) {
      setBoxes(createAllBoxRows(newWord.length));
      setSettableState(false);
    }
  }

  const handleKey = event => {
    if (winCondition || loseCondition) {
      return;
    }

    if (settableState) {
      if (event.key === "Enter") {
        handleSetWord(inputRef.current.value);
      }
    } else if (event.key === "Enter" && column > word.length - 1) {
      const guess = getRowWord(boxes[row]);

      if (!dictionary[`length${word.length}`].includes(guess)) {
        return;
      }

      if (guess === word) {
        setWinCondition(true);
      }

      const successArray = checkGuess(guess, word);
      const newBoxes = checkedGuessBoxes(boxes[row], successArray);

      newBoxes.forEach((box, i) => changeBox(box, row, i));

      if (row > 6) {
        setLoseCondition(true);
      } else {
        setRow(row + 1);
        setColumn(0);
      }
    } else if (event.key === "Backspace") {
      const newBox = {
        letter: '',
        colour: "unused"
      };
      const newColumn = column > 0 ? column - 1 : 0;

      changeBox(newBox, row, newColumn);
      setColumn(newColumn);
    } else {
      if (!inAlphabet(event.key) || column > word.length - 1) {
        return;
      }

      const newBox = {
        letter: event.key.toUpperCase(),
        colour: "unused"
      };

      changeBox(newBox, row, column);
      setColumn(column + 1);
    }
  }

  const handlePlayAgain = () => {
    setSettableState(true);
    setBoxes(null);
    setLoseCondition(false);
    setWinCondition(false);
    setColumn(0);
    setRow(0);
    setWord('');
  };

  useEventListener("keydown", handleKey);

  return (
    <>
      <p>{displayWord(word, winCondition, loseCondition, handlePlayAgain)}</p>
      <SetForm
        settableState={settableState}
        inputRef={inputRef}
        handleSetWord={handleSetWord}
      />
      {renderBoxes(boxes)}
    </>
  );
}

export default App;
