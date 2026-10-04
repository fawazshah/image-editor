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
let edgeDetectionEnabled: boolean = false;
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

  // pixels received by worker on initial message only. New image starts unblurred with no edge detection
  if (message.type === "init") {
    originalPixels = message.pixelBytes;
    blurredPixels = message.pixelBytes;
    edgeDetectionEnabled = false;
    width = message.width;
    height = message.height;
  }

  // blurring request only receives blur factor, we apply blur to stored pixels
  if (message.type === "blur") {
    await performBlur(message.blurFactor);
    render();
  }

  // edge detection toggles only change the setting, reusing the cached blurred pixels
  if (message.type == "edgeDetect") {
    edgeDetectionEnabled = true;
    render();
  }

  if (message.type == "undoEdgeDetect") {
    edgeDetectionEnabled = false;
    render();
  }
};

async function performBlur(blurFactor: number) {
  await initWasm();
  if (originalPixels == null) return;
  blurredPixels = library_gaussian_blur(
    originalPixels,
    width,
    height,
    blurFactor,
  );
}

// Applies edge detection on top of the blurred image if enabled, then posts result to main thread
async function render() {
  await initWasm();
  if (originalPixels == null) return;
  const basePixels = blurredPixels ?? originalPixels;
  const outputBytes = edgeDetectionEnabled
    ? sobel_edge_detect(basePixels, width, height)
    : new Uint8Array(basePixels); // copy, so cached pixels aren't detached on transfer
  ctx.postMessage({ output: outputBytes }, [outputBytes.buffer]);
}
