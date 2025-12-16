use wasm_bindgen::prelude::wasm_bindgen;

pub mod gaussian_blur;

#[wasm_bindgen(start)]
fn start() {
    // Allows displaying real Rust error message in browser console, instead of placeholder error
    console_error_panic_hook::set_once();
}
