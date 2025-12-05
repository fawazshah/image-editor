import { useEffect, useRef, useState } from "react";
import Form from "react-bootstrap/Form";
import { Row } from "react-bootstrap";
import "./App.css";
import viteImg from "./assets/vite.png";
import BlurWorker from "./workers/blurWorker?worker";

function App() {
  const [blurFactor, setBlurFactor] = useState(1);
  const canvasRef = useRef<HTMLCanvasElement>(null);
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

      const padding = 25;

      canvas.width = img.width + padding * 2;
      canvas.height = img.height + padding * 2;
      context.drawImage(img, 0, 0);
      const imageData = context.getImageData(
        -padding,
        -padding,
        canvas.width,
        canvas.height,
      );

      // Transfer initial image to worker for reuse
      const blurWorker = blurWorkerRef.current;
      blurWorker.postMessage({
        type: "init",
        pixelBytes: imageData.data.slice(),
        width: canvas.width,
        height: canvas.height,
      });
    };
  }, []);

  // Blur image if blur factor changed
  useEffect(() => {
    const blurWorker = blurWorkerRef.current;
    blurWorker.postMessage({
      type: "blur",
      blurFactor: blurFactor,
    });

    if (!canvasRef.current) return;
    const canvas = canvasRef.current;
    const context = canvas.getContext("2d");
    if (!context) return;

    blurWorkerRef.current.onmessage = (e) => {
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
