# Image Editor

<p align="center">
  <img src="/src/assets/preview.gif" width="400">
</p>

A lightweight web-based image editor. Written the old-fashioned way, without an LLM!

Supports the following features:
 - blurring
 - edge detection
 - importing/exporting images

Blurring is implemented via Gaussian blur, and edge detection with the Sobel algorithm.

<b>Try it out [here](https://image-editor.fawazshah.xyz/)</b>.

## Tech stack

The backend is built in Rust, targeting WebAssembly. The frontend is built in React + Typescript, using Vite as the build tool of choice.

## Implementation details

Usually Gaussian blurring is implemented with a 2D Gaussian kernel, however I make use
of the fact Gaussian blurring is a "separable" algorithm to split this into two iterations
of blurring, each with a 1D Gaussian kernel.

Sobel edge detection is implemented with a 3x3 kernel.

Credit to Computerphile for [these](https://www.youtube.com/watch?v=C_zFhWdM4ic) [explanations](https://www.youtube.com/watch?v=uihBwtPIBxM) of the algorithms.

## Running locally

To build Rust code targetting WASM:

```
cd rust-wasm
wasm-pack build --release --target web --out-dir ../src/wasm
cd ..
```

To install npm packages for the first time:

```
npm install
````

then to run the React application with Vite:

```
npm run dev
```

To view documentation for the Rust code:

```
cargo doc --no-deps --open
```

To run linting and formatting:

```
npm run format
```
