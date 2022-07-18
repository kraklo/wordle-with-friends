import './App.css';
import React, { useState, useRef, useEffect } from 'react';
import { dictionary } from './dictionary.js';

const alphabet = [..."abcdefghijklmnopqrstuvwxyzABCDEFGHIJKLMNOPQRSTUVWXYZ"];
console.log(dictionary);

function inAlphabet(character) {
  return alphabet.includes(character);
}

function createBox() {
  return {
    letter: '',
    colour: 'unused'
  };
}

function createBoxRow() {
  const boxes = [];
  for (let i = 0; i < 5; i++) {
    boxes.push(createBox());
  }

  return boxes;
}

function createAllBoxRows() {
  const rows = [];
  for (let i = 0; i < 6; i++) {
    rows.push(createBoxRow());
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

function displayWord(word, winCondition) {
  if (winCondition) {
    return (
      <>Correct! The word was <em>{word}</em>!</>
    );
  }

  if (word === '') {
    return "There is no word set"
  } else if (word.length !== 5) {
    return "Please set a five letter word"
  } else if (!dictionary.length5.includes(word)) {
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
  const [boxes, setBoxes] = useState(createAllBoxRows());
  const [row, setRow] = useState(0);
  const [column, setColumn] = useState(0);
  const [winCondition, setWinCondition] = useState(false);
  const inputRef = useRef(null);

  const changeBox = (box, rowNum, colNum) => {
    const boxesCopy = boxes.slice();

    boxesCopy[rowNum][colNum] = box;

    setBoxes(boxesCopy);
  };

  const handleSetWord = newWord => {
    setWord(newWord.toLowerCase());
    if (newWord.length === 5 && dictionary.length5.includes(newWord) && settableState) {
      setSettableState(false);
    }
  }

  const handleKey = event => {
    if (winCondition) {
      return;
    }

    if (settableState) {
      if (event.key === "Enter") {
        handleSetWord(inputRef.current.value);
      }
    } else if (event.key === "Enter" && column > 4) {
      const guess = getRowWord(boxes[row]);

      if (!dictionary.length5.includes(guess)) {
        return;
      }

      if (guess === word) {
        setWinCondition(true);
      }

      const successArray = checkGuess(guess, word);
      const newBoxes = checkedGuessBoxes(boxes[row], successArray);

      newBoxes.forEach((box, i) => changeBox(box, row, i));

      const newRow = row >= 5 ? 0 : row + 1;
      setRow(newRow);
      setColumn(0);
    } else if (event.key === "Backspace") {
      const newBox = {
        letter: '',
        colour: "unused"
      };
      const newColumn = column > 0 ? column - 1 : 0;

      changeBox(newBox, row, newColumn);
      setColumn(newColumn);
    } else {
      if (!inAlphabet(event.key) || column > 4) {
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

  useEventListener("keydown", handleKey);

  return (
    <>
      <p>{displayWord(word, winCondition)}</p>
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
