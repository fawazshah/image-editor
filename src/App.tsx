import { useState } from "react";
import Form from "react-bootstrap/Form";
import "./App.css";
import initialImage from "./assets/250x250.jpg";
import { ClickableCanvas } from "./components/ClickableCanvas";

function App() {
  const [blurFactor, setBlurFactor] = useState(1);
  const [edgeDetection, setEdgeDetection] = useState<boolean | null>(null);

  return (
    <>
      <ClickableCanvas
        initialImageUrl={initialImage}
        blurFactor={blurFactor}
        edgeDetection={edgeDetection}
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
            onChange={(e) => {
              const checked = e.target.checked;
              if (checked) {
                setEdgeDetection(true);
              } else {
                setEdgeDetection(false);
              }
            }}
          />
        </div>
      </Form>
    </>
  );
}

export default App;
