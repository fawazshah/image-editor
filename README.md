# Image Editor

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
