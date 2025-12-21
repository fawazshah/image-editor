# Image Editor

<img src="/src/assets/preview.png" width="400">

An image editor built with a Rust backend, targeting WebAssembly. Supports the following operations:
 - blurring
 - edge detection

Blurring is implemented via Gaussian blur, and edge detection with the Sobel algorithm.

## Implementation details

Usually Gaussian blurring is implemented with a 2D Gaussian kernel, however we make use
of the fact Gaussian blurring is a "separable" algorithm to split this into two iterations
of blurring, each with a 1D Gaussian kernel.

Sobel edge detection is implemented with a 3x3 kernel.

## Running locally

To build Rust code targetting WASM:

```
cd rust-wasm
wasm-pack build --target web --out-dir ../src/wasm
```

To run React + Vite application:

```
npm run dev
```

To view documentation for the Rust code:

```
cargo doc --no-deps --open
```
