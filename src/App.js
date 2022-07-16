import './App.css';
import React, { useState, useRef } from 'react';

function createBox(x, y) {
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
    <div key={colNum} className={colour} onClick={() => changeBox({ letter: "A", colour: "correct" }, rowNum, colNum)}>
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

function App() {
  const [word, setWord] = useState('');
  const [settableState, setSettableState] = useState(true);
  const [boxes, setBoxes] = useState(createAllBoxRows());
  const inputRef = useRef(null);

  const changeBox = function (box, rowNum, colNum) {
    const boxesCopy = boxes.slice();

    boxesCopy[rowNum][colNum] = box;

    setBoxes(boxesCopy);
  }

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
