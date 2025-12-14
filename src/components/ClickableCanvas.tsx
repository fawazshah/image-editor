import React, { useEffect, useRef, useCallback } from "react";
import BlurWorker from "../workers/blurWorker?worker";
import { StyledClickableCanvas, StyledButton } from "./StyledClickableCanvas";

export type ClickableCanvasProps = {
  initialImageUrl: string;
  blurFactor: number;
  onImageChange: () => void;
};

const PADDING = 40;

export const ClickableCanvas: React.FC<ClickableCanvasProps> = (
  props: ClickableCanvasProps,
) => {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const inputRef = useRef<HTMLInputElement>(null);
  const blurWorkerRef = useRef<Worker>(new BlurWorker());

  // Draw image on canvas, and transfer to web worker
  const renderImage = useCallback((img: HTMLImageElement) => {
    img.onload = () => {
      const canvas = canvasRef.current;
      if (!canvas) return;
      const context = canvas.getContext("2d");
      if (!context) return;

      canvas.width = img.width + PADDING * 2;
      canvas.height = img.height + PADDING * 2;
      context.drawImage(img, PADDING, PADDING);
      const imageData = context.getImageData(0, 0, canvas.width, canvas.height);

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

  // Render initial image
  useEffect(() => {
    const img = new Image();
    img.src = props.initialImageUrl;
    renderImage(img);
  }, [props.initialImageUrl, renderImage]);

  // Handle file upload
  const handleImageUpload = useCallback(
    (event: React.ChangeEvent<HTMLInputElement>) => {
      const file = event.target.files?.[0];
      if (!file) return;

      if (!file.type.startsWith("image/")) {
        alert("Please upload an image!");
        return;
      }

      const img = new Image();
      img.src = URL.createObjectURL(file);
      renderImage(img);
      props.onImageChange();
    },
    [renderImage, props],
  );

  // Open file upload dialogue on canvas click
  const handleCanvasClick = useCallback(() => {
    inputRef.current?.click();
  }, []);

  // Blur image if blur factor changed
  useEffect(() => {
    const blurWorker = blurWorkerRef.current;
    blurWorker.postMessage({
      type: "blur",
      blurFactor: props.blurFactor,
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
  }, [props.blurFactor]);

  const handleExport = useCallback(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;

    const dataUrl = canvas.toDataURL("image/png");
    const link = document.createElement("a");
    link.href = dataUrl;
    link.download = "image.png";

    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  }, []);

  return (
    <StyledClickableCanvas>
      {/* Hidden file input */}
      <input
        ref={inputRef}
        type="file"
        accept="image/*"
        onChange={handleImageUpload}
        style={{ display: "none" }}
      />

      {/* Clickable canvas */}
      <canvas
        ref={canvasRef}
        onClick={handleCanvasClick}
        style={{ cursor: "pointer" }}
      />

      <StyledButton onClick={() => handleExport()}>Export</StyledButton>
    </StyledClickableCanvas>
  );
};
