import init, { blur } from "../wasm/wasm.js";

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
};

async function performBlur(blurFactor) {
  await initWasm();
  const blurredPixelBytes = blur(originalPixels, height, width, blurFactor);
  self.postMessage({ blurred: blurredPixelBytes }, [blurredPixelBytes.buffer]);
}
