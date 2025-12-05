import init, { blur } from "../wasm/wasm.js";

let wasmReady = false;

async function initWasm() {
  if (!wasmReady) {
    await init();
    wasmReady = true;
  }
}

self.onmessage = async (e) => {
  const { pixelBytes, width, height, blurFactor } = e.data;

  await initWasm();
  const blurredPixelBytes = blur(pixelBytes, height, width, blurFactor);
  const blurredPixelBytesCopy = blurredPixelBytes.slice();
  self.postMessage({ blurred: blurredPixelBytesCopy }, [
    blurredPixelBytesCopy.buffer,
  ]);
};
