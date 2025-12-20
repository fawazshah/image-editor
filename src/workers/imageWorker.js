import init, {
  library_gaussian_blur,
  gaussian_blur,
  sobel_edge_detect,
} from "../wasm/wasm.js";

let wasmReady = false;
let originalPixels = null;
let width = 0;
let height = 0;

async function initWasm() {
  if (!wasmReady) {
    await init();
    wasmReady = true;
  }
}

self.onmessage = async (e) => {
  const message = e.data;

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

  if (message.type == "resetOriginalImage") {
    resetOriginalImage();
  }
};

async function performBlur(blurFactor) {
  await initWasm();
  if (originalPixels == null) return;
  const blurredPixelBytes = library_gaussian_blur(
    originalPixels,
    width,
    height,
    blurFactor,
  );
  self.postMessage({ output: blurredPixelBytes }, [blurredPixelBytes.buffer]);
}

async function performEdgeDetect() {
  await initWasm();
  if (originalPixels == null) return;
  const outputBytes = sobel_edge_detect(originalPixels, width, height);
  self.postMessage({ output: outputBytes }, [outputBytes.buffer]);
}

async function resetOriginalImage() {
  if (originalPixels == null) return;
  const originalCopy = new Uint8ClampedArray(originalPixels);
  self.postMessage({ output: originalCopy }, [originalCopy.buffer]);
}
