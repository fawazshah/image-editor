import { useEffect, useRef, useState } from "react";
import Form from "react-bootstrap/Form";
import "./App.css";
import init from "./wasm/wasm.js";
import { Row } from "react-bootstrap";

function App() {
  const [wasmReady, setWasmReady] = useState(false);
  const [blur, setBlur] = useState(0);
  const canvasRef = useRef<HTMLCanvasElement>(null);

  // Initialise WASM on initial render
  useEffect(() => {
    init().then(() => setWasmReady(true));
  }, []);

  // Render image after WASM initialised
  useEffect(() => {
    if (!wasmReady) return;

    const img = new Image();
    img.src = "/vite.png";
    img.onload = () => {
      const canvas = canvasRef.current;
      if (!canvas) return;

      const context = canvas.getContext("2d");
      if (!context) return;

      const scaledWidth = img.width * 0.5;
      const scaledHeight = img.width * 0.5;

      canvas.width = scaledWidth;
      canvas.height = scaledHeight;
      context.drawImage(img, 0, 0, scaledWidth, scaledHeight);
    };
    // TODO: render image
  }, [wasmReady]);

  return (
    <>
      <canvas ref={canvasRef} />
      <h1>Image Editor</h1>
      <Form>
        <Form.Group>
          <Row>
            <Form.Label>Blur: {blur}</Form.Label>
          </Row>
          <Row>
            <Form.Range
              min={0}
              max={100}
              value={blur}
              onChange={(e) => setBlur(Number(e.target.value))}
            />
          </Row>
        </Form.Group>
      </Form>
    </>
  );
}

export default App;
