import { useState } from "react";
import Form from "react-bootstrap/Form";
import { Row } from "react-bootstrap";
import "./App.css";
import viteImg from "./assets/vite.png";
import { ClickableCanvas } from "./components/ClickableCanvas";

function App() {
  const [blurFactor, setBlurFactor] = useState(1);

  return (
    <>
      <ClickableCanvas
        initialImageUrl={viteImg}
        blurFactor={blurFactor}
        onImageChange={() => setBlurFactor(1)}
      />
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
