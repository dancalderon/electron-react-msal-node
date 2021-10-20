
const { IPC_MESSAGES } = require('./constants');
// const { ipcRenderer } = require('electron');

function App() {
  return (
    <div className="App">
      <header className="App-header">
        <a
          className="App-link"
          href="https://reactjs.org"
          target="_blank"
          rel="noopener noreferrer"
        >
          Learn React
        </a>
        <button type="button" onClick={() => {
  console.log("🚀 ~ file: renderer.js ~ line 11 ~ document.querySelector ~ signIn")
    window.ipcRenderer.send(IPC_MESSAGES.LOGIN);
}}>log in button</button>
      </header>
    </div>
  );
}

export default App;
