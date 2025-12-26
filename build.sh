#!/usr/bin/env bash
set -e

# Install Rust
curl https://sh.rustup.rs -sSf | sh -s -- -y
source $HOME/.cargo/env

# Install wasm-pack
cargo install wasm-pack

# Build Rust → WASM
cd rust-wasm
wasm-pack build --target web --release --out-dir ../src/wasm

# Build frontend
cd ../
npm install
npm run build
