import { useEffect, useState } from "react";
import reactLogo from "./assets/react.svg";
import viteLogo from "/vite.svg";
import "./App.css";
import init, { add } from "./wasm/wasm.js";

function App() {
  const [count, setCount] = useState(0);
  const [wasmReady, setWasmReady] = useState(false);

  if (wasmReady) {
    console.log(add(3, 4));
  }

  // Initialise WASM on initial render
  useEffect(() => {
    init().then(() => setWasmReady(true));
  }, []);

  // Render image after WASM initialised
  useEffect(() => {
    if (!wasmReady) return;

    console.log("WASM is now ready");

    // TODO: render image
  }, [wasmReady]);

  return (
    <>
      <div>
        <a href="https://vite.dev" target="_blank">
          <img src={viteLogo} className="logo" alt="Vite logo" />
        </a>
        <a href="https://react.dev" target="_blank">
          <img src={reactLogo} className="logo react" alt="React logo" />
        </a>
      </div>
      <h1>Vite + React</h1>
      <div className="card">
        <button onClick={() => setCount((count) => count + 1)}>
          count is {count}
        </button>
        <p>
          Edit <code>src/App.tsx</code> and save to test HMR
        </p>
      </div>
      <p className="read-the-docs">
        Click on the Vite and React logos to learn more
      </p>
    </>
  );
}

export default App;
