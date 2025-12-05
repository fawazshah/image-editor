import { useEffect, useRef, useState } from "react";
import Form from "react-bootstrap/Form";
import { Row } from "react-bootstrap";
import "./App.css";
import viteImg from "./assets/vite.png";
import BlurWorker from "./workers/blurWorker?worker";

function App() {
  const [blurFactor, setBlurFactor] = useState(1);
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const originalImageRef = useRef<ImageData>(null);
  const blurWorkerRef = useRef<Worker>(new BlurWorker());

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
      canvas.height = img.height * 0.5;
      context.drawImage(img, 0, 0, canvas.width, canvas.height);

      // Preserve reference to original data for blurring
      const imageData = context.getImageData(0, 0, canvas.width, canvas.height);
      originalImageRef.current = imageData;
    };
  }, []);

  // Blur image if blur factor changed
  useEffect(() => {
    if (!canvasRef.current) return;
    if (!originalImageRef.current) return;

    const canvas = canvasRef.current;
    const context = canvas.getContext("2d");
    if (!context) return;

    const originalImageCopy = originalImageRef.current.data.slice();

    const blurWorker = blurWorkerRef.current;
    blurWorker.postMessage(
      {
        pixelBytes: originalImageCopy,
        width: canvas.width,
        height: canvas.height,
        blurFactor: blurFactor,
      },
      [originalImageCopy.buffer], // buffer transferred to worker
    );

    blurWorker.onmessage = (e) => {
      const blurredImageData = new ImageData(
        new Uint8ClampedArray(e.data.blurred),
        canvas.width,
        canvas.height,
      );
      context?.putImageData(blurredImageData, 0, 0);
    };
  }, [blurFactor]);

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
