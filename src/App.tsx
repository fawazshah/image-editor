import { useState } from "react";
import Form from "react-bootstrap/Form";
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
      <Form className="form">
        <div className="form-item">
          <Form.Label>Blur: {blurFactor}</Form.Label>
          <Form.Range
            min={1}
            max={100}
            value={blurFactor}
            onChange={(e) => setBlurFactor(Number(e.target.value))}
          />
        </div>
        <div className="form-item">
          <Form.Switch
            label="Detect Edges"
            onClick={() => {
              setBlurFactor(1);
            }}
          />
        </div>
      </Form>
    </>
  );
}

export default App;
