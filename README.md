To build Rust code targetting WASM:

```
cd rust-wasm
wasm-pack build --target web --out-dir ../frontend/src/wasm
```

To run frontend:

```
cd frontend
npm run dev
```