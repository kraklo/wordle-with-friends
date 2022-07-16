import './App.css';

function RenderBox() {
  return (
    <div className="box"></div>
  );
}

function RenderBoxRow() {
  const boxes = [];
  for (let i = 0; i < 5; i++) {
    boxes.push(RenderBox());
  }

  return (
    <div className="row">
      {boxes}
    </div>
  );
}

function RenderAllBoxRows() {
  const rows = [];
  for (let i = 0; i < 6; i++) {
    rows.push(RenderBoxRow());
  }

  return rows;
}

function App() {
  return RenderAllBoxRows();
}

export default App;
