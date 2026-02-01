/// <reference lib="webworker" />

export type workerMessage =
  | {
      type: "init";
      pixelBytes: Uint8Array;
      width: number;
      height: number;
    }
  | {
      type: "blur";
      blurFactor: number;
    }
  | {
      type: "edgeDetect";
    }
  | {
      type: "undoEdgeDetect";
    };

const ctx = self as DedicatedWorkerGlobalScope;

import init, {
  library_gaussian_blur,
  sobel_edge_detect,
} from "../wasm/wasm.js";

let wasmReady: boolean = false;
let originalPixels: Uint8Array<ArrayBufferLike> | null = null;
let blurredPixels: Uint8Array<ArrayBufferLike> | null = null;
let width: number = 0;
let height: number = 0;

async function initWasm() {
  if (!wasmReady) {
    await init();
    wasmReady = true;
  }
}

self.onmessage = async (e: MessageEvent) => {
  const message = e.data as workerMessage;

  // pixels received by worker on initial message only
  if (message.type === "init") {
    originalPixels = message.pixelBytes;
    width = message.width;
    height = message.height;
  }

  // blurring request only receives blur factor, we apply blur to stored pixels
  if (message.type === "blur") {
    performBlur(message.blurFactor);
  }

  // edge detection requires no params
  if (message.type == "edgeDetect") {
    performEdgeDetect();
  }

  if (message.type == "undoEdgeDetect") {
    undoEdgeDetect();
  }
};

async function performBlur(blurFactor: number) {
  await initWasm();
  if (originalPixels == null) return;
  const blurredPixelBytes = library_gaussian_blur(
    originalPixels,
    width,
    height,
    blurFactor,
  );
  blurredPixels = new Uint8Array(blurredPixelBytes);
  ctx.postMessage({ output: blurredPixelBytes }, [blurredPixelBytes.buffer]);
}

async function performEdgeDetect() {
  await initWasm();
  if (originalPixels == null) return;
  const outputBytes = sobel_edge_detect(
    blurredPixels ?? originalPixels,
    width,
    height,
  );
  ctx.postMessage({ output: outputBytes }, [outputBytes.buffer]);
}

async function undoEdgeDetect() {
  if (originalPixels == null) return;
  const originalCopy = new Uint8ClampedArray(blurredPixels ?? originalPixels);
  ctx.postMessage({ output: originalCopy }, [originalCopy.buffer]);
}
