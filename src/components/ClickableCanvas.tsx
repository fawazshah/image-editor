import React, { useEffect, useRef, useCallback } from "react";
import BlurWorker from "../workers/blurWorker?worker";

export type ClickableCanvasProps = {
  initialImageUrl: string;
  blurFactor: number;
  onImageChange: () => void;
};

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

      const padding = 40;

      canvas.width = img.width + padding * 2;
      canvas.height = img.height + padding * 2;
      context.drawImage(img, padding, padding);
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

  return (
    <div>
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
    </div>
  );
};
