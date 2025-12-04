import { useEffect, useRef, useState } from "react";
import Form from "react-bootstrap/Form";
import "./App.css";
import viteImg from "./assets/vite.png";
import init, { blur } from "./wasm/wasm.js";
import { Row } from "react-bootstrap";

function App() {
  const [wasmReady, setWasmReady] = useState(false);
  const [blurFactor, setBlurFactor] = useState(1);
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const originalImageRef = useRef<ImageData>(null);

  // Initialise WASM on initial render
  useEffect(() => {
    init().then(() => setWasmReady(true));
  }, []);

  // Render image
  useEffect(() => {
    const img = new Image();
    img.src = viteImg;
    img.onload = () => {
      const canvas = canvasRef.current;
      if (!canvas) return;

      const context = canvas.getContext("2d");
      if (!context) return;

      canvas.width = img.width * 0.5;
      canvas.height = img.width * 0.5;
      context.drawImage(img, 0, 0, canvas.width, canvas.height);

      // Preserve reference to original data for blurring
      const imageData = context.getImageData(0, 0, canvas.width, canvas.height);
      originalImageRef.current = imageData;
    };
  }, []);

  // Blur image if blur changed
  useEffect(() => {
    if (!wasmReady) return;
    if (!canvasRef.current) return;
    if (!originalImageRef.current) return;

    const canvas = canvasRef.current;
    const context = canvas.getContext("2d");
    if (!context) return;

    const originalImagePixelBytes = new Uint8Array(
      originalImageRef.current.data,
    );
    const blurredImagePixelBytes = blur(
      originalImagePixelBytes,
      canvas.height,
      canvas.width,
      blurFactor,
    );

    context.putImageData(
      new ImageData(
        new Uint8ClampedArray(blurredImagePixelBytes),
        canvas.width,
        canvas.height,
      ),
      0,
      0,
    );
  }, [wasmReady, blurFactor]);

  return (
    <>
      <canvas ref={canvasRef} />
      <h1>Image Editor</h1>
      <Form>
        <Form.Group>
          <Row>
            <Form.Label>Blur: {blurFactor}</Form.Label>
          </Row>
          <Row>
            <Form.Range
              min={1}
              max={100}
              value={blurFactor}
              onChange={(e) => setBlurFactor(Number(e.target.value))}
            />
          </Row>
        </Form.Group>
      </Form>
    </>
  );
}

export default App;
