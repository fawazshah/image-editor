import { useEffect, useState } from "react";
import Form from "react-bootstrap/Form";
import viteLogo from "/vite.svg";
import "./App.css";
import init, { add } from "./wasm/wasm.js";
import { Row } from "react-bootstrap";

function App() {
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
        <img src={viteLogo} className="logo" alt="Vite logo" />
      </div>
      <h1>Image Editor</h1>
      <Form>
        <Form.Group>
          <Row>
            <Form.Label>Blur</Form.Label>
          </Row>
          <Row>
            <Form.Range min={0} max={100} />
          </Row>
        </Form.Group>
      </Form>
    </>
  );
}

export default App;
