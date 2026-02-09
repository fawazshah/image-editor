import React, { useEffect, useRef, useCallback } from "react";
import ImageWorker from "../workers/imageWorker?worker";
import {
  StyledClickableCanvas,
  StyledButton,
  StyledTooltip,
} from "./StyledClickableCanvas";
import { OverlayTrigger } from "react-bootstrap";

export type ClickableCanvasProps = {
  initialImageUrl: string;
  blurFactor: number;
  edgeDetection: boolean | null;
  onImageChange: () => void;
};

const PADDING = 40;

export const ClickableCanvas: React.FC<ClickableCanvasProps> = (
  props: ClickableCanvasProps,
) => {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const inputRef = useRef<HTMLInputElement>(null);
  const imageWorkerRef = useRef<Worker>(new ImageWorker());
  const videoRef = useRef<HTMLVideoElement>(null);

  // Draw image on canvas, and transfer to web worker
  const renderImage = useCallback((img: HTMLImageElement) => {
    img.onload = () => {
      const canvas = canvasRef.current;
      if (!canvas) return;
      const context = canvas.getContext("2d");
      if (!context) return;

      // Extra padding as blurring expands beyond image border
      canvas.width = img.width + PADDING * 2;
      canvas.height = img.height + PADDING * 2;
      context.drawImage(img, PADDING, PADDING);
      const imageData = context.getImageData(0, 0, canvas.width, canvas.height);

      // Transfer initial image to worker for reuse
      const imageWorker = imageWorkerRef.current;
      imageWorker.postMessage({
        type: "init",
        pixelBytes: imageData.data.slice(),
        width: canvas.width,
        height: canvas.height,
      });
    };
  }, []);

  // Process each video frame one at a time
  const processVideoFrames = () => {
    const canvas = canvasRef.current;
    const video = videoRef.current;
    if (!canvas || !video || video.paused || video.ended) return;

    const context = canvas.getContext("2d");
    if (!context) return;

    context.drawImage(video, PADDING, PADDING);

    // TODO: send frame to web worker
    // const imageData = context.getImageData(0, 0, canvas.width, canvas.height);

    video.requestVideoFrameCallback(() => processVideoFrames());
  };

  // Draw video to canvas
  const renderVideo = useCallback((video: HTMLVideoElement) => {
    video.onloadeddata = () => {
      const canvas = canvasRef.current;
      if (!canvas) return;
      const context = canvas.getContext("2d");
      if (!context) return;

      canvas.width = video.videoWidth + PADDING * 2;
      canvas.height = video.videoHeight + PADDING * 2;
      context.drawImage(video, PADDING, PADDING);

      video.muted = true;
      video.loop = true;
      videoRef.current = video;
      video.play().then(() => {
        processVideoFrames();
      });

      // TODO: transfer initial frame to worker
    };
  }, []);

  // Render initial image
  useEffect(() => {
    const img = new Image();
    img.src = props.initialImageUrl;
    renderImage(img);
  }, [props.initialImageUrl, renderImage]);

  // Handle file upload
  const handleFileUpload = useCallback(
    (event: React.ChangeEvent<HTMLInputElement>) => {
      const file = event.target.files?.[0];
      if (!file) return;

      if (file.type.startsWith("image/")) {
        videoRef.current = null; // Remove video if set
        const img = new Image();
        img.src = URL.createObjectURL(file);
        renderImage(img);
        props.onImageChange();
        return;
      }

      if (file.type.startsWith("video/")) {
        const video = document.createElement("video");
        video.src = URL.createObjectURL(file);
        renderVideo(video);
        return;
      }

      alert("Please upload an image or video!");
      return;
    },
    [renderImage, renderVideo, props],
  );

  // Open file upload dialogue on canvas click
  const handleCanvasClick = useCallback(() => {
    inputRef.current?.click();
  }, []);

  // On output from worker, insert into canvas context
  const handleOutputImage = () => {
    if (!canvasRef.current) return;
    const canvas = canvasRef.current;
    const context = canvas.getContext("2d");
    if (!context) return;

    imageWorkerRef.current.onmessage = (e) => {
      const outputImageData = new ImageData(
        new Uint8ClampedArray(e.data.output),
        canvas.width,
        canvas.height,
      );
      context.putImageData(outputImageData, 0, 0);
    };
  };

  // Blur image if blur factor changed
  useEffect(() => {
    const imageWorker = imageWorkerRef.current;
    imageWorker.postMessage({
      type: "blur",
      blurFactor: props.blurFactor,
    });

    handleOutputImage();
  }, [props.blurFactor]);

  // Display edge detected image or original, depending on edge detection setting
  useEffect(() => {
    const imageWorker = imageWorkerRef.current;
    if (props.edgeDetection == null) return;

    if (props.edgeDetection) {
      imageWorker.postMessage({
        type: "edgeDetect",
      });
    } else {
      imageWorker.postMessage({
        type: "undoEdgeDetect",
      });
    }

    handleOutputImage();
  }, [props.edgeDetection]);

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
        accept="image/*,video/*"
        onChange={handleFileUpload}
        style={{ display: "none" }}
      />

      <OverlayTrigger
        placement="right"
        overlay={<StyledTooltip>Upload an image or video!</StyledTooltip>}
      >
        {/* Clickable canvas */}
        <canvas
          ref={canvasRef}
          onClick={handleCanvasClick}
          style={{ cursor: "pointer" }}
        />
      </OverlayTrigger>

      <StyledButton onClick={() => handleExport()}>Export</StyledButton>
    </StyledClickableCanvas>
  );
};
