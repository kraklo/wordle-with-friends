import './App.css';
import React, { useState, useRef, useEffect } from 'react';

const alphabet = [..."abcdefghijklmnopqrstuvwxyzABCDEFGHIJKLMNOPQRSTUVWXYZ"];

function inAlphabet(character) {
  return alphabet.includes(character);
}

function createBox() {
  return {
    letter: '',
    colour: 'unnused'
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
  function handleSetWord(word) {
    props.setWord(word);
    if (word.length === 5 && props.settableState) {
      props.setSettableState(false);
    }
  }

  if (!props.settableState) {
    return null;
  }

  return (
    <>
      <input type="text" ref={props.inputRef} />
      <button onClick={() => handleSetWord(props.inputRef.current.value)}>Set</button>
    </>
  );
}

function displayWord(word) {
  if (word === '') {
    return "There is no word set"
  } else if (word.length !== 5) {
    return "Please set a five letter word"
  } else {
    return `The current word is ${word}`;
  }
}

function renderBox(box, rowNum, colNum, changeBox) {
  const colour = "box " + box.colour;

  return (
    <div key={colNum} className={colour}>
      <p className="letter">{box.letter}</p>
    </div>
  )
}

function renderBoxRow(row, rowNum, changeBox) {
  const boxes = [];

  row.forEach((box, colNum) => boxes.push(renderBox(box, rowNum, colNum, changeBox)));

  return (
    <div key={rowNum} className="row">{boxes}</div>
  );
}

function renderBoxes(boxes, changeBox) {
  const boxRows = []

  boxes.forEach((boxRow, rowNum) => {
    boxRows.push(renderBoxRow(boxRow, rowNum, changeBox))
  });

  return boxRows;
}

const useEventListener = (eventName, handler, element = document) => {
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

function App() {
  const [word, setWord] = useState('');
  const [settableState, setSettableState] = useState(true);
  const [boxes, setBoxes] = useState(createAllBoxRows());
  const [row, setRow] = useState(0);
  const [column, setColumn] = useState(0);
  const inputRef = useRef(null);

  const changeBox = (box, rowNum, colNum) => {
    const boxesCopy = boxes.slice();

    boxesCopy[rowNum][colNum] = box;

    setBoxes(boxesCopy);
  };

  function handleKey(event) {

    if (!word) {
      return;
    } else if (event.key === "Enter" && column > 4) {
      const newRow = row >= 5 ? 0 : row + 1;

      setRow(newRow);
      setColumn(0);
    } else if (event.key === "Backspace") {
      const newBox = {
        letter: '',
        colour: "unnused"
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
        colour: "unnused"
      };

      changeBox(newBox, row, column);
      setColumn(column + 1);
    }
  }

  useEventListener("keydown", handleKey);

  return (
    <>
      <p>{displayWord(word)}</p>
      <SetForm
        settableState={settableState}
        setSettableState={setSettableState}
        setWord={setWord}
        inputRef={inputRef}
      />
      {renderBoxes(boxes, changeBox)}
    </>
  );
}

export default App;
